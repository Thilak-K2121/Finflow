const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { transactionsFile, readData, writeData } = require('../config/db');

const getTransactions = async (req, res) => {
  try {
    const {
      type, category, startDate, endDate, page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc',
    } = req.query;

    let transactions = await readData(transactionsFile);
    
    // 1. Filter by User ID
    transactions = transactions.filter(t => t.userId === req.user._id);

    // 2. Apply Queries
    if (type && ['income', 'expense'].includes(type)) {
      transactions = transactions.filter(t => t.type === type);
    }
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    if (startDate || endDate) {
      transactions = transactions.filter(t => {
        const tDate = new Date(t.date).getTime();
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        return tDate >= start && tDate <= end;
      });
    }

    // 3. Sort
    transactions.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortBy === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 4. Paginate
    const total = transactions.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedTransactions = transactions.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
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
    const transactions = await readData(transactionsFile);

    const newTransaction = {
      _id: crypto.randomUUID(),
      userId: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    await writeData(transactionsFile, transactions);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: { transaction: newTransaction },
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const transactions = await readData(transactionsFile);
    const transaction = transactions.find(t => t._id === req.params.id && t.userId === req.user._id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({ success: true, data: { transaction } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, amount, type, category, date, notes } = req.body;
    const transactions = await readData(transactionsFile);
    
    const index = transactions.findIndex(t => t._id === req.params.id && t.userId === req.user._id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    // Update fields
    transactions[index] = {
      ...transactions[index],
      ...(title && { title }),
      ...(amount && { amount: Number(amount) }),
      ...(type && { type }),
      ...(category && { category }),
      ...(date && { date: new Date(date).toISOString() }),
      ...(notes !== undefined && { notes }),
    };

    await writeData(transactionsFile, transactions);

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: { transaction: transactions[index] },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transactions = await readData(transactionsFile);
    const index = transactions.findIndex(t => t._id === req.params.id && t.userId === req.user._id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    transactions.splice(index, 1);
    await writeData(transactionsFile, transactions);

    res.status(200).json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const allTransactions = await readData(transactionsFile);
    const userTransactions = allTransactions.filter(t => t.userId === userId);

    // Overall totals
    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    userTransactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
        incomeCount++;
      } else if (t.type === 'expense') {
        expense += t.amount;
        expenseCount++;
      }
    });

    // Last 6 months monthly breakdown
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyMap = {};
    const categoryMap = {};

    userTransactions.forEach(t => {
      const tDate = new Date(t.date);
      
      // Monthly aggregation
      if (tDate >= sixMonthsAgo) {
        const year = tDate.getFullYear();
        const month = tDate.getMonth() + 1;
        const key = `${year}-${month}-${t.type}`;
        
        if (!monthlyMap[key]) {
          monthlyMap[key] = { _id: { year, month, type: t.type }, total: 0 };
        }
        monthlyMap[key].total += t.amount;
      }

      // Expense category breakdown
      if (t.type === 'expense') {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = { _id: t.category, total: 0, count: 0 };
        }
        categoryMap[t.category].total += t.amount;
        categoryMap[t.category].count++;
      }
    });

    const monthly = Object.values(monthlyMap).sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    });

    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.total - a.total);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          income,
          expense,
          balance: income - expense,
          incomeCount,
          expenseCount,
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