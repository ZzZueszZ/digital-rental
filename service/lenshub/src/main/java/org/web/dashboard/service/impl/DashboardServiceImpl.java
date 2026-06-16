package org.web.dashboard.service.impl;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.web.common.enums.AccountStatus;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalOrderStatus;
import org.web.common.enums.RentalPaymentType;
import org.web.dashboard.dto.*;
import org.web.dashboard.service.DashboardService;
import org.web.orders.repository.OrderItemRepository;
import org.web.orders.repository.OrderRepository;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.rentals.repository.RentalOrderRepository;
import org.web.rentals.repository.RentalOrderItemRepository;
import org.web.rentals.repository.RentalPaymentRepository;
import org.web.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final RentalOrderItemRepository rentalOrderItemRepository;
    private final RentalPaymentRepository rentalPaymentRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueDashboardResponse getRevenueStats(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        
        List<OrderStatus> statuses = Arrays.asList(
                OrderStatus.COMPLETED
        );
        
        List<RevenueStatResponse> purchaseStats = orderRepository.getRevenueStats(statuses, start, end);
        List<RevenueStatResponse> rentalStats = getRentalRevenueStats(start, end);

        BigDecimal purchaseRevenue = sumRevenue(purchaseStats);
        BigDecimal rentalRevenue = sumRevenue(rentalStats);
        BigDecimal totalRevenue = purchaseRevenue.add(rentalRevenue);

        // Growth Rate Calculation
        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(from, to) + 1;
        LocalDateTime prevStart = start.minusDays(daysDiff);
        LocalDateTime prevEnd = start.minusNanos(1);

        BigDecimal previousPurchaseRevenue = sumRevenue(
                orderRepository.getRevenueStats(statuses, prevStart, prevEnd)
        );
        BigDecimal previousRentalRevenue = sumRevenue(getRentalRevenueStats(prevStart, prevEnd));
        BigDecimal previousTotalRevenue = previousPurchaseRevenue.add(previousRentalRevenue);

        return RevenueDashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .purchaseRevenue(purchaseRevenue)
                .rentalRevenue(rentalRevenue)
                .growthRate(calculateGrowthRate(totalRevenue, previousTotalRevenue))
                .purchaseGrowthRate(calculateGrowthRate(purchaseRevenue, previousPurchaseRevenue))
                .rentalGrowthRate(calculateGrowthRate(rentalRevenue, previousRentalRevenue))
                .dailyStats(mergeRevenueStats(purchaseStats, rentalStats))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportRevenueReport(LocalDate from, LocalDate to, RevenueReportType type) {
        RevenueDashboardResponse revenue = getRevenueStats(from, to);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Doanh thu");
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle moneyStyle = createMoneyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            int rowIndex = 0;
            Row titleRow = sheet.createRow(rowIndex++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(resolveReportTitle(type));
            titleCell.setCellStyle(titleStyle);

            sheet.createRow(rowIndex++).createCell(0).setCellValue(
                    "Thời gian: " + from + " đến " + to
            );
            sheet.createRow(rowIndex++);

            Row summaryHeader = sheet.createRow(rowIndex++);
            createStyledCell(summaryHeader, 0, "Chỉ tiêu", headerStyle);
            createStyledCell(summaryHeader, 1, "Giá trị", headerStyle);

            if (type == RevenueReportType.TOTAL || type == RevenueReportType.PURCHASE) {
                rowIndex = writeSummaryRow(sheet, rowIndex, "Doanh thu bán hàng", revenue.getPurchaseRevenue(), moneyStyle);
            }
            if (type == RevenueReportType.TOTAL || type == RevenueReportType.RENTAL) {
                rowIndex = writeSummaryRow(sheet, rowIndex, "Doanh thu cho thuê", revenue.getRentalRevenue(), moneyStyle);
            }
            if (type == RevenueReportType.TOTAL) {
                rowIndex = writeSummaryRow(sheet, rowIndex, "Tổng doanh thu", revenue.getTotalRevenue(), moneyStyle);
            }
            sheet.createRow(rowIndex++);

            Row tableHeader = sheet.createRow(rowIndex++);
            int col = 0;
            createStyledCell(tableHeader, col++, "Ngày", headerStyle);
            if (type == RevenueReportType.TOTAL || type == RevenueReportType.PURCHASE) {
                createStyledCell(tableHeader, col++, "Doanh thu bán hàng", headerStyle);
            }
            if (type == RevenueReportType.TOTAL || type == RevenueReportType.RENTAL) {
                createStyledCell(tableHeader, col++, "Doanh thu cho thuê", headerStyle);
            }
            if (type == RevenueReportType.TOTAL) {
                createStyledCell(tableHeader, col, "Tổng doanh thu", headerStyle);
            }

            for (RevenueStatResponse stat : revenue.getDailyStats()) {
                Row row = sheet.createRow(rowIndex++);
                int valueCol = 0;
                Cell dateCell = row.createCell(valueCol++);
                dateCell.setCellValue(stat.getDate().toString());
                dateCell.setCellStyle(dateStyle);

                if (type == RevenueReportType.TOTAL || type == RevenueReportType.PURCHASE) {
                    createMoneyCell(row, valueCol++, stat.getPurchaseRevenue(), moneyStyle);
                }
                if (type == RevenueReportType.TOTAL || type == RevenueReportType.RENTAL) {
                    createMoneyCell(row, valueCol++, stat.getRentalRevenue(), moneyStyle);
                }
                if (type == RevenueReportType.TOTAL) {
                    createMoneyCell(row, valueCol, stat.getRevenue(), moneyStyle);
                }
            }

            for (int i = 0; i < 4; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Không thể xuất báo cáo doanh thu", e);
        }
    }

    private List<RevenueStatResponse> getRentalRevenueStats(LocalDateTime start, LocalDateTime end) {
        List<RevenueStatResponse> rentalFees = rentalOrderRepository.getRentalFeeRevenueStats(
                PaymentStatus.SUCCESS,
                start,
                end
        );
        List<RevenueStatResponse> extraFees = rentalPaymentRepository.getRevenueStats(
                PaymentStatus.SUCCESS,
                List.of(RentalPaymentType.EXTRA_FEE_OFFLINE),
                start,
                end
        );

        Map<LocalDate, BigDecimal> revenueByDate = new TreeMap<>();
        addRevenue(revenueByDate, rentalFees);
        addRevenue(revenueByDate, extraFees);

        return revenueByDate.entrySet().stream()
                .map(entry -> new RevenueStatResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<RevenueStatResponse> mergeRevenueStats(
            List<RevenueStatResponse> purchaseStats,
            List<RevenueStatResponse> rentalStats
    ) {
        Map<LocalDate, RevenueStatResponse> merged = new TreeMap<>();

        for (RevenueStatResponse stat : purchaseStats) {
            merged.computeIfAbsent(stat.getDate(), this::emptyRevenueStat)
                    .setPurchaseRevenue(stat.getRevenue());
        }
        for (RevenueStatResponse stat : rentalStats) {
            merged.computeIfAbsent(stat.getDate(), this::emptyRevenueStat)
                    .setRentalRevenue(stat.getRevenue());
        }

        List<RevenueStatResponse> result = new ArrayList<>(merged.values());
        result.forEach(stat -> stat.setRevenue(
                stat.getPurchaseRevenue().add(stat.getRentalRevenue())
        ));
        return result;
    }

    private RevenueStatResponse emptyRevenueStat(LocalDate date) {
        return RevenueStatResponse.builder()
                .date(date)
                .revenue(BigDecimal.ZERO)
                .purchaseRevenue(BigDecimal.ZERO)
                .rentalRevenue(BigDecimal.ZERO)
                .build();
    }

    private void addRevenue(Map<LocalDate, BigDecimal> target, List<RevenueStatResponse> stats) {
        for (RevenueStatResponse stat : stats) {
            target.merge(stat.getDate(), stat.getRevenue(), BigDecimal::add);
        }
    }

    private BigDecimal sumRevenue(List<RevenueStatResponse> stats) {
        return stats.stream()
                .map(RevenueStatResponse::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Double calculateGrowthRate(BigDecimal currentRevenue, BigDecimal previousRevenue) {
        if (previousRevenue.compareTo(BigDecimal.ZERO) > 0) {
            return currentRevenue.subtract(previousRevenue)
                    .divide(previousRevenue, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }
        return currentRevenue.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
    }

    private String resolveReportTitle(RevenueReportType type) {
        return switch (type) {
            case PURCHASE -> "Báo cáo doanh thu bán hàng";
            case RENTAL -> "Báo cáo doanh thu cho thuê";
            case TOTAL -> "Báo cáo tổng doanh thu";
        };
    }

    private int writeSummaryRow(Sheet sheet, int rowIndex, String label, BigDecimal value, CellStyle moneyStyle) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(label);
        createMoneyCell(row, 1, value, moneyStyle);
        return rowIndex + 1;
    }

    private void createStyledCell(Row row, int columnIndex, String value, CellStyle style) {
        Cell cell = row.createCell(columnIndex);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void createMoneyCell(Row row, int columnIndex, BigDecimal value, CellStyle style) {
        Cell cell = row.createCell(columnIndex);
        cell.setCellValue(value == null ? 0 : value.doubleValue());
        cell.setCellStyle(style);
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createMoneyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0 \"đ\""));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        return workbook.createCellStyle();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderStatResponse getOrderStats() {
        List<Object[]> rawStats = orderRepository.countOrdersByStatus();
        java.util.Map<String, Long> byStatus = new java.util.HashMap<>();
        long total = 0;

        for (Object[] row : rawStats) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];
            byStatus.put(status.name(), count);
            total += count;
        }
        
        for (OrderStatus status : OrderStatus.values()) {
            byStatus.putIfAbsent(status.name(), 0L);
        }

        return OrderStatResponse.builder()
                .totalOrders(total)
                .byStatus(byStatus)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductResponse> getTopSellingProducts(int limit) {
        List<OrderStatus> validStatuses = Arrays.asList(OrderStatus.COMPLETED);
        Map<Long, TopProductResponse> byProduct = new LinkedHashMap<>();

        orderItemRepository.findTopSellingProducts(validStatuses, PageRequest.of(0, limit))
                .forEach(product -> byProduct.put(product.getProductId(), product));

        List<RentalOrderStatus> rentalStatuses = Arrays.stream(RentalOrderStatus.values())
                .filter(status -> status != RentalOrderStatus.CANCELLED)
                .toList();

        for (Object[] row : rentalOrderItemRepository.findTopRentedProductStats(rentalStatuses)) {
            Long productId = ((Number) row[0]).longValue();
            TopProductResponse product = byProduct.get(productId);
            Long totalRented = ((Number) row[4]).longValue();
            BigDecimal rentalRevenue = row[5] instanceof BigDecimal value ? value : BigDecimal.ZERO;

            if (product == null) {
                product = TopProductResponse.builder()
                        .productId(productId)
                        .productName((String) row[1])
                        .brand((String) row[2])
                        .imageUrl((String) row[3])
                        .totalSold(0L)
                        .totalRented(totalRented)
                        .revenue(rentalRevenue)
                        .build();
                byProduct.put(productId, product);
            } else {
                product.setTotalRented(totalRented);
                product.setRevenue(nullSafe(product.getRevenue()).add(rentalRevenue));
            }
        }

        return byProduct.values().stream()
                .peek(product -> {
                    if (product.getTotalSold() == null) product.setTotalSold(0L);
                    if (product.getTotalRented() == null) product.setTotalRented(0L);
                    if (product.getRevenue() == null) product.setRevenue(BigDecimal.ZERO);
                })
                .sorted(Comparator
                        .comparingLong((TopProductResponse product) ->
                                product.getTotalSold() + product.getTotalRented())
                        .reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LowStockResponse> getLowStockProducts(int threshold) {
        List<Product> lowStocks = productRepository.findByQuantityLessThan(threshold);

        return lowStocks.stream()
                .map(p -> LowStockResponse.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .imageUrl(p.getMainImageUrl())
                        .stock(p.getQuantity())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserStatResponse getUserStats() {
        long total = userRepository.count();
        long active = userRepository.countByAccountStatus(AccountStatus.ACTIVE);
        long pending = userRepository.countByAccountStatus(AccountStatus.PENDING);
        long disabled = userRepository.countByAccountStatus(AccountStatus.DISABLED); 
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long newToday = userRepository.countByCreatedAtBetween(startOfDay, endOfDay);

        return UserStatResponse.builder()
                .totalUsers(total)
                .activeUsers(active)
                .pendingUsers(pending)
                .disabledUsers(disabled)
                .newUsersToday(newToday)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyOrderStatResponse> getDailyOrderStats(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        
        List<OrderStatus> statuses = Arrays.asList(OrderStatus.COMPLETED, OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.DELIVERED);
        List<RentalOrderStatus> rentalStatuses = Arrays.asList(
                RentalOrderStatus.PENDING_PAYMENT,
                RentalOrderStatus.PAID_RENTAL_FEE,
                RentalOrderStatus.WAITING_PICKUP,
                RentalOrderStatus.RENTING,
                RentalOrderStatus.RETURNED,
                RentalOrderStatus.COMPLETED
        );

        Map<LocalDate, DailyOrderStatResponse> merged = new TreeMap<>();

        for (DailyOrderStatResponse stat : orderRepository.getDailyOrderStats(statuses, start, end)) {
            DailyOrderStatResponse daily = merged.computeIfAbsent(stat.getDate(), this::emptyDailyOrderStat);
            long purchaseCount = stat.getCount() == null ? 0L : stat.getCount();
            daily.setPurchaseCount(purchaseCount);
            daily.setCount(daily.getCount() + purchaseCount);
        }

        for (Object[] row : rentalOrderRepository.getDailyRentalOrderStats(rentalStatuses, start, end)) {
            LocalDate date = toLocalDate(row[0]);
            long rentalCount = ((Number) row[1]).longValue();
            DailyOrderStatResponse daily = merged.computeIfAbsent(date, this::emptyDailyOrderStat);
            daily.setRentalCount(rentalCount);
            daily.setCount(daily.getCount() + rentalCount);
        }

        return new ArrayList<>(merged.values());
    }

    private DailyOrderStatResponse emptyDailyOrderStat(LocalDate date) {
        return DailyOrderStatResponse.builder()
                .date(date)
                .count(0L)
                .purchaseCount(0L)
                .rentalCount(0L)
                .build();
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof java.sql.Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
