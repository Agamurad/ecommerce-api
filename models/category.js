const Joi = require("joi");
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const categoryValidate = (category) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    slug: Joi.string().required(),
    isActive: Joi.boolean(),
  });

  return schema.validate(category);
};

const Category = mongoose.model("Category", categorySchema);
module.exports = { Category, categoryValidate };
