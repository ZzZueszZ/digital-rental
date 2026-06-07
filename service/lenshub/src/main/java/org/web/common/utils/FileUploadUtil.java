package org.web.common.utils;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.web.common.exceptions.ApplicationException;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

public class FileUploadUtil {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp", "avif");
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = List.of("webm", "mp4", "mov");

    /** Lưu 1 ảnh, trả về URL /uploads/xxx */
    public static String saveImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        validateImage(image);

        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        String fileName = UUID.randomUUID() + "_" + sanitizeFileName(
                Objects.requireNonNull(image.getOriginalFilename())
        );
        Path filePath = Paths.get(UPLOAD_DIR, fileName);

        try {
            Files.write(filePath, image.getBytes());
        } catch (IOException e) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving image file!");
        }

        return "/api/uploads/" + fileName;
    }

    public static String saveVideo(MultipartFile video) {
        if (video == null || video.isEmpty()) {
            return null;
        }

        validateVideo(video);

        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        String fileName = UUID.randomUUID() + "_" + sanitizeFileName(
                Objects.requireNonNull(video.getOriginalFilename())
        );
        Path filePath = Paths.get(UPLOAD_DIR, fileName);

        try {
            Files.write(filePath, video.getBytes());
        } catch (IOException e) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving video file!");
        }

        return "/api/uploads/" + fileName;
    }

    /** Xóa file ảnh trên disk (nếu tồn tại) */
    public static void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/api/uploads/")) {
            return; // không phải ảnh hợp lệ của hệ thống -> bỏ qua
        }

        String relativePath = imageUrl.substring(1); // "/uploads/xx" -> "uploads/xx"
        Path path = Paths.get(System.getProperty("user.dir"), relativePath);

        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Failed to delete image file: " + e.getMessage());
        }
    }

    /** Thay ảnh: xóa ảnh cũ (nếu có) rồi lưu ảnh mới */
    public static String replaceImage(String oldImageUrl, MultipartFile newImage) {
        if (newImage == null || newImage.isEmpty()) {
            return oldImageUrl;
        }

        deleteImage(oldImageUrl);
        return saveImage(newImage);
    }

    /** Lưu nhiều ảnh gallery */
    public static List<String> saveImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile image : images) {
            if (image != null && !image.isEmpty()) {
                urls.add(saveImage(image));
            }
        }
        return urls;
    }

    // ------------ helper methods ------------

    private static void validateImage(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Kích thước file vượt quá 10MB!");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid file name!");
        }

        String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Only JPG, JPEG, PNG, WEBP files are allowed!");
        }
    }

    private static void validateVideo(MultipartFile file) {
        if (file.getSize() > MAX_VIDEO_FILE_SIZE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Video file exceeds 50MB!");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid video file name!");
        }

        String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_VIDEO_EXTENSIONS.contains(ext)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Only WEBM, MP4, MOV video files are allowed!");
        }
    }

    private static String sanitizeFileName(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
