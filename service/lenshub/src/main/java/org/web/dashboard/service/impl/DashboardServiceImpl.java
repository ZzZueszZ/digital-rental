package org.web.dashboard.service.impl;

import org.web.common.enums.AccountStatus;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalPaymentType;
import org.web.dashboard.dto.*;
import org.web.dashboard.service.DashboardService;
import org.web.orders.repository.OrderItemRepository;
import org.web.orders.repository.OrderRepository;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.rentals.repository.RentalOrderRepository;
import org.web.rentals.repository.RentalPaymentRepository;
import org.web.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.ArrayList;
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
        return orderItemRepository.findTopSellingProducts(validStatuses, PageRequest.of(0, limit));
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
        
        return orderRepository.getDailyOrderStats(statuses, start, end);
    }
}
