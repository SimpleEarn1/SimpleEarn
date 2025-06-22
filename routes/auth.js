const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid'); // генерация referralCode

// 🔐 Регистрация
router.post('/register', async (req, res) => {
  try {
    const { nickname, email, password, referralCode } = req.body;

    // Проверка на существующий email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email уже используется' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const newUser = new User({
      nickname,
      email,
      password: hashedPassword,
      referralCode: uuidv4().slice(0, 8) // свой уникальный код
    });

    // Если введён чужой реферальный код — сохраняем referrer
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        newUser.referrer = referrer._id;

        // 🔁 Можно начислить бонус пригласившему:
        // referrer.balance += 10;
        // await referrer.save();
      }
    }

    await newUser.save();

    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 🔑 Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Пользователь не найден' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        referralCode: user.referralCode,
        referrer: user.referrer,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка входа' });
  }
});

module.exports = router;