package dev.xbase.core.starter.security;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.time.Instant;
import java.util.Map;

import static org.apache.commons.lang3.StringUtils.substringBeforeLast;
import static org.springdoc.core.utils.Constants.DOT;

@Configuration
@RequiredArgsConstructor
public class JWTTokenService {
    @NonNull
    final JwtProperties jwtProperties;

    @Bean
    public JwtDecoder jwtDecoder() {
        if (jwtProperties.emptyJwkSetUri()) {
            return NimbusJwtDecoder.withPublicKey(jwtProperties.rsaPublicKey()).build();
        }
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(
                jwtProperties.getJwkSetUri()).build();
        jwtDecoder.setClaimSetConverter(new OrganizationSubClaimAdapter());
        return jwtDecoder;
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        JWK jwk = new RSAKey.Builder(jwtProperties.rsaPublicKey()).privateKey(jwtProperties.rsaPrivateKey()).build();
        JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwks);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Remove the SCOPE_ prefix
        grantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    public String createAccessToken(String scope, String subject) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(jwtProperties.getJwtAccessTokenExpirationS()))
                .subject(subject)
                .claim("scope", scope)
                .build();
        return jwtEncoder().encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public String createAccessToken(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        JwtClaimsSet.Builder claimBuilder = JwtClaimsSet.builder();
        claimBuilder.issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(jwtProperties.getJwtAccessTokenExpirationS()))
                .subject(subject);
        claims.forEach(claimBuilder::claim);
        return jwtEncoder().encode(JwtEncoderParameters.from(claimBuilder.build())).getTokenValue();
    }

    public String createRefreshToken(String subject) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(jwtProperties.getJwtRefreshExpirationS()))
                .subject(subject)
                .build();
        return jwtEncoder().encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public Jwt getJwt(final String token) {
        return jwtDecoder().decode(token);
    }

    public String untrusted(final String token) {
        final String withoutSignature = substringBeforeLast(token, DOT) + DOT;

        return jwtDecoder().decode(token).getClaim(withoutSignature);
        // See: https://github.com/jwtk/jjwt/issues/135
    }
}
