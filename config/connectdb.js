const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        // Mongo DB
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecommerce.uokeik5.mongodb.net/?appName=${process.env.DB_CLIENT}`,
        );
        console.log("Mongodb connect is successfully"); 
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectdb;