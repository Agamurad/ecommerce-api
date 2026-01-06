const { Basket, basketValidate } = require("../models/basket");
const { Product } = require("../models/product");
const { errorMessage } = require("../utils/infoMessage");

exports.getBasket = async (req, res) => {
    try {
        const basket = await Basket.findOne({ user: req.user._id }).populate("items.product", "title price discountPrice images");

        if (!basket) {
            return res.status(200).json({ items: []});
        }

        res.status(200).json(basket);
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.addBasket = async (req, res) => {
    try {
        const { error } = basketValidate(req.body);
        if (error) {
            return res.status(400).json(errorMessage(error.message));
        }

        const { product, quantity = 1} = req.body;

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json(errorMessage("Product not found"));
        }

        let basket = await Basket.findOne({ user: req.user._id });

        if (!basket) {
            basket = new Basket({
                user: req.user._id,
                items: [{ product, quantity}],
            });
        } else {
            const itemIndex = basket.items.findIndex(
                (item) => item.product.toString() === product
            );

            if (itemIndex > -1) {
                basket.items[itemIndex].quantity += quantity;
            } else {
                basket.items.push({ product, quantity });
            }
        }

        await basket.save();
        res.status(200).json(basket);
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.editBasketItem = async (req, res) => {
    try {
        const { error } = basketValidate(req.body);
        if (error) {
            return res.status(400).json(errorMessage(error.details[0].message));
        }

        const { product, quantity } = req.body;

        const basket = await Basket.findOne({ user: req.user._id });
        if (!basket) {
            return res.status(404).json(errorMessage("Basket not found"));
        }

        const item = basket.items.find(
            (item) => item.product.toString() === product
        );

        if (!item) {
            return res.status(404).json(errorMessage("Product not in basket"));
        }

        item.quantity = quantity;
        await basket.save();

        res.status(200).json(basket);
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong"), error.message);
    }
}

exports.removeFromBasket = async (req, res) => {
    try {
        const basket = await Basket.findOne({ user: req.user._id });
        if (!basket) {
            return res.status(404).json(errorMessage("Basket not found"));
        }

        basket.items = basket.items.filter(
            (item) => item.product.toString() !== req.params.productId
        );

        await basket.save();
        res.status(200).json(basket);
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}

exports.clearBasket = async (req, res) => {
  try {
    await Basket.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Basket cleared" });
  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};