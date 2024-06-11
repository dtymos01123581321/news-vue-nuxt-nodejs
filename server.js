const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const sharedsession = require('express-socket.io-session');

const app = express();

const sessionMiddleware = session({
  secret: 'mySecretKey', // Заміни на свій секретний ключ
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 день
});

app.use(cors());
app.use(sessionMiddleware);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.use(sharedsession(sessionMiddleware, {
  autoSave: true
}));

let newsFeed = [];

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
  const userSession = socket.handshake.session;

  if (!userSession.likedPosts) {
    userSession.likedPosts = [];
  }

  // Впевніться, що новини завантажуються при підключенні
  const sortedNewsFeed = newsFeed.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
  socket.emit('news', sortedNewsFeed);

  socket.on('get_news', () => {
    socket.emit('news', sortedNewsFeed);
  });

  socket.on('new_post', (post) => {
    newsFeed.push(post);
    saveNewsFeed();
    const sortedNewsFeed = newsFeed.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
    io.emit('news', sortedNewsFeed);
  });

  socket.on('like', (postId) => {
    if (!userSession.likedPosts.includes(postId)) {
      const post = newsFeed.find(p => p.id === postId);
      if (post) {
        post.likes += 1;
        userSession.likedPosts.push(postId);
        userSession.save();
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
