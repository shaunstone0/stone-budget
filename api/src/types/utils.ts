import { Types } from 'mongoose';
import { IBill, IMonthlyBalance, ICategory, IBank, IUser } from './models';

// Mongoose utility types
export type MongooseUpdateResult = {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId?: Types.ObjectId;
  upsertedCount: number;
  matchedCount: number;
};

// Populated document types (for when using .populate())
export type PopulatedBill = IBill & {
  category: ICategory;
  bank: IBank;
  enteredByUser: IUser;
};

export type PopulatedMonthlyBalance = IMonthlyBalance & {
  bank: IBank;
  enteredByUser: IUser;
};

// Utility type for optional fields
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Type for removing MongoDB-specific fields
export type WithoutMongoFields<T> = Omit<T, '_id' | '__v' | 'createdAt' | 'updatedAt'>;

// Type for API responses without sensitive data
export type SafeUser = Omit<IUser, 'password_hash'>;
