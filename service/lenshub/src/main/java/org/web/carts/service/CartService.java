package org.web.carts.service;

import org.web.carts.dto.request.AddToCartRequest;
import org.web.carts.dto.request.RemoveCartItemsRequest;
import org.web.carts.dto.request.UpdateCartItemRequest;
import org.web.carts.dto.response.CartItemResponse;
import org.web.users.model.User;

import java.util.List;

public interface CartService {

    List<CartItemResponse> getMyCart(User user);

    CartItemResponse addToCart(User user, AddToCartRequest request);

    CartItemResponse updateCartItem(User user, Long cartItemId, UpdateCartItemRequest request);

    void removeCartItem(User user, Long cartItemId);

    void removeCartItems(User user, RemoveCartItemsRequest request);

    void clearCart(User user);
}
