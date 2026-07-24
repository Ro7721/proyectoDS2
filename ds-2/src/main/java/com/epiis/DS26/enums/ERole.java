package com.epiis.DS26.enums;

public enum ERole {
    ROLE_ADMIN("Administrador"),
    ROLE_TEACHER("Profesor"),
    ROLE_STUDENT("Alumno");

    private String name;

    ERole(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public static ERole fromString(String name) {
        for (ERole role : ERole.values()) {
            if (role.name.equalsIgnoreCase(name)) {
                return role;
            }
        }
        return null;
    }
}
