const Category = require("../Models/Category");
const Expense = require("../Models/Expenses");
const mongoose = require("mongoose");

const CategoryController = {
    addCategory: async (req, res) => {
        try {
            const {name, description} = req.body;
            const existingCategory = await Category.findOne({name});
            if (existingCategory) {
                return res.status(400).json({error: "Category with this name already exists"});
            }
            // Create and save the new category
            const category = await Category.create({
                _id: new mongoose.Types.ObjectId(),
                name,
                description
            });
            // await category.save();
            res.status(201).json({message: "Category added successfully", category});
        } catch (error) {
            res.status(500).json({error: "Error adding category", details: error.message});
        }
    },
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find().sort({name: 1});
            res.status(200).json({categories});
        } catch (error) {
            res.status(500).json({error: "Error fetching categories", details: error.message});
        }
    },
    updateCategory: async (req, res) => {
        try {
            const {categoryId} = req.params;
            if (!mongoose.isValidObjectId(categoryId)) {
                return res.status(404).json({error: "Category not found"});
            }
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({error: "Category not found"});
            }

            const {name, description} = req.body;
            if (name !== undefined && name !== category.name) {
                const existingCategory = await Category.findOne({name});
                if (existingCategory) {
                    return res.status(400).json({error: "Category with this name already exists"});
                }
                category.name = name;
            }
            if (description !== undefined) category.description = description;

            await category.save();
            res.status(200).json({message: "Category updated successfully", category});
        } catch (error) {
            res.status(400).json({error: "Error updating category", details: error.message});
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const {categoryId} = req.params;
            if (!mongoose.isValidObjectId(categoryId)) {
                return res.status(404).json({error: "Category not found"});
            }

            // Check if the category exists
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({error: "Category not found"});
            }

            // A category that still has expenses cannot be removed
            const expensesUsingCategory = await Expense.countDocuments({category: categoryId});
            if (expensesUsingCategory > 0) {
                return res.status(409).json({
                    error: "Category is used by existing expenses",
                    expenses: expensesUsingCategory,
                });
            }

            // Delete the category
            await Category.findByIdAndDelete({_id: categoryId});

            res.status(200).json({
                message: "Category deleted successfully",
                categoryId,
            });
        } catch (error) {
            res.status(500).json({
                error: "Error deleting category",
                details: error.message,
            });
        }
    },
}

module.exports = CategoryController;
