const mongoose = require('mongoose')
const ProductSchema = mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  created_at: {
    type: Date,
    default: Date.now(),
  },
})

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product
