const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB подключен'))
.catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// API роуты (пример с auth)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Статика React (dashboard)
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Любой другой маршрут отдаём index.html React-приложения
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});