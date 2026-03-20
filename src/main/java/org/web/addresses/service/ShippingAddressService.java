package org.web.addresses.service;

import org.web.addresses.dto.request.ShippingAddressRequest;
import org.web.addresses.dto.response.ShippingAddressResponse;

import java.util.List;

public interface ShippingAddressService {
    List<ShippingAddressResponse> getMyAddresses();
    ShippingAddressResponse createAddress(ShippingAddressRequest request);
    ShippingAddressResponse updateAddress(Long id, ShippingAddressRequest request);
    void deleteAddress(Long id);
    ShippingAddressResponse setDefaultAddress(Long id);
    
    // Admin support
    List<ShippingAddressResponse> getByUserId(Long userId);
    ShippingAddressResponse createByUserId(Long userId, ShippingAddressRequest request);
    ShippingAddressResponse updateByUserId(Long userId, Long addressId, ShippingAddressRequest request);
    void deleteByUserId(Long userId, Long addressId);
    ShippingAddressResponse setDefaultByUserId(Long userId, Long addressId);
}
