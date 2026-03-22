const express = require('express');
const { body } = require('express-validator');
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

// All routes are protected
router.use(protect);

const transactionValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters'),
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .custom((val) => Number(val) > 0).withMessage('Amount must be greater than 0'),
  body('type')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date'),
];

router.get('/summary', getSummary);
router.get('/', getTransactions);
router.post('/', transactionValidation, createTransaction);
router.get('/:id', getTransaction);
router.put('/:id', transactionValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
