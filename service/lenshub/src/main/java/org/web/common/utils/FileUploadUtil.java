package org.web.common.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.web.common.exceptions.ApplicationException;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class FileUploadUtil {

    private static final Logger log = LoggerFactory.getLogger(FileUploadUtil.class);
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final long MAX_LIVENESS_VIDEO_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    private static final double MIN_LIVENESS_VIDEO_DURATION_SECONDS = 4.5;
    private static final double MAX_LIVENESS_VIDEO_DURATION_SECONDS = 7.0;
    private static final boolean REQUIRE_LIVENESS_VIDEO_DURATION_PROBE = Boolean.parseBoolean(
            Optional.ofNullable(System.getenv("REQUIRE_LIVENESS_VIDEO_DURATION_PROBE")).orElse("false")
    );
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp", "avif");
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = List.of("webm", "mp4", "mov");
    private static final List<String> ALLOWED_VIDEO_CONTENT_TYPES = List.of("video/webm", "video/mp4", "video/quicktime");

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

    public static String saveLivenessVideo(MultipartFile video) {
        return saveLivenessVideo(video, FileUploadUtil::probeVideoDurationSeconds);
    }

    static String saveLivenessVideo(MultipartFile video, VideoDurationProbe durationProbe) {
        if (video == null || video.isEmpty()) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Video liveness is required");
        }

        validateLivenessVideoFile(video);

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Error preparing upload directory!");
        }

        String fileName = UUID.randomUUID() + "_" + sanitizeFileName(
                Objects.requireNonNull(video.getOriginalFilename())
        );
        Path tempPath = null;
        Path finalPath = Paths.get(UPLOAD_DIR, fileName);

        try {
            String ext = extension(video.getOriginalFilename());
            tempPath = Files.createTempFile(Paths.get(UPLOAD_DIR), "liveness_", "." + ext);
            video.transferTo(tempPath);
            validateLivenessVideoPath(tempPath, ext, durationProbe);

            Files.move(tempPath, finalPath, StandardCopyOption.REPLACE_EXISTING);
            tempPath = null;
        } catch (ApplicationException e) {
            throw e;
        } catch (IOException e) {
            throw new ApplicationException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving liveness video file!");
        } finally {
            if (tempPath != null) {
                try {
                    Files.deleteIfExists(tempPath);
                } catch (IOException e) {
                    log.warn("Failed to delete temporary liveness video {}", tempPath, e);
                }
            }
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
            log.warn("Failed to delete image file {}", path, e);
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

    private static void validateLivenessVideoFile(MultipartFile file) {
        if (file.getSize() > MAX_LIVENESS_VIDEO_FILE_SIZE) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Video liveness must be smaller than 15MB");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid liveness video file name");
        }

        String ext = extension(originalName);
        if (!ALLOWED_VIDEO_EXTENSIONS.contains(ext)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Only WEBM, MP4, MOV video files are allowed!");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (contentType == null || !ALLOWED_VIDEO_CONTENT_TYPES.contains(contentType)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid liveness video content type");
        }
    }

    private static void validateVideoSignature(Path path, String extension) throws IOException {
        byte[] header = Files.readAllBytes(path);
        if (header.length < 12) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid liveness video file");
        }

        boolean validWebm = extension.equals("webm")
                && header.length >= 4
                && (header[0] & 0xFF) == 0x1A
                && (header[1] & 0xFF) == 0x45
                && (header[2] & 0xFF) == 0xDF
                && (header[3] & 0xFF) == 0xA3;
        boolean validIsoVideo = (extension.equals("mp4") || extension.equals("mov"))
                && header[4] == 'f'
                && header[5] == 't'
                && header[6] == 'y'
                && header[7] == 'p';
        if (!validWebm && !validIsoVideo) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid liveness video file");
        }
    }

    public static void validateLivenessVideoPath(Path path, String extension) {
        validateLivenessVideoPath(path, extension, FileUploadUtil::probeVideoDurationSeconds);
    }

    static void validateLivenessVideoPath(Path path, String extension, VideoDurationProbe durationProbe) {
        try {
            validateVideoSignature(path, extension);
            durationProbe.durationSeconds(path).ifPresent(FileUploadUtil::validateLivenessVideoDuration);
        } catch (ApplicationException e) {
            throw e;
        } catch (IOException e) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Invalid liveness video file");
        }
    }

    private static OptionalDouble probeVideoDurationSeconds(Path path) {
        String ffprobe = Optional.ofNullable(System.getenv("FFPROBE_PATH"))
                .filter(value -> !value.isBlank())
                .orElse("ffprobe");
        try {
            OptionalDouble containerDuration = parseDurationSeconds(runFfprobe(
                    ffprobe,
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    path.toAbsolutePath().toString()
            ));
            if (containerDuration.isPresent()) {
                return containerDuration;
            }

            // MediaRecorder WebM files commonly omit the container duration. In that case,
            // derive it from the final video packet instead of rejecting an otherwise valid recording.
            OptionalDouble packetDuration = parsePacketDurationSeconds(runFfprobe(
                    ffprobe,
                    "-select_streams", "v:0",
                    "-show_entries", "packet=pts_time,duration_time",
                    "-of", "csv=p=0",
                    path.toAbsolutePath().toString()
            ));
            if (packetDuration.isPresent()) {
                return packetDuration;
            }
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Cannot read liveness video duration");
        } catch (ApplicationException e) {
            throw e;
        } catch (IOException e) {
            if (REQUIRE_LIVENESS_VIDEO_DURATION_PROBE) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, "Cannot read liveness video duration");
            }
            log.warn("ffprobe is unavailable; liveness upload will use size and signature validation only. Set REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=true to reject these uploads.", e);
            return OptionalDouble.empty();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Cannot read liveness video duration");
        }
    }

    private static String runFfprobe(String ffprobe, String... arguments) throws IOException, InterruptedException {
        List<String> command = new ArrayList<>(arguments.length + 3);
        command.add(ffprobe);
        command.add("-v");
        command.add("error");
        command.addAll(Arrays.asList(arguments));

        Process process = new ProcessBuilder(command).start();
        boolean finished = process.waitFor(5, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Cannot read liveness video duration");
        }
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        if (process.exitValue() != 0) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Cannot read liveness video duration");
        }
        return output;
    }

    static OptionalDouble parseDurationSeconds(String output) {
        if (output == null) {
            return OptionalDouble.empty();
        }
        return Arrays.stream(output.lines().toArray(String[]::new))
                .map(String::trim)
                .map(FileUploadUtil::finiteDouble)
                .flatMapToDouble(OptionalDouble::stream)
                .filter(value -> value > 0)
                .findFirst();
    }

    static OptionalDouble parsePacketDurationSeconds(String output) {
        if (output == null || output.isBlank()) {
            return OptionalDouble.empty();
        }
        double duration = -1;
        for (String line : output.lines().toList()) {
            String[] values = line.trim().split(",", -1);
            if (values.length == 0) {
                continue;
            }
            OptionalDouble pts = finiteDouble(values[0]);
            if (pts.isEmpty()) {
                continue;
            }
            double packetDuration = values.length > 1
                    ? finiteDouble(values[1]).orElse(0)
                    : 0;
            duration = Math.max(duration, pts.getAsDouble() + Math.max(0, packetDuration));
        }
        return duration > 0 ? OptionalDouble.of(duration) : OptionalDouble.empty();
    }

    private static OptionalDouble finiteDouble(String value) {
        try {
            double parsed = Double.parseDouble(value.trim());
            return Double.isFinite(parsed) ? OptionalDouble.of(parsed) : OptionalDouble.empty();
        } catch (NumberFormatException e) {
            return OptionalDouble.empty();
        }
    }

    private static void validateLivenessVideoDuration(double duration) {
        if (!Double.isFinite(duration)) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "Cannot read liveness video duration");
        }
        if (duration < MIN_LIVENESS_VIDEO_DURATION_SECONDS || duration > MAX_LIVENESS_VIDEO_DURATION_SECONDS) {
            throw new ApplicationException(
                    HttpStatus.BAD_REQUEST,
                    "Video liveness must be between 4.5 and 7 seconds"
            );
        }
    }

    private static String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return null;
        }
        return contentType.split(";")[0].trim().toLowerCase(Locale.ROOT);
    }

    private static String extension(String originalName) {
        return originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private static String sanitizeFileName(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    @FunctionalInterface
    interface VideoDurationProbe {
        OptionalDouble durationSeconds(Path path);
    }
}
