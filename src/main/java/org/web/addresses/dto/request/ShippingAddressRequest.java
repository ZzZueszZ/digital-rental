package org.web.addresses.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiverName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ đầy đủ không được để trống")
    private String fullAddress;

    private String province;
    private String district;
    private String ward;
    private String detailAddress;

    private Boolean setAsDefault;
}
