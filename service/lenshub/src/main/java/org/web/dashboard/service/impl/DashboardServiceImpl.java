package org.web.dashboard.service.impl;

import org.web.common.enums.AccountStatus;
import org.web.common.enums.OrderStatus;
import org.web.dashboard.dto.*;
import org.web.dashboard.service.DashboardService;
import org.web.orders.repository.OrderItemRepository;
import org.web.orders.repository.OrderRepository;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueDashboardResponse getRevenueStats(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        
        List<OrderStatus> statuses = Arrays.asList(
                OrderStatus.COMPLETED
        );
        
        List<RevenueStatResponse> stats = orderRepository.getRevenueStats(statuses, start, end);
        
        BigDecimal totalRevenue = stats.stream()
                .map(RevenueStatResponse::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Growth Rate Calculation
        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(from, to) + 1;
        LocalDateTime prevStart = start.minusDays(daysDiff);
        LocalDateTime prevEnd = start.minusNanos(1);

        List<RevenueStatResponse> prevStats = orderRepository.getRevenueStats(statuses, prevStart, prevEnd);
        BigDecimal prevRevenue = prevStats.stream()
                .map(RevenueStatResponse::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double growthRate = 0.0;
        if (prevRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = totalRevenue.subtract(prevRevenue);
            growthRate = diff.divide(prevRevenue, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        } else if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growthRate = 100.0;
        }

        return RevenueDashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .growthRate(growthRate)
                .dailyStats(stats)
                .build();
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
