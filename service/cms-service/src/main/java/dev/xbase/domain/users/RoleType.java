package dev.xbase.domain.users;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class RoleType {

   @NonNull final String value;

    public boolean isAdmin() {
        return "ADMIN".equals(value) ;
    }

    public static RoleType ofEmpty() {
        return new RoleType("");
    }
}
