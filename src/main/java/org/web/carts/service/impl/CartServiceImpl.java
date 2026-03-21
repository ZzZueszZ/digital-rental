package org.web.carts.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web.carts.dto.request.AddToCartRequest;
import org.web.carts.dto.request.RemoveCartItemsRequest;
import org.web.carts.dto.request.UpdateCartItemRequest;
import org.web.carts.dto.response.CartItemResponse;
import org.web.carts.model.CartItem;
import org.web.carts.repository.CartItemRepository;
import org.web.carts.service.CartService;
import org.web.common.exceptions.ApplicationException;
import org.web.products.model.Product;
import org.web.products.repository.ProductRepository;
import org.web.users.model.User;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CartItemResponse> getMyCart(User user) {
        List<CartItem> items = cartItemRepository.findByUserOrderByCreatedAtDesc(user);
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CartItemResponse addToCart(User user, AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (!product.isActive() || (!product.isForRent() && !product.isForSale())) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Sản phẩm hiện không khả dụng để thuê hoặc mua");
        }

        CartItem cartItem = cartItemRepository.findByUserAndProduct(user, product)
                .orElse(CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity(0)
                        .build());

        int newQty = cartItem.getQuantity() + request.getQuantity();

        if (newQty > product.getQuantity()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Số lượng trong giỏ vượt quá tồn kho khả dụng");
        }

        cartItem.setQuantity(newQty);
        CartItem saved = cartItemRepository.save(cartItem);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CartItemResponse updateCartItem(User user, Long cartItemId, UpdateCartItemRequest request) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm trong giỏ"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Sản phẩm không thuộc giỏ hàng của bạn");
        }

        if (request.getQuantity() == 0) {
            cartItemRepository.delete(item);
            return null;
        }

        if (request.getQuantity() > item.getProduct().getQuantity()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Số lượng yêu cầu vượt quá tồn kho khả dụng");
        }

        item.setQuantity(request.getQuantity());
        CartItem saved = cartItemRepository.save(item);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void removeCartItem(User user, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "Not your cart item");
        }

        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void removeCartItems(User user, RemoveCartItemsRequest request) {
        List<CartItem> items = cartItemRepository.findAllById(request.getCartItemIds());
        
        List<CartItem> userItems = items.stream()
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        if (!userItems.isEmpty()) {
            cartItemRepository.deleteAll(userItems);
        }
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }

    private CartItemResponse mapToResponse(CartItem item) {
        Product product = item.getProduct();
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getMainImageUrl())
                .rentPricePerDay(product.getRentPricePerDay())
                .salePrice(product.getSalePrice())
                .quantity(item.getQuantity())
                .availableStock(product.getQuantity())
                .build();
    }
}
