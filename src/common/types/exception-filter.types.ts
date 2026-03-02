import { ErrorCode } from '../enums/error-code.enum';

export type ErrorResponseBody = {
  statusCode: number;
  message: string;
  errorCode: ErrorCode;
};

export type HttpExceptionResponseLike = {
  errorCode?: ErrorCode;
  message?: string | string[];
};


