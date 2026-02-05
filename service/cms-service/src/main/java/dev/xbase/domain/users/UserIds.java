package dev.xbase.domain.users;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@RequiredArgsConstructor
public class UserIds {
    final @NonNull List<UserId> list;

    public static UserIds of(Integer[] ids) {
        return new UserIds(Arrays.stream(ids)
                .map(UserId::new)
                .collect(Collectors.toList()));
    }

    public static UserIds of(Integer id) {
        return new UserIds(List.of(new UserId(id)));
    }

    public List<UserId> list() {
        return Collections.unmodifiableList(list);
    }

    public static final UserIds ofEmpty() {
        return new UserIds(Collections.emptyList());
    }

    public boolean checkSameSize(UserIds userIds) {
        return list.size() == userIds.list().size();
    }
}
