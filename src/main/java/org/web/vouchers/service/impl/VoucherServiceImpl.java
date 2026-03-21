package org.web.vouchers.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.common.enums.VoucherStatus;
import org.web.common.enums.VoucherType;
import org.web.common.exceptions.ApplicationException;
import org.web.common.service.AuditLogService;
import org.web.vouchers.dto.request.VoucherApplyRequest;
import org.web.vouchers.dto.request.VoucherCreateRequest;
import org.web.vouchers.dto.request.VoucherUpdateRequest;
import org.web.vouchers.dto.response.VoucherApplyResponse;
import org.web.vouchers.dto.response.VoucherResponse;
import org.web.vouchers.mapper.VoucherMapper;
import org.web.vouchers.model.Voucher;
import org.web.vouchers.repository.VoucherRepository;
import org.web.vouchers.service.VoucherService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public VoucherResponse create(VoucherCreateRequest request) {
        if (voucherRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ApplicationException(HttpStatus.CONFLICT, "Mã voucher đã tồn tại!");
        }

        validateDates(request.getStartDate(), request.getEndDate());
        validateDiscountConfig(request.getType(), request.getDiscountValue());

        Voucher voucher = voucherMapper.toEntity(request);
        Voucher saved = voucherRepository.save(voucher);
        
        auditLogService.logAction("VOUCHER", saved.getId(), "CREATE_VOUCHER", "Created voucher: " + saved.getCode(), null, null);
        
        return voucherMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VoucherResponse update(Long id, VoucherUpdateRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy voucher!"));

        VoucherType typeAfterUpdate = request.getType() != null ? request.getType() : voucher.getType();
        BigDecimal discountAfterUpdate = request.getDiscountValue() != null
                ? request.getDiscountValue()
                : voucher.getDiscountValue();

        LocalDateTime startDateAfterUpdate = request.getStartDate() != null
                ? request.getStartDate()
                : voucher.getStartDate();
        LocalDateTime endDateAfterUpdate = request.getEndDate() != null
                ? request.getEndDate()
                : voucher.getEndDate();

        validateDates(startDateAfterUpdate, endDateAfterUpdate);
        validateDiscountConfig(typeAfterUpdate, discountAfterUpdate);

        if (voucher.getStatus() == VoucherStatus.EXPIRED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Voucher đã hết hạn không thể cập nhật!");
        }

        voucherMapper.applyUpdate(voucher, request);
        Voucher saved = voucherRepository.save(voucher);
        
        auditLogService.logAction("VOUCHER", saved.getId(), "UPDATE_VOUCHER", "Updated voucher: " + saved.getCode(), null, null);
        
        return voucherMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy voucher!"));

        voucher.setStatus(VoucherStatus.INACTIVE);
        voucherRepository.save(voucher);
        
        auditLogService.logAction("VOUCHER", id, "DEACTIVATE_VOUCHER", "Deactivated voucher: " + voucher.getCode(), null, null);
    }

    @Override
    @Transactional
    public void activate(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy voucher!"));

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Voucher đã hết hạn!");
        }

        voucher.setStatus(VoucherStatus.ACTIVE);
        voucherRepository.save(voucher);
        
        auditLogService.logAction("VOUCHER", id, "ACTIVATE_VOUCHER", "Activated voucher: " + voucher.getCode(), null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Voucher not found!"));
        return voucherMapper.toResponse(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> list(int page, int size) {
        Page<Voucher> vouchers = voucherRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return vouchers.map(voucherMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> listActive(int page, int size) {
        Page<Voucher> vouchers = voucherRepository.findAllByStatus(
                VoucherStatus.ACTIVE,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        LocalDateTime now = LocalDateTime.now();

        List<VoucherResponse> filtered = vouchers.getContent().stream()
                .filter(v -> (v.getStartDate() == null || !now.isBefore(v.getStartDate()))
                        && (v.getEndDate() == null || !now.isAfter(v.getEndDate())))
                .map(voucherMapper::toResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(filtered, vouchers.getPageable(), filtered.size());
    }

    @Override
    @Transactional
    public VoucherApplyResponse apply(VoucherApplyRequest request) {
        String code = request.getCode().trim();
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Mã giảm giá không tồn tại!"));

        LocalDateTime now = LocalDateTime.now();

        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);
            return invalid("Mã giảm giá đã hết hạn!", request);
        }

        if (voucher.getStatus() == VoucherStatus.DRAFT || voucher.getStatus() == VoucherStatus.INACTIVE) {
            return invalid("Mã giảm giá đang bị khóa hoặc chưa được phát hành!", request);
        }

        if (voucher.getStatus() == VoucherStatus.EXPIRED) {
            return invalid("Mã giảm giá đã hết hạn!", request);
        }

        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            return invalid("Chưa đến thời gian áp dụng mã giảm giá!", request);
        }

        try {
            validateDiscountConfig(voucher.getType(), voucher.getDiscountValue());
        } catch (ApplicationException ex) {
            return invalid(ex.getMessage(), request);
        }

        BigDecimal cartTotal = request.getCartTotal();
        BigDecimal discountAmount = BigDecimal.ZERO;

        if (voucher.getMinOrderValue() != null && cartTotal.compareTo(voucher.getMinOrderValue()) < 0) {
            return invalid("Giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng mã này!", request);
        }

        int currentUsed = voucher.getUsedCount() != null ? voucher.getUsedCount() : 0;
        if (voucher.getMaxUsage() != null && currentUsed >= voucher.getMaxUsage()) {
            voucher.setStatus(VoucherStatus.INACTIVE);
            voucherRepository.save(voucher);
            return invalid("Mã giảm giá này đã vượt quá số lần sử dụng tối đa!", request);
        }

        if (voucher.getType() == VoucherType.PERCENTAGE) {
            BigDecimal percent = voucher.getDiscountValue();
            if (percent == null || percent.compareTo(BigDecimal.ZERO) <= 0) {
                return invalid("Giá trị phần trăm cấu hình không hợp lệ!", request);
            }
            discountAmount = cartTotal.multiply(percent).divide(BigDecimal.valueOf(100));

            if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discountAmount = voucher.getMaxDiscountAmount();
            }
            if (discountAmount.compareTo(cartTotal) > 0) {
                discountAmount = cartTotal;
            }

        } else if (voucher.getType() == VoucherType.FIXED_AMOUNT) {
            discountAmount = voucher.getDiscountValue();
            if (discountAmount == null || discountAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return invalid("Giá trị cố định cấu hình không hợp lệ!", request);
            }
            if (discountAmount.compareTo(cartTotal) > 0) {
                discountAmount = cartTotal;
            }
        }

        BigDecimal finalCartTotal = cartTotal.subtract(discountAmount);
        if (finalCartTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalCartTotal = BigDecimal.ZERO;
        }

        int newUsedCount = currentUsed + 1;
        voucher.setUsedCount(newUsedCount);
        if (voucher.getMaxUsage() != null && newUsedCount >= voucher.getMaxUsage()) {
            voucher.setStatus(VoucherStatus.INACTIVE);
        }
        voucherRepository.save(voucher);
        
        auditLogService.logAction("VOUCHER", voucher.getId(), "APPLY_VOUCHER", "Applied voucher " + voucher.getCode() + " with discount: " + discountAmount, null, null);

        return VoucherApplyResponse.builder()
                .valid(true)
                .message("Áp dụng mã giảm giá thành công!")
                .cartTotal(cartTotal)
                .discountAmount(discountAmount)
                .finalPayable(finalCartTotal)
                .build();
    }

    private VoucherApplyResponse invalid(String message, VoucherApplyRequest request) {
        BigDecimal cartTotal = request.getCartTotal();
        return VoucherApplyResponse.builder()
                .valid(false)
                .message(message)
                .cartTotal(cartTotal)
                .discountAmount(BigDecimal.ZERO)
                .finalPayable(cartTotal)
                .build();
    }

    private void validateDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải sau ngày bắt đầu");
        }
    }

    private void validateDiscountConfig(VoucherType type, BigDecimal discountValue) {
        if (type == null) return;

        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Giá trị giảm giá phải lớn hơn 0");
        }

        if (type == VoucherType.PERCENTAGE && discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Giá trị giảm giá theo phần trăm không được quá 100");
        }
    }
}
