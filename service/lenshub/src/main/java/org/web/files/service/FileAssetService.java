package org.web.files.service;

import org.web.files.dto.request.PresignUploadRequest;
import org.web.files.dto.response.FileAssetResponse;
import org.web.files.dto.response.PresignedDownloadResponse;
import org.web.files.dto.response.PresignedUploadResponse;
import org.web.users.model.User;

import java.util.UUID;

public interface FileAssetService {
    PresignedUploadResponse createUpload(User user, PresignUploadRequest request);

    FileAssetResponse complete(User user, UUID assetId, boolean canManageAll);

    PresignedDownloadResponse createDownload(User user, UUID assetId, boolean canManageAll);

    void delete(User user, UUID assetId, boolean canManageAll);
}
