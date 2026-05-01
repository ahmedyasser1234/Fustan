import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: true;
  statusCode: number;
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: unknown) => {
        const isObject = data !== null && typeof data === 'object';
        const dataObj = data as Record<string, any>;
        const customMessage = isObject && 'message' in dataObj ? dataObj.message : 'Success';

        let finalData = data;
        if (isObject && 'message' in dataObj) {
          const { message: _, ...rest } = dataObj;
          finalData = Object.keys(rest).length > 0 ? rest : null;
        }

        return {
          success: true,
          statusCode,
          message: customMessage as string,
          data: finalData as T,
        };
      }),
    );
  }
}
