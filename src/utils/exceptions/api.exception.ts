import { HttpException, HttpStatus } from '@nestjs/common';
import { isString } from 'class-validator';
import { ResponseHelper } from '../helpers/response.helper';
import { TMessage } from '../dto/base-response.dto';

export class ApiException extends HttpException {
  public messages: string | TMessage;

  public params: object;

  constructor(message: string | TMessage, statusCode: HttpStatus, params: object = []) {
    super(isString(message) ? message : JSON.stringify(message), statusCode);
    this.messages = message;
    this.params = params;
  }

  getResponse() {
    return ResponseHelper.error(this.messages);
  }
}
