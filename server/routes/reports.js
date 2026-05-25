const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { from, to } = req.query;

    // Date filter banao
    let dateFilter = {};
    if (from && to) {
      dateFilter = {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to + 'T23:59:59.999Z')
        }
      };
    }

    // Summary stats
    const totalCustomers = await Customer.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: 'Active' });
    const closedLoans = await Loan.countDocuments({ status: 'Closed' });

    // Loan stats
    const loanStats = await Loan.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalLoanAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$totalPaid' },
          totalPending: { $sum: '$remaining' },
          totalInterest: { $sum: '$totalInterest' }
        }
      }
    ]);

    // Payment stats - mode wise
    const paymentModeStats = await Payment.aggregate([
      ...(from && to ? [{
        $match: {
          paymentDate: {
            $gte: new Date(from),
            $lte: new Date(to + 'T23:59:59.999Z')
          }
        }
      }] : []),
      {
        $group: {
          _id: '$paymentMode',
          total: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly payments (last 6 months)
    const monthlyPayments = await Payment.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$paymentDate' },
            year: { $year: '$paymentDate' }
          },
          total: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Customer wise loans
    const customerWise = await Loan.find(dateFilter)
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      summary: {
        totalCustomers,
        activeLoans,
        closedLoans,
        ...(loanStats[0] || {
          totalLoanAmount: 0,
          totalPaid: 0,
          totalPending: 0,
          totalInterest: 0
        })
      },
      paymentModeStats,
      monthlyPayments,
      customerWise
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;