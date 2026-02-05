package dev.xbase.core.model.template;

import java.util.List;

public interface Template {
    TemplateContent content();

    TemplateData data();

    default String asText() {
        if (data().isEmpty()) {
            return content().value();
        }
        return Template.resolveTemplates(data().list(), content().value());
    }

    static String resolveTemplates(List<FieldItem> fieldItems, String template) {
        return fieldItems.stream()
                .reduce(template, (s, fieldItem) -> s.replace("${" + fieldItem.code() + "}", fieldItem.value())
                                .replace("{" + fieldItem.code() + "}", fieldItem.value())
                                .replace("{{" + fieldItem.code() + "}}", fieldItem.value())
                                .replace("{!" + fieldItem.code() + "!}", fieldItem.value())
                        , (s, s2) -> s);
    }
}
