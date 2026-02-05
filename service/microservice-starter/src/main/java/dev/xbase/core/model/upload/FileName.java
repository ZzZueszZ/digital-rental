package dev.xbase.core.model.upload;

public record FileName(String value) {

    public static FileName ofEmpty() {
        return new FileName("");
    }

    public static FileName of(String originalFilename) {
        return new FileName(originalFilename);
    }
}
