package org.web.reviews;

import org.springframework.stereotype.Component;
import org.web.reviews.dto.response.ReviewResponse;
import org.web.reviews.model.Review;
import org.web.reviews.model.ReviewImage;
import org.web.users.repository.UserProfileRepository;
import org.web.users.model.UserProfile;
import lombok.RequiredArgsConstructor;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReviewMapper {

    private final UserProfileRepository userProfileRepository;

    public ReviewResponse toResponse(Review review) {
        if (review == null) return null;

        String userName = null;
        String userAvatar = null;
        if (review.getUser() != null) {
            UserProfile profile = userProfileRepository.findById(review.getUser().getId()).orElse(null);
            if (profile != null) {
                userName = profile.getFullName();
                userAvatar = profile.getAvatarUrl();
            } else {
                userName = review.getUser().getEmail();
            }
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(userName)
                .userAvatar(userAvatar)
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .orderId(review.getOrder() != null ? review.getOrder().getId() : null)
                .rating(review.getRating())
                .content(review.getContent())
                .hidden(review.getHidden())
                .reporterCount(review.getReporters() != null ? review.getReporters().size() : 0)
                .images(review.getImages() != null ? 
                        review.getImages().stream().map(ReviewImage::getImageUrl).collect(Collectors.toList()) : null)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
