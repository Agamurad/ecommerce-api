const Joi = require("joi");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
  },
  { timestamps: true },
);

const registerValidate = (user) => {
  const schema = new Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().min(7).max(30).email().required(),
    password: Joi.string().min(8).required(),
  });

  return schema.validate(user);
};

const loginValidate = (user) => {
  const schema = new Joi.object({
    email: Joi.string().min(7).max(20).email().required(),
    password: Joi.string().min(8).required(),
  });

  return schema.validate(user);
};

userSchema.methods.createAuthToken = function() {
  const decodedToken = jwt.sign(
    {
      _id: this._id,
      fullname: this.fullname,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  return decodedToken;
};

const User = mongoose.model("User", userSchema);
module.exports = { User, registerValidate, loginValidate };
