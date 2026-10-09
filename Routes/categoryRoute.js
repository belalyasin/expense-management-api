const express = require('express');
const auth = require("../Middleware/auth");
const CategoryController = require('../Controllers/categoryController');

const router = express.Router();

router.route('/create').post(auth,CategoryController.addCategory);
router.route('/').get(auth, CategoryController.getCategories);
router.route('/:categoryId')
    .put(auth, CategoryController.updateCategory)
    .delete(auth, CategoryController.deleteCategory);

module.exports = router;