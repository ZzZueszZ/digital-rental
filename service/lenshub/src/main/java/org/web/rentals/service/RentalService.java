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

    void sendSigningOtp(Long id, User user);

    RentalOrderResponse signContract(Long id, User user, SignContractRequest request);

    RentalOrderResponse payDeposit(Long id);

    // Staff actions
    Page<RentalOrderResponse> getAllRentals(RentalOrderStatus status, int page, int size);

    RentalOrderResponse getStaffRentalDetail(Long id);

    RentalOrderResponse prepareRental(Long id, PrepareRentalRequest request);

    RentalOrderResponse rejectRental(Long id, String reason);

    RentalOrderResponse createHandoverReport(Long id, User staff, HandoverReportRequest request);

    RentalOrderResponse collectDeposit(Long id, CollectDepositRequest request);

    RentalOrderResponse handoverDevices(Long id);

    RentalOrderResponse createReturnReport(Long id, User staff, ReturnReportRequest request);

    RentalOrderResponse completeRental(Long id, User staff, CompleteRentalRequest request);

    // Device Management
    DeviceResponse createDevice(DeviceRequest request);

    DeviceResponse updateDevice(Long id, DeviceRequest request);

    List<DeviceResponse> getDevicesByProduct(Long productId);

    List<DeviceResponse> getAvailableDevices(Long productId);

    DeviceResponse updateDeviceStatus(Long id, DeviceStatusRequest request);

    void deleteDevice(Long id);
}
