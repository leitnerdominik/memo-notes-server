const express = require('express');
const router = express.Router();

const { signup, login, signupNameless, loginNameless } = require('../controllers/users-controller');

router.post('/login', login);
router.post('/signup', signup);
router.put('/signupnameless', signupNameless);
router.post('/loginnameless', loginNameless);

module.exports = router;
