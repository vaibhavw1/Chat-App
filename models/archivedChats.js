const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedMessage = sequelize.define( 'ArchivedMessage' , {
    
    chats: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    
});

module.exports = ArchivedMessage;