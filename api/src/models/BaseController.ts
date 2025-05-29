import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export abstract class BaseController {
  protected sendResponse<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    error?: string
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: statusCode < 400,
      message,
      ...(data && { data }),
      ...(error && { error }),
    };

    return res.status(statusCode).json(response);
  }

  protected sendSuccess<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    return this.sendResponse(res, statusCode, message, data);
  }

  protected sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string
  ): Response<ApiResponse> {
    return this.sendResponse(res, statusCode, message, undefined, error);
  }

  protected sendCreated<T>(res: Response, message: string, data?: T): Response<ApiResponse<T>> {
    return this.sendResponse(res, 201, message, data);
  }

  protected sendBadRequest(res: Response, message: string, error?: string): Response<ApiResponse> {
    return this.sendResponse(res, 400, message, undefined, error);
  }

  protected sendUnauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response<ApiResponse> {
    return this.sendResponse(res, 401, message);
  }

  protected sendForbidden(res: Response, message: string = 'Forbidden'): Response<ApiResponse> {
    return this.sendResponse(res, 403, message);
  }

  protected sendNotFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response<ApiResponse> {
    return this.sendResponse(res, 404, message);
  }

  protected sendConflict(res: Response, message: string, error?: string): Response<ApiResponse> {
    return this.sendResponse(res, 409, message, undefined, error);
  }

  protected sendPaginatedResponse<T>(
    res: Response,
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response<PaginatedResponse<T>> {
    const pages = Math.ceil(total / limit);

    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };

    return res.status(200).json(response);
  }

  protected validateRequiredFields(
    body: Record<string, any>,
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        missingFields.push(field);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  protected validateMongoId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  protected getFirstDayOfMonth(dateString: string): Date {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  protected handleValidationErrors(errors: any[]): string {
    return errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
  }
}
