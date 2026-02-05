package dev.xbase.domain.users;

public enum StatusType {
    ACTIVE,
    DELETED,
    EXPIRED,
    LOCKED;

    public boolean isActive(){
        return this == ACTIVE;
    }

    public boolean isDeleted(){
        return this == DELETED;
    }

    public boolean isExperied(){
        return this == EXPIRED;
    }

    public boolean isLocked(){
        return this == LOCKED;
    }
}
