const Joi = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const productValidate = (product) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    discountPrice: Joi.number().min(0).less(Joi.ref("price")),
    stock: Joi.number().min(0).required(),
    category: Joi.string().required(),
    images: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
  });

  return schema.validate(product);
};

const Product = mongoose.model("Product", productSchema);
module.exports = { Product, productValidate };
