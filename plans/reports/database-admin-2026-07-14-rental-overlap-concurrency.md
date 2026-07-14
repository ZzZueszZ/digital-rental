# Rental overlap concurrency analysis

## Executive conclusion

Current checkout is not concurrency-safe. `createRentalOrder()` runs `COUNT(overlapping items)` then inserts a new order without locking a shared row. Two transactions can both observe one remaining unit and both commit. `@Transactional` alone does not prevent this under PostgreSQL `READ COMMITTED`.

**Minimal recommended solution:** lock every requested `products` row with `PESSIMISTIC_WRITE` in ascending ID order, aggregate duplicate product lines, rerun the overlap count while holding locks, then insert the order in the same transaction. All capacity-changing operations must use the same product lock protocol. This works across multiple Spring instances because PostgreSQL owns the row locks.

No code changed.

## Current evidence

- `RentalServiceImpl.java:89-163`: transaction checks availability, then later saves order/items.
- `RentalServiceImpl.java:109-113`: per-line check; duplicate product lines are not aggregated.
- `RentalOrderRepository.java:32-40`: overlap is a count query, no lock.
- `Product.java:67-69`: capacity is mutable `rental_quantity`.
- `RentalOrderItem.java:26-32`: product is known at booking; physical device remains null until prepare.
- `RentalServiceImpl.java:367-392`: device is assigned later with read-check-write, also without row lock.
- `RentalServiceImpl.java:728-748` and `:811-822`: device create/delete changes capacity without product locking.
- `RentalOrderStatus` contains `CANCELLED`, not `CANCELED`, and has no `REJECTED`; current JPQL uses both invalid names.
- Production enables Flyway at `classpath:db/migration`, but that directory is absent in the repository. Local defaults to Hibernate `ddl-auto=update`.

## Correct interval and blocking policy

Preserve current business semantics unless product decides otherwise:

- Interval is **closed** `[startDate, endDate]`.
- Overlap condition: `existing.startDate <= requested.endDate AND existing.endDate >= requested.startDate`.
- A booking ending exactly when another starts conflicts.
- Blocking statuses: `PENDING_PAYMENT`, `PAID_RENTAL_FEE`, `WAITING_PICKUP`, `RENTING`, `RETURNED`.
- Releasing statuses: `CANCELLED`, `COMPLETED`.

If same-instant turnaround should be allowed, change all layers together to half-open `[startDate, endDate)` and predicate `existing.startDate < requested.endDate AND existing.endDate > requested.startDate`. Do not mix conventions.

`PENDING_PAYMENT` currently reserves capacity indefinitely. Add a payment-expiry/cancel job separately; otherwise safety is preserved but inventory can be stranded.

## Ranked options

### 1. Product row lock + recheck — recommended, minimal

**Guarantee:** serializes bookings per product. After transaction A commits, blocked transaction B executes its count statement with a fresh `READ COMMITTED` snapshot and sees A's items.

**Pros:** small JPA change; multi-instance safe; no PostgreSQL extension; low contention because unrelated products remain parallel.

**Conditions:** every booking path and every capacity decrease follows the same lock protocol; multiple products always locked in ascending ID order.

### 2. PostgreSQL transaction advisory lock

Call `pg_advisory_xact_lock` per product, sorted, before count. It gives the same mutex without updating schema.

**Why rank lower:** PostgreSQL-specific, invisible in entity/repository semantics, easy for a future code path to omit, and lock-key namespace/collision must be governed. Useful only if product rows cannot be locked.

### 3. `SERIALIZABLE` checkout + retry

PostgreSQL SSI can abort one transaction in the read-count/write anomaly. Spring must retry the whole transaction on SQLSTATE `40001` with bounded backoff.

**Why rank lower:** broader abort rate, more operational complexity, and correctness depends on retrying the entire unit of work. It is unnecessary when a natural product row already exists.

### 4. Per-device reservation table + exclusion constraint — strongest invariant, non-minimal

Allocate a physical device at booking and let PostgreSQL reject overlapping ranges:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE device_reservations (
    id bigserial PRIMARY KEY,
    rental_order_item_id bigint NOT NULL UNIQUE
        REFERENCES rental_order_items(id) ON DELETE CASCADE,
    device_id bigint NOT NULL REFERENCES devices(id),
    rental_period tsrange NOT NULL,
    status varchar(20) NOT NULL,
    CONSTRAINT ck_device_reservation_period CHECK (NOT isempty(rental_period))
);

