import { Document, Types } from 'mongoose';
import { BillStatus, PaymentType, AccountType } from './enums';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password_hash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface IBank extends Document {
  _id: Types.ObjectId;
  name: string;
  accountType: AccountType;
  userId: Types.ObjectId;
  createdAt: Date;
}

export interface IBill extends Document {
  _id: Types.ObjectId;
  name: string;
  amount: number;
  status: BillStatus;
  paymentType: PaymentType;
  categoryId: Types.ObjectId;
  dueDate: Date;
  bankId: Types.ObjectId;
  enteredByUserId: Types.ObjectId;
  month: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMonthlyBalance extends Document {
  _id: Types.ObjectId;
  personName: string;
  bankId: Types.ObjectId;
  month: Date;
  openingBalance: number;
  enteredByUserId: Types.ObjectId;
  createdAt: Date;
}
