package org.web.identity.service.provider;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.web.common.exceptions.ApplicationException;
import org.web.storage.StorageService;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UploadedFileResolverTest {

    @TempDir
    private Path tempDir;

    @Test
    void resolveAcceptsFileInsideUploadsDirectory() throws Exception {
        Path uploadDir = Files.createDirectories(tempDir.resolve("uploads"));
        Path image = Files.createFile(uploadDir.resolve("front.jpg"));
        String originalUserDir = System.getProperty("user.dir");
        System.setProperty("user.dir", tempDir.toString());
        try {
            UploadedFileResolver resolver = new UploadedFileResolver(org.mockito.Mockito.mock(StorageService.class));

            Path resolved = resolver.resolve("/api/uploads/front.jpg");

            assertThat(resolved).isEqualTo(image);
        } finally {
            System.setProperty("user.dir", originalUserDir);
        }
    }

    @Test
    void resolveRejectsPathTraversalOutsideUploadsDirectory() throws Exception {
        Files.createDirectories(tempDir.resolve("uploads"));
        Files.createFile(tempDir.resolve("outside.jpg"));
        String originalUserDir = System.getProperty("user.dir");
        System.setProperty("user.dir", tempDir.toString());
        try {
            UploadedFileResolver resolver = new UploadedFileResolver(org.mockito.Mockito.mock(StorageService.class));

            assertThatThrownBy(() -> resolver.resolve("/api/uploads/../outside.jpg"))
                    .isInstanceOf(ApplicationException.class)
                    .hasMessageContaining("Invalid KYC image URL");
        } finally {
            System.setProperty("user.dir", originalUserDir);
        }
    }
}
