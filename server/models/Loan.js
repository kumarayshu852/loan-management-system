const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  reason: { type: String },
  date: { type: Date, default: Date.now },

  // auto calculated fields
  totalInterest: { type: Number, default: 0 },
  totalPayable: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Pending'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);