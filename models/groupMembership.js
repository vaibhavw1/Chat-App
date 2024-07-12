const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');
const Group = require('./group');

const GroupMember = sequelize.define('GroupMember', {
      isAdmin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
      },
      UserId: {
          type : Sequelize.INTEGER,
          allowNull:false,

      },
      GroupId: {
          type:Sequelize.INTEGER,
          allowNull:false,
      },

});

module.exports = GroupMember;