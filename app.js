require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');

const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors({ origin: '*', credentials: true }));

app.use(bodyParser.json());

const sequelize = require('./util/database');

const userRoutes = require('./routes/user');
app.use('/user' , userRoutes);

const chatRoutes = require('./routes/chat-app');
app.use('/chat-app' , chatRoutes);

const groupsRoutes= require('./routes/groups');
app.use('/groups' , groupsRoutes);
app.use(express.static(path.join(__dirname, 'public')));

const chatController = require('./controllers/chat-app');
chatController.init(io);

io.on('connection', (socket) => {
    console.log("New client connected");

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
    });
});

app.use((req, res, next) => {
    console.log('url' , req.url)
    res.sendFile(path.join(__dirname, `public/${req.url}`));
});

const User = require('./models/user');
const Message = require('./models/chat-app');
const Group = require('./models/group');
const GroupMember = require('./models/groupmembership');

User.hasMany(Message , { onDelete: 'CASCADE'});
Message.belongsTo(User);

User.belongsToMany(Group , {through: GroupMember});
Group.belongsToMany(User , { through: GroupMember});

User.hasMany(GroupMember);
GroupMember.belongsTo(User)

Group.hasMany(GroupMember);
GroupMember.belongsTo(Group);

Group.hasMany(Message  , { onDelete: 'CASCADE'});
Message.belongsTo(Group);

const cronJob = require('./cron/cron'); // Import the cron job configuration

sequelize.sync({ force: true })
    .then(result => {
        server.listen( process.env.PORT || 3000);
        console.log('Database synchronized');
    })
    .catch(err => {
        console.error('Error synchronizing database:', err);
    });

   