const express = require('express');
const auth = require("../Middleware/auth");
const UserController = require("../Controllers/userController");
const ExpenseController = require("../Controllers/expenseController");

const router = express.Router();

router.route('/create').post(auth,ExpenseController.addExpense);
router.route('/monthly_expenses').get(auth,ExpenseController.getCurrentMonthExpenses);
router.route('/monthly_statics').get(auth,ExpenseController.getMonthlyStatics);
router.route('/expense_type_statistics').get(auth,ExpenseController.getExpenseTypeStatistics);
router.route('/:expenseId')
    .put(auth, ExpenseController.updateExpense)
    .delete(auth, ExpenseController.deleteExpense);

module.exports = router;