const Joi = require("joi");
const { default: mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const orderValidate = (order) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
          price: Joi.number().min(0).required(),
        })
      )
      .min(1)
      .required(),

    totalPrice: Joi.number().min(0).required(),
    status: Joi.string().valid(
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled"
    ),
  });

  return schema.validate(order);
};

const Order = mongoose.model("Order", orderSchema);
module.exports = { Order, orderValidate };