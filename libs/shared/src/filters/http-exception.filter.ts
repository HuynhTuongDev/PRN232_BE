import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    // 1. Xác định Status Code
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception.code === 2 || exception.details) {
      // Mã lỗi 2 (UNKNOWN) hoặc có details thường là lỗi từ gRPC Microservice
      status = HttpStatus.BAD_REQUEST;
    }

    // 2. Xác định tin nhắn lỗi (Lấy từ details của gRPC)
    let message = 'Internal server error';

    if (exception.details) {
      // ĐÂY LÀ GIÁ TRỊ TỪ MICROSERVICE (ví dụ: "Xe đã được thuê")
      message = exception.details;
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = typeof res === 'object' ? (res as any).message || JSON.stringify(res) : res;
    } else if (exception.message) {
      message = exception.message;
    }

    // 3. Log để bạn thấy ở Terminal [0]
    console.log(`[Filter] Đang trả về lỗi cho Postman: "${message}" (Status: ${status})`);

    // 4. Trả về JSON chuẩn cho Postman
    return response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      error: message,
      message: message, // Gửi cả 2 trường để chắc chắn Postman hiện đúng
    });
  }
}
