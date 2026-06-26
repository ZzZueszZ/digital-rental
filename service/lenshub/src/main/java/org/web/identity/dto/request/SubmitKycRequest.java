package org.web.identity.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class SubmitKycRequest {

    private String frontImageUrl;
    private String backImageUrl;
    private String selfieImageUrl;
    private String livenessVideoUrl;
    private UUID frontImageAssetId;
    private UUID backImageAssetId;
    private UUID selfieImageAssetId;
    private UUID livenessVideoAssetId;
}
