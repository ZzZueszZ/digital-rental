package dev.xbase.core.configurations;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Objects;

@Configuration
public class CustomLocaleResolver extends AcceptHeaderLocaleResolver {

    private LocaleResolver cookieLocaleResolver(Locale defaultLocale) {
        CookieLocaleResolver resolver = new CookieLocaleResolver("ots-locale");
        resolver.setDefaultLocale(defaultLocale);
        resolver.setCookieMaxAge(Duration.of(4800, ChronoUnit.MINUTES));
        return resolver;
    }

    @NotNull
    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        Locale localeDefault = new Locale("vi", "VN");
        if (Objects.nonNull(request.getHeader("Accept-Language"))) {
            localeDefault = super.resolveLocale(request);
        }
        return cookieLocaleResolver(localeDefault).resolveLocale(request);
    }
}
