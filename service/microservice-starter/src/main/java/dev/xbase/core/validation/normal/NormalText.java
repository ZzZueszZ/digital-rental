package dev.xbase.core.validation.normal;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;

@Target({ElementType.FIELD, ElementType.PARAMETER, TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = NormalTextValidator.class)
public @interface NormalText {

    String message() default "NORMAL_TEXT_INVALID";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
