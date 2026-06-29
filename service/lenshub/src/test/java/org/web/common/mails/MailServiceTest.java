package org.web.common.mails;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.web.common.mails.config.MailProperties;
import org.web.common.mails.gateway.MailCategory;
import org.web.common.mails.gateway.MailDeliveryException;
import org.web.common.mails.gateway.MailDeliveryResult;
import org.web.common.mails.gateway.MailGateway;
import org.web.common.mails.gateway.MailMessage;
import org.web.files.model.FileAsset;
import org.web.products.model.Product;
import org.web.storage.StorageService;
import org.web.users.model.User;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MailServiceTest {

    private final MailGateway mailGateway = mock(MailGateway.class);
    private final StorageService storageService = mock(StorageService.class);
    private final MailService mailService = new MailService(
            mailGateway,
            storageService,
            properties(),
            "https://api.lenshub.shop"
    );

    @Test
    void activationUsesProviderNeutralMessage() {
        User user = User.builder().email("user@example.com").build();
        when(mailGateway.send(any())).thenReturn(new MailDeliveryResult("smtp", null));

        mailService.sendActivationEmail(user, "https://api.lenshub.shop/api/auth/activate?token=test");

        ArgumentCaptor<MailMessage> captor = ArgumentCaptor.forClass(MailMessage.class);
        verify(mailGateway).send(captor.capture());
        MailMessage message = captor.getValue();
        assertEquals("LensHub <no-reply@mail.lenshub.shop>", message.from());
        assertEquals("user@example.com", message.to());
        assertEquals(MailCategory.ACTIVATION, message.category());
        assertTrue(message.html().contains("token=test"));
        assertTrue(message.attachments().isEmpty());
    }

    @Test
    void inlineImageTempFileIsDeletedEvenWhenGatewayFails() throws Exception {
        Path image = Files.createTempFile("mail-service-", ".png");
        Files.writeString(image, "image");
        when(storageService.downloadToTempFile("products/camera.png", ".png"))
                .thenReturn(image);
        doAnswer(invocation -> {
            MailMessage message = invocation.getArgument(0);
            assertEquals(MailCategory.INVENTORY, message.category());
            assertEquals(1, message.attachments().size());
            assertTrue(Files.exists(message.attachments().get(0).path()));
            throw new MailDeliveryException("smtp", true, new RuntimeException("offline"));
        }).when(mailGateway).send(any());

        Product product = Product.builder()
                .id(10L)
                .name("Camera")
                .salePrice(new BigDecimal("1000000"))
                .mainImageAsset(FileAsset.builder()
                        .objectKey("products/camera.png")
                        .contentType("image/png")
                        .build())
                .build();

        assertDoesNotThrow(() -> mailService.sendLowSaleStockAlertEmail(product, 5, 4));
        assertFalse(Files.exists(image));
    }

    private MailProperties properties() {
        MailProperties properties = new MailProperties();
        properties.setFrom("LensHub <no-reply@mail.lenshub.shop>");
        properties.setAdmin("admin@lenshub.shop");
        return properties;
    }
}
