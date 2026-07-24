package com.epiis.DS26.dto.request;

import com.epiis.DS26.enums.ERole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {
    private String firstName;
    private String lastName;
    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "El formato de correo no es valido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    @Pattern(regexp = "^(?=.[a-z])(?=.[A-Z])(?=.\\d)(?=.[@$!%?&])[A-Za-z\\d@$!%?&]{8,}$", message = "La contraseña debe tener al menos una mayuscula, una minuscula y un numero")
    private String password;
    @NotBlank(message = "El rol es obligatorio.")
    private ERole role;

}
