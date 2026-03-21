package org.web.reviews.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.web.common.dto.ApiResponse;
import org.web.reviews.dto.request.ReviewCreateRequest;
import org.web.reviews.dto.request.ReviewUpdateRequest;
import org.web.reviews.dto.response.ReviewListResponse;
import org.web.reviews.dto.response.ReviewResponse;
import org.web.reviews.service.ReviewService;
import org.web.users.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private Long getCurrentUserId(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại")).getId();
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    public ApiResponse<ReviewResponse> create(
            Authentication authentication,
            @RequestPart(value = "data", required = false) String data,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        Long userId = getCurrentUserId(authentication);
        ReviewCreateRequest request = parseRequest(data);
        ReviewResponse response = reviewService.create(userId, request, images);
        return ApiResponse.successfulResponse(
                HttpStatus.CREATED.value(),
                "Đánh giá đã được tạo thành công!",
                response
        );
    }

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    public ApiResponse<ReviewResponse> createJson(
            Authentication authentication,
            @Valid @RequestBody ReviewCreateRequest request
    ) {
        Long userId = getCurrentUserId(authentication);
        ReviewResponse response = reviewService.create(userId, request, List.of());
        return ApiResponse.successfulResponse(
                HttpStatus.CREATED.value(),
                "Đánh giá đã được tạo thành công!",
                response
        );
    }

    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    public ApiResponse<ReviewResponse> update(
            Authentication authentication,
            @PathVariable Long id,
            @RequestPart(value = "data", required = false) String data,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        Long userId = getCurrentUserId(authentication);
        boolean canManage = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("REVIEW_MANAGE"));
        ReviewUpdateRequest request = parseUpdateRequest(data);
        ReviewResponse response = reviewService.update(userId, request, images, id, canManage);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Đánh giá đã được cập nhật thành công!",
                response
        );
    }

    @PutMapping(value = "/{id}", consumes = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    public ApiResponse<ReviewResponse> updateJson(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        Long userId = getCurrentUserId(authentication);
        boolean canManage = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("REVIEW_MANAGE"));
        ReviewResponse response = reviewService.update(userId, request, null, id, canManage);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Đánh giá đã được cập nhật thành công!",
                response
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    public ApiResponse<Void> delete(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getCurrentUserId(authentication);
        boolean canManage = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("REVIEW_MANAGE"));
        reviewService.delete(userId, id, canManage);
        return ApiResponse.successfulResponseNoData(
                HttpStatus.OK.value(),
                "Đã xóa đánh giá thành công!"
        );
    }

    private ReviewCreateRequest parseRequest(String data) {
        if (data == null) {
            throw new IllegalArgumentException("Thông tin đánh giá là bắt buộc");
        }
        try {
            return objectMapper.readValue(data, ReviewCreateRequest.class);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Định dạng dữ liệu đánh giá không hợp lệ");
        }
    }

    private ReviewUpdateRequest parseUpdateRequest(String data) {
        if (data == null) {
            throw new IllegalArgumentException("Thông tin cập nhật đánh giá là bắt buộc");
        }
        try {
            return objectMapper.readValue(data, ReviewUpdateRequest.class);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Định dạng dữ liệu đánh giá không hợp lệ");
        }
    }

    @GetMapping("/product/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<ReviewListResponse> listByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        ReviewListResponse data = reviewService.listByProduct(productId, page, size);
        return ApiResponse.successfulResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách đánh giá thành công!",
                data
        );
    }

    @GetMapping("/my/product/{productId}")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ApiResponse<List<ReviewResponse>> listMyReviewsByProduct(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = getCurrentUserId(authentication);
        Page<ReviewResponse> data = reviewService.listMyReviewsByProduct(userId, productId, page, size);
        return ApiResponse.successfulPageResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách đánh giá của tôi thành công!",
                data
        );
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('REVIEW_MANAGE')")
    public ApiResponse<List<ReviewResponse>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReviewResponse> data = reviewService.listAll(page, size);
        return ApiResponse.successfulPageResponse(
                HttpStatus.OK.value(),
                "Lấy tất cả đánh giá thành công!",
                data
        );
    }

    @GetMapping("/reported")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('REVIEW_MANAGE')")
    public ApiResponse<List<ReviewResponse>> listReported(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReviewResponse> data = reviewService.listReported(page, size);
        return ApiResponse.successfulPageResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách đánh giá bị báo cáo thành công!",
                data
        );
    }

    @GetMapping("/hidden")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('REVIEW_MANAGE')")
    public ApiResponse<List<ReviewResponse>> listHidden(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReviewResponse> data = reviewService.listHidden(page, size);
        return ApiResponse.successfulPageResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách đánh giá đã ẩn thành công!",
                data
        );
    }

    @PostMapping("/{id}/report")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('ORDER_READ')")
    public ApiResponse<Void> report(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getCurrentUserId(authentication);
        reviewService.report(userId, id);
        return ApiResponse.successfulResponseNoData(
                HttpStatus.OK.value(),
                "Đã gửi báo cáo"
        );
    }

    @PatchMapping("/{id}/hide")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('REVIEW_MANAGE')")
    public ApiResponse<Void> hide(@PathVariable Long id) {
        reviewService.hide(id);
        return ApiResponse.successfulResponseNoData(
                HttpStatus.OK.value(),
                "Đã ẩn đánh giá"
        );
    }

    @PatchMapping("/{id}/unhide")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority('REVIEW_MANAGE')")
    public ApiResponse<Void> unhide(@PathVariable Long id) {
        reviewService.unhide(id);
        return ApiResponse.successfulResponseNoData(
                HttpStatus.OK.value(),
                "Đã bỏ ẩn đánh giá"
        );
    }
}
