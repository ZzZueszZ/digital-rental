package org.web.rentals.service;

import org.springframework.data.domain.Page;
import org.web.common.enums.RentalOrderStatus;
import org.web.rentals.dto.request.*;
import org.web.rentals.dto.response.*;
import org.web.users.model.User;

import java.time.LocalDateTime;
import java.util.List;

public interface RentalService {

    boolean checkProductAvailability(Long productId, LocalDateTime startDate, LocalDateTime endDate, int requestedQty);

    RentalOrderResponse createRentalOrder(User user, RentalCheckoutRequest request);

    Page<RentalOrderResponse> getMyRentals(User user, RentalOrderStatus status, int page, int size);

    RentalOrderResponse getRentalDetail(Long id, User currentUser);

    RentalOrderResponse getRentalDetailByCode(String code, User currentUser);

    RentalOrderResponse signContract(Long id, User user, String signature);

    RentalOrderResponse payDeposit(Long id);

    // Staff actions
    Page<RentalOrderResponse> getAllRentals(RentalOrderStatus status, int page, int size);

    RentalOrderResponse approveRental(Long id, ApproveRentalRequest request);

    RentalOrderResponse rejectRental(Long id, String reason);

    RentalOrderResponse handoverDevices(Long id, HandoverRentalRequest request);

    RentalOrderResponse returnDevices(Long id, ReturnRentalRequest request);

    RentalOrderResponse settleAndComplete(Long id);

    // Device Management
    DeviceResponse createDevice(DeviceRequest request);

    DeviceResponse updateDevice(Long id, DeviceRequest request);

    List<DeviceResponse> getDevicesByProduct(Long productId);

    List<DeviceResponse> getAvailableDevices(Long productId);
}
