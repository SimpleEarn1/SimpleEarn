const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Секрет для JWT берём из переменных окружения, чтобы не хардкодить в коде
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { nickname, email, password, referralCode } = req.body;

    // Проверка, что email ещё не занят
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email уже используется' });
    }

    // Хешируем пароль с saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерируем уникальный реферальный код (8 символов)
    const newReferralCode = uuidv4().slice(0, 8);

    // Создаём пользователя
    const newUser = new User({
      nickname,
      email,
      password: hashedPassword,
      referralCode: newReferralCode
    });

    // Если передан реферальный код, ищем пригласившего и сохраняем его ID
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        newUser.referrer = referrer._id;

        // Можно добавить бонус пригласившему, например:
        // referrer.balance = (referrer.balance || 0) + 10;
        // await referrer.save();
      }
    }

    await newUser.save();

    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    // Создаём JWT-токен
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        referralCode: user.referralCode,
        referrer: user.referrer,
        balance: user.balance || 0
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

module.exports = router;
