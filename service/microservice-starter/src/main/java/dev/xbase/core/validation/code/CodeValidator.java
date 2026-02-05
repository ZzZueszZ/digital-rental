package dev.xbase.core.validation.code;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class CodeValidator implements ConstraintValidator<Code, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return Pattern.matches("[A-Z0-9_]{3,100}", value);
    }
}
