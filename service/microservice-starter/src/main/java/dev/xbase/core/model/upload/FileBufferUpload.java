package dev.xbase.core.model.upload;

public record FileBufferUpload(FileName fileName,
                               FileData fileData,
                               FileType fileType,
                               FileSize fileSize,
                               Path filePath,
                               FileName destName) {
}
