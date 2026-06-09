package org.web.identity.service;

import org.springframework.data.domain.Page;
import org.web.identity.dto.request.ResolveKycRequest;
import org.web.identity.dto.request.SubmitKycRequest;
import org.web.identity.dto.response.KycSessionResponse;
import org.web.users.model.User;

public interface IdentityService {
    KycSessionResponse initiateKyc(User user);
    KycSessionResponse submitKyc(User user, SubmitKycRequest request);
    KycSessionResponse getKycStatus(User user);
    Page<KycSessionResponse> getPendingKycSessions(int page, int size);
    KycSessionResponse resolveKycSession(Long sessionId, ResolveKycRequest request);
}
