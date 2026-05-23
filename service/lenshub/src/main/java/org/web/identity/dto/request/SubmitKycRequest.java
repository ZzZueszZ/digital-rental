package org.web.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SubmitKycRequest {

    @NotBlank(message = "Identity number is required")
    private String identityNumber;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private LocalDate dateOfBirth;

    private String gender; // MALE, FEMALE, OTHER

    private String nationality;

    private String placeOfOrigin;

    private String placeOfResidence;

    private LocalDate issuedDate;

    private LocalDate expiryDate;

    @NotBlank(message = "Front document image URL is required")
    private String frontImageUrl;

    @NotBlank(message = "Back document image URL is required")
    private String backImageUrl;

    @NotBlank(message = "Selfie image URL is required")
    private String selfieImageUrl;
}
