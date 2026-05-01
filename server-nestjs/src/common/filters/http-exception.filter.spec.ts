import { AllExceptionsFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      url: '/test',
      method: 'GET',
    };
    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should format HttpException correctly', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        path: '/test',
      }),
    );
  });

  it('should handle internal server errors (non-HttpException)', () => {
    const exception = new Error('Unknown error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });
});
