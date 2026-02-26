import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    Matches,
    IsNotEmpty
} from 'class-validator';

/**
 * DTO for user registration
 */
export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
    @MaxLength(100, { message: 'Tên không được vượt quá 100 ký tự' })
    name: string;

    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        { message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số' }
    )
    password: string;

    @IsOptional()
    @IsString()
    @Matches(
        /^[0-9]{10,15}$/,
        { message: 'Số điện thoại phải có từ 10-15 chữ số' }
    )
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Địa chỉ không được vượt quá 500 ký tự' })
    address?: string;
}

/**
 * DTO for user login
 */
export class LoginDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;
}

/**
 * Response DTO for authentication
 */
export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken?: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        phone?: string;
        address?: string;
    };
}

/**
 * DTO for JWT payload
 */
export interface JwtPayload {
    sub: string; // user id
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

/**
 * DTO for refresh token
 */
export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'Refresh token không được để trống' })
    refresh_token: string;
}
