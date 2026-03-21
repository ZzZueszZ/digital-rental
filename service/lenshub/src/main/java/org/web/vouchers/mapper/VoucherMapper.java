package org.web.vouchers.mapper;

import org.springframework.stereotype.Component;
import org.web.common.enums.VoucherStatus;
import org.web.vouchers.dto.request.VoucherCreateRequest;
import org.web.vouchers.dto.request.VoucherUpdateRequest;
import org.web.vouchers.dto.response.VoucherResponse;
import org.web.vouchers.model.Voucher;

@Component
public class VoucherMapper {

    public Voucher toEntity(VoucherCreateRequest request) {
        if (request == null) return null;
        return Voucher.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .scope(request.getScope())
                .discountValue(request.getDiscountValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderValue(request.getMinOrderValue())
                .maxUsagePerUser(request.getMaxUsagePerUser())
                .maxUsage(request.getMaxUsage())
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(VoucherStatus.DRAFT)
                .build();
    }

    public VoucherResponse toResponse(Voucher entity) {
        if (entity == null) return null;
        return VoucherResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .scope(entity.getScope())
                .discountValue(entity.getDiscountValue())
                .maxDiscountAmount(entity.getMaxDiscountAmount())
                .minOrderValue(entity.getMinOrderValue())
                .maxUsagePerUser(entity.getMaxUsagePerUser())
                .maxUsage(entity.getMaxUsage())
                .usedCount(entity.getUsedCount())
                .status(entity.getStatus())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .build();
    }

    public void applyUpdate(Voucher voucher, VoucherUpdateRequest request) {
        if (request == null || voucher == null) return;
        
        if (request.getName() != null) voucher.setName(request.getName());
        if (request.getDescription() != null) voucher.setDescription(request.getDescription());
        if (request.getType() != null) voucher.setType(request.getType());
        if (request.getScope() != null) voucher.setScope(request.getScope());
        if (request.getDiscountValue() != null) voucher.setDiscountValue(request.getDiscountValue());
        if (request.getMaxDiscountAmount() != null) voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getMinOrderValue() != null) voucher.setMinOrderValue(request.getMinOrderValue());
        if (request.getMaxUsagePerUser() != null) voucher.setMaxUsagePerUser(request.getMaxUsagePerUser());
        if (request.getMaxUsage() != null) voucher.setMaxUsage(request.getMaxUsage());
        if (request.getStartDate() != null) voucher.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) voucher.setEndDate(request.getEndDate());
    }
}
