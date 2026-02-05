package dev.xbase.core.validation.normal;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NormalTextValidator implements ConstraintValidator<NormalText, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value.length() <= 255;
    }
}
