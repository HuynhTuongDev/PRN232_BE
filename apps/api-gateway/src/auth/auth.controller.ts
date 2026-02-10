import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ApiResponse } from '@goride/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Controller - API Gateway
 * Handles HTTP requests for authentication
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Register a new user
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.register(registerDto);
      return {
        success: true,
        data: result,
        message: 'Đăng ký tài khoản thành công',
      };
    } catch (error) {
      const errorMsg = error.details || error.message || 'Đăng ký thất bại';
      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      };
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.login(loginDto);
      return {
        success: true,
        data: result,
        message: 'Đăng nhập thành công',
      };
    } catch (error) {
      const errorMsg = error.details || error.message || 'Đăng nhập thất bại';
      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      };
    }
  }

  /**
   * Get current user profile
   * GET /auth/profile
   * Requires JWT authentication
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req): Promise<ApiResponse> {
    try {
      const userId = req.user.sub;
      const result = await this.authService.validateUser(userId);
      return {
        success: true,
        data: result.user,
        message: 'Lấy thông tin người dùng thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.details || error.message || 'Không thể lấy thông tin người dùng',
      };
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.refreshToken(refreshTokenDto.refresh_token);
      return {
        success: true,
        data: result,
        message: 'Làm mới token thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.details || error.message || 'Làm mới token thất bại',
      };
    }
  }

  /**
   * Health check endpoint
   * GET /auth/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck(): ApiResponse {
    return {
      success: true,
      message: 'Auth service is running',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
