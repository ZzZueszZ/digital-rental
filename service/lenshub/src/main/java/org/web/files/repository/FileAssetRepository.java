package org.web.files.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.web.files.model.FileAsset;

import java.util.UUID;

public interface FileAssetRepository extends JpaRepository<FileAsset, UUID> {
}
