const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Group = require('./group');
const User = require('./user');

const Message = sequelize.define('Message' , {
    
    
    chats: {
        type: Sequelize.TEXT,
        allowNull: false
    },

    
})
module.exports = Message;