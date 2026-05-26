const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

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

// Get all loans - sirf apne
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({
      adminId: req.user.id  // ✅
    })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    const updatedLoans = await Promise.all(
      loans.map(async (loan) => {
        const lastPayment = await Payment.findOne({
          loanId: loan._id
        }).sort({ paymentDate: -1 });

        const fromDate = lastPayment
          ? lastPayment.paymentDate
          : loan.date;
        const today = new Date();
        const lastPayDate = new Date(fromDate);

        const toDate = lastPayDate > today
          ? new Date(lastPayDate.getFullYear(),
              lastPayDate.getMonth() + 1,
              lastPayDate.getDate())
          : today;

        let months = 1;
        let currentInterest = 0;
        let totalDue = loan.remaining;

        if (loan.status === 'Active' && loan.remaining > 0) {
          months = calculateMonths(fromDate, toDate);
          if (months < 1) months = 1;
          currentInterest = Math.round(
            (loan.remaining * loan.interestRate * months) / 100
          );
          totalDue = loan.remaining + currentInterest;
        }

        return {
          ...loan._doc,
          months,
          currentInterest,
          totalDue,
          remaining: loan.remaining
        };
      })
    );

    res.json(updatedLoans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create loan - adminId save karo
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, amount, interestRate, reason, date } = req.body;

    const loanDate = date || new Date();
    const totalInterest = Math.round(
      (amount * interestRate * 1) / 100
    );

    const loan = new Loan({
      adminId: req.user.id,  // ✅
      customerId,
      amount,
      interestRate,
      reason,
      date: loanDate,
      totalInterest,
      totalPayable: Number(amount) + totalInterest,
      remaining: Number(amount),
      totalPaid: 0
    });

    await loan.save();
    res.status(201).json({ message: 'Loan created', loan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single loan - sirf apna
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      adminId: req.user.id  // ✅
    }).populate('customerId', 'name phone address aadhaarImage');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    let months = 1;
    let currentInterest = 0;
    let totalDue = loan.remaining;

    if (loan.status === 'Active' && loan.remaining > 0) {
      const lastPayment = await Payment.findOne({
        loanId: loan._id
      }).sort({ paymentDate: -1 });

      const fromDate = lastPayment
        ? lastPayment.paymentDate
        : loan.date;
      const today = new Date();
      const lastPayDate = new Date(fromDate);

      const toDate = lastPayDate > today
        ? new Date(lastPayDate.getFullYear(),
            lastPayDate.getMonth() + 1,
            lastPayDate.getDate())
        : today;

      months = calculateMonths(fromDate, toDate);
      if (months < 1) months = 1;
      currentInterest = Math.round(
        (loan.remaining * loan.interestRate * months) / 100
      );
      totalDue = loan.remaining + currentInterest;
    }

    res.json({
      ...loan._doc,
      months,
      currentInterest,
      totalDue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete loan - sirf apna
router.delete('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      adminId: req.user.id  // ✅
    });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    await Payment.deleteMany({ loanId: req.params.id });
    await Loan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Loan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

        

module.exports = router;