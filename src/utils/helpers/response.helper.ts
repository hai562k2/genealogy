import { BaseResponseDto, TMessage } from '../dto/base-response.dto';

export class ResponseHelper {
  static success<T>(data: T, message: string | TMessage = ''): BaseResponseDto<T> {
    return {
      message,
      data,
    };
  }

  static error(message: string | TMessage) {
    return {
      message,
    };
  }
}
