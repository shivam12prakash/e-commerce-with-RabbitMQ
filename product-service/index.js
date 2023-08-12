require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const amqp = require('amqplib')
const Product = require('./models/Product.js')
const isAuthenicated = require('../Authentication.js')
const app = express()
const PORT = process.env.PORT_PRODUCTSERVICE || 8080
app.use(express.json())

var channel, connection
var order

mongoose.connect(process.env.DB_URL)

async function connect() {
  const amqpServer = process.env.AMQP_SERVER
  connection = await amqp.connect(amqpServer)
  channel = await connection.createChannel()
  await channel.assertQueue('PRODUCT') //if queue does not exists, new queue is created
}

connect()

app.post('/product/create', isAuthenicated, async (req, res) => {
  const { name, description, price } = req.body
  const newProduct = new Product({
    name,
    description,
    price,
  })
  await newProduct.save()
  return res.json(newProduct)
})

app.post('/product/buy', isAuthenicated, async (req, res) => {
  const { productIds } = req.body
  const products = await Product.find({ _id: { $in: productIds } })

  channel.sendToQueue(
    'ORDER',
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  )
  channel.consume('PRODUCT', (data) => {
    console.log('CONSUMING PRODUCT QUEUE')
    order = JSON.parse(data.content)
    channel.ack(data)
  })
  return res.json(order)
})

app.listen(PORT, () => {
  console.log(`Product-Service is serving on PORT ${PORT}`)
})
