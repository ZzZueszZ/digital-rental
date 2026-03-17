package org.web.users.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.web.common.enums.Gender;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {

    @Size(max = 200, message = "Full name must be less than 200 characters")
    private String fullName;

    @Size(max = 100, message = "First name must be less than 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must be less than 100 characters")
    private String lastName;

    private Gender gender;

    private LocalDate dateOfBirth;

    @Size(max = 150, message = "Occupation must be less than 150 characters")
    private String occupation;

    @Size(max = 200, message = "Company name must be less than 200 characters")
    private String companyName;
}
