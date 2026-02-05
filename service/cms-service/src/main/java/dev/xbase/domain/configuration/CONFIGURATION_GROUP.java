package dev.xbase.domain.configuration;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@RequiredArgsConstructor
@Getter
public enum CONFIGURATION_GROUP {
    OTHER("OTHER"),
    COMPANY_INFO("COMPANY-INFO"),
    SOCIAL_NET_INFO("SOCIAL-NET-INFO"),
    SEO_INFO("SEO-INFO"),
    CONTACT_INFO("CONTACT-INFO"),
    BASIC_INFO("BASIC-INFO"),
    ORDER_CONFIG("ORDER-CONFIG"),
    MAIL_SENDER("MAIL-SENDER"),
    EMAIL_TEMPLATE("EMAIL_TEMPLATE"),
    SMS_TEMPLATE("SMS_TEMPLATE"),
    HOME_SLIDES("HOME_SLIDES");

    @NonNull
    final String code;

    public static CONFIGURATION_GROUP valueCodeOf(String code) {
        return Arrays.stream(CONFIGURATION_GROUP.values())
                .filter(setting_group -> setting_group.getCode().equals(code))
                .findFirst()
                .orElse(CONFIGURATION_GROUP.OTHER);
    }
}