const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../auth-service/models/User.js')
require('dotenv').config()
const app = express()
app.use(express.json())
const PORT = process.env.PORT_AUTHSERVICE || 7070

mongoose.connect(process.env.DB_URL)

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body

  const user = await User.findOne({ email })
  if (user) {
    return res.json({ message: 'User exists !!!' })
  } else {
    const newUser = new User({
      name,
      email,
      password,
    })
    await newUser.save()
    return res.json(newUser)
  }
})

app.post('/auth/login', async (req, res) => {
  const { email, passowrd } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return res.json({ message: `Sorry User not exists !!!` })
  } else {
    if (passowrd !== user.passowrd) {
      res.json({ message: `Sorry Invalid Password` })
    }
    const payload = {
      email,
      name: user.name,
    }
    jwt.sign(payload, process.env.JWT_SECRET, (error, token) => {
      if (error) {
        console.log(error)
      } else {
        return res.json({ token: token })
      }
    })
  }
})

app.listen(PORT, () => {
  console.log(`Auth-Service is serving on PORT ${PORT}`)
})
