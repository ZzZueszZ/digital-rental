package org.web.storage;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.web.common.exceptions.ApplicationException;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioStorageService implements StorageService {
    private final MinioStorageProperties properties;
    private MinioClient internalClient;
    private MinioClient presignClient;

    @PostConstruct
    void initializeClients() {
        internalClient = newClient(properties.getInternalEndpoint());
        presignClient = newClient(properties.getPublicEndpoint());
        log.info("MinIO storage configured. internalEndpoint={}, publicEndpoint={}, bucket={}",
                normalizeEndpoint(properties.getInternalEndpoint()),
                normalizeEndpoint(properties.getPublicEndpoint()),
                properties.getBucket());
        ensureBucketExists();
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
    public void putBytes(String objectKey, byte[] content, String contentType) {
        try (ByteArrayInputStream input = new ByteArrayInputStream(content)) {
            internalClient.putObject(PutObjectArgs.builder()
                    .bucket(properties.getBucket())
                    .object(objectKey)
                    .stream(input, content.length, -1)
                    .contentType(contentType)
                    .build());
        } catch (Exception exception) {
            throw storageFailure("Cannot upload file to MinIO", exception);
        }
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
            return presignClient.getPresignedObjectUrl(builder.build());
        } catch (Exception exception) {
            throw storageFailure("Cannot create file upload URL", exception);
        }
    }

    private MinioClient newClient(String endpoint) {
        return MinioClient.builder()
                .endpoint(normalizeEndpoint(endpoint))
                .credentials(properties.getAccessKey(), properties.getSecretKey())
                .build();
    }

    private String normalizeEndpoint(String endpoint) {
        String value = endpoint == null || endpoint.isBlank() ? "http://localhost:9000" : endpoint.trim();
        try {
            URI uri = URI.create(value);
            String scheme = uri.getScheme() == null ? "http" : uri.getScheme();
            String host = uri.getHost();
            int port = uri.getPort();
            if (host == null || host.isBlank()) {
                return value;
            }
            if (("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host)) && port == 9001) {
                port = 9000;
            }
            String authority = port > -1 ? host + ":" + port : host;
            return scheme + "://" + authority;
        } catch (IllegalArgumentException exception) {
            log.warn("Invalid MinIO endpoint '{}', using raw value", endpoint);
            return value;
        }
    }

    private ApplicationException storageFailure(String message, Exception exception) {
        log.error("{}: {}", message, exception.getMessage(), exception);
        return new ApplicationException(HttpStatus.BAD_GATEWAY, message);
    }

    private void ensureBucketExists() {
        try {
            boolean exists = internalClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(properties.getBucket())
                    .build());
            if (!exists) {
                internalClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(properties.getBucket())
                        .build());
                log.info("Created MinIO bucket: {}", properties.getBucket());
            }
        } catch (Exception exception) {
            log.warn("Cannot verify/create MinIO bucket {} during startup. File APIs will fail until MinIO is available.",
                    properties.getBucket(), exception);
        }
    }
}
