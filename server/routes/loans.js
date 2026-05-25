const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

// ✅ Helper - date se months calculate karo
const calculateMonthsFromDate = (loanDate, toDate) => {
  const start = new Date(loanDate);
  const end = new Date(toDate);
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

// Get all loans
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    // Har loan ke liye last payment dhundho
    const updatedLoans = await Promise.all(loans.map(async (loan) => {
      const lastPayment = await Payment.findOne({ loanId: loan._id })
        .sort({ paymentDate: -1 });

      const toDate = lastPayment ? lastPayment.paymentDate : new Date();
      const months = calculateMonthsFromDate(loan.date, toDate);
      const totalInterest = (loan.amount * loan.interestRate * months) / 100;
      const totalPayable = Math.round(loan.amount + totalInterest);

      return {
        ...loan._doc,
        months,
        totalInterest: Math.round(totalInterest),
        totalPayable,
        remaining: totalPayable - loan.totalPaid
      };
    }));

    res.json(updatedLoans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create loan
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, amount, interestRate, reason, date } = req.body;

    const loanDate = date || new Date();
    const months = 1;
    const totalInterest = (amount * interestRate * months) / 100;
    const totalPayable = Math.round(amount + totalInterest);

    const loan = new Loan({
      customerId,
      amount,
      interestRate,
      reason,
      date: loanDate,
      totalInterest: Math.round(totalInterest),
      totalPayable,
      remaining: totalPayable,
      totalPaid: 0
    });

    await loan.save();

    res.status(201).json({
      message: 'Loan created',
      loan: { ...loan._doc, months }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single loan
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('customerId', 'name phone address aadhaarImage');

    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // ✅ Last payment date se calculate karo
    const lastPayment = await Payment.findOne({ loanId: loan._id })
      .sort({ paymentDate: -1 });

    const toDate = lastPayment ? lastPayment.paymentDate : new Date();
    const months = calculateMonthsFromDate(loan.date, toDate);
    const totalInterest = (loan.amount * loan.interestRate * months) / 100;
    const totalPayable = Math.round(loan.amount + totalInterest);

    res.json({
      ...loan._doc,
      months,
      totalInterest: Math.round(totalInterest),
      totalPayable,
      remaining: totalPayable - loan.totalPaid
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get loans by customer
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 });

    const updatedLoans = await Promise.all(loans.map(async (loan) => {
      const lastPayment = await Payment.findOne({ loanId: loan._id })
        .sort({ paymentDate: -1 });

      const toDate = lastPayment ? lastPayment.paymentDate : new Date();
      const months = calculateMonthsFromDate(loan.date, toDate);
      const totalInterest = (loan.amount * loan.interestRate * months) / 100;
      const totalPayable = Math.round(loan.amount + totalInterest);

      return {
        ...loan._doc,
        months,
        totalInterest: Math.round(totalInterest),
        totalPayable,
        remaining: totalPayable - loan.totalPaid
      };
    }));

    res.json(updatedLoans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete loan
router.delete('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    await Payment.deleteMany({ loanId: req.params.id });
    await Loan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Loan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;