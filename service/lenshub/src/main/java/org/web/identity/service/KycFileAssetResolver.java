package org.web.identity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.web.common.exceptions.ApplicationException;
import org.web.files.model.FileAssetPurpose;
import org.web.files.model.FileAssetStatus;
import org.web.files.repository.FileAssetRepository;
import org.web.users.model.User;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KycFileAssetResolver {
    private final FileAssetRepository assets;

    public String resolve(User user, UUID id, FileAssetPurpose purpose) {
        if (id == null) throw new ApplicationException(HttpStatus.BAD_REQUEST, "KYC file asset is required");
        var asset = assets.findById(id).orElseThrow(() -> new ApplicationException(HttpStatus.NOT_FOUND, "KYC file asset not found"));
        if (!asset.getOwner().getId().equals(user.getId()) || asset.getPurpose() != purpose || asset.getStatus() != FileAssetStatus.READY) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, "KYC file asset is not available");
        }
        return asset.getObjectKey();
    }
}
