package dev.xbase.core.validation.postfix;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Objects;

public class PostfixValidator implements ConstraintValidator<Postfix, String> {

    private String endWith;
    @Override
    public void initialize(Postfix constraintAnnotation) {
        this.endWith = constraintAnnotation.endWith();
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return Objects.nonNull(value) && value.endsWith(endWith);
    }
}
