const express = require('express');
const multer = require('multer');
const upload = multer();
const router = express.Router();

const chatsControllers = require('../controllers/chat-app');
const userAuth = require('../middleware/auth');

router.post('/add-chats' , userAuth.authenticate, chatsControllers.postMessages );
router.get('/get-chats' , userAuth.authenticate, chatsControllers.getAllMessages );
router.post('/uploadFile' , userAuth.authenticate , upload.single('myFile') , chatsControllers.uploadFile );


module.exports = router ;