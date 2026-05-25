const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');

// ✅ Payment date se months calculate karo
const calculateMonthsOnPayment = (loanDate, paymentDate) => {
  const start = new Date(loanDate);
  const end = new Date(paymentDate);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // ✅ Agar days positive hai toh poora mahina count karo
  if (days > 0) {
    months += 1;
  }


  const totalMonths = years * 12 + months;

  return totalMonths < 1 ? 1 : totalMonths;
};

// Get payments by loan
router.get('/loan/:loanId', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ loanId: req.params.loanId })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add payment
router.post('/', auth, async (req, res) => {
  try {
    const { loanId, paidAmount, paymentDate, paymentMode, note } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // ✅ Payment date se months calculate karo
    const months = calculateMonthsOnPayment(loan.date, paymentDate);
    const totalInterest = (loan.amount * loan.interestRate * months) / 100;
    const totalPayable = Math.round(loan.amount + totalInterest);

    // Payment save karo
    const newPayment = new Payment({
      loanId,
      paidAmount,
      paymentDate,
      paymentMode,
      note
    });
    await newPayment.save();

    // Loan update karo
    loan.totalPaid += Number(paidAmount);
    loan.totalInterest = Math.round(totalInterest);
    loan.totalPayable = totalPayable;
    loan.remaining = totalPayable - loan.totalPaid;

    // Status update
    if (loan.remaining <= 0) {
      loan.remaining = 0;
      loan.status = 'Closed';
    }

    await loan.save();

    res.status(201).json({
      message: 'Payment added',
      payment: newPayment,
      loan: {
        ...loan._doc,
        months,
        totalInterest: Math.round(totalInterest),
        totalPayable,
        remaining: loan.remaining
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all payments
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find()
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

module.exports = router;