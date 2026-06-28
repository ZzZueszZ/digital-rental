package org.web.orders.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.web.orders.dto.response.OrderItemResponse;
import org.web.orders.dto.response.OrderResponse;
import org.web.orders.model.Order;
import org.web.orders.model.OrderItem;
import org.web.products.model.Product;
import org.web.storage.MinioStorageProperties;
import org.web.storage.StorageService;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {
    private final StorageService storageService;
    private final MinioStorageProperties minioProperties;

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        if (item == null) return null;
        Product product = item.getProduct();
        String imageUrl = resolveProductImage(product);
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .productMainImage(imageUrl)
                .mainImageUrl(imageUrl)
                .productMainImageUrl(imageUrl)
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
                .cancelReason(order.getCancelReason())
                .canceledBy(order.getCanceledBy())
                .refundRequired(Boolean.TRUE.equals(order.getRefundRequired()))
                .refundNote(order.getRefundNote())
                .items(itemResponses)
                .build();
    }

    private String resolveProductImage(Product product) {
        if (product == null) return null;
        if (product.getMainImageAsset() != null) {
            return storageService.presignGet(
                    product.getMainImageAsset().getObjectKey(),
                    Duration.ofMinutes(minioProperties.getDownloadExpiryMinutes()));
        }
        return product.getMainImageUrl();
    }
}
