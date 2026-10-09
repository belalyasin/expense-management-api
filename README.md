# Expense Management API

REST API for tracking personal expenses against a monthly income. Built with Node.js, Express and MongoDB (Mongoose), with JWT authentication.

The Angular client lives in [expense-management-angular](https://github.com/belalyasin/expense-management-angular).

## Features

- Register, log in and log out with JWT tokens (passwords hashed with bcrypt)
- Set a monthly income per user
- Create, list, rename and delete expense categories
- Add, edit and delete expenses under a category
- Expense list, monthly totals and statistics by category for any month

## Tech stack

Node.js, Express 4, MongoDB, Mongoose 8, JSON Web Tokens, bcrypt

## Getting started

```bash
git clone https://github.com/belalyasin/expense-management-api.git
cd expense-management-api
npm install
cp .env.example .env   # then edit the values
npm run dev            # nodemon, or: npm start
```

Environment variables:

| Name | Purpose |
| --- | --- |
| `PORT` | Port to listen on (default 3000) |
| `DB_URL` | MongoDB connection string |
| `JWT_KEY` | Secret used to sign tokens |

## API

All routes are under `/api`. Routes marked with a lock need an `Authorization: Bearer <token>` header.

**Users**

| Method | Route | Auth | Body |
| --- | --- | --- | --- |
| POST | `/user/register` | | `firstname`, `lastname`, `username`, `email`, `password` (8+ characters) |
| POST | `/user/login` | | `email`, `password`. Returns a token valid for 1 hour |
| GET | `/user/me` | lock | |
| POST | `/user/income` | lock | `monthlyIncome` |
| POST | `/user/logout` | lock | |

**Categories**

| Method | Route | Auth | Body |
| --- | --- | --- | --- |
| GET | `/category` | lock | |
| POST | `/category/create` | lock | `name`, `description` |
| PUT | `/category/:categoryId` | lock | `name`, `description` (either or both) |
| DELETE | `/category/:categoryId` | lock | Returns 409 while expenses still use the category |

**Expenses**

| Method | Route | Auth | Body |
| --- | --- | --- | --- |
| POST | `/expense/create` | lock | `amount`, `category` (category name), optional `description`, `date` |
| PUT | `/expense/:expenseId` | lock | Any of `amount`, `category`, `description`, `date` |
| DELETE | `/expense/:expenseId` | lock | |
| GET | `/expense/monthly_expenses` | lock | |
| GET | `/expense/monthly_statics` | lock | |
| GET | `/expense/expense_type_statistics` | lock | |

The three GET routes report on the current month by default. Add `?month=1-12&year=YYYY` to report on another month. Users can only read, change and delete their own expenses.
