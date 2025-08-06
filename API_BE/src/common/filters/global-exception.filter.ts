import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    const isDev = process.env.NODE_ENV !== 'production';

    // Print to terminal for debugging
    if (isDev) {
      console.error('🔥 Exception caught by GlobalExceptionFilter:');
      console.error(exception);
    }

    // Send extended info if in development
    const responseBody: Record<string, any> = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (isDev && exception instanceof Error) {
      responseBody.name = exception.name;
      responseBody.stack = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
