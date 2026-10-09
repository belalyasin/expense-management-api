const Category = require("../Models/Category");
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
    deleteCategory: async (req, res) => {
        try {
            const {categoryId} = req.params;

            // Check if the category exists
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({error: "Category not found"});
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