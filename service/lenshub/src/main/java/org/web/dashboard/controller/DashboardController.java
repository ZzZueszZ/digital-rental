package org.web.dashboard.controller;

import org.web.common.dto.ApiResponse;
import org.web.dashboard.dto.*;
import org.web.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // REVENUE
    @GetMapping("/revenue")
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public org.springframework.http.ResponseEntity<ApiResponse<RevenueDashboardResponse>> getRevenueStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();

        return org.springframework.http.ResponseEntity.ok(ApiResponse.successfulResponse(
                "Lấy thống kê doanh thu thành công!",
                dashboardService.getRevenueStats(from, to)
        ));
    }

    @GetMapping("/revenue/export")
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public ResponseEntity<byte[]> exportRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false, defaultValue = "total") String type
    ) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();

        RevenueReportType reportType = RevenueReportType.from(type);
        byte[] file = dashboardService.exportRevenueReport(from, to, reportType);
        String filename = "revenue-report-" + reportType.fileSuffix() + "-" + from + "_to_" + to + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(file.length)
                .body(file);
    }

    // ORDERS
    @GetMapping("/orders/summary")
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public org.springframework.http.ResponseEntity<ApiResponse<OrderStatResponse>> getOrderStats() {
        return org.springframework.http.ResponseEntity.ok(ApiResponse.successfulResponse(
                "Lấy thống kê đơn hàng thành công!",
                dashboardService.getOrderStats()
        ));
    }

    // TOP PRODUCTS
    @GetMapping("/top-products")
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public org.springframework.http.ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return org.springframework.http.ResponseEntity.ok(ApiResponse.successfulResponse(
                "Lấy danh sách sản phẩm bán chạy thành công!",
                dashboardService.getTopSellingProducts(limit)
        ));
    }

    // LOW STOCK
    @GetMapping("/low-stock")
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public org.springframework.http.ResponseEntity<ApiResponse<List<LowStockResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold
    ) {
        return org.springframework.http.ResponseEntity.ok(ApiResponse.successfulResponse(
                "Lấy danh sách sản phẩm sắp hết hàng thành công!",
                dashboardService.getLowStockProducts(threshold)
        ));
    }

    // DAILY ORDERS CHART
    @GetMapping("/orders/daily-chart")
    @PreAuthorize("hasAuthority('DASHBOARD_READ') or hasAuthority('ORDER_MANAGE')")
    public org.springframework.http.ResponseEntity<ApiResponse<List<DailyOrderStatResponse>>> getDailyOrderStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();

        return org.springframework.http.ResponseEntity.ok(ApiResponse.successfulResponse(
                "Lấy thống kê đơn hàng hàng ngày thành công!",
                dashboardService.getDailyOrderStats(from, to)
        ));
    }

    // USER STATS
    @GetMapping("/users/summary")
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public org.springframework.http.ResponseEntity<ApiResponse<UserStatResponse>> getUserStats() {
        return org.springframework.http.ResponseEntity.ok(ApiResponse.successfulResponse(
                "Lấy thống kê người dùng thành công!",
                dashboardService.getUserStats()
        ));
    }
}
