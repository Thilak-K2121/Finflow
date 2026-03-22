const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// @desc    Get all transactions for current user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const filter = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { title, amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: { transaction },
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get a single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.status(200).json({ success: true, data: { transaction } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { title, amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(title && { title }),
        ...(amount && { amount: Number(amount) }),
        ...(type && { type }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: { transaction },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get dashboard summary (totals + monthly + category breakdown)
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Overall totals
    const totals = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = totals.find((t) => t._id === 'income')?.total || 0;
    const expense = totals.find((t) => t._id === 'expense')?.total || 0;

    // Last 6 months monthly breakdown
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthly = await Transaction.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Expense category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          income,
          expense,
          balance: income - expense,
          incomeCount: totals.find((t) => t._id === 'income')?.count || 0,
          expenseCount: totals.find((t) => t._id === 'expense')?.count || 0,
        },
        monthly,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
