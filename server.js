const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectdb = require('./config/connectdb');
const auth = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');

const app = express();

app.use(cors());
app.use(express.json());
connectdb();
const PORT = process.env.PORT || 3001;

// CLIENT ROUTERS

const surfaceRouter = require('./routes/client/surface');
app.use('/api/v1/', surfaceRouter);

const authRouter = require('./routes/client/auth');
app.use('/api/v1/auth', authRouter);


// ADMİN ROUTERS

const userRouter = require('./routes/admin/user');
app.use('/api/v1/ad/users', auth, isAdmin, userRouter);

const categoryRouter = require("./routes/admin/category");
app.use("/api/v1/ad/categories", auth, isAdmin, categoryRouter);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})