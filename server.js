const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { WebSocketServer } = require('ws');

// Настройка Express
const app = express();
app.use(cors());
app.use(express.json());

// Подключение к MongoDB (бесплатно на https://www.mongodb.com/atlas)
mongoose.connect('mongodb+srv://логин:пароль@ваш-кластер.mongodb.net/messenger?retryWrites=true&w=majority');

// Модель сообщения
const Message = mongoose.model('Message', {
  text: String,
  user: String,
  timestamp: { type: Date, default: Date.now }
});

// API для сообщений
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: -1 }).limit(100);
  res.json(messages);
});

app.post('/messages', async (req, res) => {
  const { text, user } = req.body;
  const message = new Message({ text, user });
  await message.save();
  res.json({ status: 'Сообщение сохранено!' });
});

// WebSocket для реального времени
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    // Рассылка сообщения всем клиентам
    wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(data.toString());
      }
    });
  });
});

// Старт сервера
app.listen(3000, () => console.log('Сервер запущен!'));
