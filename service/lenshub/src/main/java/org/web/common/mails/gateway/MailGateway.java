package org.web.common.mails.gateway;

public interface MailGateway {

    MailDeliveryResult send(MailMessage message);
}
