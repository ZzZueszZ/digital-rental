package org.web.dashboard.service;

import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.web.dashboard.dto.RevenueReportType;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.web.dashboard.dto.RevenueDashboardResponse;
import org.web.dashboard.dto.RevenueStatResponse;
import org.web.dashboard.service.impl.DashboardServiceImpl;
import org.web.common.enums.RentalPaymentType;
import org.web.orders.repository.OrderItemRepository;
import org.web.orders.repository.OrderRepository;
import org.web.products.repository.ProductRepository;
import org.web.rentals.repository.RentalOrderRepository;
import org.web.rentals.repository.RentalPaymentRepository;
import org.web.users.repository.UserRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RentalOrderRepository rentalOrderRepository;
    @Mock
    private RentalPaymentRepository rentalPaymentRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void getRevenueStatsCombinesPurchaseRentalAndExtraFeeRevenue() {
        LocalDate currentDate = LocalDate.of(2026, 6, 12);
        LocalDate previousDate = LocalDate.of(2026, 6, 11);

        when(orderRepository.getRevenueStats(anyList(), any(), any()))
                .thenReturn(
                        List.of(stat(currentDate, "100")),
                        List.of(stat(previousDate, "50"))
                );
        when(rentalOrderRepository.getRentalFeeRevenueStats(any(), any(), any()))
                .thenReturn(
                        List.of(stat(currentDate, "300")),
                        List.of(stat(previousDate, "200"))
                );
        when(rentalPaymentRepository.getRevenueStats(
                any(),
                eq(List.of(RentalPaymentType.EXTRA_FEE_OFFLINE)),
                any(),
                any()
        ))
                .thenReturn(
                        List.of(stat(currentDate, "50")),
                        List.of()
                );

        RevenueDashboardResponse result = dashboardService.getRevenueStats(currentDate, currentDate);

        assertEquals(new BigDecimal("100"), result.getPurchaseRevenue());
        assertEquals(new BigDecimal("350"), result.getRentalRevenue());
        assertEquals(new BigDecimal("450"), result.getTotalRevenue());
        assertEquals(100.0, result.getPurchaseGrowthRate());
        assertEquals(75.0, result.getRentalGrowthRate());
        assertEquals(80.0, result.getGrowthRate());

        assertEquals(1, result.getDailyStats().size());
        RevenueStatResponse daily = result.getDailyStats().get(0);
        assertEquals(currentDate, daily.getDate());
        assertEquals(new BigDecimal("100"), daily.getPurchaseRevenue());
        assertEquals(new BigDecimal("350"), daily.getRentalRevenue());
        assertEquals(new BigDecimal("450"), daily.getRevenue());
    }

    @Test
    void exportRevenueReportCreatesExcelWorkbook() throws IOException {
        LocalDate currentDate = LocalDate.of(2026, 6, 12);
        LocalDate previousDate = LocalDate.of(2026, 6, 11);

        when(orderRepository.getRevenueStats(anyList(), any(), any()))
                .thenReturn(
                        List.of(stat(currentDate, "1000000")),
                        List.of(stat(previousDate, "500000"))
                );
        when(rentalOrderRepository.getRentalFeeRevenueStats(any(), any(), any()))
                .thenReturn(
                        List.of(stat(currentDate, "300000")),
                        List.of(stat(previousDate, "200000"))
                );
        when(rentalPaymentRepository.getRevenueStats(
                any(),
                eq(List.of(RentalPaymentType.EXTRA_FEE_OFFLINE)),
                any(),
                any()
        ))
                .thenReturn(
                        List.of(stat(currentDate, "50000")),
                        List.of()
                );

        byte[] file = dashboardService.exportRevenueReport(
                currentDate,
                currentDate,
                RevenueReportType.TOTAL
        );

        assertTrue(file.length > 0);
        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(file))) {
            var sheet = workbook.getSheet("Doanh thu");
            assertEquals("Báo cáo tổng doanh thu", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Ngày", sheet.getRow(8).getCell(0).getStringCellValue());
            assertEquals("Doanh thu bán hàng", sheet.getRow(8).getCell(1).getStringCellValue());
            assertEquals("Doanh thu cho thuê", sheet.getRow(8).getCell(2).getStringCellValue());
            assertEquals("Tổng doanh thu", sheet.getRow(8).getCell(3).getStringCellValue());
        }
    }

    private RevenueStatResponse stat(LocalDate date, String revenue) {
        return new RevenueStatResponse(date, new BigDecimal(revenue));
    }
}
