package org.web.rentals.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.web.common.enums.KycStatus;
import org.web.common.enums.RentalOrderStatus;
import org.web.common.exceptions.ApplicationException;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.rentals.dto.request.RentalCheckoutItemRequest;
import org.web.rentals.dto.request.RentalCheckoutRequest;
import org.web.rentals.repository.RentalOrderRepository;
import org.web.rentals.service.impl.RentalServiceImpl;
import org.web.users.model.User;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RentalCheckoutConcurrencyTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private RentalOrderRepository rentalOrderRepository;

    @InjectMocks
    private RentalServiceImpl rentalService;

    @Test
    void createRentalAggregatesDuplicateProductLinesWhileHoldingProductLock() {
        User user = User.builder().id(7L).kycStatus(KycStatus.VERIFIED).build();
        Product product = Product.builder().id(11L).name("Camera").rentalQuantity(1).build();
        RentalCheckoutRequest request = new RentalCheckoutRequest();
        LocalDateTime start = LocalDateTime.of(2026, 7, 20, 8, 0);
        LocalDateTime end = LocalDateTime.of(2026, 7, 22, 18, 0);
        request.setStartDate(start);
        request.setEndDate(end);
        request.setItems(List.of(item(11L, 1), item(11L, 1)));

        when(productRepository.findAllByIdForUpdate(anyCollection())).thenReturn(List.of(product));
        when(rentalOrderRepository.countRentedUnitsInPeriod(
                11L,
                start,
                end,
                List.of(RentalOrderStatus.COMPLETED, RentalOrderStatus.CANCELLED)))
                .thenReturn(0L);

        ApplicationException error = assertThrows(
                ApplicationException.class,
                () -> rentalService.createRentalOrder(user, request));

        assertEquals(HttpStatus.BAD_REQUEST, error.getHttpStatus());
        verify(productRepository).findAllByIdForUpdate(anyCollection());
    }

    private RentalCheckoutItemRequest item(Long productId, int quantity) {
        RentalCheckoutItemRequest item = new RentalCheckoutItemRequest();
        item.setProductId(productId);
        item.setQuantity(quantity);
        return item;
    }
}
