package org.web.carts.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.web.carts.dto.request.AddToCartRequest;
import org.web.carts.dto.request.RemoveCartItemsRequest;
import org.web.carts.dto.request.UpdateCartItemRequest;
import org.web.carts.dto.response.CartItemResponse;
import org.web.carts.service.CartService;
import org.web.common.dto.ApiResponse;
import org.web.common.exceptions.ApplicationException;
import org.web.users.model.User;
import org.web.users.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Chưa xác thực");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<List<CartItemResponse>>> getMyCart() {
        User user = getCurrentUser();
        List<CartItemResponse> items = cartService.getMyCart(user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Lấy giỏ hàng thành công", items));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<CartItemResponse>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        User user = getCurrentUser();
        CartItemResponse response = cartService.addToCart(user, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Thêm vào giỏ hàng thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateCartItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        User user = getCurrentUser();
        CartItemResponse response = cartService.updateCartItem(user, id, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Cập nhật giỏ hàng thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(@PathVariable Long id) {
        User user = getCurrentUser();
        cartService.removeCartItem(user, id);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Xóa sản phẩm khỏi giỏ hàng thành công"));
    }

    @DeleteMapping("/items")
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<Void>> removeCartItems(@Valid @RequestBody RemoveCartItemsRequest request) {
        User user = getCurrentUser();
        cartService.removeCartItems(user, request);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã xóa các sản phẩm được chọn khỏi giỏ"));
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasAuthority('CART_WRITE')")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        User user = getCurrentUser();
        cartService.clearCart(user);
        return ResponseEntity.ok(ApiResponse.successfulResponse("Đã xóa toàn bộ giỏ hàng"));
    }
}
