package dev.xbase.core.validation.prefix;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Objects;

public class PrefixValidator implements ConstraintValidator<Prefix, String> {

    private String startWith;

    public void initialize(Prefix constraintAnnotation) {
        this.startWith = constraintAnnotation.startWith();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return Objects.nonNull(value) && value.startsWith(startWith);
    }
}
