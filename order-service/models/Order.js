const mongoose = require('mongoose')
const OrderSchema = mongoose.Schema({
  products: [
    {
      product_id: String,
    },
  ],
  user: String,
  total_price: Number,
  created_at: {
    type: Date,
    default: Date.now(),
  },
})

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order
