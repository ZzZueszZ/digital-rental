package dev.xbase.core.starter.autoconfigure.email.domain;

import java.io.Serializable;

public enum EmailBodyType implements Serializable {
    Html,
    Text;

    public boolean isHtml(){
        return this == Html;
    }
    public boolean isText(){
        return this == Text;
    }
}
