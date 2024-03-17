import { HttpStatus, ValidationError, ValidationPipeOptions } from '@nestjs/common';
import { ApiException } from './exceptions/api.exception';

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) =>
    new ApiException(
      errors.reduce(
        (accumulator, currentValue) => ({
          ...accumulator,
          [currentValue.property]:
            Object.values(currentValue.constraints ?? {}).length > 0
              ? Object.values(currentValue.constraints ?? {})[0]
              : Object.values(currentValue.constraints ?? {}),
        }),
        {},
      ),
      HttpStatus.UNPROCESSABLE_ENTITY,
      errors.reduce(
        (accumulator, currentValue) => ({
          ...accumulator,
          ...currentValue.target,
        }),
        {},
      ),
    ),
};

export default validationOptions;
