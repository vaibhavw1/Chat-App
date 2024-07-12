const { where } = require('sequelize');
const Chats = require('../models/chat-app');
const Group = require('../models/group');
const GroupMember = require('../models/groupmembership');
const User= require('../models/user');
const AWS = require('aws-sdk');

let io;
exports.init = (socketIoInstance) => {
    io = socketIoInstance;
}


const uploadToS3=async(data,filename)=>{
    try {
        const BUCKET_NAME=process.env.BUCKET_NAME;
        const IAM_USER_KEY= process.env.IAM_USER_KEY;
        const IAM_USER_SECRET= process.env.IAM_USER_SECRET;
        console.log(BUCKET_NAME)

        const s3bucket=new AWS.S3({
            accessKeyId:IAM_USER_KEY,
            secretAccessKey:IAM_USER_SECRET
        })
        const params={
            Bucket:BUCKET_NAME,
            Key:filename,
            Body:data,
            ACL:'public-read'
        }
        const response = await s3bucket.upload(params).promise();
        return response; 
    } catch (err) {
        console.log('Upload error', err);
        throw err;
    }
}
exports.uploadFile=async(req,res)=>{
    try{
        const { groupId } = req.body;
        const file = req.file;
        const uploadedFile = await uploadToS3(file.buffer, file.originalname);
        console.log(uploadedFile.Location)

        const chatRes = await Chats.create({
            name: req.user.username,
            chat: uploadedFile.Location,
            UserId: req.user.id,
            GroupId: groupId
        });

        io.to(groupId).emit('newMessage', groupId);
        res.status(201).json({url:uploadedFile.Location,message:"file posted"});
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to post message' });
    }
}



exports.postMessages = async ( req , res) => {
    const {  groupId , chats } = req.body;
    try{
        const isMember = await GroupMember.findOne({
            where: {
                UserId:req.user.id,
                GroupId: groupId
            }
        });
        if(!isMember){
            return res.status(403).json({ error: 'You are not a member of this group.' });
        }
        const group = await Group.findByPk(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        };
        
        const newMessage = await Chats.create({
            UserId:req.user.id ,
            chats:chats ,
            GroupId: groupId
        });
        const messageWithUser = await Chats.findOne({
            where: { id: newMessage.id },
            include: [{ model: User, attributes: ['username'] }]
        });
        console.log('Message send and stored successfully!',messageWithUser);
        io.to(groupId).emit('newMessage' , groupId);
        res.status(201).json({newMessage: messageWithUser , message:"Message sent succesfully" });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Cant send message' });
    }
}

exports.getAllMessages = async (req, res) => {
    const groupId = req.query.groupId;

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        let messages = await Chats.findAll({
            where: { GroupId: groupId },
            include: [{
                model: User,
                attributes: ['username']
            }]
        });
        console.log('Message got successfully!', messages);

        res.json( messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: 'Unable to fetch messages' });
    }
}