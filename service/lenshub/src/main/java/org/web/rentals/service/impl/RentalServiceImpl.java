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

        String shippingName = user.getEmail();
        String shippingPhone = user.getPhone() != null ? user.getPhone() : "Chưa cập nhật";
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
        order.setStatus(RentalOrderStatus.PAID_RENTAL_FEE);

        // Generate contract automatically
        RentalContract contract = RentalContract.builder()
                .rentalOrder(order)
                .contractNumber("CTR-" + order.getCode())
                .termsAndConditions("HỢP ĐỒNG THUÊ THIẾT BỊ HÌNH ẢNH KỸ THUẬT SỐ\n\n"
                        + "Điều 1: Bên thuê có trách nhiệm tự kiểm tra và bàn giao đúng tình trạng như biên bản nhận.\n"
                        + "Điều 2: Tiền cọc sẽ được hoàn lại đầy đủ sau khi thiết bị được trả và hoàn tất thẩm định không có lỗi/hư hỏng.\n"
                        + "Điều 3: Trường hợp trả trễ hạn, mức phạt là 150% phí thuê hàng ngày của mỗi ngày trễ hạn.\n"
                        + "Điều 4: Mọi tranh chấp sẽ được ưu tiên thương lượng giữa 2 bên.")
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

        // Build contract terms dynamically
        StringBuilder terms = new StringBuilder();
        terms.append("HỢP ĐỒNG THUÊ THIẾT BỊ HÌNH ẢNH KỸ THUẬT SỐ\n");
        terms.append("Mã hợp đồng: CTR-").append(order.getCode()).append("\n\n");
        terms.append("BÊN CHO THUÊ: Cửa hàng Digital Rental\n");
        terms.append("BÊN THUÊ:\n");
        terms.append("- Họ tên / Email: ").append(order.getUser().getEmail()).append("\n");
        terms.append("- Số điện thoại: ").append(order.getShippingPhone()).append("\n\n");
        
        terms.append("THÔNG TIN THIẾT BỊ THUÊ:\n");
        for (RentalOrderItem item : order.getItems()) {
            terms.append("- ").append(item.getProduct().getName());
            if (item.getDevice() != null) {
                terms.append(" (Số Serial: ").append(item.getDevice().getSerialNumber())
                     .append(" - Tình trạng: ").append(item.getDevice().getConditionDetails() != null ? item.getDevice().getConditionDetails() : "Mới 99%")
                     .append(")");
            }
            terms.append("\n");
        }
        terms.append("\n");
        
        terms.append("ĐIỀU KHOẢN CHI TIẾT:\n");
        terms.append("- Thời gian thuê: Từ ").append(order.getStartDate().toString().split("T")[0])
             .append(" đến ").append(order.getEndDate().toString().split("T")[0]).append("\n");
        terms.append("- Tổng phí thuê: ").append(order.getRentalFee()).append(" VND (Đã thanh toán Online)\n");
        terms.append("- Tiền cọc thiết bị: ").append(order.getEstimatedDepositAmount()).append(" VND (Thanh toán trực tiếp tại cửa hàng)\n");
        terms.append("- Đánh giá mức độ rủi ro: ").append(order.getRiskLevel()).append("\n\n");
        
        terms.append("Điều 1: Bên thuê có trách nhiệm tự kiểm tra và bàn giao đúng tình trạng như biên bản nhận.\n");
        terms.append("Điều 2: Tiền cọc sẽ được hoàn lại đầy đủ sau khi thiết bị được trả và hoàn tất thẩm định không có lỗi/hư hỏng.\n");
        terms.append("Điều 3: Trường hợp trả trễ hạn, mức phạt là 150% phí thuê hàng ngày của mỗi ngày trễ hạn.\n");
        terms.append("Điều 4: Mọi tranh chấp sẽ được ưu tiên thương lượng giữa 2 bên.");

        // Generate or update contract draft
        RentalContract contract = order.getContract();
        if (contract == null) {
            contract = RentalContract.builder()
                    .rentalOrder(order)
                    .contractNumber("CONTRACT-" + order.getCode())
                    .termsAndConditions(terms.toString())
                    .status(org.web.common.enums.ContractStatus.DRAFT)
                    .generatedAt(LocalDateTime.now())
                    .lessorSignature("Cửa hàng Digital Rental")
                    .lessorSignedAt(LocalDateTime.now())
                    .isLocked(false)
                    .build();
        } else {
            contract.setTermsAndConditions(terms.toString());
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

        BigDecimal totalPenalty = request.getLateFee().add(request.getDamageFee()).add(request.getMissingAccessoryFee());
        BigDecimal finalDeposit = order.getFinalDepositAmount() != null ? order.getFinalDepositAmount() : BigDecimal.ZERO;

        BigDecimal refundAmount = finalDeposit.subtract(totalPenalty);
        BigDecimal extraPaymentAmount = BigDecimal.ZERO;

        if (refundAmount.compareTo(BigDecimal.ZERO) < 0) {
            extraPaymentAmount = refundAmount.negate();
            refundAmount = BigDecimal.ZERO;
        }

        RentalReturnReport report = RentalReturnReport.builder()
                .rentalOrder(order)
                .staff(staff)
                .returnDate(LocalDateTime.now())
                .bodyConditionAfter(request.getBodyConditionAfter())
                .lensConditionAfter(request.getLensConditionAfter())
                .batteryConditionAfter(request.getBatteryConditionAfter())
                .accessoryConditionAfter(request.getAccessoryConditionAfter())
                .lateDays(request.getLateDays())
                .lateFee(request.getLateFee())
                .damageFee(request.getDamageFee())
                .missingAccessoryFee(request.getMissingAccessoryFee())
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
                if (request.getDamageFee().compareTo(BigDecimal.ZERO) > 0) {
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
