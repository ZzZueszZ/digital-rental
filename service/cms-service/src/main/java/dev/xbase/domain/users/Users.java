package dev.xbase.domain.users;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Collections;
import java.util.List;

@Getter
@RequiredArgsConstructor
public class Users {
    final @NonNull List<User> list;
    public List<User> list(){
        return Collections.unmodifiableList(list);
    }

    public static final Users ofEmpty() {
        return new Users(Collections.emptyList());
    }

    public boolean isEmpty() {
        return list.isEmpty();
    }
}
