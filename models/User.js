const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  nickname:     { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true },
  referralCode: { type: String, unique: true }, // генерируется при регистрации
  referrer:     { type: Schema.Types.ObjectId, ref: 'User', default: null }, // кто пригласил
  balance:      { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);