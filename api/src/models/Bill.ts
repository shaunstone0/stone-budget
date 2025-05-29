import { Schema, model } from 'mongoose';
import { IBill, BillStatus, PaymentType } from '../types';

const billSchema = new Schema<IBill>(
  {
    name: {
      type: String,
      required: [true, 'Bill name is required'],
      trim: true,
      maxlength: [255, 'Bill name cannot exceed 255 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value) && value > 0;
        },
        message: 'Amount must be a valid positive number',
      },
    },
    status: {
      type: String,
      enum: Object.values(BillStatus),
      default: BillStatus.UNPAID,
      required: [true, 'Status is required'],
    },
    paymentType: {
      type: String,
      enum: Object.values(PaymentType),
      default: PaymentType.MANUAL,
      required: [true, 'Payment type is required'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (value: Date) {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Due date must be a valid date',
      },
    },
    bankId: {
      type: Schema.Types.ObjectId,
      ref: 'Bank',
      required: [true, 'Bank is required'],
    },
    enteredByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
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
  },
  {
    timestamps: true,
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
billSchema.index({ month: 1, status: 1 });
billSchema.index({ enteredByUserId: 1, month: 1 });
billSchema.index({ categoryId: 1, month: 1 });
billSchema.index({ bankId: 1, month: 1 });
billSchema.index({ dueDate: 1 });

export const Bill = model<IBill>('Bill', billSchema);
