package dev.xbase.core.configurations.controller.advice;

import jakarta.servlet.http.HttpServletRequest;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import dev.xbase.core.constants.RequestAttributeConfig;
import dev.xbase.core.model.CreateProgram;
import dev.xbase.core.model.CurrentRequest;

import java.util.Objects;

@Aspect
@Configuration
@RequiredArgsConstructor
public class RestControllerAspect {
  @NonNull
  HttpServletRequest httpServletRequest;

  @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
  public void controllerBean() {
  }

  @Pointcut("execution(* *(..))")
  public void methodPointcut() {}

  @Around("controllerBean() && methodPointcut()")
  public Object aroundMethodInControllerClass(ProceedingJoinPoint pjp) throws Throwable {
    MethodSignature methodSignature = (MethodSignature) pjp.getSignature();
    CreateProgram createProgram = new CreateProgram(String.format("%s.%s(..)",
        methodSignature.getDeclaringType().getCanonicalName(),
        methodSignature.getMethod().getName()));
    CurrentRequest currentRequest = new CurrentRequest(createProgram);
    Objects.requireNonNull(RequestContextHolder
                    .getRequestAttributes())
        .setAttribute(RequestAttributeConfig.CurrentRequest.name(),
            currentRequest,
            RequestAttributes.SCOPE_REQUEST);

    return pjp.proceed();
  }
}
