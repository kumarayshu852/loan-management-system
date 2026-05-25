const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  aadhaarImage: { type: String, default: '' },
  aadhaarPublicId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);