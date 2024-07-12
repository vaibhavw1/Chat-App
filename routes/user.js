const express = require('express');

const router = express.Router();
const authetication = require('../middleware/auth');
const user = require('../controllers/user');


router.post('/signup' , user.signup );
router.post('/login' , user.login );
router.get('/all-users' ,authetication.authenticate, user.getUsers);

module.exports = router ;