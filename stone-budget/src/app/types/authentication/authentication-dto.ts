// Types matching your backend API
import {AccountType, BillStatus, PaymentType} from './authentication-enums';
import {ApiResponse} from './authentication-types';


export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}



export interface Bill {
  id: string;
  name: string;
  amount: number;
  status: BillStatus;
  paymentType: PaymentType;
  categoryId: string;
  dueDate: string;
  bankId: string;
  enteredByUserId: string;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
  accountType: AccountType;
  userId: string;
  createdAt: string;
}

export interface MonthlyBalance {
  id: string;
  personName: string;
  bankId: string;
  month: string;
  openingBalance: number;
  enteredByUserId: string;
  createdAt: string;
}

export interface CreateBillDTO {
  name: string;
  amount: number;
  status?: BillStatus;
  paymentType: PaymentType;
  categoryId: string;
  dueDate: string;
  bankId: string;
  month: string;
}

export interface CreateBankDTO {
  name: string;
  accountType: AccountType;
}

export interface CreateMonthlyBalanceDTO {
  personName: string;
  bankId: string;
  month: string;
  openingBalance: number;
}

export interface BillQuery {
  month?: string;
  status?: BillStatus;
  categoryId?: string;
  bankId?: string;
  page?: number;
  limit?: number;
}
