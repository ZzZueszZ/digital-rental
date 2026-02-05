package dev.xbase.core.validation.description;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DescriptionValidator implements ConstraintValidator<Description, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value.length() <= 512;
    }
}
