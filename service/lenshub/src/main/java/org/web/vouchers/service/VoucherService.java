package org.web.vouchers.service;

import org.springframework.data.domain.Page;
import org.web.vouchers.dto.request.VoucherApplyRequest;
import org.web.vouchers.dto.request.VoucherCreateRequest;
import org.web.vouchers.dto.request.VoucherUpdateRequest;
import org.web.vouchers.dto.response.VoucherApplyResponse;
import org.web.vouchers.dto.response.VoucherResponse;

public interface VoucherService {

    VoucherResponse create(VoucherCreateRequest request);

    VoucherResponse update(Long id, VoucherUpdateRequest request);

    void deactivate(Long id);

    void activate(Long id);

    VoucherResponse getById(Long id);

    Page<VoucherResponse> list(int page, int size);

    Page<VoucherResponse> listActive(int page, int size);

    VoucherApplyResponse apply(VoucherApplyRequest request);
}
