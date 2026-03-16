package org.web.authentication.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {

    @NotBlank(message = "Role code is required")
    @Size(max = 50, message = "Role code must be less than 50 characters")
    private String code;

    @Size(max = 255, message = "Description must be less than 255 characters")
    private String description;
}
