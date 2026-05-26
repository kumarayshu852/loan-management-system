const express =require('express');
const router=express.Router();
const Customer=require('../models/Customer');
const Loan=require('../models/Loan');
const Payment=require('../models/Payment');
const { populate } = require('../models/User');
const auth=require('../middleware/auth');
const mongoose = require('mongoose');


router.get('/', auth, async (req, res) => {
  try {
    // ✅ Sirf apna data
    const adminId = req.user.id;

    const totalCustomers = await Customer.countDocuments({ adminId });
    const activeLoans = await Loan.countDocuments({
      adminId, status: 'Active'
    });
    const closedLoans = await Loan.countDocuments({
      adminId, status: 'Closed'
    });

    const loanStats = await Loan.aggregate([
      { $match: {
        adminId: new mongoose.Types.ObjectId(adminId)
      }},
      {
        $group: {
          _id: null,
          totalLoanAmount: { $sum: '$amount' },
          totalPending: { $sum: '$remaining' },
          totalReceived: { $sum: '$totalPaid' }
        }
      }
    ]);

    const recentLoans = await Loan.find({ adminId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({ adminId })
      .populate({
        path: 'loanId',
        populate: { path: 'customerId', select: 'name' }
      })
      .sort({ paymentDate: -1 })
      .limit(5);

    res.json({
      totalCustomers,
      activeLoans,
      closedLoans,
      stats: loanStats[0] || {},
      recentLoans,
      recentPayments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports=router;