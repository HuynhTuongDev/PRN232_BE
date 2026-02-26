
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<any>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';

        // Log the exception to the terminal for debugging
        console.log('--- GATEWAY EXCEPTION CAUGHT (LOCAL FILTER) ---');
        console.log('Exception Keys:', Object.keys(exception));
        if (exception.details) console.log('Details:', exception.details);
        if (exception.message) console.log('Message:', exception.message);
        if (exception.response) console.log('Response:', exception.response);

        // 1. Check for gRPC error (usually error code 2 UNKNOWN or explicit details)
        if (exception.details) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.details;
        }
        // 2. Check for standard HttpException
        else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'object' ? (res as any).message || JSON.stringify(res) : res;
        }
        // 3. Fallback for other errors
        else if (exception.message) {
            // If error message contains gRPC error code, try to extract it
            if (exception.message.includes('UNKNOWN:') || exception.message.includes('details:')) {
                status = HttpStatus.BAD_REQUEST;
                // Extract message if possible or use full message
                message = exception.message;
            } else {
                message = exception.message;
            }
        }

        if (Array.isArray(message)) {
            message = message.join(', ');
        }

        // Clean up "2 UNKNOWN:" prefix if present
        if (typeof message === 'string' && message.includes('UNKNOWN:')) {
            message = message.split('UNKNOWN:')[1].trim();
        }

        const errorResponse = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: message,
            message: message,
        };

        response.status(status).json(errorResponse);
    }
}
