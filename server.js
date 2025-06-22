const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // подключаем .env

const app = express();

// Мидлвары
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB подключен'))
  .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Роуты
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});