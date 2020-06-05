const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const {
  signup,
  login,
  signupNameless,
  loginNameless,
} = require('../controllers/users-controller');

router.post(
  '/login',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  login
);
router.post(
  '/signup',
  [
    check('name').not().isEmpty().isLength({ min: 5 }),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  signup
);
router.put('/signupnameless', signupNameless);
router.post('/loginnameless', [check('userId').not().isEmpty()], loginNameless);

module.exports = router;
