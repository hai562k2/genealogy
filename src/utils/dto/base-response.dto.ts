export type TMessage = Record<string, string>;
export type BaseResponseDto<T> = {
  message?: string | TMessage;
  data?: T;
};
