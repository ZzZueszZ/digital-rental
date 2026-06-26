package org.web.identity.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class OcrPreviewRequest {

    private String frontImageUrl;
    private String backImageUrl;
    private UUID frontImageAssetId;
    private UUID backImageAssetId;
}
