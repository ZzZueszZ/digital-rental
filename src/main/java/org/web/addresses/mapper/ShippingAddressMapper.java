package org.web.addresses.mapper;

import org.springframework.stereotype.Component;
import org.web.addresses.dto.response.ShippingAddressResponse;
import org.web.addresses.model.ShippingAddress;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ShippingAddressMapper {

    public ShippingAddressResponse toResponse(ShippingAddress address) {
        if (address == null) return null;
        return ShippingAddressResponse.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .fullAddress(address.getFullAddress())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .detailAddress(address.getDetailAddress())
                .isDefault(address.isDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }

    public List<ShippingAddressResponse> toResponses(List<ShippingAddress> addresses) {
        if (addresses == null) return List.of();
        return addresses.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
