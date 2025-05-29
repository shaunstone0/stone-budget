import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { BillStatus, PaymentType, AccountType } from '../types';

/**
 * Validate MongoDB ObjectId format
 */
export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: `${paramName} must be a valid MongoDB ObjectId`,
      });
      return;
    }

    next();
  };
};

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const value = req.body[field];
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: `Required fields: ${missingFields.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Validate bill creation data
 */
export const validateBillData = (req: Request, res: Response, next: NextFunction): void => {
  const { name, amount, paymentType, categoryId, dueDate, bankId, month } = req.body;

  const errors: string[] = [];

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Bill name is required and must be a non-empty string');
  } else if (name.length > 255) {
    errors.push('Bill name cannot exceed 255 characters');
  }

  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  // Validate payment type
  if (!paymentType || !Object.values(PaymentType).includes(paymentType)) {
    errors.push(`Payment type must be one of: ${Object.values(PaymentType).join(', ')}`);
  }

  // Validate category ID
  if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
    errors.push('Category ID must be a valid MongoDB ObjectId');
  }

  // Validate bank ID
  if (!bankId || !Types.ObjectId.isValid(bankId)) {
    errors.push('Bank ID must be a valid MongoDB ObjectId');
  }

  // Validate due date
  if (!dueDate || isNaN(Date.parse(dueDate))) {
    errors.push('Due date must be a valid date');
  }

  // Validate month (should be first day of month)
  if (!month || isNaN(Date.parse(month))) {
    errors.push('Month must be a valid date');
  } else {
    const monthDate = new Date(month);
    if (monthDate.getDate() !== 1) {
      errors.push('Month must be the first day of the month (e.g., 2024-03-01)');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.join('; '),
    });
    return;
  }

  next();
};

/**
 * Validate bill status
 */
export const validateBillStatus = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;

  if (status && !Object.values(BillStatus).includes(status)) {
    res.status(400).json({
      success: false,
      message: 'Invalid bill status',
      error: `Status must be one of: ${Object.values(BillStatus).join(', ')}`,
    });
    return;
  }

  next();
};

/**
 * Validate bank creation data
 */
export const validateBankData = (req: Request, res: Response, next: NextFunction): void => {
  const { name, accountType } = req.body;

  const errors: string[] = [];

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Bank name is required and must be a non-empty string');
  } else if (name.length > 100) {
    errors.push('Bank name cannot exceed 100 characters');
  }

  // Validate account type
  if (!accountType || !Object.values(AccountType).includes(accountType)) {
    errors.push(`Account type must be one of: ${Object.values(AccountType).join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.join('; '),
    });
    return;
  }

  next();
};

/**
 * Validate category creation data
 */
export const validateCategoryData = (req: Request, res: Response, next: NextFunction): void => {
  const { name, description } = req.body;

  const errors: string[] = [];

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Category name is required and must be a non-empty string');
  } else if (name.length > 100) {
    errors.push('Category name cannot exceed 100 characters');
  }

  // Validate description (optional)
  if (description && (typeof description !== 'string' || description.length > 500)) {
    errors.push('Description must be a string with maximum 500 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.join('; '),
    });
    return;
  }

  next();
};

/**
 * Validate monthly balance data
 */
export const validateMonthlyBalanceData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { personName, bankId, month, openingBalance } = req.body;

  const errors: string[] = [];

  // Validate person name
  if (!personName || typeof personName !== 'string' || personName.trim().length === 0) {
    errors.push('Person name is required and must be a non-empty string');
  } else if (personName.length > 100) {
    errors.push('Person name cannot exceed 100 characters');
  }

  // Validate bank ID
  if (!bankId || !Types.ObjectId.isValid(bankId)) {
    errors.push('Bank ID must be a valid MongoDB ObjectId');
  }

  // Validate month (should be first day of month)
  if (!month || isNaN(Date.parse(month))) {
    errors.push('Month must be a valid date');
  } else {
    const monthDate = new Date(month);
    if (monthDate.getDate() !== 1) {
      errors.push('Month must be the first day of the month (e.g., 2024-03-01)');
    }
  }

  // Validate opening balance
  if (
    openingBalance === undefined ||
    openingBalance === null ||
    typeof openingBalance !== 'number'
  ) {
    errors.push('Opening balance is required and must be a valid number');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.join('; '),
    });
    return;
  }

  next();
};

/**
 * Validate query parameters for bills
 */
export const validateBillQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { month, status, categoryId, bankId, page, limit } = req.query;

  const errors: string[] = [];

  // Validate month format if provided
  if (month && isNaN(Date.parse(month as string))) {
    errors.push('Month must be a valid date format');
  }

  // Validate status if provided
  if (status && !Object.values(BillStatus).includes(status as BillStatus)) {
    errors.push(`Status must be one of: ${Object.values(BillStatus).join(', ')}`);
  }

  // Validate ObjectIds if provided
  if (categoryId && !Types.ObjectId.isValid(categoryId as string)) {
    errors.push('Category ID must be a valid MongoDB ObjectId');
  }

  if (bankId && !Types.ObjectId.isValid(bankId as string)) {
    errors.push('Bank ID must be a valid MongoDB ObjectId');
  }

  // Validate pagination parameters
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: errors.join('; '),
    });
    return;
  }

  next();
};
