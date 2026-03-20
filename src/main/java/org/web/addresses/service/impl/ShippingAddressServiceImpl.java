package org.web.addresses.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.addresses.dto.request.ShippingAddressRequest;
import org.web.addresses.dto.response.ShippingAddressResponse;
import org.web.addresses.mapper.ShippingAddressMapper;
import org.web.addresses.model.ShippingAddress;
import org.web.addresses.repository.ShippingAddressRepository;
import org.web.addresses.service.ShippingAddressService;
import org.web.common.exceptions.ApplicationException;
import org.web.common.service.AuditLogService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingAddressServiceImpl implements ShippingAddressService {

    private final ShippingAddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ShippingAddressMapper mapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<ShippingAddressResponse> getMyAddresses() {
        User user = getCurrentUser();
        List<ShippingAddress> addresses = addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
        return mapper.toResponses(addresses);
    }

    @Override
    @Transactional
    public ShippingAddressResponse createAddress(ShippingAddressRequest request) {
        User user = getCurrentUser();

        ShippingAddress address = ShippingAddress.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .fullAddress(request.getFullAddress())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .detailAddress(request.getDetailAddress())
                .isDefault(false)
                .build();

        // If it's the 1st address or user explicitly wants it to be default
        boolean shouldBeDefault = Boolean.TRUE.equals(request.getSetAsDefault()) || addressRepository.countByUser(user) == 0;

        if (shouldBeDefault) {
            handlePreviousDefault(user);
            address.setDefault(true);
        }

        ShippingAddress saved = addressRepository.save(address);

        auditLogService.logAction("ADDRESS", saved.getId(), "CREATE_ADDRESS",
                "User created shipping address: " + saved.getReceiverName() + " (" + saved.getReceiverPhone() + ")",
                null,
                "{\"fullAddress\":\"" + saved.getFullAddress() + "\",\"isDefault\":" + saved.isDefault() + "}");

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ShippingAddressResponse updateAddress(Long id, ShippingAddressRequest request) {
        User user = getCurrentUser();
        ShippingAddress address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        String oldDetails = "{\"fullAddress\":\"" + address.getFullAddress() + "\",\"isDefault\":" + address.isDefault() + "}";

        address.setReceiverName(request.getReceiverName());
        address.setReceiverPhone(request.getReceiverPhone());
        address.setFullAddress(request.getFullAddress());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setWard(request.getWard());
        address.setDetailAddress(request.getDetailAddress());

        if (Boolean.TRUE.equals(request.getSetAsDefault()) && !address.isDefault()) {
            handlePreviousDefault(user);
            address.setDefault(true);
        }

        ShippingAddress saved = addressRepository.save(address);

        auditLogService.logAction("ADDRESS", saved.getId(), "UPDATE_ADDRESS",
                "User updated shipping address: " + saved.getId(),
                oldDetails,
                "{\"fullAddress\":\"" + saved.getFullAddress() + "\",\"isDefault\":" + saved.isDefault() + "}");

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAddress(Long id) {
        User user = getCurrentUser();
        ShippingAddress address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        if (address.isDefault()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không thể xóa địa chỉ mặc định");
        }

        addressRepository.delete(address);

        auditLogService.logAction("ADDRESS", id, "DELETE_ADDRESS",
                "User deleted shipping address", null, null);
    }

    @Override
    @Transactional
    public ShippingAddressResponse setDefaultAddress(Long id) {
        User user = getCurrentUser();
        ShippingAddress address = addressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        if (!address.isDefault()) {
            handlePreviousDefault(user);
            address.setDefault(true);
            address = addressRepository.save(address);

            auditLogService.logAction("ADDRESS", id, "SET_DEFAULT_ADDRESS",
                    "User set address as default", null, "{\"isDefault\":true}");
        }

        return mapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShippingAddressResponse> getByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found"));
        return mapper.toResponses(addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user));
    }

    private void handlePreviousDefault(User user) {
        addressRepository.findByUserAndIsDefaultTrue(user).ifPresent(oldDefault -> {
            oldDefault.setDefault(false);
            addressRepository.save(oldDefault);
        });
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found with email: " + auth.getName()));
    }
}
