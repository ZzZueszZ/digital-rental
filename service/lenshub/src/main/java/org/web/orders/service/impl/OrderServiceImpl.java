package org.web.orders.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.web.addresses.model.ShippingAddress;
import org.web.addresses.repository.ShippingAddressRepository;
import org.web.carts.model.CartItem;
import org.web.carts.repository.CartItemRepository;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.common.exceptions.ApplicationException;
import org.web.common.service.AuditLogService;
import org.web.orders.dto.request.CheckoutFromCartRequest;
import org.web.orders.dto.request.CheckoutItemRequest;
import org.web.orders.dto.request.CheckoutRequest;
import org.web.orders.dto.response.OrderResponse;
import org.web.orders.mapper.OrderMapper;
import org.web.orders.model.Order;
import org.web.orders.model.OrderItem;
import org.web.orders.repository.OrderRepository;
import org.web.orders.service.OrderService;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;
import org.web.vouchers.dto.request.VoucherApplyRequest;
import org.web.vouchers.dto.response.VoucherApplyResponse;
import org.web.vouchers.service.VoucherService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final CartItemRepository cartItemRepository;
    private final VoucherService voucherService;
    private final AuditLogService auditLogService;
    private final ShippingAddressRepository shippingAddressRepository;
    private final org.web.reviews.repository.ReviewRepository reviewRepository;

    @Override
    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        User user = getUser(userId);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Giỏ hàng rỗng");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal itemsTotal = BigDecimal.ZERO;

        for (CheckoutItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm: " + itemReq.getProductId()));

            int requestedQty = itemReq.getQuantity();
            if (product.getQuantity() < requestedQty) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không đủ tồn kho cho sản phẩm: " + product.getName());
            }

            BigDecimal unitPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getRentPricePerDay();
            if(unitPrice == null) {
                unitPrice = BigDecimal.ZERO;
            }
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(requestedQty));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(requestedQty)
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
            itemsTotal = itemsTotal.add(subtotal);
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

        BigDecimal discountAmount = BigDecimal.ZERO;
        String voucherCode = null;

        if (StringUtils.hasText(request.getVoucherCode())) {
            VoucherApplyResponse res = voucherService.apply(
                    VoucherApplyRequest.builder()
                            .code(request.getVoucherCode().trim())
                            .cartTotal(itemsTotal)
                            .build()
            );
            if (!res.isValid()) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, res.getMessage());
            }

            discountAmount = res.getDiscountAmount();
            voucherCode = request.getVoucherCode().trim();
        }

        BigDecimal finalCartTotal = itemsTotal.subtract(discountAmount);
        if (finalCartTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalCartTotal = BigDecimal.ZERO;
        }

        // We don't model shipping variations so assume 0 fee directly
        BigDecimal shippingFee = BigDecimal.ZERO;
        BigDecimal total = finalCartTotal.add(shippingFee);

        Order order = Order.builder()
                .user(user)
                .totalPrice(total)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .shippingDiscount(BigDecimal.ZERO)
                .voucherCode(voucherCode)
                .shippingName(shippingName)
                .shippingPhone(shippingPhone)
                .shippingAddress(shippingAddress)
                .build();

        if (order.getCode() == null) {
            order.setCode("ORD-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 6));
        }

        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
        }
        order.setItems(orderItems);

        // Deduct stock
        for (CheckoutItemRequest itemReq : request.getItems()) {
             Product p = productRepository.getReferenceById(itemReq.getProductId());
             p.setQuantity(p.getQuantity() - itemReq.getQuantity());
             productRepository.save(p);
        }

        order = orderRepository.save(order);
        auditLogService.logAction("ORDER", order.getId(), "CREATE_ORDER", "Created order " + order.getCode(), null, null);

        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse checkoutFromCart(Long userId, CheckoutFromCartRequest request) {
        User user = getUser(userId);

        List<CartItem> cartItems = cartItemRepository.findByUserOrderByCreatedAtDesc(user);
        if (cartItems == null || cartItems.isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Giỏ hàng hiện đang rỗng");
        }

        List<CartItem> selectedItems = cartItems;
        if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            selectedItems = cartItems.stream()
                    .filter(ci -> request.getCartItemIds().contains(ci.getId()))
                    .toList();
        }

        if (selectedItems.isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Chưa chọn sản phẩm nào để thanh toán");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal itemsTotal = BigDecimal.ZERO;

        for (CartItem cartItem : selectedItems) {
            Product product = cartItem.getProduct();
            int requestedQty = cartItem.getQuantity();

            if (requestedQty <= 0) continue;

            if (product.getQuantity() < requestedQty) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không đủ tồn kho cho sản phẩm: " + product.getName());
            }

            BigDecimal unitPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getRentPricePerDay();
            if(unitPrice == null) {
                unitPrice = BigDecimal.ZERO;
            }
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(requestedQty));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(requestedQty)
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
            itemsTotal = itemsTotal.add(subtotal);
        }

        if (orderItems.isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không có sản phẩm để tạo đơn");
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

        BigDecimal discountAmount = BigDecimal.ZERO;
        String voucherCode = null;

        if (StringUtils.hasText(request.getVoucherCode())) {
            VoucherApplyResponse res = voucherService.apply(
                    VoucherApplyRequest.builder()
                            .code(request.getVoucherCode().trim())
                            .cartTotal(itemsTotal)
                            .build()
            );
            if (!res.isValid()) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, res.getMessage());
            }
            discountAmount = res.getDiscountAmount();
            voucherCode = request.getVoucherCode().trim();
        }

        BigDecimal finalCartTotal = itemsTotal.subtract(discountAmount);
        if (finalCartTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalCartTotal = BigDecimal.ZERO;
        }

        BigDecimal shippingFee = BigDecimal.ZERO;
        BigDecimal total = finalCartTotal.add(shippingFee);

        Order order = Order.builder()
                .user(user)
                .totalPrice(total)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .shippingDiscount(BigDecimal.ZERO)
                .voucherCode(voucherCode)
                .shippingName(shippingName)
                .shippingPhone(shippingPhone)
                .shippingAddress(shippingAddress)
                .build();

        if (order.getCode() == null) {
            order.setCode("ORD-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 6));
        }

        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
        }
        order.setItems(orderItems);

        for (CartItem cartItem : selectedItems) {
             Product p = cartItem.getProduct();
             p.setQuantity(p.getQuantity() - cartItem.getQuantity());
             productRepository.save(p);
        }

        order = orderRepository.save(order);
        cartItemRepository.deleteAll(selectedItems);

        auditLogService.logAction("ORDER", order.getId(), "CREATE_ORDER", "Created order from cart " + order.getCode(), null, null);

        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForUser(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Đơn hàng này không thuộc về bạn");
        }
        OrderResponse res = orderMapper.toOrderResponse(order);
        res.setIsReviewed(reviewRepository.existsByOrderId(orderId));
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Long userId, int page, int size, OrderStatus status, PaymentStatus paymentStatus) {
        User user = getUser(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findMyOrders(user, status, paymentStatus, pageable);
        return orders.map(order -> {
            OrderResponse res = orderMapper.toOrderResponse(order);
            res.setIsReviewed(reviewRepository.existsByOrderId(order.getId()));
            return res;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Order not found"));
        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse confirmReceived(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Bạn không có quyền xác nhận đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa được giao, không thể xác nhận hoàn thành");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        order.setPaymentStatus(org.web.common.enums.PaymentStatus.SUCCESS);
        
        order = orderRepository.save(order);
        auditLogService.logAction("ORDER", order.getId(), "CONFIRM_RECEIVED", "User confirmed receipt", null, null);
        
        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        OrderStatus currentStatus = order.getStatus();

        boolean validTransition = false;
        if (currentStatus == OrderStatus.PENDING) {
            validTransition = (newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELED);
        } else if (currentStatus == OrderStatus.CONFIRMED) {
            validTransition = (newStatus == OrderStatus.SHIPPING || newStatus == OrderStatus.CANCELED);
        } else if (currentStatus == OrderStatus.SHIPPING) {
            validTransition = (newStatus == OrderStatus.DELIVERED);
        } else if (currentStatus == OrderStatus.DELIVERED) {
            // Only CUSTOMERS can confirm completion via confirmReceived method
            validTransition = false; 
        }

        if (!validTransition) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus);
        }

        order.setStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();
        
        if (newStatus == OrderStatus.CONFIRMED) {
            order.setConfirmedAt(now);
        } else if (newStatus == OrderStatus.SHIPPING) {
            order.setShippedAt(now);
        } else if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(now);
            order.setPaymentStatus(org.web.common.enums.PaymentStatus.SUCCESS);
        } else if (newStatus == OrderStatus.CANCELED) {
            order.setCanceledAt(now);
            restoreStock(order);
        }

        order = orderRepository.save(order);
        auditLogService.logAction("ORDER", order.getId(), "UPDATE_STATUS", "Order status changed to " + newStatus, null, null);
        
        return orderMapper.toOrderResponse(order);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng!"));
    }

    private void restoreStock(Order order) {
        if (order.getItems() == null) return;
        for (OrderItem item : order.getItems()) {
            Product p = item.getProduct();
            if (p != null) {
                p.setQuantity(p.getQuantity() + item.getQuantity());
                productRepository.save(p);
            }
        }
    }
}
