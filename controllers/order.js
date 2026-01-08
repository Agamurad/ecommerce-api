const { Basket } = require("../models/basket");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { errorMessage, createMessage, editMessage } = require("../utils/infoMessage");

exports.checkout = async (req, res) => {
    try {
        const basket = await Basket.findOne({ user: req.user._id }).populate("items.product");

        if (!basket || basket.items.length === 0) {
            return res.status(400).json(errorMessage("Basket is empty"));
        }

        let totalPrice = 0;
        const orderItems = [];

        for (const item of basket.items) {
            const product = item.product;

            if (!product) {
                return res.status(404).json(errorMessage("Product not found"));
            }

            if (product.stock < item.quantity) {
                return res.status(400).json(errorMessage(`Not enough stock for ${product.title}`));
            }

            const price = product.discountPrice || product.price;

            totalPrice += price * item.quantity;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price,
            });
        }

        for (const item of basket.items){
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity},
            });
        }

        const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalPrice,
        });

        const result = await order.save();

        await Basket.findOneAndDelete({ user: req.user._id });

        res.status(201).json(createMessage("Order", result));
    } catch (error) {
        res.status(500).json(errorMessage("Checkout failed", error.message));
    }
}

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json(errorMessage("Order not found"));
        }

        if (order.status === "cancelled") {
            return res.status(400).json(errorMessage("Order already cancelled"));
        }

        for (const item of order.items) {
            const product = await Product.findById(item.product);

            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = "cancelled";
        await order.save();

        res.status(200).json(editMessage("Order cancelled", order));
    } catch (error) {
        res.status(500).json(errorMessage("Something went wrong", error.message));
    }
}