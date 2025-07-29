const Category = require('../models/Category');
const mongoose = require('mongoose');

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }
//create Category
exports.createCategory = async (req, res) => {
    try {
        //fetch data
        const { name, description } = req.body;

        //validate 
        if (!name || !description) {
            return res.status(401).json({
                success: false,
                message: "all Category field require"
            })
        }
        //create enter on db
        const category = await Category.create({ name: name, description: description });

        //return success response
        res.status(200).json({
            success: true,
            message: "Category created successfully",
            Category: category
        })

    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: `error occur while create Category: ${error.message}`
        })
    }
}

//fetch all Category
exports.showAllCategories = async (req, res) => {
    try {
        //get all Category from db
        const AllCategorys = await Category.find({});
        //return response
        res.status(200).json({
            sucess: true,
            message: "get all Categorys",
            AllCategorys
        })
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: `error occur while fetching all Category: ${error.message}`
        })
    }
}

//get categoryPage Details
exports.categoryPageDetails = async (req, res) => {
    try {
        //get catgory details
        const { categoryId } = req.body;
        //fetch all category course details
        const selectedCategory = await Category.findById(categoryId).populate({
            path: "courses",
            match: { status: "Published" },
            populate: {
                path: "instructor",
            },
            populate: "RatingAndReview",
            
        })
            .exec()
        if (!selectedCategory) {
            console.log("Category not found.")
            return res
                .status(404)
                .json({ success: false, message: "Category not found" })
        }

        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        console.log("SELECTED COURSE", selectedCategory);


      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()

        console.log("Different COURSE", differentCategory)


        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        console.log("mostSellingCourses COURSE", mostSellingCourses)
        //return response
        res.status(200).json({
            success: true,
            message: "course found successfully",
            data:{
                selectedCategory,
                differentCategory,
                mostSellingCourses
            }
        })
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: `error occur while fetching  Category details ${error.message}`
        })
    }
}