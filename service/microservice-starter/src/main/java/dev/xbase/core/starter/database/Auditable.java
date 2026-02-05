package dev.xbase.core.starter.database;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Temporal;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

import static jakarta.persistence.TemporalType.TIMESTAMP;

@MappedSuperclass
@EntityListeners({AuditingEntityListener.class, BaseEntityListener.class})
@Data
public abstract class Auditable {
    @Column(name = "created_program")
    protected String createdProgram;
    @Column(name = "created_by")
    @CreatedBy
    protected Integer createdBy;
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    @Temporal(TIMESTAMP)
    protected LocalDateTime createdAt;
    @Column(name = "updated_by")
    @LastModifiedBy
    protected Integer updatedBy;
    @Column(name = "updated_at")
    @LastModifiedDate
    @Temporal(TIMESTAMP)
    protected LocalDateTime updatedAt;
}
