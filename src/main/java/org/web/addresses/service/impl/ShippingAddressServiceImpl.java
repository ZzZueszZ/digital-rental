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
        return createAddressForUser(user, request);
    }

    @Override
    @Transactional
    public ShippingAddressResponse updateAddress(Long id, ShippingAddressRequest request) {
        User user = getCurrentUser();
        return updateAddressForUser(user, id, request);
    }

    @Override
    @Transactional
    public void deleteAddress(Long id) {
        User user = getCurrentUser();
        deleteAddressForUser(user, id);
    }

    @Override
    @Transactional
    public ShippingAddressResponse setDefaultAddress(Long id) {
        User user = getCurrentUser();
        return setDefaultAddressForUser(user, id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShippingAddressResponse> getByUserId(Long userId) {
        User user = findUserById(userId);
        return mapper.toResponses(addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user));
    }

    @Override
    @Transactional
    public ShippingAddressResponse createByUserId(Long userId, ShippingAddressRequest request) {
        User user = findUserById(userId);
        return createAddressForUser(user, request);
    }

    @Override
    @Transactional
    public ShippingAddressResponse updateByUserId(Long userId, Long addressId, ShippingAddressRequest request) {
        User user = findUserById(userId);
        return updateAddressForUser(user, addressId, request);
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId, Long addressId) {
        User user = findUserById(userId);
        deleteAddressForUser(user, addressId);
    }

    @Override
    @Transactional
    public ShippingAddressResponse setDefaultByUserId(Long userId, Long addressId) {
        User user = findUserById(userId);
        return setDefaultAddressForUser(user, addressId);
    }

    // Helper methods for internal reuse
    private ShippingAddressResponse createAddressForUser(User user, ShippingAddressRequest request) {
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

        boolean shouldBeDefault = Boolean.TRUE.equals(request.getSetAsDefault()) || addressRepository.countByUser(user) == 0;

        if (shouldBeDefault) {
            handlePreviousDefault(user);
            address.setDefault(true);
        }

        ShippingAddress saved = addressRepository.save(address);

        auditLogService.logAction("ADDRESS", saved.getId(), "CREATE_ADDRESS",
                "Created shipping address for user " + user.getId() + ": " + saved.getReceiverName(),
                null,
                "{\"fullAddress\":\"" + saved.getFullAddress() + "\",\"isDefault\":" + saved.isDefault() + "}");

        return mapper.toResponse(saved);
    }

    private ShippingAddressResponse updateAddressForUser(User user, Long addressId, ShippingAddressRequest request) {
        ShippingAddress address = addressRepository.findByIdAndUser(addressId, user)
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
                "Updated shipping address: " + saved.getId(),
                oldDetails,
                "{\"fullAddress\":\"" + saved.getFullAddress() + "\",\"isDefault\":" + saved.isDefault() + "}");

        return mapper.toResponse(saved);
    }

    private void deleteAddressForUser(User user, Long addressId) {
        ShippingAddress address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        if (address.isDefault()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không thể xóa địa chỉ mặc định");
        }

        addressRepository.delete(address);
        auditLogService.logAction("ADDRESS", addressId, "DELETE_ADDRESS", "Deleted shipping address", null, null);
    }

    private ShippingAddressResponse setDefaultAddressForUser(User user, Long addressId) {
        ShippingAddress address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        if (!address.isDefault()) {
            handlePreviousDefault(user);
            address.setDefault(true);
            address = addressRepository.save(address);

            auditLogService.logAction("ADDRESS", addressId, "SET_DEFAULT_ADDRESS",
                    "Set address as default", null, "{\"isDefault\":true}");
        }

        return mapper.toResponse(address);
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "User not found with id: " + userId));
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
