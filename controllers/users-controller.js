const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const signup = async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Fetching user failed!'));
  }

  if (existingUser) {
    return next(new HttpError('User exists. Login instead!', 422));
  }

  if (password !== passwordConfirm) {
    return next(new HttpError('Passwords does not match!'), 401);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, +process.env.SALT);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not create user, please try again!'));
  }

  const createdUser = User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Signing up failed, please try again later'));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    console.log(err);
    return next(new HttpError('Signing up failed, please try again later.'));
  }

  res.status(201).json({
    message: 'User created!',
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let loginUser;
  try {
    loginUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('Invalid credentials, could not log you in.', 403)
    );
  }

  if (!loginUser) {
    return next(new HttpError('User not found. Please sign up.'));
  }

  let equalPasswords;
  try {
    equalPasswords = await bcrypt.compare(password, loginUser.password);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not login. Please try agin.'));
  }

  if (!equalPasswords) {
    return next(
      new HttpError('Invalid credentials, could not log you in.', 403)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: loginUser.id },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    console.log(err);
    return next(new HttpError('Logging in failed. Please try again.'));
  }

  res.json({
    message: 'Logged in!',
    userId: loginUser.id,
    email: loginUser.email,
    token: token,
  });
};

const signupNameless = async (req, res, next) => {
  let user;
  try {
    user = new User();
    await user.save();
  } catch (err) {
    return next(new HttpError('Unable to create user.'));
  }

  let token;
  try {
    token = jwt.sign({ userId: user.id }, process.env.JWT_KEY, {
      expiresIn: '1h',
    });
  } catch (err) {
    return next(new HttpError('Signing in failed. Please try again.'));
  }

  res.status(201).json({ message: 'User created!', user: user, token: token });
};

const loginNameless = async(req, res, next) => {
  const { userId } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch(err) {
    return next(new HttpError('Logging in failed. Please try again.'));
  }

  if(!user) {
    return next(new HttpError('User not found with the provided id.', 404));
  }

  let token;
  try {
    token = jwt.sign({ userId: user.id}, process.env.JWT_KEY, { expiresIn: '1h'});
  } catch(err) {
    return next(new HttpError('Logging in failed. Please try again.'));
  }

  res.json({message: 'Logged in!', user: user, token: token});

}

exports.signup = signup;
exports.login = login;
exports.signupNameless = signupNameless;
exports.loginNameless = loginNameless;
