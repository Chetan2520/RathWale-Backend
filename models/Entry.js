const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }, 
});

const EntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  items: [ItemSchema],
  total: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Entry', EntrySchema); 