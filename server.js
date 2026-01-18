const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectdb = require('./config/connectdb');
const auth = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');

const app = express();

app.use(cors());
connectdb();
const PORT = process.env.PORT || 3001;


const stripeWebhookRouter = require("./routes/stripeWebhook");
app.use("/api/v1/stripe", stripeWebhookRouter);

app.use(express.json());
// CLIENT ROUTERS

const surfaceRouter = require('./routes/client/surface');
app.use('/api/v1/', surfaceRouter);

const authRouter = require('./routes/client/auth');
app.use('/api/v1/auth', authRouter);

const basketRouter = require('./routes/client/basket');
app.use("/api/v1/basket", auth, basketRouter);

const orderRouter = require("./routes/client/order");
app.use("/api/v1/order", auth, orderRouter);

const paymentRouter = require("./routes/client/payment");
app.use("/api/v1/payment", auth, paymentRouter);

// ADMİN ROUTERS

const userRouter = require('./routes/admin/user');
app.use('/api/v1/ad/user', auth, isAdmin, userRouter);

const categoryRouter = require("./routes/admin/category");
app.use("/api/v1/ad/category", auth, isAdmin, categoryRouter);

const productRouter = require("./routes/admin/product");
app.use("/api/v1/ad/product", auth, isAdmin, productRouter);

const adminOrderRouter = require("./routes/admin/order");
app.use("/api/v1/ad/order", auth, isAdmin, adminOrderRouter);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})