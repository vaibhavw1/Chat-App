const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('Users' , {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email : {
        type: Sequelize.STRING,
        allowNull: false,
        unique : true
    },
    number : {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password : {
        type: Sequelize.STRING,
        allowNull: false,
    }, 
    
});

module.exports = User;