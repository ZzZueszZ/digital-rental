package org.web.rentals.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.web.addresses.model.ShippingAddress;
import org.web.addresses.repository.ShippingAddressRepository;
import org.web.common.enums.DeviceStatus;
import org.web.common.enums.KycStatus;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalOrderStatus;
import org.web.common.enums.ReportType;
import org.web.common.exceptions.ApplicationException;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.rentals.dto.request.*;
import org.web.rentals.dto.response.*;
import org.web.rentals.model.*;
import org.web.rentals.repository.*;
import org.web.rentals.service.RentalService;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RentalServiceImpl implements RentalService {

    private final RentalOrderRepository rentalOrderRepository;
    private final RentalOrderItemRepository rentalOrderItemRepository;
    private final RentalContractRepository rentalContractRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceConditionReportRepository deviceConditionReportRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ShippingAddressRepository shippingAddressRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean checkProductAvailability(Long productId, LocalDateTime startDate, LocalDateTime endDate, int requestedQty) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        long rentedCount = rentalOrderRepository.countRentedUnitsInPeriod(productId, startDate, endDate);
        int availableQty = product.getRentalQuantity() - (int) rentedCount;
        return availableQty >= requestedQty;
    }

    @Override
    @Transactional
    public RentalOrderResponse createRentalOrder(User user, RentalCheckoutRequest request) {
        // Strict eKYC Verification rule
        if (user.getKycStatus() != KycStatus.VERIFIED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Tài khoản của bạn chưa được xác thực eKYC. Vui lòng hoàn tất xác thực eKYC trước khi đặt thuê.");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Ngày bắt đầu phải trước ngày trả thiết bị");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate().toLocalDate(), request.getEndDate().toLocalDate());
        if (days <= 0) {
            days = 1; // Minimum is 1 day rental
        }

        List<RentalOrderItem> orderItems = new ArrayList<>();
        BigDecimal totalRentalFee = BigDecimal.ZERO;

        for (RentalCheckoutItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm ID: " + itemReq.getProductId()));

            // Check period availability
            boolean isAvailable = checkProductAvailability(product.getId(), request.getStartDate(), request.getEndDate(), itemReq.getQuantity());
            if (!isAvailable) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, "Thiết bị '" + product.getName() + "' không còn đủ số lượng trống trong khoảng thời gian này.");
            }

            BigDecimal pricePerDay = product.getRentPricePerDay() != null ? product.getRentPricePerDay() : BigDecimal.ZERO;
            BigDecimal subtotal = pricePerDay.multiply(BigDecimal.valueOf(days)).multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalRentalFee = totalRentalFee.add(subtotal);

            // Since checkout request specifies quantity, we create items for each unit requested
            for (int i = 0; i < itemReq.getQuantity(); i++) {
                RentalOrderItem item = RentalOrderItem.builder()
                        .product(product)
                        .pricePerDay(pricePerDay)
                        .build();
                orderItems.add(item);
            }
        }

        String shippingName = request.getShippingName();
        String shippingPhone = request.getShippingPhone();
        String shippingAddress = request.getShippingAddress();

        if (request.getShippingAddressId() != null) {
            ShippingAddress savedAddress = shippingAddressRepository.findByIdAndUser(request.getShippingAddressId(), user)
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Địa chỉ nhận hàng không tồn tại"));
            shippingName = savedAddress.getReceiverName();
            shippingPhone = savedAddress.getReceiverPhone();
            shippingAddress = savedAddress.getFullAddress();
        }

        if (!StringUtils.hasText(shippingName) || !StringUtils.hasText(shippingPhone) || !StringUtils.hasText(shippingAddress)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Thiếu thông tin nhận hàng");
        }

        RentalOrder order = RentalOrder.builder()
                .code("RNT-" + System.currentTimeMillis())
                .user(user)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(RentalOrderStatus.PENDING_APPROVAL)
                .rentalFee(totalRentalFee)
                .depositAmount(BigDecimal.ZERO) // Will be set by Staff upon approval
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.UNPAID)
                .shippingName(shippingName)
                .shippingPhone(shippingPhone)
                .shippingAddress(shippingAddress)
                .build();

        for (RentalOrderItem item : orderItems) {
            item.setRentalOrder(order);
        }
        order.setItems(orderItems);

        RentalOrder saved = rentalOrderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RentalOrderResponse> getMyRentals(User user, RentalOrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<RentalOrder> rentals = rentalOrderRepository.findMyRentals(user, status, pageable);
        return rentals.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RentalOrderResponse getRentalDetail(Long id, User currentUser) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng thuê"));

        // Ensure authorization
        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(r -> r.getCode().equals("ROLE_STAFF") || r.getCode().equals("ROLE_ADMIN") || r.getCode().equals("ROLE_SUPER_ADMIN"));
        if (!isStaff && !order.getUser().getId().equals(currentUser.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn hàng này");
        }

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public RentalOrderResponse getRentalDetailByCode(String code, User currentUser) {
        RentalOrder order = rentalOrderRepository.findByCode(code)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng thuê"));

        boolean isStaff = currentUser.getRoles().stream()
                .anyMatch(r -> r.getCode().equals("ROLE_STAFF") || r.getCode().equals("ROLE_ADMIN") || r.getCode().equals("ROLE_SUPER_ADMIN"));
        if (!isStaff && !order.getUser().getId().equals(currentUser.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn hàng này");
        }

        return mapToResponse(order);
    }

    @Override
    @Transactional
    public RentalOrderResponse signContract(Long id, User user, String signature) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng thuê"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền ký hợp đồng này");
        }

        if (order.getStatus() != RentalOrderStatus.PAID_DEPOSIT) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái đã đóng tiền cọc (PAID_DEPOSIT) để thực hiện ký hợp đồng.");
        }

        RentalContract contract = order.getContract();
        if (contract == null) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Hợp đồng chưa được khởi tạo cho đơn hàng này.");
        }

        if (contract.isLocked()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Hợp đồng này đã được ký và khóa.");
        }

        contract.setCustomerSignature(signature);
        contract.setSignedAt(LocalDateTime.now());
        contract.setLocked(true);
        rentalContractRepository.save(contract);

        order.setStatus(RentalOrderStatus.CONTRACT_SIGNED);
        RentalOrder saved = rentalOrderRepository.save(order);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse payDeposit(Long id) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.PENDING_PAYMENT) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn thuê không ở trạng thái chờ thanh toán cọc.");
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(RentalOrderStatus.PAID_DEPOSIT);

        // Generate contract automatically
        RentalContract contract = RentalContract.builder()
                .rentalOrder(order)
                .contractNumber("CTR-" + order.getCode())
                .termsAndConditions("HỢP ĐỒNG THUÊ THIẾT BỊ HÌNH ẢNH KỸ THUẬT SỐ\n\n"
                        + "Điều 1: Bên thuê có trách nhiệm tự kiểm tra và bàn giao đúng tình trạng như biên bản nhận.\n"
                        + "Điều 2: Tiền cọc sẽ được hoàn lại đầy đủ sau khi thiết bị được trả và hoàn tất thẩm định không có lỗi/hư hỏng.\n"
                        + "Điều 3: Trường hợp trả trễ hạn, mức phạt là 150% phí thuê hàng ngày của mỗi ngày trễ hạn.\n"
                        + "Điều 4: Mọi tranh chấp sẽ được ưu tiên thương lượng giữa 2 bên.")
                .isLocked(false)
                .build();
        rentalContractRepository.save(contract);
        order.setContract(contract);

        RentalOrder saved = rentalOrderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RentalOrderResponse> getAllRentals(RentalOrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<RentalOrder> pageResult;
        if (status != null) {
            // Find all with status
            pageResult = rentalOrderRepository.findAll(Example.of(RentalOrder.builder().status(status).build()), pageable);
        } else {
            pageResult = rentalOrderRepository.findAll(pageable);
        }
        return pageResult.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public RentalOrderResponse approveRental(Long id, ApproveRentalRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đặt thuê"));

        if (order.getStatus() != RentalOrderStatus.PENDING_APPROVAL) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng không ở trạng thái chờ duyệt.");
        }

        order.setDepositAmount(request.getDepositAmount());

        // Assign physical devices
        for (Map.Entry<Long, Long> entry : request.getItemDeviceAssignments().entrySet()) {
            RentalOrderItem item = rentalOrderItemRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đơn thuê ID: " + entry.getKey()));

            Device device = deviceRepository.findById(entry.getValue())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị vật lý ID: " + entry.getValue()));

            if (device.getStatus() != DeviceStatus.AVAILABLE) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, "Thiết bị số Serial " + device.getSerialNumber() + " hiện không sẵn sàng.");
            }

            item.setDevice(device);
            rentalOrderItemRepository.save(item);
        }

        order.setStatus(RentalOrderStatus.PENDING_PAYMENT);
        RentalOrder saved = rentalOrderRepository.save(order);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse rejectRental(Long id, String reason) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đặt thuê"));

        if (order.getStatus() != RentalOrderStatus.PENDING_APPROVAL) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chỉ có thể từ chối đơn thuê ở trạng thái chờ duyệt.");
        }

        order.setStatus(RentalOrderStatus.REJECTED);
        RentalOrder saved = rentalOrderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse handoverDevices(Long id, HandoverRentalRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.CONTRACT_SIGNED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Hợp đồng phải được ký trước khi bàn giao thiết bị.");
        }

        // Record handover condition reports
        for (RentalOrderItem item : order.getItems()) {
            Device device = item.getDevice();
            if (device == null) {
                throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Thiết bị vật lý chưa được gán cho đơn hàng này.");
            }

            String condition = request.getItemConditions() != null ? request.getItemConditions().get(item.getId()) : "Bình thường";
            item.setConditionBeforeHandover(condition);
            rentalOrderItemRepository.save(item);

            // Change device status to RENTED
            device.setStatus(DeviceStatus.RENTED);
            deviceRepository.save(device);

            // Create Condition Report
            DeviceConditionReport report = DeviceConditionReport.builder()
                    .device(device)
                    .rentalOrder(order)
                    .type(ReportType.HANDOVER_INSPECTION)
                    .conditionNotes(condition)
                    .inspectorName(request.getInspectorName())
                    .build();
            deviceConditionReportRepository.save(report);
        }

        order.setHandedOverAt(LocalDateTime.now());
        order.setStatus(RentalOrderStatus.DEVICE_HANDED_OVER);
        RentalOrder saved = rentalOrderRepository.save(order);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse returnDevices(Long id, ReturnRentalRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.DEVICE_HANDED_OVER) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái đang được thuê để thực hiện trả máy.");
        }

        BigDecimal additionalFee = BigDecimal.ZERO;

        // 1. Calculate Late Return Fee
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(order.getEndDate())) {
            long lateDays = ChronoUnit.DAYS.between(order.getEndDate().toLocalDate(), now.toLocalDate());
            if (lateDays > 0) {
                // Sum price per day of all items
                BigDecimal totalDailyFee = order.getItems().stream()
                        .map(RentalOrderItem::getPricePerDay)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Multiplier 1.5 for penalty
                BigDecimal lateFee = totalDailyFee.multiply(BigDecimal.valueOf(lateDays)).multiply(BigDecimal.valueOf(1.5));
                additionalFee = additionalFee.add(lateFee);
            }
        }

        // 2. Add damage fee
        if (request.getDamageFee() != null && request.getDamageFee().compareTo(BigDecimal.ZERO) > 0) {
            additionalFee = additionalFee.add(request.getDamageFee());
        }

        order.setAdditionalFee(additionalFee);

        // Record return reports
        for (RentalOrderItem item : order.getItems()) {
            Device device = item.getDevice();
            String condition = request.getItemConditions() != null ? request.getItemConditions().get(item.getId()) : "Bình thường";
            item.setConditionAfterReturn(condition);
            rentalOrderItemRepository.save(item);

            // Create Condition Report
            DeviceConditionReport report = DeviceConditionReport.builder()
                    .device(device)
                    .rentalOrder(order)
                    .type(ReportType.RETURN_INSPECTION)
                    .conditionNotes(condition)
                    .inspectorName(request.getInspectorName())
                    .build();
            deviceConditionReportRepository.save(report);

            // Reset device status to AVAILABLE or DAMAGED based on notes
            if (condition.toLowerCase().contains("hỏng") || condition.toLowerCase().contains("broken") || condition.toLowerCase().contains("vỡ")) {
                device.setStatus(DeviceStatus.DAMAGED);
            } else {
                device.setStatus(DeviceStatus.AVAILABLE);
            }
            deviceRepository.save(device);
        }

        order.setReturnedAt(now);
        order.setStatus(RentalOrderStatus.RETURNED);
        RentalOrder saved = rentalOrderRepository.save(order);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse settleAndComplete(Long id) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.RETURNED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái đã trả (RETURNED) để hoàn cọc & hoàn tất.");
        }

        // Release devices if not already done in return step
        for (RentalOrderItem item : order.getItems()) {
            Device device = item.getDevice();
            if (device != null && device.getStatus() == DeviceStatus.RENTED) {
                device.setStatus(DeviceStatus.AVAILABLE);
                deviceRepository.save(device);
            }
        }

        order.setStatus(RentalOrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        order.setRefundStatus(PaymentStatus.PAID); // Completed deposit refund process

        RentalOrder saved = rentalOrderRepository.save(order);
        return mapToResponse(saved);
    }

    // Device Management
    @Override
    @Transactional
    public DeviceResponse createDevice(DeviceRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (deviceRepository.findBySerialNumber(request.getSerialNumber()).isPresent()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Số Serial '" + request.getSerialNumber() + "' đã tồn tại trong hệ thống.");
        }

        Device device = Device.builder()
                .product(product)
                .serialNumber(request.getSerialNumber())
                .status(request.getStatus() != null ? request.getStatus() : DeviceStatus.AVAILABLE)
                .conditionDetails(request.getConditionDetails())
                .build();

        Device saved = deviceRepository.save(device);
        return mapToDeviceResponse(saved);
    }

    @Override
    @Transactional
    public DeviceResponse updateDevice(Long id, DeviceRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị vật lý"));

        if (request.getStatus() != null) {
            device.setStatus(request.getStatus());
        }
        if (request.getConditionDetails() != null) {
            device.setConditionDetails(request.getConditionDetails());
        }
        if (StringUtils.hasText(request.getSerialNumber())) {
            deviceRepository.findBySerialNumber(request.getSerialNumber())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Số Serial đã tồn tại");
                        }
                    });
            device.setSerialNumber(request.getSerialNumber());
        }

        Device saved = deviceRepository.save(device);
        return mapToDeviceResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceResponse> getDevicesByProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
        return deviceRepository.findByProduct(product).stream().map(this::mapToDeviceResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceResponse> getAvailableDevices(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
        return deviceRepository.findByProductAndStatus(product, DeviceStatus.AVAILABLE).stream().map(this::mapToDeviceResponse).toList();
    }

    // Hand-written DTO Converters
    private RentalOrderResponse mapToResponse(RentalOrder order) {
        if (order == null) return null;
        return RentalOrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .startDate(order.getStartDate())
                .endDate(order.getEndDate())
                .status(order.getStatus())
                .rentalFee(order.getRentalFee())
                .depositAmount(order.getDepositAmount())
                .additionalFee(order.getAdditionalFee())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .refundStatus(order.getRefundStatus())
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(order.getShippingAddress())
                .handedOverAt(order.getHandedOverAt())
                .returnedAt(order.getReturnedAt())
                .completedAt(order.getCompletedAt())
                .canceledAt(order.getCanceledAt())
                .items(order.getItems() != null ? order.getItems().stream().map(this::mapToItemResponse).toList() : List.of())
                .contract(order.getContract() != null ? mapToContractResponse(order.getContract()) : null)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private RentalOrderItemResponse mapToItemResponse(RentalOrderItem item) {
        if (item == null) return null;
        return RentalOrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productMainImageUrl(item.getProduct() != null ? item.getProduct().getMainImageUrl() : null)
                .deviceId(item.getDevice() != null ? item.getDevice().getId() : null)
                .deviceSerialNumber(item.getDevice() != null ? item.getDevice().getSerialNumber() : null)
                .pricePerDay(item.getPricePerDay())
                .conditionBeforeHandover(item.getConditionBeforeHandover())
                .conditionAfterReturn(item.getConditionAfterReturn())
                .build();
    }

    private RentalContractResponse mapToContractResponse(RentalContract contract) {
        if (contract == null) return null;
        return RentalContractResponse.builder()
                .id(contract.getId())
                .contractNumber(contract.getContractNumber())
                .termsAndConditions(contract.getTermsAndConditions())
                .customerSignature(contract.getCustomerSignature())
                .signedAt(contract.getSignedAt())
                .isLocked(contract.isLocked())
                .build();
    }

    private DeviceResponse mapToDeviceResponse(Device device) {
        if (device == null) return null;
        return DeviceResponse.builder()
                .id(device.getId())
                .productId(device.getProduct() != null ? device.getProduct().getId() : null)
                .productName(device.getProduct() != null ? device.getProduct().getName() : null)
                .serialNumber(device.getSerialNumber())
                .status(device.getStatus())
                .conditionDetails(device.getConditionDetails())
                .createdAt(device.getCreatedAt())
                .updatedAt(device.getUpdatedAt())
                .build();
    }
}
