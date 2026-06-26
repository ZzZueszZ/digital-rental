package org.web.identity.service.provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.web.common.exceptions.ApplicationException;
import org.web.storage.StorageService;

import java.nio.file.Files;
import java.nio.file.Path;

@Component
@Slf4j
@RequiredArgsConstructor
public class UploadedFileResolver {
    private final StorageService storageService;

    public Path resolve(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid KYC image URL");
        }
        if (!imageUrl.startsWith("/api/uploads/")) {
            if (imageUrl.startsWith("/") || imageUrl.contains("..")) throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid KYC storage key");
            return storageService.downloadToTempFile(imageUrl, suffix(imageUrl));
        }
        String fileName = imageUrl.substring("/api/uploads/".length());
        Path uploadDir = Path.of(System.getProperty("user.dir"), "uploads").normalize();
        Path path = uploadDir.resolve(fileName).normalize();
        if (!path.startsWith(uploadDir)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid KYC image URL");
        }
        if (!Files.exists(path)) {
            log.error("KYC uploaded file not found: imageUrl={}, resolvedPath={}", imageUrl, path);
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "KYC image file not found");
        }
        log.debug("KYC uploaded file resolved: imageUrl={}, path={}", imageUrl, path);
        return path;
    }

    private String suffix(String key) {
        int dot = key.lastIndexOf('.');
        return dot >= 0 ? key.substring(dot) : ".bin";
    }

    public void cleanup(Path path) {
        if (path == null || path.startsWith(Path.of(System.getProperty("user.dir"), "uploads").normalize())) {
            return;
        }
        try {
            Files.deleteIfExists(path);
        } catch (Exception e) {
            log.warn("Failed to delete temporary KYC file {}", path, e);
        }
    }
}
