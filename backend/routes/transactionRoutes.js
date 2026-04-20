const express = require('express');
const { check } = require('express-validator');
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes below
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(
    [
      check('title', 'Title is required').not().isEmpty(),
      check('amount', 'Amount is required and must be a number').isNumeric(),
      check('type', 'Type is required (income or expense)').isIn(['income', 'expense']),
      check('category', 'Category is required').not().isEmpty(),
    ],
    createTransaction
  );

router.get('/summary', getSummary);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;