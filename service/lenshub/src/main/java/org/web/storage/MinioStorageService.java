package org.web.storage;

import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.web.common.exceptions.ApplicationException;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MinioStorageService implements StorageService {
    private final MinioStorageProperties properties;
    private MinioClient internalClient;
    private MinioClient presignClient;

    @PostConstruct
    void initializeClients() {
        internalClient = newClient(properties.getInternalEndpoint());
        presignClient = newClient(properties.getPublicEndpoint());
    }

    @Override
    public String presignPut(String objectKey, String contentType, Duration expiry) {
        return presign(Method.PUT, objectKey, contentType, expiry);
    }

    @Override
    public String presignGet(String objectKey, Duration expiry) {
        return presign(Method.GET, objectKey, null, expiry);
    }

    @Override
    public StorageObjectMetadata stat(String objectKey) {
        try {
            StatObjectResponse response = internalClient.statObject(StatObjectArgs.builder()
                    .bucket(properties.getBucket())
                    .object(objectKey)
                    .build());
            return new StorageObjectMetadata(response.size(), response.contentType(), response.etag());
        } catch (Exception exception) {
            throw storageFailure("Cannot verify uploaded file", exception);
        }
    }

    @Override
    public Path downloadToTempFile(String objectKey, String fileSuffix) {
        String suffix = fileSuffix == null || fileSuffix.isBlank() ? ".bin" : fileSuffix;
        try {
            Path tempFile = Files.createTempFile("lenshub-storage-", suffix);
            try (InputStream input = internalClient.getObject(GetObjectArgs.builder()
                    .bucket(properties.getBucket())
                    .object(objectKey)
                    .build())) {
                Files.copy(input, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception exception) {
                Files.deleteIfExists(tempFile);
                throw exception;
            }
            return tempFile;
        } catch (ApplicationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw storageFailure("Cannot download private file", exception);
        }
    }

    @Override
    public void delete(String objectKey) {
        try {
            internalClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(properties.getBucket())
                    .object(objectKey)
                    .build());
        } catch (Exception exception) {
            throw storageFailure("Cannot delete private file", exception);
        }
    }

    private String presign(Method method, String objectKey, String contentType, Duration expiry) {
        try {
            GetPresignedObjectUrlArgs.Builder builder = GetPresignedObjectUrlArgs.builder()
                    .method(method)
                    .bucket(properties.getBucket())
                    .object(objectKey)
                    .expiry((int) expiry.toSeconds(), TimeUnit.SECONDS);
            if (contentType != null) {
                builder.extraHeaders(Map.of("Content-Type", contentType));
            }
            return presignClient.getPresignedObjectUrl(builder.build());
        } catch (Exception exception) {
            throw storageFailure("Cannot create file upload URL", exception);
        }
    }

    private MinioClient newClient(String endpoint) {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(properties.getAccessKey(), properties.getSecretKey())
                .build();
    }

    private ApplicationException storageFailure(String message, Exception exception) {
        return new ApplicationException(HttpStatus.BAD_GATEWAY, message);
    }
}
