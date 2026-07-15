package org.web.common.utils;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.web.common.exceptions.ApplicationException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.OptionalDouble;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileUploadUtilTest {

    @Test
    void saveLivenessVideoRejectsLongVideoBeforePermanentSave() {
        MockMultipartFile video = webmVideo("liveness.webm");

        assertThatThrownBy(() -> FileUploadUtil.saveLivenessVideo(video, path -> OptionalDouble.of(8.1)))
                .isInstanceOf(ApplicationException.class)
                .hasMessageContaining("between 4.5 and 7 seconds");
    }

    @Test
    void saveLivenessVideoRejectsRenamedNonVideo() {
        MockMultipartFile video = new MockMultipartFile(
                "file",
                "liveness.webm",
                "video/webm",
                "not a real video".getBytes()
        );

        assertThatThrownBy(() -> FileUploadUtil.saveLivenessVideo(video, path -> OptionalDouble.of(6.0)))
                .isInstanceOf(ApplicationException.class)
                .hasMessageContaining("Invalid liveness video file");
    }

    @Test
    void saveLivenessVideoStoresValidWebmAfterValidation() throws Exception {
        MockMultipartFile video = webmVideo("liveness.webm");

        String url = FileUploadUtil.saveLivenessVideo(video, path -> OptionalDouble.of(6.0));

        assertThat(url).startsWith("/api/uploads/");
        Path saved = Path.of(System.getProperty("user.dir"), url.substring("/api/".length()));
        assertThat(Files.exists(saved)).isTrue();
        Files.deleteIfExists(saved);
    }

    @Test
    void saveLivenessVideoStoresValidWebmWhenDurationProbeUnavailable() throws Exception {
        MockMultipartFile video = webmVideo("liveness.webm");

        String url = FileUploadUtil.saveLivenessVideo(video, path -> OptionalDouble.empty());

        assertThat(url).startsWith("/api/uploads/");
        Path saved = Path.of(System.getProperty("user.dir"), url.substring("/api/".length()));
        assertThat(Files.exists(saved)).isTrue();
        Files.deleteIfExists(saved);
    }

    @Test
    void durationParserTreatsWebmUnknownDurationAsUnavailable() {
        assertThat(FileUploadUtil.parseDurationSeconds("N/A\n")).isEmpty();
    }

    @Test
    void packetParserDerivesDurationForWebmWithoutContainerDuration() {
        String packets = "0.000000,0.033000\n5.966000,0.034000\n";

        assertThat(FileUploadUtil.parsePacketDurationSeconds(packets))
                .hasValue(6.0);
    }

    @Test
    void packetParserIgnoresMalformedMetadata() {
        assertThat(FileUploadUtil.parsePacketDurationSeconds("N/A,N/A\ninvalid\n"))
                .isEmpty();
    }

    private MockMultipartFile webmVideo(String filename) {
        byte[] content = new byte[] {
                0x1A, 0x45, (byte) 0xDF, (byte) 0xA3,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00
        };
        return new MockMultipartFile("file", filename, "video/webm", content);
    }
}
