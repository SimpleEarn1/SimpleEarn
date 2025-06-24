const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: 'https://simpleearn-a3dt.onrender.com', // укажи свой фронтенд домен
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ВАЖНО: подключаем CORS один раз с опциями, до всех роутов и middleware
app.use(cors(corsOptions));

// Обработка preflight-запросов для всех маршрутов
app.options('*', cors(corsOptions));

// Middleware для парсинга JSON
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB подключен'))
.catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Роуты API
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Статика React-приложения (dashboard)
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Все остальные маршруты — отдаём index.html React-приложения
app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  }
});


// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});