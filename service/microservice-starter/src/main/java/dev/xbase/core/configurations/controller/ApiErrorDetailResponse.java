package dev.xbase.core.configurations.controller;

import org.springframework.validation.FieldError;

public record ApiErrorDetailResponse(String fieldCode,
                                     String objectName,
                                     String message) {
    public static ApiErrorDetailResponse ofEmpty() {
        return new ApiErrorDetailResponse("",
                "",
                "");
    }

    public static ApiErrorDetailResponse of(FieldError fieldError) {
        return new ApiErrorDetailResponse(fieldError.getField(), fieldError.getObjectName(),
                fieldError.getDefaultMessage());
    }
}