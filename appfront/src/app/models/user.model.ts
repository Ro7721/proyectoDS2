export interface UserRegisterRequestModel {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: RoleEnum;
}

export enum RoleEnum {
    ROLE_STUDENT = "ESTUDIANTE",
    ROLE_TEACHER = "PROFESOR"
}

export interface UserRegisterResponseModel {
    idUser: string;
    firstName: string;
    lastName: string;
    email: string;
    role: RoleEnum;
    createdAt: Date;

}