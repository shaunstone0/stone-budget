import { BillStatus, PaymentType, AccountType } from './enums';

// Authentication DTOs
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Bill DTOs
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

export interface UpdateBillDTO {
  name?: string;
  amount?: number;
  status?: BillStatus;
  paymentType?: PaymentType;
  categoryId?: string;
  dueDate?: string;
  bankId?: string;
}

// Category DTOs
export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

// Bank DTOs
export interface CreateBankDTO {
  name: string;
  accountType: AccountType;
}

// Monthly Balance DTOs
export interface CreateMonthlyBalanceDTO {
  personName: string;
  bankId: string;
  month: string;
  openingBalance: number;
}
