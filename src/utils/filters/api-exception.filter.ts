import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
import { ResponseHelper } from '../helpers/response.helper';

@Catch(ApiException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    const logger = new Logger();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    logger.error({
      endpoint: request.url,
      messages: exception.messages,
      params: exception.params,
    });

    response.status(status).json(ResponseHelper.error(exception.messages));
  }
}

@Catch(HttpException)
export class ValidationFailedExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const logger = new Logger();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    logger.error({
      endpoint: request.url,
      messages: exception.message,
    });

    response.status(status).json(ResponseHelper.error(exception.message));
  }
}
