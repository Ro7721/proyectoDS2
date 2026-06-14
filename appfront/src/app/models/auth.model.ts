export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: {
        idUser: string;
        firstName: string;
        surName: string;
        email: string;
        role: string;
    }
}

export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
}

export interface CurrentUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}
