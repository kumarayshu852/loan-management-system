const express =require('express');
const router=express.Router();
const Customer=require('../models/Customer');
const Loan=require('../models/Loan');
const Payment=require('../models/Payment');
const { populate } = require('../models/User');
const auth=require('../middleware/auth');

router.get('/',auth,async(req,res)=>{
    try{
        const totalCustomers=await Customer.countDocuments();
        const activeLoans=await Loan.countDocuments({status:"Active"});
        const closedLoans=await Loan.countDocuments({status:"Closed"});

        // Total amount
        const loanStats=await Loan.aggregate([
            {
                $group:{
                    _id:null,
                    totalLoanAmount:{$sum:"$amount"},
                    totalPending:{$sum:"$remaining"},
                    totalReceived:{$sum:"$totalPaid"},
                }
            }
        ]);
          
        // recent loans(last 5)
        const recentLoans=await Loan.find()
        .populate('customerId','name')
        .sort({createdAt:-1})
        .limit(5);

        // recent payments(last 5)
        const recentPayments=await Payment.find()
        .populate({
            path:"loanId",
            populate:{path:"customerId",select:"name"}
        })
        .sort({paymentDate:-1})
        .limit(5);

        res.json({
            totalCustomers,
            activeLoans,
            closedLoans,
            stats:loanStats[0] || {},
            recentLoans,
            recentPayments
        });
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

module.exports=router;