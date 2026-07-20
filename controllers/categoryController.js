const Category = require('../models/categoryModel')

const createCategory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ success: false, msg: "Please upload image", });
        }

        let { categoryName, createdBy, updatedBy } = req.body
        const existingBrand = await Category.findOne({ categoryName: categoryName })
        if (existingBrand) {
            return res.status(400).send({ success: false, msg: "Category already exists..." })
        }

        let categoryImage = `/uploads/categories/${req.file.filename}`;
        const newCategory = await Category.create({ categoryName, createdBy, updatedBy, categoryImage })
        await newCategory.save()
        //console.log(newBrand)

        res.status(200).send({ success: true, msg: "Successfully Category Created..." })


    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "Server Error", success: false })
    }

}

const getAllCategory=async(req, res)=>{
  try {
        const allCategories = await Category.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
        res.status(200).send({ allCategories: allCategories, success: true })
    } catch (error) {
         console.log(error.message)
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = req.params.ID;
        //console.log(req.file, req.body, 'update Category')

        const category = await Category.findById(id);
        if (req.file) {
            category.categoryImage = `/uploads/categories/${req.file.filename}`;
        }

        category.categoryName = req.body.categoryName;
        category.updatedBy = req.body.updatedBy;
        category.isActive = req.body.isActive;
        await category.save();

        res.status(200).json({
            success: true,
            msg: "Category Updated sucessfully.."
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "Server Error", success: false })
    }
}

const deleteCategory = async (req, res) => {
    try {
        const ID = req.params.ID;

        const category = await Category.findById(ID);

        if (!category) {
            return res.status(404).send({
                success: false,
                msg: "category not found"
            });
        }

        await Category.findByIdAndDelete(ID);

        return res.status(200).send({
            success: true,
            msg: "category deleted successfully"
        });
    }
    catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "server error", success: false })
    }
}

module.exports = {
    createCategory,getAllCategory, updateCategory, deleteCategory,getCategoryById
}