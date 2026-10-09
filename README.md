# Expense Management API

REST API for tracking personal expenses against a monthly income. Built with Node.js, Express and MongoDB (Mongoose), with JWT authentication.

The Angular client lives in [expense-management-angular](https://github.com/belalyasin/expense-management-angular).

## Features

- Register, log in and log out with JWT tokens (passwords hashed with bcrypt)
- Set a monthly income per user
- Create expense categories
- Add expenses under a category
- Current-month expense list, monthly totals and statistics by category

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

| Method | Route | Auth | Body |
| --- | --- | --- | --- |
| POST | `/user/register` | | `firstname`, `lastname`, `username`, `email`, `password` (8+ characters) |
| POST | `/user/login` | | `email`, `password`. Returns a token valid for 1 hour |
| POST | `/user/income` | lock | `monthlyIncome` |
| POST | `/user/logout` | lock | |
| POST | `/category/create` | lock | `name`, `description` |
| POST | `/expense/create` | lock | `amount`, `category` (category name), optional `description`, `date` |
| GET | `/expense/monthly_expenses` | lock | |
| GET | `/expense/monthly_statics` | lock | |
| GET | `/expense/expense_type_statistics` | lock | |

## Roadmap

- List, update and delete categories
- Update and delete expenses
- Statistics for a chosen month instead of only the current one
