const User = require("../Models/User");
const Category = require("../Models/Category");
const Expense = require("../Models/Expenses");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

// Month to report on. Defaults to the current month; accepts ?month=1-12&year=YYYY.
// Returns {month, year} with a zero-based month, or null when the query is invalid.
const resolvePeriod = (query = {}) => {
    const now = new Date();
    const month = query.month === undefined ? now.getMonth() + 1 : Number(query.month);
    const year = query.year === undefined ? now.getFullYear() : Number(query.year);
    if (!Number.isInteger(month) || month < 1 || month > 12) return null;
    if (!Number.isInteger(year) || year < 1970 || year > 9999) return null;
    return {month: month - 1, year};
};

const ExpenseController = {
    // Add a new expense
    addExpense: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({error: 'Token is required'});
            }
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            // const decoded = jwt.verify(token, process.env.JWT_KEY);
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }
            const {amount, description, category: categoryName, date} = req.body;
            // Validate category
            const category = await Category.findOne({name: categoryName});
            if (!category) {
                return res.status(404).json({error: "Category not found"});
            }
            // Create and save the expense
            const expense = new Expense({
                _id: new mongoose.Types.ObjectId(),
                amount,
                description,
                category: category._id, // Assign the found category's ID
                user: user._id,
                date: date || Date.now(), // Use provided date or default to current date
            });

            await expense.save();
            res.status(201).json({message: "Expense added successfully", expense});
        } catch (err) {
            res.status(400).json({error: "Error adding expense", details: err.message});
        }
    },
    // Get monthly expenses and totals
    getCurrentMonthExpenses: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({error: 'Token is required'});
            }

            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId;

            if (!userId) {
                return res.status(400).json({error: "Invalid user token"});
            }

            const period = resolvePeriod(req.query);
            if (!period) {
                return res.status(400).json({error: "Invalid month or year"});
            }
            const {month: currentMonth, year: currentYear} = period;

            // Find all expenses for the user
            const expenses = await Expense.find({user: userId}).populate('category');

            // Filter expenses for the current month
            const currentMonthExpenses = expenses.filter((expense) => {
                const expenseDate = new Date(expense.date);
                return (
                    expenseDate.getMonth() === currentMonth &&
                    expenseDate.getFullYear() === currentYear
                );
            });

            const totalExpenses = currentMonthExpenses.reduce((total, expense) => total + expense.amount, 0);

            res.status(200).json({
                message: "Expenses for the current month",
                month: currentMonth + 1,
                year: currentYear,
                expenses: currentMonthExpenses,
                totalExpenses,
            });
        } catch (err) {
            res.status(500).json({error: "Error fetching current month expenses", details: err.message});
        }
    },
    getMonthlyStatics: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({error: 'Token is required'});
            }

            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId;

            if (!userId) {
                return res.status(400).json({error: "Invalid user token"});
            }

            const period = resolvePeriod(req.query);
            if (!period) {
                return res.status(400).json({error: "Invalid month or year"});
            }
            const {month: currentMonth, year: currentYear} = period;

            // Find all expenses for the user
            const expenses = await Expense.find({user: userId}).populate('category');

            // Filter expenses for the current month
            const currentMonthExpenses = expenses.filter((expense) => {
                const expenseDate = new Date(expense.date);
                return (
                    expenseDate.getMonth() === currentMonth &&
                    expenseDate.getFullYear() === currentYear
                );
            });

            // Total Expenses for the month
            const totalExpenses = currentMonthExpenses.reduce((total, expense) => total + expense.amount, 0);

            // Remaining Income for the month
            const user = await User.findById(userId); // Fetch the user's details to get the monthly income
            const remainingIncome = user.monthlyIncome - totalExpenses;

            // Average Daily Expense
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get the number of days in the current month
            const averageDailyExpense = totalExpenses / daysInMonth;

            res.status(200).json({
                message: "Current month statistics",
                month: currentMonth + 1,
                year: currentYear,
                totalExpenses,
                remainingIncome,
                averageDailyExpense,
            });
        } catch (err) {
            res.status(500).json({error: 'Error fetching statistics', details: err.message});
        }
    },
    getExpenseTypeStatistics: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({error: 'Token is required'});
            }

            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId;

            if (!userId) {
                return res.status(400).json({error: "Invalid user token"});
            }

            const period = resolvePeriod(req.query);
            if (!period) {
                return res.status(400).json({error: "Invalid month or year"});
            }
            const {month: currentMonth, year: currentYear} = period;

            // Find all expenses for the user
            const expenses = await Expense.find({user: userId}).populate('category');

            // Filter expenses for the current month
            const currentMonthExpenses = expenses.filter((expense) => {
                const expenseDate = new Date(expense.date);
                return (
                    expenseDate.getMonth() === currentMonth &&
                    expenseDate.getFullYear() === currentYear
                );
            });

            // Group expenses by category and calculate total for each
            const categoryStatistics = currentMonthExpenses.reduce((stats, expense) => {
                const categoryName = expense.category ? expense.category.name : 'Uncategorized';
                stats[categoryName] = (stats[categoryName] || 0) + expense.amount;
                return stats;
            }, {});

            res.status(200).json({
                message: "Expense type statistics for the current month",
                month: currentMonth + 1,
                year: currentYear,
                categoryStatistics,
            });
        } catch (err) {
            res.status(500).json({error: "Error fetching expense type statistics", details: err.message});
        }
    },
    // Update an expense that belongs to the logged-in user
    updateExpense: async (req, res) => {
        try {
            const {expenseId} = req.params;
            if (!mongoose.isValidObjectId(expenseId)) {
                return res.status(404).json({error: "Expense not found"});
            }
            const expense = await Expense.findOne({_id: expenseId, user: req.userId});
            if (!expense) {
                return res.status(404).json({error: "Expense not found"});
            }

            const {amount, description, category: categoryName, date} = req.body;
            if (categoryName !== undefined) {
                const category = await Category.findOne({name: categoryName});
                if (!category) {
                    return res.status(404).json({error: "Category not found"});
                }
                expense.category = category._id;
            }
            if (amount !== undefined) expense.amount = amount;
            if (description !== undefined) expense.description = description;
            if (date !== undefined) expense.date = date;

            await expense.save();
            await expense.populate('category');
            res.status(200).json({message: "Expense updated successfully", expense});
        } catch (err) {
            res.status(400).json({error: "Error updating expense", details: err.message});
        }
    },
    // Delete an expense that belongs to the logged-in user
    deleteExpense: async (req, res) => {
        try {
            const {expenseId} = req.params;
            if (!mongoose.isValidObjectId(expenseId)) {
                return res.status(404).json({error: "Expense not found"});
            }
            const expense = await Expense.findOneAndDelete({_id: expenseId, user: req.userId});
            if (!expense) {
                return res.status(404).json({error: "Expense not found"});
            }
            res.status(200).json({message: "Expense deleted successfully", expenseId});
        } catch (err) {
            res.status(500).json({error: "Error deleting expense", details: err.message});
        }
    }
};

module.exports = ExpenseController;
