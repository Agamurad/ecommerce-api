const mongoose = require("mongoose");

const basketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
          min: 1,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const basketValidate = (basket) => {
  const schema = Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().min(1),
  });

  return schema.validate(basket);
};

const Basket = mongoose.model("Basket", basketSchema);

module.exports = { Basket, basketValidate};
