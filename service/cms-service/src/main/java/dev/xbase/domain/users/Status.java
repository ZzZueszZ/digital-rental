package dev.xbase.domain.users;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class Status {
    final @NonNull StatusType statusType;
    final @NonNull String reason;

    public static Status ofEmpty() {
        return new Status(StatusType.ACTIVE, "");
    }

    public boolean notEquals(Status status) {
        return statusType != status.getStatusType() || !reason.equals(status.getReason());
    }
}
