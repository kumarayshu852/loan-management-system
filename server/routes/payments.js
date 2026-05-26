const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');

// ✅ Date se months calculate karo
const calculateMonths = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days > 0) months += 1;

  const totalMonths = years * 12 + months;
  return totalMonths < 1 ? 1 : totalMonths;
};

// Add payment - adminId save karo
router.post('/', auth, async (req, res) => {
  try {
    const { loanId, paidAmount, paymentDate,
            paymentMode, note } = req.body;

    // ✅ Sirf apna loan
    const loan = await Loan.findOne({
      _id: loanId,
      adminId: req.user.id
    });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const lastPayment = await Payment.findOne({ loanId })
      .sort({ paymentDate: -1 });

    const fromDate = lastPayment
      ? lastPayment.paymentDate
      : loan.date;

    const months = calculateMonths(fromDate, paymentDate);

    const currentRemaining = loan.remaining;
    const interest = Math.round(
      (currentRemaining * loan.interestRate * months) / 100
    );
    const totalDue = currentRemaining + interest;

    const newPayment = new Payment({
      adminId: req.user.id,  // ✅
      loanId,
      paidAmount: Number(paidAmount),
      paymentDate,
      paymentMode,
      note,
      interestAtPayment: interest,
      remainingAtPayment: currentRemaining,
      monthsAtPayment: months
    });
    await newPayment.save();

    loan.totalPaid += Number(paidAmount);
    loan.totalInterest += interest;
    loan.totalPayable = loan.amount + loan.totalInterest;
    loan.remaining = totalDue - Number(paidAmount);

    if (loan.remaining <= 0) {
      loan.remaining = 0;
      loan.status = 'Closed';
    }

    await loan.save();

    res.status(201).json({
      message: 'Payment added',
      payment: newPayment,
      loan
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all payments - sirf apne
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({
      adminId: req.user.id  // ✅
    })
      .populate({
        path: 'loanId',
        populate: { path: 'customerId', select: 'name' }
      })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get payments by loan - sirf apne
router.get('/loan/:loanId', auth, async (req, res) => {
  try {
    const payments = await Payment.find({
      loanId: req.params.loanId,
      adminId: req.user.id  // ✅
    }).sort({ paymentDate: 1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;