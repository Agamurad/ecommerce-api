const { Product, productValidate } = require("../models/product");
const { deleteSingleOldImage, deleteManyOldImage } = require("../utils/deleteOldImage");
const {
  createMessage,
  editMessage,
  deleteMessage,
  errorMessage
} = require("../utils/infoMessage");

exports.listProduct = async (req, res) => {
    try {
        const filter = {};

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === "true";
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) {
                filter.price.$gte = Number(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.price.$lte = Number(req.query.maxPrice);
            }
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find(filter).populate("category", "name slug").skip(skip).limit(limit).sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            total,
            page,
            limit,
            data: products
        });

    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json(errorMessage("Product not found"));
        }

        res.status(200).json({ data: product });
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.createProduct = async (req, res) => {
    try {
        const { error } = productValidate(req.body);
        if (error) {
            return res.status(400).json(errorMessage(error.message));
        }

        const product = new Product(req.body);

        if (req.files) {
            if (req.files.images?.length) {
                product.images = req.files.images.map((file) => file.path);
            }

            if (req.files.coverImg?.length) {
                product.coverImg = req.files.coverImg[0].path;
            }

            if (req.files.video?.length) {
                product.video = req.files.video[0].path;
            }
        }

        const result = await product.save();
        res.status(201).json(createMessage("Product", result));
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.editProduct = async (req, res) => {
    try {
        const { error } = productValidate(req.body);
        if (error) {
            return res.status(400).json(errorMessage(error.message));
        }

        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json(errorMessage("Product not found"));
        }

        const updateData = { ...req.body };

        if (req.files?.images?.length) {
            deleteManyOldImage(product.images);
            updateData.images = req.files.images.map((file) => file.path);
        } else {
            updateData.images = product.images;
        }

        if (req.files?.coverImg?.length) {
            deleteSingleOldImage(product.coverImg);
            updateData.coverImg = req.files.coverImg[0].path;
        } else {
            updateData.coverImg = product.coverImg;
        }

        if (req.files?.video?.length) {
            deleteSingleOldImage(product.video);
            updateData.video = req.files.video[0].path;
        } else {
            updateData.video = product.video;
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json(errorMessage("Product not found"));
    }

    if (product.coverImg) deleteSingleOldImage(product.coverImg);
    if (product.images?.length) deleteManyOldImage(product.images);
    if (product.video) deleteSingleOldImage(product.video);

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};