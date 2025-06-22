const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// Добавляем заголовок Content Security Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "img-src 'self' data: https://yastatic.net; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self';"
  );
  next();
});

// 🔌 Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB подключен'))
  .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// 🔗 Роуты API
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 📦 Подключаем React build
app.use(express.static(path.join(__dirname, 'client', 'build')));

// 🔁 Все остальные маршруты — отдаем React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// 🚀 Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});