const express = require('express');

const router = express.Router();

const group = require('../controllers/groups');
const authentication = require('../middleware/auth');

router.post('/create-group' , authentication.authenticate , group.createGroup);
router.get('/get-groups' , authentication.authenticate , group.getAllGroups);
router.post('/add-user' , authentication.authenticate , group.addUsers)
router.get('/get-group-members/:groupId' , authentication.authenticate, group.getGroupMembers);
router.delete('/remove-member' , authentication.authenticate, group.removeGroupMembers);
router.delete('/delete-group/:groupId' , authentication.authenticate, group.deleteGroup);


module.exports = router ;