ALTER TABLE device_reservations
ADD CONSTRAINT ex_device_reservation_no_overlap
EXCLUDE USING gist (
    device_id WITH =,
    rental_period WITH &&
)
WHERE (status IN ('HELD', 'CONFIRMED', 'ACTIVE'));
```

Use `tsrange(start_date, end_date, '[]')` to preserve current closed intervals. This is the only ranked option where the database itself expresses the no-overlap invariant. It requires changing the current workflow because devices are presently assigned only after payment in `prepareRental()`.

An exclusion constraint cannot directly enforce “no more than N overlapping rows per product”; therefore it is not applicable to the current aggregate `rental_quantity` model without introducing capacity slots/device reservations.

## Exact minimal application changes

### `ProductRepository.java`

Add a deterministic lock query:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id IN :ids ORDER BY p.id")
List<Product> findAllByIdForUpdate(@Param("ids") Collection<Long> ids);
```

Do not rely on `findAllById()` order. Verify the returned count equals the distinct requested ID count.

### `RentalOrderRepository.java`

Replace string literals and return counts for all products in one query:

```java
@Query("""
    SELECT ri.product.id, COUNT(ri.id)
    FROM RentalOrderItem ri
    JOIN ri.rentalOrder ro
    WHERE ri.product.id IN :productIds
      AND ro.status IN :blockingStatuses
      AND ro.startDate <= :endDate
      AND ro.endDate >= :startDate
    GROUP BY ri.product.id
    """)
List<Object[]> countRentedUnitsByProductInPeriod(
    @Param("productIds") Collection<Long> productIds,
    @Param("blockingStatuses") Collection<RentalOrderStatus> blockingStatuses,
    @Param("startDate") LocalDateTime startDate,
    @Param("endDate") LocalDateTime endDate);
```

The existing `REJECTED` / `CANCELED` JPQL must be removed. Prefer positive blocking statuses so a newly added terminal status does not accidentally reserve inventory.

Keep `checkProductAvailability()` as a read-only UX hint, but label its result non-authoritative. Checkout must always lock and recheck.

### `RentalServiceImpl.createRentalOrder()`

Within the existing transaction, in this order:

1. Validate `startDate <= endDate`.
2. Aggregate request lines with `Map<Long, Integer>` using checked addition. This closes the duplicate-product bypass.
3. Sort distinct product IDs ascending.
4. Call `findAllByIdForUpdate(sortedIds)` before any availability count.
5. Validate every product exists, active, rentable, and has a non-negative capacity.
6. Query blocking overlap counts once for all requested products.
7. For each product, require `rentalQuantity - blockingCount >= aggregatedRequestedQuantity`.
8. Build exactly the aggregated item quantities and save order/items before transaction commit.
9. Map conflicts to HTTP `409 CONFLICT`, not generic `400`, so clients can refresh availability.

Do not use JVM `synchronized`, Redis cache state, or a preflight availability endpoint as the lock. They do not protect multiple backend instances/transactions.

### Capacity-changing device methods

- `createDevice()`: lock its product before incrementing `rentalQuantity`; this also prevents lost updates from concurrent device creation.
- `deleteDevice()`: lock product first, calculate maximum overlapping active reservations before lowering capacity, and reject deletion if new capacity would be below committed demand.
- Device status policy must be decided. Currently `MAINTENANCE`, `DAMAGED`, and `LOST` devices still remain in `rentalQuantity`. If “last usable unit” is the requirement, derive bookable capacity from governed device lifecycle instead of a manually maintained counter.

### `prepareRental()`

Separate physical-device race exists: two staff transactions can both read the same device as `AVAILABLE` and reserve it. Add `DeviceRepository.findAllByIdForUpdate(... ORDER BY id)`, reject duplicate device IDs, verify each device belongs to the order item's product, verify assignments cover only that order, then mark all devices `RESERVED` in one transaction.

Global `Device.status=RESERVED` safely prevents reuse but over-restricts non-overlapping future bookings. Per-device dated reservations are the long-term fix.

## Exact migration proposal

Repository has no Flyway files although production requires them. First inspect production `flyway_schema_history`; do not assume a clean database. If the next version is free, add:

`service/lenshub/src/main/resources/db/migration/V20260714_01__rental_booking_concurrency.sql`

