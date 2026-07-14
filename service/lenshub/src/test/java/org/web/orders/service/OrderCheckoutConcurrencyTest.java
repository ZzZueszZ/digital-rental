package org.web.orders.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.web.common.exceptions.ApplicationException;
import org.web.orders.dto.request.CheckoutItemRequest;
import org.web.orders.dto.request.CheckoutRequest;
import org.web.orders.service.impl.OrderServiceImpl;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderCheckoutConcurrencyTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void checkoutAggregatesDuplicateProductLinesBeforeStockValidation() {
        User user = User.builder().id(7L).build();
        Product product = Product.builder().id(11L).name("Camera").quantity(1).build();
        CheckoutRequest request = new CheckoutRequest();
        request.setItems(List.of(item(11L, 1), item(11L, 1)));

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(productRepository.findAllByIdForUpdate(anyCollection())).thenReturn(List.of(product));

        ApplicationException error = assertThrows(
                ApplicationException.class,
                () -> orderService.checkout(7L, request));

        assertEquals(HttpStatus.BAD_REQUEST, error.getHttpStatus());
        assertEquals(1, product.getQuantity());
        verify(productRepository).findAllByIdForUpdate(anyCollection());
    }

    private CheckoutItemRequest item(Long productId, int quantity) {
        CheckoutItemRequest item = new CheckoutItemRequest();
        item.setProductId(productId);
        item.setQuantity(quantity);
        return item;
    }
}
