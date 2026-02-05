package dev.xbase.core.model.upload;

public interface UploadFileRepository {
    Url uploadFile(FileBufferUpload file);
}
