import { TransformInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response correctly', (done) => {
    const mockData = { id: 1, name: 'Test' };
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockNext = {
      handle: () => of(mockData),
    } as CallHandler;

    interceptor.intercept(mockContext, mockNext).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Success',
        data: mockData,
      });
      done();
    });
  });

  it('should use custom message if provided in data', (done) => {
    const mockData = { message: 'Custom Message', id: 1 };
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 201 }),
      }),
    } as unknown as ExecutionContext;

    const mockNext = {
      handle: () => of(mockData),
    } as CallHandler;

    interceptor.intercept(mockContext, mockNext).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        statusCode: 201,
        message: 'Custom Message',
        data: { id: 1 },
      });
      done();
    });
  });
});
