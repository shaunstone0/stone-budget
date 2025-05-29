import { Request } from 'express';
import { IUser } from './models';
import { BillStatus } from './enums';

// Extended Request interface for authenticated routes
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Query parameter types
export interface BillQuery {
  month?: string;
  status?: BillStatus;
  categoryId?: string;
  bankId?: string;
  page?: number;
  limit?: number;
}

export interface MonthlyBalanceQuery {
  month?: string;
  bankId?: string;
}
