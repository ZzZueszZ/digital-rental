package org.web.orders.mapper;

import org.springframework.stereotype.Component;
import org.web.orders.dto.response.OrderItemResponse;
import org.web.orders.dto.response.OrderResponse;
import org.web.orders.model.Order;
import org.web.orders.model.OrderItem;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        if (item == null) return null;
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productMainImage(item.getProduct() != null ? item.getProduct().getMainImageUrl() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    public OrderResponse toOrderResponse(Order order) {
        if (order == null) return null;

        List<OrderItemResponse> itemResponses = null;
        if (order.getItems() != null) {
            itemResponses = order.getItems().stream()
                    .map(this::toOrderItemResponse)
                    .collect(Collectors.toList());
        }

        return OrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .totalPrice(order.getTotalPrice())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .shippingDiscount(order.getShippingDiscount())
                .voucherCode(order.getVoucherCode())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(order.getShippingAddress())
                .confirmedAt(order.getConfirmedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .completedAt(order.getCompletedAt())
                .canceledAt(order.getCanceledAt())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
