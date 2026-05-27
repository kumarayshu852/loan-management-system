const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // ✅ Har payment ka admin
  },
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
  note: { type: String, default: '' },


  // ✅ Reducing Balance ke liye extra fields
  interestAtPayment: { type: Number, default: 0 },
  remainingAtPayment: { type: Number, default: 0 },
  monthsAtPayment: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

