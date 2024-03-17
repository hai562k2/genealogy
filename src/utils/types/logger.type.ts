import { TMessage } from '../dto/base-response.dto';

export type LoggerType = {
  endpoint?: string;
  messages?: string | TMessage;
  params?: object;
};
