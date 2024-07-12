const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');

const Group = sequelize.define("Group" , {
    
    groupName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    
    
});

module.exports = Group;