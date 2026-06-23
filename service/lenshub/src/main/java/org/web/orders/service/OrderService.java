package org.web.orders.service;

import org.springframework.data.domain.Page;
import org.web.common.enums.OrderStatus;
import org.web.common.enums.PaymentStatus;
import org.web.orders.dto.request.CheckoutFromCartRequest;
import org.web.orders.dto.request.CheckoutRequest;
import org.web.orders.dto.request.CancelOrderRequest;
import org.web.orders.dto.response.OrderResponse;

public interface OrderService {

    OrderResponse checkout(Long userId, CheckoutRequest request);

    OrderResponse checkoutFromCart(Long userId, CheckoutFromCartRequest request);

    Page<OrderResponse> getMyOrders(Long userId, int page, int size, OrderStatus status, PaymentStatus paymentStatus);

    OrderResponse getOrderByIdForUser(Long userId, Long orderId);

    OrderResponse confirmReceived(Long userId, Long orderId);

    OrderResponse cancelMyOrder(Long userId, Long orderId, CancelOrderRequest request);

    Page<OrderResponse> getAllOrders(int page, int size);

    OrderResponse getOrderByIdForAdmin(Long orderId);

    OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus);
}
