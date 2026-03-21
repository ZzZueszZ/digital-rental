package org.web.support.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.web.common.enums.SupportSubject;

@Getter
@Setter
public class SupportTicketRequest {

    @NotBlank(message = "Tên là bắt buộc")
    private String name;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    private String phone;

    @NotBlank(message = "Email là bắt buộc")
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    @NotNull(message = "Chủ đề là bắt buộc")
    private SupportSubject subject;

    @NotBlank(message = "Nội dung là bắt buộc")
    private String message;
}
