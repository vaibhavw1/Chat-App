const Groups = require('../models/group');
const GroupMembership = require('../models/groupmembership');
const User = require('../models/user');
const Chats = require('../models/chat-app');
const sequelize= require('sequelize');
const { Op } = require('sequelize');


exports.createGroup = async( req, res) => {
    const {groupName } = req.body;
    const userId = req.user.id;
    try{
        const newGroup = await Groups.create({groupName ,AdminId:userId });
        await GroupMembership.create({UserId:userId , GroupId:newGroup.id , isAdmin:true})
        console.log('Group created successfully!', newGroup);
        res.status(201).json({ group:newGroup , message: 'Group created successfully'})
    } catch(error){
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Unable to create group' });
    }
}

exports.getAllGroups = async(req, res) => {
    try{
        const groups = await Groups.findAll();
        res.json(groups);
    }catch(error){
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Failed to fetch groups.' });
    };
}

exports.addUsers = async(req ,res) => {
    let {groupId, userId } = req.body;
    try{
        groupId = Number(groupId);
        userId = Number(userId);
        const group = await Groups.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        };
        const user = await User.findByPk( userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        };
        const adminUserGroup = await GroupMembership.findOne({
            where: {
                UserId:req.user.id,
                GroupId:groupId,
                isAdmin:true
            }
        });
        if (!adminUserGroup) {
            return res.status(403).json({ success: false, message: 'Only admins can add users to the group.' });
        };
        const userMembership = await GroupMembership.findOne({
            where:{
                UserId:userId,
                GroupId:groupId
            }
        })
        if (userMembership) {
            return res.status(400).json({ success: false, message: 'User is already a member of the group.' });
        }
        await GroupMembership.create({UserId:userId , GroupId:groupId});
        res.json({ success: true, message: 'User added to the group successfully.' });
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).json({ success: false, message: 'An error occurred while adding the user to the group.' });
    }
}

exports.getGroupMembers = async(req, res) => {
    const {groupId} = req.params;
    try{
        console.log(groupId)
        const group = await Groups.findByPk(groupId , {
            include:[
                {
                    model:User,
                    through:{attributes:[]}
                }
            ]
        });
        if(!group){
            return res.status(404).json({ success: false, message: 'Group not found.' });
        };
        const members = group.Users;
        console.log('members' , members)
        res.json({success:true ,members:members});
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching group members.' });
    }
};

exports.removeGroupMembers = async(req ,res) => {
    const { groupId , userId } = req.body;
    try{
        const adminUserGroup = await GroupMembership.findOne({
            where: {
                UserId: req.user.id , 
                GroupId: groupId,
                isAdmin:true
            }
        });
        if (!adminUserGroup) {
            return res.status(403).json({ success: false, message: 'Only admins can remove users from the group.' });
        }
        const result = await GroupMembership.destroy({
            where: {
                UserId: userId,
                GroupId:groupId
            }
        });
        if (result === 0) {
            return res.status(404).json({ success: false, message: 'User is not a member of the group.' });
        }
        res.json({ success: true, message: 'User removed from the group successfully.' });
    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).json({ success: false, message: 'An error occurred while removing the user from the group.' });
    }
}


exports.deleteGroup = async(req ,res) => {
    const { groupId } = req.params;
    try{
        const adminUserGroup = await GroupMembership.findOne({
            where: {
                UserId: req.user.id , 
                GroupId: groupId,
                isAdmin:true
            }
        });
        if (!adminUserGroup) {
            return res.status(403).json({ success: false, message: 'Only admins can rdelete the group.' });
        }
        const result = await Groups.destroy({
            where: {
                id:groupId
            }
        });
        res.json({ success: true, message: 'group deleted succesguly.' });
    } catch (error) {
        console.error('Error group deleted succesguly.', error);
        res.status(500).json({ success: false, message: 'An error occurred while group deleting.' });
    }
}