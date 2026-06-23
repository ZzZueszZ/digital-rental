package org.web.orders.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelOrderRequest {

    @NotBlank(message = "Vui lòng nhập lý do hủy đơn hàng")
    @Size(max = 1000, message = "Lý do hủy không được vượt quá 1000 ký tự")
    private String reason;
}
