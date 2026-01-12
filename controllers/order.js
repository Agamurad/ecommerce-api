const { Basket } = require("../models/basket");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { errorMessage, createMessage, editMessage } = require("../utils/infoMessage");

exports.checkout = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const basket = await Basket.findOne({ user: req.user._id })
        .populate("items.product")
        .session(session);

      if (!basket || basket.items.length === 0) {
        await session.abortTransaction();
        return res.status(400).json(errorMessage("Basket is empty"));
      }

      let totalPrice = 0;
      const orderItems = [];

      for (const item of basket.items) {
        const product = item.product;

        if (!product) {
          await session.abortTransaction();
          return res.status(404).json(errorMessage("Product not found"));
        }

        if (product.stock < item.quantity) {
          await session.abortTransaction();
          return res
            .status(400)
            .json(errorMessage(`Not enough stock for ${product.title}`));
        }

        const price = product.discountPrice || product.price;

        totalPrice += price * item.quantity;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price,
        });
      }
      for (const item of basket.items) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      const order = new Order({
        user: req.user._id,
        items: orderItems,
        totalPrice,
        status: "pending",
        statusHistory: [
          {
            status: "pending",
            changedBy: req.user._id,
          },
        ],
      });

      await order.save({ session });

      await Basket.findOneAndDelete({ user: req.user._id }).session(session);

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(createMessage("Order", order));
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res.status(500).json(errorMessage("Checkout failed", error.message));
    }
}

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json(errorMessage("Order not found"));
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json(errorMessage("Access denied"));
        }

        if (order.status === "cancelled") {
            return res.status(400).json(errorMessage("Order already cancelled"));
        }

        if (["shipped", "delivered"].includes(order.status)) {
            return res.status(400).json(errorMessage("Order cannot be cancelled"));
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

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title images")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: orders.length, data: orders });
  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.user) {
      filter.user = req.query.user;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate("user", "fullname email")
      .populate("items.product", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      total,
      page,
      limit,
      data: orders,
    });
  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json(errorMessage("Invalid order status"));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(errorMessage("Order not found"));
    }

    if (["cancelled", "delivered"].includes(order.status)) {
      return res.status(400).json(errorMessage("Order status cannot be changed"));
    }

    order.status = status;

    order.statusHistory.push({
      status,
      changedBy: req.user._id,
    });

    await order.save();

    res.status(200).json(editMessage("Order status updated", order));
  } catch (error) {
    res.status(500).json(errorMessage("Something went wrong", error.message));
  }
};