```sql
ALTER TABLE rental_orders
    ADD CONSTRAINT ck_rental_orders_date_order
    CHECK (start_date <= end_date) NOT VALID;

ALTER TABLE rental_orders
    VALIDATE CONSTRAINT ck_rental_orders_date_order;

CREATE INDEX IF NOT EXISTS idx_rental_order_items_product_order
    ON rental_order_items (product_id, rental_order_id);

CREATE INDEX IF NOT EXISTS idx_rental_orders_blocking_dates
    ON rental_orders (start_date, end_date, id)
    WHERE status IN (
        'PENDING_PAYMENT',
        'PAID_RENTAL_FEE',
        'WAITING_PICKUP',
        'RENTING',
        'RETURNED'
    );

ALTER TABLE products
    ADD CONSTRAINT ck_products_rental_quantity_nonnegative
    CHECK (rental_quantity >= 0) NOT VALID;

ALTER TABLE products
    VALIDATE CONSTRAINT ck_products_rental_quantity_nonnegative;
```

Primary access begins from `rental_order_items.product_id`; the composite item index is the important one. The partial order-date index helps active-period queries but should be confirmed with `EXPLAIN (ANALYZE, BUFFERS)` using production-like volume. Do not add GiST merely for fashion; it becomes justified with a range/exclusion reservation model.

**Rollback:** drop the two constraints and two indexes. Rollback does not undo already accepted bookings; check for overbooked periods before deployment.

## Pre-migration data audit

Run before enabling the new check:

```sql
SELECT id, code, start_date, end_date
FROM rental_orders
WHERE start_date > end_date;

SELECT id, rental_quantity
FROM products
WHERE rental_quantity < 0;
```

Also compute overlapping demand per product/time window from production data. If existing overbooking exists, product locks prevent new anomalies but do not repair history.

## Deterministic PostgreSQL concurrency tests

Add Testcontainers PostgreSQL dependencies; H2 cannot validate PostgreSQL locks or exclusion behavior.

Create `RentalBookingConcurrencyIT` with real `TransactionTemplate` transactions and separate pooled connections. Use latches to control order:

1. **Last unit:** capacity 1. T1 acquires product `FOR UPDATE`, signals `lockHeld`; T2 begins checkout and reaches the lock; T1 inserts overlapping order and commits. T2 resumes, recounts, returns conflict. Assert one committed order/item only.
2. **Capacity N:** capacity 2, launch 3 overlapping checkouts behind a start barrier. Assert exactly 2 commits and 1 conflict; database overlap count equals 2.
3. **Duplicate lines:** one request contains the same product twice with quantity 1 while capacity is 1. Assert rejection before insert.
4. **Non-overlap:** with closed semantics, `[10:00,11:00]` conflicts with a start at `11:00`; start at `11:00:00.000001` succeeds. If product chooses half-open semantics, reverse the boundary assertion.
5. **Terminal status release:** create blocking order, change to `CANCELLED` and commit, then overlapping checkout succeeds.
6. **Rollback:** T1 locks and creates but throws before commit; T2 then succeeds. Assert no phantom capacity consumption.
7. **Multi-product deadlock:** two requests list products `[A,B]` and `[B,A]`; sorted locking must finish without deadlock and preserve both capacities.
8. **Concurrent capacity decrease:** checkout holds product lock while device deletion tries to lower capacity. After serialization, deletion must reject if committed demand would exceed new capacity.
9. **Concurrent device assignment:** two prepare operations request the same serial. Exactly one reserves it; the other conflicts.
10. **Status query contract:** every enum status is parameterized; verify blocking and releasing sets explicitly so spelling regressions cannot compile silently.

For test 1, avoid timing-only `sleep`. Expose a package-private booking coordinator/helper or use a test transaction probe to signal immediately after the product lock. Assert futures finish within a timeout to catch deadlocks.

## Operational validation

- Measure lock wait time and checkout conflict count by product.
- Log product IDs and requested period, never sensitive payment/KYC data.
- Set a bounded PostgreSQL `lock_timeout` below HTTP timeout and map timeout/deadlock to retryable `409/503`.
- Alert on long `PENDING_PAYMENT` reservations and automatically expire them under a documented SLA.
- Run `EXPLAIN (ANALYZE, BUFFERS)` after representative data is loaded; no live database credentials were available in this task.

## Unresolved questions

1. Are end timestamps inclusive pickup/return instants, or should intervals be half-open?
2. How long may `PENDING_PAYMENT` reserve capacity before automatic cancellation?
3. Does `rentalQuantity` mean all registered devices or only currently bookable devices?
4. Should a future booking receive a physical serial immediately or only after payment?
5. What Flyway versions already exist in production, since the repository migration directory is absent?

**Status:** DONE_WITH_CONCERNS  
**Summary:** Recommended deterministic product-row locking plus locked recheck, request aggregation, corrected status query, capacity locking, indexes, and PostgreSQL concurrency tests.  
**Concerns/Blockers:** Missing Flyway history/files, undefined boundary semantics, and drift between `rentalQuantity` and physical device status must be resolved before production rollout.
