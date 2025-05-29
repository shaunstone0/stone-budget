import { Schema, model } from 'mongoose';
import { IBank, AccountType } from '../types';

const bankSchema = new Schema<IBank>(
  {
    name: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters'],
    },
    accountType: {
      type: String,
      enum: Object.values(AccountType),
      default: AccountType.CHECKING,
      required: [true, 'Account type is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
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

// Compound index for user's banks
bankSchema.index({ userId: 1, name: 1 });

export const Bank = model<IBank>('Bank', bankSchema);
