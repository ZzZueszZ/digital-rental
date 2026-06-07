package org.web.identity.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class KycOcrPreviewResponse {
    private Long sessionId;
    private String frontImageUrl;
    private String backImageUrl;
    private String identityNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String placeOfOrigin;
    private String placeOfResidence;
    private LocalDate issuedDate;
    private LocalDate expiryDate;
    private Double ocrConfidence;
    private String documentType;
    private Boolean successful;
    private String previewStatus;
    private List<String> warnings;
}
