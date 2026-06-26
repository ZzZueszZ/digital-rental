package org.web.files.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.web.common.model.BaseAuditEntity;
import org.web.users.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "file_assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileAsset extends BaseAuditEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FileAssetPurpose purpose;

    @Column(nullable = false, length = 100)
    private String bucket;

    @Column(name = "object_key", nullable = false, unique = true, length = 500)
    private String objectKey;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(length = 255)
    private String etag;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FileAssetStatus status;

    @Column(name = "upload_expires_at", nullable = false)
    private LocalDateTime uploadExpiresAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
