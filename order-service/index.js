const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const amqp = require('amqplib')
const Order = require('./models/Order.js')
const isAuthenicated = require('../Authentication.js')
require('dotenv').config()
const app = express()
const PORT = process.env.PORT_ORDERSERVICE || 9090
app.use(express.json())

var channel, connection

mongoose.connect(process.env.DB_URL)

async function connect() {
  const amqpServer = process.env.AMQP_SERVER
  connection = await amqp.connect(amqpServer)
  channel = await connection.createChannel()
  await channel.assertQueue('ORDER') //if queue does not exists, new queue is created
}

function createOrder(products, userEmail) {
  let total_price = 0
  for (let product = 0; product < products.length; ++product) {
    total_price += products[product].price
  }
  const newOrder = new Order({
    products,
    user: userEmail,
    total_price: total_price,
  })
  newOrder.save()
  return newOrder
}

connect().then(() => {
  channel.consume('ORDER', (data) => {
    const { products, userEmail } = JSON.parse(data.content)
    const newOrder = createOrder(products, userEmail)
    channel.ack(data)
    channel.sendToQueue('PRODUCT', Buffer.from(JSON.stringify({ newOrder })))
    console.log(products)
  })
})

app.listen(PORT, () => {
  console.log(`Order-Service is serving on PORT ${PORT}`)
})
