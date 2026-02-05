package dev.xbase.core.configurations;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@OpenAPIDefinition(
        info = @io.swagger.v3.oas.annotations.info.Info(
                title = "Document API",
                version = "v2",
                description = "This app provides REST APIs for order entities",
                contact = @io.swagger.v3.oas.annotations.info.Contact(
                        name = "document",
                        email = "xbase.dev",
                        url = "https://xbase.dev/support"
                )
        )
)
@Configuration
public class OpenApiConfig {
    @Value("${app.module.openapi.dev-url:}")
    private String devUrl;

    @Value("${app.module.openapi.prod-url:}")
    private String prodUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl(devUrl);
        devServer.setDescription("Server URL in Development environment");

        Server prodServer = new Server();
        prodServer.setUrl(prodUrl);
        prodServer.setDescription("Server URL in Production environment");

        Contact contact = new Contact();
        contact.setEmail("contact@xbase.dev");
        contact.setName("Ots");
        contact.setUrl("https://www.xbase.dev");

        License mitLicense = new License().name("MIT License").url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title("CMS Management API")
                .version("1.0")
                .contact(contact)
                .description("This API exposes endpoints to manage tutorials.").termsOfService("https://xbase.dev/terms")
                .license(mitLicense);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer, prodServer))
                .externalDocs(new ExternalDocumentation()
                        .description("xBase Framework Documentation")
                        .url("https://ots.vn/docs"))
                .components(new Components()
                        .addSecuritySchemes("basic-auth",
                                new SecurityScheme().type(SecurityScheme.Type.HTTP).name("basicAuth").scheme("basic"))
                        .addSecuritySchemes("bearer-key",
                                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT"))
                        .addSecuritySchemes("SystemKey",
                                new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.HEADER).name("Authorization"))
                        .addParameters("property-id", new Parameter()
                                .in("header")
                                .name("property-id")
                                .schema(new StringSchema())
                                .required(false))
                );
    }

    @Bean
    public GroupedOpenApi cmsApi() {
        return GroupedOpenApi.builder()
                .group("CMS API")
                .pathsToMatch("/v1/api/**")
                .addOperationCustomizer((operation, handlerMethod)
                        -> operation.addSecurityItem(new SecurityRequirement().addList("bearer-key"))
                )
                .build();
    }

    @Bean
    public GroupedOpenApi cmsPropertyApi() {
        return GroupedOpenApi.builder()
                .group("Property API")
                .pathsToMatch("/v1/property/**")
                .addOperationCustomizer((operation, handlerMethod)
                        -> operation.addSecurityItem(new SecurityRequirement().addList("bearer-key"))
                        .addParametersItem(new HeaderParameter()
                                .$ref("#/components/parameters/property-id"))
                )
                .build();
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("PUBLIC API")
                .pathsToMatch("/pub/**", "/api/authenticate/refresh-token")
                .build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("AUTH API")
                .pathsToMatch("/pub/authenticate")
                .addOperationCustomizer((operation, handlerMethod)
                        -> operation.addSecurityItem(new SecurityRequirement().addList("basic-auth")))
                .build();
    }
}
