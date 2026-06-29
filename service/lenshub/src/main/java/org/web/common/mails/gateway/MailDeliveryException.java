package org.web.common.mails.gateway;

public class MailDeliveryException extends RuntimeException {

    private final String provider;
    private final boolean transientFailure;

    public MailDeliveryException(String provider, boolean transientFailure, Throwable cause) {
        super("Mail delivery failed via " + provider, cause);
        this.provider = provider;
        this.transientFailure = transientFailure;
    }

    public String getProvider() {
        return provider;
    }

    public boolean isTransientFailure() {
        return transientFailure;
    }
}
