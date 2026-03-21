package org.web.authentication.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleAssignPermissionRequest {

    @NotNull(message = "Permission IDs are required")
    private List<Long> permissionIds;
}
