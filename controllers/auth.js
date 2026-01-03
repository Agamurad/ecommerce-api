const bcrypt = require('bcrypt')
const { registerValidate, User, loginValidate } = require('../models/user')

exports.register = async (req, res) => {
  try {
    const { error } = registerValidate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    if (req.body.role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(403).json({ message: 'Admin already exists' });
      }
    }

    const accountId = Array.from(
      { length: 16 },
      () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    ).join('');

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      accountId,
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      role: req.body.role,
    });

    const savedUser = await user.save();
    const token = savedUser.createAuthToken();

    res.status(201).json({
      token,
      user: savedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

exports.login = async (req, res) => {
  try {
    const { error } = loginValidate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = user.createAuthToken();

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}
