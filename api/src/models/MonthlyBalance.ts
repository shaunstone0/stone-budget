import { Schema, model } from 'mongoose';
import { IMonthlyBalance } from '../types';

const monthlyBalanceSchema = new Schema<IMonthlyBalance>(
  {
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      maxlength: [100, 'Person name cannot exceed 100 characters'],
    },
    bankId: {
      type: Schema.Types.ObjectId,
      ref: 'Bank',
      required: [true, 'Bank is required'],
    },
    month: {
      type: Date,
      required: [true, 'Month is required'],
      validate: {
        validator: function (value: Date) {
          // Ensure it's the first day of the month
          return value instanceof Date && value.getDate() === 1;
        },
        message: 'Month must be the first day of the month (e.g., 2024-03-01)',
      },
    },
    openingBalance: {
      type: Number,
      required: [true, 'Opening balance is required'],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value);
        },
        message: 'Opening balance must be a valid number',
      },
    },
    enteredByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient queries
monthlyBalanceSchema.index({ month: 1, bankId: 1 });
monthlyBalanceSchema.index({ enteredByUserId: 1, month: 1 });

// Ensure unique combination of person, bank, and month
monthlyBalanceSchema.index({ personName: 1, bankId: 1, month: 1 }, { unique: true });

export const MonthlyBalance = model<IMonthlyBalance>('MonthlyBalance', monthlyBalanceSchema);
