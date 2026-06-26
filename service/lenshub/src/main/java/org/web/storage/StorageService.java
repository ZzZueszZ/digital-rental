package org.web.storage;

import java.nio.file.Path;
import java.time.Duration;

public interface StorageService {
    String presignPut(String objectKey, String contentType, Duration expiry);

    String presignGet(String objectKey, Duration expiry);

    StorageObjectMetadata stat(String objectKey);

    Path downloadToTempFile(String objectKey, String fileSuffix);

    void delete(String objectKey);
}
