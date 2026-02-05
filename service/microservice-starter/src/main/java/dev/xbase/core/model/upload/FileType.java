package dev.xbase.core.model.upload;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(staticName = "of")
@Getter
public class FileType {
    @NonNull
    final String value;

    public static FileType ofEmpty() {
        return FileType.of("");
    }
}
