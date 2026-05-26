const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // ✅ Har customer ka admin
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  aadhaarImage: { type: String, default: '' },
  aadhaarPublicId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);