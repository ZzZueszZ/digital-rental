package org.web.identity.service.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.web.common.exceptions.ApplicationException;

import java.nio.file.Files;
import java.nio.file.Path;

@Component
@Slf4j
public class UploadedFileResolver {

    public Path resolve(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/api/uploads/")) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid KYC image URL");
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
}
