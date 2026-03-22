const mongoose = require('mongoose');

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other Income'],
  expense: [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Education',
    'Travel',
    'Other Expense',
  ],
};

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.CATEGORIES = CATEGORIES;
