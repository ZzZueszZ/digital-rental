package dev.xbase.domain.users;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class UserSearchCriteria {
    final UserName userName;
    final Email email;
    final Statuses statuses;

    public boolean hasUserName() {
        return userName.hasValue();
    }

    public boolean hasEmail() {
        return email.hasValue();
    }

    public boolean hasStatuses() {
        return statuses.hasValue();
    }
}
