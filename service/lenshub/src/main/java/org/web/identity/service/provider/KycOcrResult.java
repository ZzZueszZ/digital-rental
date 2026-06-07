package org.web.identity.service.provider;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class KycOcrResult {
    private final String identityNumber;
    private final String fullName;
    private final LocalDate dateOfBirth;
    private final String gender;
    private final String nationality;
    private final String placeOfOrigin;
    private final String placeOfResidence;
    private final LocalDate issuedDate;
    private final LocalDate expiryDate;
    private final double confidence;
    private final String documentType;
    private final boolean successful;
    private final String rawResponse;
}
