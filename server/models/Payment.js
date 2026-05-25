const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  paidAmount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer'],
    default: 'Cash'
  },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);