package org.web.inventory.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.common.exceptions.ApplicationException;
import org.web.inventory.dto.request.AdjustStockRequest;
import org.web.inventory.dto.response.InventoryAuditResponse;
import org.web.inventory.model.InventoryAuditLog;
import org.web.inventory.repository.InventoryAuditLogRepository;
import org.web.inventory.service.InventoryService;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;
    private final InventoryAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Chưa xác thực");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
    }

    @Override
    @Transactional
    public InventoryAuditResponse adjustStock(Long productId, AdjustStockRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        String stockType = request.getType() != null ? request.getType().toUpperCase() : "SALE";
        if (!stockType.equals("RENTAL") && !stockType.equals("SALE")) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Loại tồn kho không hợp lệ. Phải là SALE hoặc RENTAL.");
        }

        int oldStock = stockType.equals("RENTAL") ? product.getRentalQuantity() : product.getQuantity();
        int delta = request.getQuantityChange();
        int newStock = oldStock + delta;

        if (newStock < 0) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Tồn kho không thể âm");
        }

        if (stockType.equals("RENTAL")) {
            product.setRentalQuantity(newStock);
        } else {
            product.setQuantity(newStock);
        }
        productRepository.save(product);

        User changedBy = getCurrentUser();

        InventoryAuditLog log = InventoryAuditLog.builder()
                .product(product)
                .oldStock(oldStock)
                .newStock(newStock)
                .stockType(stockType)
                .reason(request.getReason())
                .changedBy(changedBy)
                .build();
        
        log = auditLogRepository.save(log);

        return mapToResponse(log);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryAuditResponse> getInventoryLogs(Long productId, LocalDate fromDate, LocalDate toDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : LocalDate.of(2000, 1, 1).atStartOfDay();
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : LocalDate.of(2100, 1, 1).atTime(LocalTime.MAX);

        Page<InventoryAuditLog> logsPage;

        if (productId != null) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
            logsPage = auditLogRepository.findByProductAndCreatedAtBetweenOrderByCreatedAtDesc(product, from, to, pageable);
        } else {
            logsPage = auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to, pageable);
        }

        List<InventoryAuditResponse> content = logsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(content, pageable, logsPage.getTotalElements());
    }

    private InventoryAuditResponse mapToResponse(InventoryAuditLog log) {
        return InventoryAuditResponse.builder()
                .id(log.getId())
                .productId(log.getProduct().getId())
                .productName(log.getProduct().getName())
                .oldStock(log.getOldStock())
                .newStock(log.getNewStock())
                .stockType(log.getStockType())
                .reason(log.getReason())
                .changedByEmail(log.getChangedBy() != null ? log.getChangedBy().getEmail() : "Unknown")
                .changedAt(log.getCreatedAt())
                .build();
    }
}
