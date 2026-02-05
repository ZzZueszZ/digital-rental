package dev.xbase.core.starter.autoconfigure.email.domain;

public enum MailStatus {
    SENT_OK,
    SENT_FAIL;

    public boolean isOK() {
        return this == SENT_OK;
    }

    public boolean isFail() {
        return this == SENT_FAIL;
    }
}
