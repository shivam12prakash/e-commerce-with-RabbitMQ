const mongoose = require('mongoose')
const UserSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  created_at: {
    type: Date,
    default: Date.now(),
  },
})

const User = mongoose.model('User', UserSchema)

module.exports = User
