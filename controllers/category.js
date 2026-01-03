const { Category, categoryValidate } = require("../models/category");
const slugify = require("slugify");
const {
  createMessage,
  editMessage,
  deleteMessage,
  errorMessage
} = require("../utils/infoMessage");

exports.listCategory = async (req, res) => {
    try {
        const filter = {};

        if (req.query.name) {
            filter.name = req.query.name;
        }
        if (req.query.slug) {
            filter.slug = req.query.slug;
        }

        const categories = await Category.find(filter);

        res.status(200).json({
            dataLength: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json(errorMessage("Category not found"));
    }

    res.status(200).json({ data: category });

  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { error } = categoryValidate(req.body);
    if (error) {
      return res.status(400).json(errorMessage(error.details[0].message));
    }

    const slug = slugify(req.body.name, { lower: true });

    const exists = await Category.findOne({
      $or: [{ name: req.body.name }, { slug }]
    });

    if (exists) {
      return res.status(409).json(errorMessage("Category already exists"));
    }

    const category = new Category({
      ...req.body,
      slug
    });
    
    const result = await category.save();

    res.status(201).json(createMessage("Category", result));

  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { error } = categoryValidate(req.body);
    if (error) {
      return res.status(400).json(errorMessage(error.details[0].message));
    }

    const updateData = { ...req.body };

    if (req.body.name) {
    updateData.slug = slugify(req.body.name, { lower: true });
    }

    const category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
    );

    if (!category) {
      return res.status(404).json(errorMessage("Category not found"));
    }

    res.status(200).json(editMessage("Category", category));

  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json(errorMessage("Category not found"));
    }

    res.status(200).json(deleteMessage("Category", category));

  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};