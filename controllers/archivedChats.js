const Chats = require('../models/chat-app');
const ArchivedChats = require('../models/archivedChats');
const Sequelize = require('sequelize');

exports.archiveOldChats = async () => {
    console.log('Running the cron job to archive old chats');
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 1);

    try{
        const oldChats = await Chats.findAll({
            where:{
                createdAt: { [Sequelize.Op.It] : dateThreshold}
            }
        });
        for(let chat of oldChats){
            await ArchivedChats.create({
                username:chat.username,
                chats:chat.chats,
                createdAt:chat.createdAt,
                updatedAt:chat.updatedAt
            })
            await chat.destroy()
        }
        console.log("Archied old chats successfully..")
    }catch(error){
        console.error('Error at archiving old chats',error);
    }
}