document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const chatsInput = document.getElementById('chats-input');
    const sendBtn = document.getElementById('sendBtn');
    const groupsList = document.getElementById('groups-list');
    const createGroupBtn = document.getElementById('createGroupBtn');
    const groupNameElement = document.getElementById('group-name');
    const chatBox = document.getElementById('chat-box');
    const adminElement = document.getElementById('admin');
    const usersListElement = document.getElementById('users-list');
    const groupMembersListElement = document.getElementById('group-members-list');
    const deleteGroupBtn = document.getElementById('deleteGroupBtn'); 

    let loggedInUser = '';
    let currentGroupId = localStorage.getItem('currentGroupId');

    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        loggedInUser = payload.name;
        adminElement.textContent = `Welcome, ${loggedInUser}`;
    } else {
        window.location.href = '../login/login.html';
        return;
    }
    const socket = io();
    socket.on('newMessage', (groupId) => {
        if (currentGroupId === groupId) {
            fetchMessages(groupId); // Fetch messages for the current group
        }
    });



    if (currentGroupId) {
        fetchMessages(currentGroupId);
        fetchGroupMembers(currentGroupId);
    };

    document.getElementById('uploadForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const fileInput = document.getElementById('myFile');
        const file = fileInput.files[0];
    
        if (!file) {
            return alert('Please select a file to upload');
        }
    
        const formData = new FormData();
        formData.append('myFile', file);
        formData.append('groupId', currentGroupId);
        try {
            const response = await axios.post(`http://localhost:3000/chat-app/uploadFile`,formData,  {headers: { 'Authorization': token } } );
            console.log(response);
            fileInput.value = '';
            fetchMessages(currentGroupId);
    
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('chat-box').innerText = 'Failed to upload file';
        }
    });
    async function fetchUsers() {
        try {
            const response = await axios.get(`http://localhost:3000/user/all-users`, {
                headers: { 'Authorization': token }
            });
            const users = response.data.users;
            if (Array.isArray(users)) {
                displayUsers(users);
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            usersListElement.innerHTML = '<p>Failed to load users.</p>';
        }
    }
    

    function displayUsers(users) {
        usersListElement.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.id=`user-${user.id}`;
            userElement.textContent = `${user.username } `;
            const isMember = user.groups ? user.groups.some(group => group.id === currentGroupId) : false;

            if (!isMember) {
                const addButton = document.createElement('button');
                addButton.textContent = 'Add to Group';
                addButton.classList.add('add-to-group-btn');
                addButton.addEventListener('click', () => addToGroup(user.id));
                userElement.appendChild(addButton);
            }              
            usersListElement.appendChild(userElement);
        });
    };

    async function addToGroup(userId){
        if(!currentGroupId){
            alert("please select a group");
            return;
        };

        try{
            const response = await axios.post(`http://localhost:3000/groups/add-user`, {groupId:Number(currentGroupId),userId}, {headers: { 'Authorization': token } });
            console.log(response.data)
            if(response.data.success){
                alert('User added to the group successfully.');
                const userElement = document.getElementById(`user-${userId}`);
                if (userElement) {
                    const addButton = userElement.querySelector('.add-to-group-btn');
                    if (addButton) {
                        addButton.remove();
                    }
                }
                fetchGroupMembers(currentGroupId);
            } else {
                alert('Failed to add user to the group.');
            }
        } catch (error) {
            console.error('Error adding user to the group:', error);
            alert('An error occurred while adding the user to the group.');
        }
    }
    fetchUsers();

    async function fetchGroupMembers(groupId){
        try{
            const response = await axios.get(`http://localhost:3000/groups/get-group-members/${groupId}`, {headers: { 'Authorization': token }});
            const members = response.data.members;
            displayGroupMembers(members);
        } catch (error) {
            console.error('Error fetching group members:', error);
            groupMembersListElement.innerHTML = '<p>Failed to load group members.</p>';
        }
    };

    function displayGroupMembers(members){
        groupMembersListElement.innerHTML='';
        members.forEach(member => {
            const memberElement = document.createElement('li');
            memberElement.textContent = `${member.username} `;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove member'; 
            removeBtn.addEventListener('click' , async() => {
                removeMembersFromGroup(currentGroupId,member.id);
            });
            memberElement.appendChild(removeBtn)
            groupMembersListElement.appendChild(memberElement);
        })
    };

    async function removeMembersFromGroup ( groupId , userId) {
        try{
            const response = await axios.delete('http://localhost:3000/groups/remove-member', {headers: { 'Authorization': token } , data:{ groupId,userId }});
            fetchGroupMembers(groupId)
        } catch (error) {
            console.error('Error removing user:', error);
            alert('Unable to removing members from group')
        }
    }

    async function fetchMessages(groupId) {
        try {
            const response = await axios.get(`http://localhost:3000/chat-app/get-chats?groupId=${groupId}`, {
                headers: { 'Authorization': token }
            });
            const messages = response.data.slice(-10);
            localStorage.setItem(`group-${groupId}-messages`, JSON.stringify(messages));
            updateChatBox(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            alert('An error occurred while fetching the messages');
        }
    }

    function addMessageToChatUi(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${message.sender === loggedInUser ? 'You' : message.sender}:</strong> ${message.text}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        groupsList.scrollTop = groupsList.scrollHeight;
    }

    function saveMessagesToLocalStorage(message, groupId) {
        let messages = JSON.parse(localStorage.getItem(`group-${groupId}-messages`)) || [];
        messages.push(message);
        if (messages.length > 10) {
            messages = messages.slice(messages.length - 10);
        }
        localStorage.setItem(`group-${groupId}-messages`, JSON.stringify(messages));
    }

    function loadMessagesFromLocalStorage(groupId) {
        const messages = JSON.parse(localStorage.getItem(`group-${groupId}-messages`)) || [];
        messages.forEach(message => addMessageToChatUi(message));
    }

    function updateChatBox(messages) {
        chatBox.innerHTML = '';
        messages.forEach(message => {
            const sender = message.User && message.User.username ? message.User.username : 'Unknown';
            addMessageToChatUi({
                text: message.chats,
                sender: sender
            });
        });
    }

    async function fetchGroups() {
        try {
            const response = await axios.get('http://localhost:3000/groups/get-groups', {
                headers: { 'Authorization': token }
            });
            const groups = response.data;
            groupsList.innerHTML = '';
            groups.forEach(group => {
                const listItem = document.createElement('li');
                listItem.textContent = group.groupName;
                listItem.classList.add('group-item');
                listItem.addEventListener('click', () => {
                    currentGroupId = group.id;
                    localStorage.setItem('currentGroupId', currentGroupId);
                    groupNameElement.textContent = group.groupName;
                    chatBox.innerHTML = '';
                    loadMessagesFromLocalStorage(group.id);
                    fetchMessages(group.id);
                });
                groupsList.appendChild(listItem);
            });
            if (currentGroupId) {
                const currentGroup = groups.find(group => group.id === parseInt(currentGroupId));
                if (currentGroup) {
                    groupNameElement.textContent = currentGroup.groupName;
                    loadMessagesFromLocalStorage(currentGroupId);
                    fetchMessages(currentGroupId);
                }
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            alert('An error occurred while fetching groups');
        }
    }

    fetchGroups();

    createGroupBtn.addEventListener('click', async () => {
        try {
            const groupName = prompt("Enter group name");
            if (!groupName) return;
            const response = await axios.post('http://localhost:3000/groups/create-group', { groupName }, { headers: { 'Authorization': token } });
            fetchGroups();
        } catch (error) {
            console.error('Error creating group:', error);
            alert("Error creating group!");
        }
    });
    deleteGroupBtn.addEventListener('click', async () => {
        const groupId = currentGroupId;
        if (!groupId) {
            alert('Please select a group to delete.');
            return;
        }
        try{
            const response = await axios.delete(`http://localhost:3000/groups/delete-group/${groupId}`  ,  { headers: { 'Authorization': token } });
            currentGroupId=null;
            localStorage.removeItem('currentGroupId');
            groupNameElement.textContent='';
            groupMembersListElement.innerHTML='';
            chatBox.innerHTML='';
            fetchGroups();
        } catch (error) {
            console.error('Error deleting group:', error);
            alert("Error delting group!");
        }
    })

    sendBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const chats = chatsInput.value.trim();

        if (chats && currentGroupId) {
            try {
                const response = await axios.post(`http://localhost:3000/chat-app/add-chats`, {
                    chats: chats,
                    groupId: currentGroupId
                }, {
                    headers: { 'Authorization': token }
                });
                const newMessage = response.data.newMessage;
                const messageObject = {
                    text: newMessage.chats,
                    sender: newMessage.User.username || loggedInUser
                };
                addMessageToChatUi(messageObject);
                saveMessagesToLocalStorage(messageObject, currentGroupId);
                chatsInput.value = '';
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message');
            }
        }
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentGroupId');
        window.location.href = '../login/login.html';
    });

});