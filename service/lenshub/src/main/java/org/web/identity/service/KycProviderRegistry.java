package org.web.identity.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.web.identity.service.provider.KycProvider;
import org.web.identity.service.provider.KycProviderProperties;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class KycProviderRegistry {

    private final List<KycProvider> providers;
    private final KycProviderProperties properties;

    public KycProvider activeProvider() {
        KycProvider provider = providers.stream()
                .filter(candidate -> candidate.supports(properties.getProvider()))
                .findFirst()
                .orElseGet(() -> providers.stream()
                        .filter(candidate -> candidate.supports("mock"))
                        .findFirst()
                        .orElseThrow());
        log.debug("KYC active provider resolved: configured={}, selected={}", properties.getProvider(), provider.name());
        return provider;
    }
}
