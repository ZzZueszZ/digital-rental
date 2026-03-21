package org.web.reviews.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long productId;
    private Long orderId;
    private Integer rating;
    private String content;
    private Boolean hidden;
    private Integer reporterCount;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
