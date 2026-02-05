package dev.xbase.core.validation.code;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD,ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = {CodeValidator.class})
public @interface Code {
    String message() default "ERROR_CODE";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
