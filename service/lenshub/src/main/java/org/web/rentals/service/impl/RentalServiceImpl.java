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
import org.web.common.enums.PaymentMethod;
import org.web.common.enums.PaymentStatus;
import org.web.common.enums.RentalOrderStatus;
import org.web.common.enums.ReportType;
import org.web.common.exceptions.ApplicationException;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.identity.model.UserIdentity;
import org.web.identity.model.VerificationResult;
import org.web.identity.repository.UserIdentityRepository;
import org.web.identity.repository.VerificationResultRepository;
import org.web.identity.repository.VerificationSessionRepository;
import org.web.rentals.dto.request.*;
import org.web.rentals.dto.response.*;
import org.web.rentals.model.*;
import org.web.rentals.repository.*;
import org.web.rentals.service.RentalService;
import org.web.users.model.User;
import org.web.users.model.UserProfile;
import org.web.users.repository.UserRepository;
import org.web.users.repository.UserProfileRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import org.web.common.mails.MailService;
import java.security.SecureRandom;
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
    private final UserProfileRepository userProfileRepository;
    private final UserIdentityRepository userIdentityRepository;
    private final VerificationSessionRepository verificationSessionRepository;
    private final VerificationResultRepository verificationResultRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final RentalHandoverReportRepository rentalHandoverReportRepository;
    private final RentalReturnReportRepository rentalReturnReportRepository;
    private final RentalPaymentRepository rentalPaymentRepository;
    private final RentalRefundRepository rentalRefundRepository;
    private final MailService mailService;
    private final org.web.common.service.AuditLogService auditLogService;

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

        ShippingAddress contactAddress = resolveRentalContactAddress(user, request.getShippingAddressId());
        String shippingName = contactAddress != null && StringUtils.hasText(contactAddress.getReceiverName())
                ? contactAddress.getReceiverName()
                : user.getEmail();
        String shippingPhone = contactAddress != null && StringUtils.hasText(contactAddress.getReceiverPhone())
                ? contactAddress.getReceiverPhone()
                : (user.getPhone() != null ? user.getPhone() : "Chưa cập nhật");
        String pickupTime = StringUtils.hasText(request.getPickupTimeSlot()) ? request.getPickupTimeSlot() : "Giờ hành chính";
        String shippingAddress = "Nhận tại cửa hàng. Khung giờ: " + pickupTime;

        RentalOrder order = RentalOrder.builder()
                .code("RNT-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 6))
                .user(user)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(RentalOrderStatus.PENDING_PAYMENT)
                .rentalFee(totalRentalFee)
                .estimatedDepositAmount(BigDecimal.ZERO) // Will be set by Staff upon approval
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .depositStatus(org.web.common.enums.DepositStatus.NOT_COLLECTED)
                .shippingName(shippingName)
                .shippingPhone(shippingPhone)
                .shippingAddress(shippingAddress)
                .build();

        for (RentalOrderItem item : orderItems) {
            item.setRentalOrder(order);
        }
        order.setItems(orderItems);

        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "CREATE_ORDER", "Khách hàng đặt thuê thiết bị. Đơn hàng: " + saved.getCode(), null, saved.getStatus().name());
        return mapToResponse(saved);
    }

    private ShippingAddress resolveRentalContactAddress(User user, Long shippingAddressId) {
        if (user == null) {
            return null;
        }
        if (shippingAddressId != null) {
            return shippingAddressRepository.findByIdAndUser(shippingAddressId, user)
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Địa chỉ nhận hàng không tồn tại"));
        }
        return shippingAddressRepository.findByUserAndIsDefaultTrue(user).orElse(null);
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
    public void sendSigningOtp(Long id, User user) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng thuê"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền ký hợp đồng này");
        }

        if (order.getStatus() != RentalOrderStatus.PAID_RENTAL_FEE && order.getStatus() != RentalOrderStatus.WAITING_PICKUP) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái đã thanh toán hoặc chờ lấy máy để thực hiện gửi OTP.");
        }

        RentalContract contract = order.getContract();
        if (contract == null) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Hợp đồng chưa được khởi tạo cho đơn hàng này.");
        }

        if (contract.isLocked()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Hợp đồng này đã được ký và khóa.");
        }

        String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));
        contract.setSigningOtpCode(otp);
        contract.setSigningOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        rentalContractRepository.save(contract);
        auditLogService.logAction("RENTAL_ORDER", order.getId(), "SEND_OTP", "Gửi mã OTP ký hợp đồng cho đơn hàng: " + order.getCode(), null, null);
        mailService.sendContractSigningOtp(user, otp, order.getCode());
    }

    @Override
    @Transactional
    public RentalOrderResponse signContract(Long id, User user, SignContractRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng thuê"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền ký hợp đồng này");
        }

        if (order.getStatus() != RentalOrderStatus.PAID_RENTAL_FEE && order.getStatus() != RentalOrderStatus.WAITING_PICKUP) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái đã thanh toán hoặc chờ lấy máy để thực hiện ký hợp đồng.");
        }

        RentalContract contract = order.getContract();
        if (contract == null) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Hợp đồng chưa được khởi tạo cho đơn hàng này.");
        }

        if (contract.isLocked()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Hợp đồng này đã được ký và khóa.");
        }

        if (contract.getSigningOtpCode() == null || contract.getSigningOtpExpiresAt() == null) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Yêu cầu gửi OTP trước khi thực hiện ký hợp đồng.");
        }

        if (contract.getSigningOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn. Vui lòng gửi lại OTP.");
        }

        if (!contract.getSigningOtpCode().equals(request.getOtpCode())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác.");
        }

        contract.setContractHash(request.getSignature());
        contract.setStatus(org.web.common.enums.ContractStatus.SIGNED);
        contract.setSignerUserId(user.getId());
        contract.setSignedAt(LocalDateTime.now());
        contract.setLocked(true);
        contract.setSigningOtpCode(null);
        contract.setSigningOtpExpiresAt(null);
        rentalContractRepository.save(contract);

        order.setStatus(RentalOrderStatus.WAITING_PICKUP);
        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "SIGN_CONTRACT", "Khách hàng ký hợp đồng điện tử online thành công. Đơn hàng: " + saved.getCode(), null, saved.getStatus().name());
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

        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setRentalFeePaidAt(LocalDateTime.now());
        order.setStatus(RentalOrderStatus.PAID_RENTAL_FEE);

        // Generate contract automatically
        RentalContract contract = RentalContract.builder()
                .rentalOrder(order)
                .contractNumber("CTR-" + order.getCode())
                .termsAndConditions(buildRentalContractTerms(order))
                .lessorSignature("Cửa hàng Digital Rental")
                .lessorSignedAt(LocalDateTime.now())
                .isLocked(false)
                .build();
        rentalContractRepository.save(contract);
        order.setContract(contract);

        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "PAY_DEPOSIT", "Khách hàng thanh toán tiền cọc thành công cho đơn hàng: " + saved.getCode(), null, saved.getStatus().name());
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
    @Transactional(readOnly = true)
    public RentalOrderResponse getStaffRentalDetail(Long id) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public RentalOrderResponse prepareRental(Long id, PrepareRentalRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đặt thuê"));

        if (order.getStatus() != RentalOrderStatus.PAID_RENTAL_FEE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái đã thanh toán phí thuê để chuẩn bị thiết bị.");
        }

        // Assign physical devices
        for (Map.Entry<Long, Long> entry : request.getItemDeviceAssignments().entrySet()) {
            RentalOrderItem item = rentalOrderItemRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đơn thuê ID: " + entry.getKey()));

            Device device = deviceRepository.findById(entry.getValue())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị vật lý ID: " + entry.getValue()));

            if (device.getStatus() != DeviceStatus.AVAILABLE) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, "Thiết bị số Serial " + device.getSerialNumber() + " hiện không sẵn sàng.");
            }

            device.setStatus(DeviceStatus.RESERVED);
            deviceRepository.save(device);

            item.setDevice(device);
            rentalOrderItemRepository.save(item);
        }

        // Update order risk level and deposit
        order.setEstimatedDepositAmount(request.getEstimatedDepositAmount() != null ? request.getEstimatedDepositAmount() : java.math.BigDecimal.ZERO);
        order.setRiskLevel(request.getRiskLevel() != null ? request.getRiskLevel() : org.web.common.enums.RiskLevel.LOW_RISK);
        order.setDepositStatus(org.web.common.enums.DepositStatus.NOT_COLLECTED);

        String terms = buildRentalContractTerms(order);

        // Generate or update contract draft
        RentalContract contract = order.getContract();
        if (contract == null) {
            contract = RentalContract.builder()
                    .rentalOrder(order)
                    .contractNumber("CONTRACT-" + order.getCode())
                    .termsAndConditions(terms)
                    .status(org.web.common.enums.ContractStatus.DRAFT)
                    .generatedAt(LocalDateTime.now())
                    .lessorSignature("Cửa hàng Digital Rental")
                    .lessorSignedAt(LocalDateTime.now())
                    .isLocked(false)
                    .build();
        } else {
            contract.setTermsAndConditions(terms);
            contract.setGeneratedAt(LocalDateTime.now());
            contract.setStatus(org.web.common.enums.ContractStatus.DRAFT);
            contract.setLessorSignature("Cửa hàng Digital Rental");
            contract.setLessorSignedAt(LocalDateTime.now());
        }
        rentalContractRepository.save(contract);
        order.setContract(contract);

        order.setStatus(RentalOrderStatus.WAITING_PICKUP);
        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "PREPARE_RENTAL", "Nhân viên chuẩn bị thiết bị cho đơn hàng: " + saved.getCode() + ". Đã sinh dự thảo hợp đồng.", null, saved.getStatus().name());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse rejectRental(Long id, String reason) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đặt thuê"));

        if (order.getStatus() == RentalOrderStatus.RENTING || order.getStatus() == RentalOrderStatus.COMPLETED || order.getStatus() == RentalOrderStatus.CANCELLED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không thể hủy đơn thuê ở trạng thái hiện tại.");
        }

        // Release reserved devices
        if (order.getItems() != null) {
            for (RentalOrderItem item : order.getItems()) {
                Device device = item.getDevice();
                if (device != null && device.getStatus() == DeviceStatus.RESERVED) {
                    device.setStatus(DeviceStatus.AVAILABLE);
                    deviceRepository.save(device);
                }
            }
        }

        order.setStatus(RentalOrderStatus.CANCELLED);
        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "REJECT_RENTAL", "Từ chối đơn hàng: " + saved.getCode() + ". Lý do: " + reason, null, saved.getStatus().name());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse createHandoverReport(Long id, User staff, HandoverReportRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.WAITING_PICKUP) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái WAITING_PICKUP.");
        }

        RentalContract contract = order.getContract();
        if (contract == null || !contract.isLocked()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Hợp đồng chưa được ký. Vui lòng ký hợp đồng (online hoặc offline) trước khi lập biên bản bàn giao.");
        }

        RentalHandoverReport report = RentalHandoverReport.builder()
                .rentalOrder(order)
                .staff(staff)
                .serialNumber(request.getSerialNumber())
                .bodyCondition(request.getBodyCondition())
                .lensCondition(request.getLensCondition())
                .batteryCondition(request.getBatteryCondition())
                .accessoryCondition(request.getAccessoryCondition())
                .riskLevel(request.getRiskLevel())
                .finalDepositAmount(request.getFinalDepositAmount())
                .depositPaymentMethod(request.getDepositPaymentMethod())
                .note(request.getNote())
                .build();
        rentalHandoverReportRepository.save(report);

        order.setFinalDepositAmount(request.getFinalDepositAmount());
        order.setRiskLevel(request.getRiskLevel());
        order.setDepositStatus(org.web.common.enums.DepositStatus.NOT_COLLECTED);

        if (request.getItemConditions() != null) {
            for (RentalOrderItem item : order.getItems()) {
                if (request.getItemConditions().containsKey(item.getId())) {
                    item.setConditionBeforeHandover(request.getItemConditions().get(item.getId()));
                }
            }
        }

        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "CREATE_HANDOVER_REPORT", "Lập biên bản bàn giao cho đơn hàng: " + saved.getCode(), null, saved.getStatus().name());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse collectDeposit(Long id, CollectDepositRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getDepositStatus() == org.web.common.enums.DepositStatus.PAID) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng đã thu cọc.");
        }

        RentalPayment payment = RentalPayment.builder()
                .rentalOrder(order)
                .paymentType(org.web.common.enums.RentalPaymentType.DEPOSIT_OFFLINE)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();
        rentalPaymentRepository.save(payment);

        order.setDepositStatus(org.web.common.enums.DepositStatus.PAID);
        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "COLLECT_DEPOSIT", "Thu cọc trực tiếp cho đơn hàng: " + saved.getCode() + ". Số tiền: " + request.getAmount(), null, null);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse handoverDevices(Long id) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.WAITING_PICKUP) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái WAITING_PICKUP.");
        }

        if (order.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chưa thanh toán tiền thuê online.");
        }

        if (order.getDepositStatus() != org.web.common.enums.DepositStatus.PAID) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chưa thu tiền cọc offline.");
        }

        if (order.getContract() == null || order.getContract().getStatus() != org.web.common.enums.ContractStatus.SIGNED || !order.getContract().isLocked()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Khách hàng chưa ký hợp đồng thuê.");
        }

        for (RentalOrderItem item : order.getItems()) {
            Device device = item.getDevice();
            if (device != null) {
                device.setStatus(DeviceStatus.RENTED);
                deviceRepository.save(device);
            }
        }

        order.setHandedOverAt(LocalDateTime.now());
        order.setStatus(RentalOrderStatus.RENTING);
        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "HANDOVER_DEVICES", "Bàn giao thiết bị vật lý cho khách hàng. Đơn hàng chuyển sang trạng thái đang thuê (RENTING). Mã đơn: " + saved.getCode(), null, saved.getStatus().name());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse createReturnReport(Long id, User staff, ReturnReportRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.RENTING) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái RENTING để lập biên bản trả.");
        }

        int earlyReturnDays = Math.max(0, request.getEarlyReturnDays());
        int lateDays = Math.max(0, request.getLateDays());
        if (earlyReturnDays > 0 && lateDays > 0) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không thể vừa trả sớm vừa trả trễ trong cùng một biên bản.");
        }

        BigDecimal dailyRentalTotal = calculateDailyRentalTotal(order);
        BigDecimal earlyReturnRefundAmount = dailyRentalTotal
                .multiply(BigDecimal.valueOf(earlyReturnDays))
                .multiply(BigDecimal.valueOf(0.8))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal lateFee = dailyRentalTotal
                .multiply(BigDecimal.valueOf(lateDays))
                .multiply(BigDecimal.valueOf(1.5))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal damageFee = safeAmount(request.getDamageFee());
        BigDecimal missingAccessoryFee = safeAmount(request.getMissingAccessoryFee());
        BigDecimal totalPenalty = lateFee.add(damageFee).add(missingAccessoryFee);
        BigDecimal finalDeposit = order.getFinalDepositAmount() != null ? order.getFinalDepositAmount() : BigDecimal.ZERO;

        BigDecimal refundAmount = finalDeposit.add(earlyReturnRefundAmount).subtract(totalPenalty);
        BigDecimal extraPaymentAmount = BigDecimal.ZERO;

        if (refundAmount.compareTo(BigDecimal.ZERO) < 0) {
            extraPaymentAmount = refundAmount.negate();
            refundAmount = BigDecimal.ZERO;
        }

        RentalReturnReport report = RentalReturnReport.builder()
                .rentalOrder(order)
                .staff(staff)
                .returnDate(request.getReturnDate() != null ? request.getReturnDate() : LocalDateTime.now())
                .bodyConditionAfter(request.getBodyConditionAfter())
                .lensConditionAfter(request.getLensConditionAfter())
                .batteryConditionAfter(request.getBatteryConditionAfter())
                .accessoryConditionAfter(request.getAccessoryConditionAfter())
                .earlyReturnDays(earlyReturnDays)
                .earlyReturnRefundAmount(earlyReturnRefundAmount)
                .lateDays(lateDays)
                .lateFee(lateFee)
                .damageFee(damageFee)
                .missingAccessoryFee(missingAccessoryFee)
                .totalPenalty(totalPenalty)
                .refundAmount(refundAmount)
                .extraPaymentAmount(extraPaymentAmount)
                .note(request.getNote())
                .build();
        rentalReturnReportRepository.save(report);

        order.setReturnedAt(LocalDateTime.now());
        order.setAdditionalFee(totalPenalty);
        order.setStatus(RentalOrderStatus.RETURNED);

        // Reset device statuses
        for (RentalOrderItem item : order.getItems()) {
            Device device = item.getDevice();
            if (device != null) {
                if (damageFee.compareTo(BigDecimal.ZERO) > 0 || missingAccessoryFee.compareTo(BigDecimal.ZERO) > 0) {
                    device.setStatus(DeviceStatus.DAMAGED);
                } else {
                    device.setStatus(DeviceStatus.AVAILABLE);
                }
                deviceRepository.save(device);
            }
        }

        if (request.getItemConditions() != null) {
            for (RentalOrderItem item : order.getItems()) {
                if (request.getItemConditions().containsKey(item.getId())) {
                    item.setConditionAfterReturn(request.getItemConditions().get(item.getId()));
                }
            }
        }

        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "CREATE_RETURN_REPORT", "Lập biên bản trả thiết bị cho đơn hàng: " + saved.getCode(), null, saved.getStatus().name());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RentalOrderResponse completeRental(Long id, User staff, CompleteRentalRequest request) {
        RentalOrder order = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê"));

        if (order.getStatus() != RentalOrderStatus.RETURNED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng phải ở trạng thái RETURNED để hoàn tất.");
        }

        RentalReturnReport returnReport = rentalReturnReportRepository.findAll().stream()
                .filter(r -> r.getRentalOrder().getId().equals(order.getId()))
                .findFirst().orElse(null);

        if (returnReport == null) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chưa lập biên bản nhận lại thiết bị.");
        }

        if (returnReport.getRefundAmount().compareTo(BigDecimal.ZERO) > 0) {
            RentalRefund refund = RentalRefund.builder()
                    .rentalOrder(order)
                    .amount(returnReport.getRefundAmount())
                    .refundMethod(request.getRefundMethod())
                    .status(PaymentStatus.SUCCESS)
                    .refundedAt(LocalDateTime.now())
                    .note(request.getNote())
                    .build();
            rentalRefundRepository.save(refund);
            order.setDepositStatus(org.web.common.enums.DepositStatus.REFUNDED);
        } else {
            if (returnReport.getExtraPaymentAmount().compareTo(BigDecimal.ZERO) > 0) {
                // We should record an extra payment if we collected it.
                RentalPayment payment = RentalPayment.builder()
                        .rentalOrder(order)
                        .paymentType(org.web.common.enums.RentalPaymentType.EXTRA_FEE_OFFLINE)
                        .amount(returnReport.getExtraPaymentAmount())
                        .paymentMethod(request.getRefundMethod() != null ? request.getRefundMethod() : PaymentMethod.COD)
                        .status(PaymentStatus.SUCCESS)
                        .paidAt(LocalDateTime.now())
                        .build();
                rentalPaymentRepository.save(payment);
            }
            order.setDepositStatus(org.web.common.enums.DepositStatus.FULLY_DEDUCTED);
        }

        order.setStatus(RentalOrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        RentalOrder saved = rentalOrderRepository.save(order);
        auditLogService.logAction("RENTAL_ORDER", saved.getId(), "COMPLETE_RENTAL", "Hoàn tất đơn hàng thuê: " + saved.getCode(), null, saved.getStatus().name());
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

        // Update product rental quantity
        product.setRentalQuantity(product.getRentalQuantity() + 1);
        productRepository.save(product);

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

    @Override
    @Transactional
    public DeviceResponse updateDeviceStatus(Long id, DeviceStatusRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị vật lý"));

        device.setStatus(request.getStatus());
        if (request.getConditionDetails() != null) {
            device.setConditionDetails(request.getConditionDetails());
        }

        Device saved = deviceRepository.save(device);
        return mapToDeviceResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDevice(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy thiết bị vật lý"));

        Product product = device.getProduct();
        if (product.getRentalQuantity() > 0) {
            product.setRentalQuantity(product.getRentalQuantity() - 1);
            productRepository.save(product);
        }

        deviceRepository.delete(device);
    }

    private String buildRentalContractTerms(RentalOrder order) {
        String renterName = resolveRenterName(order);
        User user = order.getUser();
        UserIdentity identity = user != null
                ? userIdentityRepository.findByUserId(user.getId()).orElse(null)
                : null;
        VerificationResult latestOcr = resolveLatestOcrResult(user);
        renterName = firstText(
                identity != null ? identity.getFullName() : null,
                latestOcr != null ? latestOcr.getExtractedFullName() : null,
                renterName
        );
        String renterEmail = user != null ? user.getEmail() : "Chưa cập nhật";
        String renterPhone = resolveContactPhone(user, order.getShippingPhone());
        String receiveAddress = StringUtils.hasText(order.getShippingAddress())
                ? order.getShippingAddress()
                : "Nhận tại cửa hàng Digital Rental";
        String identityNumber = firstText(
                identity != null ? identity.getIdentityNumber() : null,
                latestOcr != null ? latestOcr.getExtractedIdentityNumber() : null,
                "Chưa cập nhật"
        );
        String issuedDate = identity != null && identity.getIssuedDate() != null
                ? formatDate(identity.getIssuedDate())
                : (latestOcr != null ? formatDate(latestOcr.getExtractedIssuedDate()) : "Chưa cập nhật");
        String issuedPlace = firstText(
                identity != null ? identity.getIssuedPlace() : null,
                extractIssuedPlaceFromRawOcr(latestOcr),
                "Chưa cập nhật"
        );
        String permanentAddress = firstText(
                identity != null ? identity.getPlaceOfResidence() : null,
                latestOcr != null ? latestOcr.getExtractedPlaceOfResidence() : null,
                "Chưa cập nhật"
        );
        String currentAddress = resolveCurrentAddress(user, receiveAddress);
        String verificationLevel = user != null
                ? user.getKycStatus() + " / " + user.getTrustLevel()
                : "Chưa cập nhật";
        BigDecimal depositAmount = order.getFinalDepositAmount() != null
                ? order.getFinalDepositAmount()
                : (order.getEstimatedDepositAmount() != null ? order.getEstimatedDepositAmount() : BigDecimal.ZERO);
        String paymentNote = order.getPaymentMethod() == PaymentMethod.ONLINE
                ? "Đã thanh toán online"
                : "Thanh toán theo phương thức " + order.getPaymentMethod();

        StringBuilder terms = new StringBuilder();
        terms.append("HỢP ĐỒNG THUÊ THIẾT BỊ HÌNH ẢNH KỸ THUẬT SỐ\n");
        terms.append("Mã hợp đồng: CTR-").append(order.getCode()).append("\n\n");

        terms.append("I. THÔNG TIN CÁC BÊN\n");
        terms.append("BÊN CHO THUÊ: Cửa hàng Digital Rental\n");
        terms.append("- Đại diện: Cửa hàng Digital Rental\n");
        terms.append("- Hotline: 037 6600 545\n");
        terms.append("- Email hỗ trợ: adminlenshub@gmail.com\n\n");

        terms.append("BÊN THUÊ:\n");
        terms.append("- Họ tên: ").append(renterName).append("\n");
        terms.append("- Email: ").append(renterEmail).append("\n");
        terms.append("- Số điện thoại: ").append(renterPhone).append("\n");
        terms.append("- CCCD: ").append(identityNumber).append("\n");
        terms.append("- Ngày cấp: ").append(issuedDate).append("\n");
        terms.append("- Nơi cấp: ").append(issuedPlace).append("\n");
        terms.append("- Địa chỉ thường trú: ").append(permanentAddress).append("\n");
        terms.append("- Địa chỉ hiện tại: ").append(currentAddress).append("\n");
        terms.append("- Mức xác thực: ").append(verificationLevel).append("\n\n");

        terms.append("II. THÔNG TIN THIẾT BỊ CHO THUÊ\n");
        terms.append("Danh sách thiết bị, serial và giá trị tài sản làm căn cứ bồi thường:\n");
        for (RentalOrderItem item : order.getItems()) {
            Product product = item.getProduct();
            Device device = item.getDevice();
            BigDecimal assetValue = product != null && product.getSalePrice() != null
                    ? product.getSalePrice()
                    : BigDecimal.ZERO;
            terms.append("- Thiết bị: ").append(product != null ? product.getName() : "Thiết bị")
                    .append(" | Serial: ").append(device != null ? device.getSerialNumber() : "Sẽ cập nhật khi bàn giao")
                    .append(" | Giá trị tài sản: ").append(formatAmount(assetValue)).append(" VND")
                    .append(" | Đơn giá thuê/ngày: ").append(formatAmount(item.getPricePerDay())).append(" VND")
                    .append(" | Tình trạng: ")
                    .append(device != null && StringUtils.hasText(device.getConditionDetails()) ? device.getConditionDetails() : "Chưa cập nhật");
            terms.append("\n");
        }
        terms.append("\n");

        terms.append("III. THỜI HẠN THUÊ\n");
        terms.append("- Thời gian thuê: Từ ").append(order.getStartDate().toLocalDate())
                .append(" đến ").append(order.getEndDate().toLocalDate()).append("\n");
        terms.append("- Địa điểm nhận thiết bị: ").append(receiveAddress).append("\n\n");

        terms.append("IV. GIÁ THUÊ, TIỀN ĐẶT CỌC VÀ THANH TOÁN\n");
        terms.append("- Tổng phí thuê: ").append(formatAmount(order.getRentalFee())).append(" VND (").append(paymentNote).append(")\n");
        terms.append("- Tiền cọc thiết bị: ").append(formatAmount(depositAmount)).append(" VND (thanh toán trực tiếp tại cửa hàng nếu chưa thu online)\n");
        terms.append("- Đánh giá mức độ rủi ro: ").append(order.getRiskLevel() != null ? order.getRiskLevel() : "Chưa đánh giá").append("\n");
        terms.append("- Tiền cọc được đối soát sau khi thiết bị được trả và kiểm tra tình trạng thực tế.\n");
        appendExpandedRentalContractTerms(terms);
        return terms.toString();
    }

    private void appendExpandedRentalContractTerms(StringBuilder terms) {
        terms.append("\n\nV. QUY TRÌNH BÀN GIAO THIẾT BỊ\n");
        terms.append("Bên cho thuê kiểm tra thiết bị, serial, phụ kiện và tình trạng trước khi bàn giao.\n");
        terms.append("Bên thuê phải kiểm tra lại thiết bị khi nhận. Nếu tiếp nhận thiết bị, bên thuê được xem là đã đồng ý với tình trạng ghi nhận trong biên bản bàn giao.\n");

        terms.append("\nVI. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A\n");
        terms.append("Bên A có trách nhiệm cung cấp thiết bị đúng mô tả, hỗ trợ kỹ thuật cơ bản và hoàn tiền cọc/hoàn phí hợp lệ sau khi đối soát.\n");
        terms.append("Bên A có quyền từ chối bàn giao nếu bên thuê chưa hoàn tất eKYC, chưa ký hợp đồng, chưa thanh toán phí thuê hoặc tiền cọc theo quy định.\n");

        terms.append("\nVII. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B\n");
        terms.append("Bên B có trách nhiệm sử dụng thiết bị đúng mục đích, bảo quản cẩn thận, không tự ý tháo lắp, sửa chữa, cho thuê lại hoặc chuyển giao cho bên thứ ba.\n");
        terms.append("Bên B phải trả thiết bị đúng hạn, đúng tình trạng đã nhận và phối hợp xác minh khi có tranh chấp về thiết bị.\n");

        terms.append("\nVIII. QUY ĐỊNH VỀ HƯ HỎNG, MẤT MÁT VÀ BỒI THƯỜNG\n");
        terms.append("Nếu thiết bị hư hỏng, mất mát hoặc thiếu phụ kiện, bên B phải thanh toán chi phí sửa chữa, thay thế hoặc bồi thường theo kết quả thẩm định.\n");
        terms.append("- Mất thiết bị: bên B bồi thường 100% giá trị thị trường hoặc giá trị tài sản ghi trong hợp đồng, tùy mức được bên A xác định tại thời điểm xử lý.\n");
        terms.append("- Hư hỏng sửa được: bên B thanh toán toàn bộ chi phí sửa chữa, kiểm tra, vận chuyển và thời gian thiết bị ngừng khai thác nếu có.\n");
        terms.append("- Hư hỏng không sửa được: bên B bồi thường giá trị còn lại hoặc giá trị thay thế của thiết bị theo kết quả thẩm định.\n");
        terms.append("Chi phí phát sinh được trừ vào tiền cọc và/hoặc khoản hoàn phí trả sớm. Nếu chi phí vượt quá số tiền được khấu trừ, bên B phải thanh toán phần chênh lệch.\n");

        terms.append("\nVIII-A. ĐIỀU KHOẢN MẤT CẮP\n");
        terms.append("Nếu thiết bị bị mất cắp, bên B phải thông báo cho bên A trong vòng 02 giờ kể từ thời điểm phát hiện sự việc.\n");
        terms.append("Bên B phải trình báo cơ quan công an có thẩm quyền và cung cấp biên bản tiếp nhận/trình báo cho bên A.\n");
        terms.append("Việc có biên bản công an không miễn trừ nghĩa vụ bồi thường, hoàn trả hoặc thanh toán các khoản phát sinh theo hợp đồng.\n");

        terms.append("\nIX. QUY ĐỊNH VỀ TRẢ TRỄ, TRẢ SỚM VÀ GIA HẠN\n");
        terms.append("Trả trễ bị tính phụ thu 150% phí thuê mỗi ngày cho mỗi ngày quá hạn.\n");
        terms.append("Trả sớm được hoàn 80% phí thuê của số ngày chưa sử dụng, sau khi trừ các khoản phát sinh nếu có.\n");
        terms.append("Mọi yêu cầu gia hạn phải được bên A xác nhận trước khi hết hạn thuê và phụ thu sẽ được tính theo đơn giá hiện hành.\n");

        terms.append("\nIX-A. CẤM CHO THUÊ LẠI VÀ CHUYỂN GIAO THIẾT BỊ\n");
        terms.append("Bên B không được cho người khác mượn, cho thuê lại, cầm cố, thế chấp, chuyển giao quyền sử dụng hoặc giao thiết bị cho bên thứ ba khi chưa có chấp thuận bằng văn bản của bên A.\n");
        terms.append("Nếu vi phạm, bên A có quyền chấm dứt hợp đồng ngay, yêu cầu hoàn trả thiết bị và xử lý toàn bộ thiệt hại phát sinh.\n");

        terms.append("\nX. XỬ LÝ VI PHẠM VÀ CHẤM DỨT HỢP ĐỒNG\n");
        terms.append("Hợp đồng có thể bị chấm dứt nếu bên B cung cấp thông tin sai, không thanh toán, không trả thiết bị hoặc vi phạm nghiêm trọng nghĩa vụ bảo quản.\n");
        terms.append("Bên A có quyền ghi nhận sự cố, tạm giữ tiền cọc và thực hiện các biện pháp cần thiết để bảo vệ tài sản.\n");
        terms.append("Nếu quá hạn 07 ngày mà bên B không liên hệ hoặc không hoàn trả thiết bị, hành vi có thể bị xem xét là chiếm giữ trái phép tài sản. Bên A có quyền sử dụng hồ sơ eKYC, hợp đồng, biên bản bàn giao, nhật ký hệ thống và chứng từ liên quan để làm việc với cơ quan có thẩm quyền.\n");

        terms.append("\nXI. BẢO MẬT VÀ XÁC THỰC ĐIỆN TỬ\n");
        terms.append("Bên B đồng ý việc hệ thống sử dụng thông tin tài khoản, eKYC, OTP, chữ ký điện tử và nhật ký thao tác để xác minh giao dịch thuê.\n");
        terms.append("Dữ liệu nhạy cảm được bảo vệ theo cơ chế xác thực, phân quyền và các lớp bảo mật của hệ thống, bao gồm E2EE-SHIELD đối với API phù hợp.\n");

        terms.append("\nXII. GIẢI QUYẾT TRANH CHẤP\n");
        terms.append("Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương lượng trên cơ sở dữ liệu đơn thuê, hợp đồng, biên bản bàn giao, biên bản hoàn trả và nhật ký hệ thống.\n");

        terms.append("\nXIII. CAM KẾT CỦA CÁC BÊN\n");
        terms.append("Các bên cam kết thông tin cung cấp là trung thực, đã đọc và đồng ý với toàn bộ nội dung hợp đồng trước khi ký điện tử.\n");
        terms.append("Hợp đồng có hiệu lực từ thời điểm được ký điện tử bởi các bên trên hệ thống Digital Rental.\n");

        terms.append("\nPHỤ LỤC ĐÍNH KÈM\n");
        terms.append("Phụ lục gồm: thông tin thiết bị/serial, biên bản bàn giao, biên bản hoàn trả, bảng tính phí phát sinh, lịch sử thanh toán và nhật ký ký điện tử nếu có.");
    }

    private String resolveCurrentAddress(User user, String fallback) {
        if (user == null) {
            return defaultText(fallback, "Chưa cập nhật");
        }
        return shippingAddressRepository.findByUserAndIsDefaultTrue(user)
                .map(ShippingAddress::getFullAddress)
                .filter(StringUtils::hasText)
                .orElse(defaultText(fallback, "Chưa cập nhật"));
    }

    private String resolveContactPhone(User user, String orderPhone) {
        if (!isMissingText(orderPhone)) {
            return orderPhone;
        }
        if (user == null) {
            return "Chưa cập nhật";
        }
        return shippingAddressRepository.findByUserAndIsDefaultTrue(user)
                .map(ShippingAddress::getReceiverPhone)
                .filter(phone -> !isMissingText(phone))
                .orElse(!isMissingText(user.getPhone()) ? user.getPhone() : "Chưa cập nhật");
    }

    private VerificationResult resolveLatestOcrResult(User user) {
        if (user == null) {
            return null;
        }
        return verificationSessionRepository.findByUserId(user.getId()).stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .map(session -> verificationResultRepository.findByVerificationSessionId(session.getId()).orElse(null))
                .filter(result -> result != null
                        && (StringUtils.hasText(result.getExtractedIdentityNumber())
                            || StringUtils.hasText(result.getExtractedFullName())
                            || StringUtils.hasText(result.getExtractedPlaceOfResidence())))
                .findFirst()
                .orElse(null);
    }

    private String extractIssuedPlaceFromRawOcr(VerificationResult result) {
        if (result == null || !StringUtils.hasText(result.getRawOcrJson())) {
            return null;
        }
        String raw = result.getRawOcrJson();
        for (String key : List.of("issue_place", "issued_place", "issue_loc", "issue_by", "issued_by", "place_issue")) {
            String value = extractJsonStringValue(raw, key);
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private String extractJsonStringValue(String rawJson, String key) {
        String pattern = "\"" + key + "\"";
        int keyIndex = rawJson.indexOf(pattern);
        if (keyIndex < 0) {
            return null;
        }
        int colonIndex = rawJson.indexOf(':', keyIndex + pattern.length());
        if (colonIndex < 0) {
            return null;
        }
        int firstQuote = rawJson.indexOf('"', colonIndex + 1);
        if (firstQuote < 0) {
            return null;
        }
        int secondQuote = rawJson.indexOf('"', firstQuote + 1);
        if (secondQuote < 0) {
            return null;
        }
        return rawJson.substring(firstQuote + 1, secondQuote);
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.toString() : "Chưa cập nhật";
    }

    private String formatAmount(BigDecimal amount) {
        return safeAmount(amount).setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private String defaultText(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private String firstText(String first, String second, String fallback) {
        if (!isMissingText(first)) {
            return first;
        }
        if (!isMissingText(second)) {
            return second;
        }
        return fallback;
    }

    private boolean isMissingText(String value) {
        return !StringUtils.hasText(value)
                || "Chưa cập nhật".equalsIgnoreCase(value.trim())
                || "N/A".equalsIgnoreCase(value.trim());
    }

    private String resolveRenterName(RentalOrder order) {
        if (StringUtils.hasText(order.getShippingName())) {
            return order.getShippingName();
        }
        if (order.getUser() == null) {
            return "Chưa cập nhật";
        }
        return userProfileRepository.findById(order.getUser().getId())
                .map(UserProfile::getFullName)
                .filter(StringUtils::hasText)
                .orElse(order.getUser().getEmail());
    }

    private BigDecimal calculateDailyRentalTotal(RentalOrder order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return order.getItems().stream()
                .map(RentalOrderItem::getPricePerDay)
                .map(this::safeAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal safeAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    // Hand-written DTO Converters
    private RentalOrderResponse mapToResponse(RentalOrder order) {
        if (order == null) return null;
        String userFullName = order.getUser() != null
                ? userProfileRepository.findById(order.getUser().getId())
                    .map(UserProfile::getFullName)
                    .orElse(null)
                : null;
        return RentalOrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userFullName(userFullName)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .userPhone(order.getUser() != null ? order.getUser().getPhone() : null)
                .startDate(order.getStartDate())
                .endDate(order.getEndDate())
                .status(order.getStatus())
                .rentalFee(order.getRentalFee())
                .estimatedDepositAmount(order.getEstimatedDepositAmount())
                .finalDepositAmount(order.getFinalDepositAmount())
                .depositStatus(order.getDepositStatus())
                .riskLevel(order.getRiskLevel())
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
                .handoverReport(order.getHandoverReport() != null ? mapToHandoverResponse(order.getHandoverReport()) : null)
                .returnReport(order.getReturnReport() != null ? mapToReturnResponse(order.getReturnReport()) : null)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private RentalHandoverReportResponse mapToHandoverResponse(RentalHandoverReport report) {
        if (report == null) return null;
        String staffName = null;
        if (report.getStaff() != null) {
            staffName = userProfileRepository.findById(report.getStaff().getId())
                    .map(UserProfile::getFullName)
                    .orElse(report.getStaff().getEmail());
        }
        return RentalHandoverReportResponse.builder()
                .id(report.getId())
                .serialNumber(report.getSerialNumber())
                .bodyCondition(report.getBodyCondition())
                .lensCondition(report.getLensCondition())
                .batteryCondition(report.getBatteryCondition())
                .accessoryCondition(report.getAccessoryCondition())
                .riskLevel(report.getRiskLevel())
                .finalDepositAmount(report.getFinalDepositAmount())
                .depositPaymentMethod(report.getDepositPaymentMethod())
                .note(report.getNote())
                .staffName(staffName)
                .createdAt(report.getCreatedAt())
                .build();
    }

    private RentalReturnReportResponse mapToReturnResponse(RentalReturnReport report) {
        if (report == null) return null;
        String staffName = null;
        if (report.getStaff() != null) {
            staffName = userProfileRepository.findById(report.getStaff().getId())
                    .map(UserProfile::getFullName)
                    .orElse(report.getStaff().getEmail());
        }
        return RentalReturnReportResponse.builder()
                .id(report.getId())
                .returnDate(report.getReturnDate())
                .bodyConditionAfter(report.getBodyConditionAfter())
                .lensConditionAfter(report.getLensConditionAfter())
                .batteryConditionAfter(report.getBatteryConditionAfter())
                .accessoryConditionAfter(report.getAccessoryConditionAfter())
                .earlyReturnDays(report.getEarlyReturnDays())
                .earlyReturnRefundAmount(safeAmount(report.getEarlyReturnRefundAmount()))
                .lateDays(report.getLateDays())
                .lateFee(report.getLateFee())
                .damageFee(report.getDamageFee())
                .missingAccessoryFee(report.getMissingAccessoryFee())
                .totalPenalty(report.getTotalPenalty())
                .refundAmount(report.getRefundAmount())
                .extraPaymentAmount(report.getExtraPaymentAmount())
                .note(report.getNote())
                .staffName(staffName)
                .createdAt(report.getCreatedAt())
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
                .contractVersion(contract.getContractVersion())
                .contractHash(contract.getContractHash())
                .signerUserId(contract.getSignerUserId())
                .signerIp(contract.getSignerIp())
                .status(contract.getStatus())
                .signedAt(contract.getSignedAt())
                .lessorSignature(contract.getLessorSignature())
                .lessorSignedAt(contract.getLessorSignedAt())
                .generatedAt(contract.getGeneratedAt())
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
