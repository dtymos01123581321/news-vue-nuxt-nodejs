const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let newsFeed = [];
let likes = {};

const filePath = path.join(__dirname, 'newsFeed.json');

const loadNewsFeed = () => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    newsFeed = JSON.parse(data);
  }
};

const saveNewsFeed = () => {
  fs.writeFileSync(filePath, JSON.stringify(newsFeed));
};

loadNewsFeed();

io.on('connection', (socket) => {
  console.log('a user connected');

  const sortedNewsFeed = newsFeed.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
  socket.emit('news', sortedNewsFeed);

  socket.on('new_post', (post) => {
    newsFeed.push(post);
    saveNewsFeed();
    const sortedNewsFeed = newsFeed.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
    io.emit('news', sortedNewsFeed);
  });

  socket.on('like', (postId) => {
    if (!likes[socket.id]) likes[socket.id] = {};
    if (!likes[socket.id][postId]) {
      const post = newsFeed.find(p => p.id === postId);
      if (post) {
        post.likes += 1;
        likes[socket.id][postId] = true;
        saveNewsFeed();
        io.emit('like', { postId, likes: post.likes });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
