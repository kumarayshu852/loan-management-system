const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;


// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find({
      adminId: req.user.id  // ← Sirf is admin ke
    }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add customer
router.post('/', auth, upload.single('aadhaarImage'), async (req, res) => {
  try {
    const name = req.body.name;
    const phone = req.body.phone;
    const address = req.body.address;

    // ✅ Full Cloudinary URL banao
    let aadhaarImage = '';
    let aadhaarPublicId = '';

    if (req.file) {
      console.log('File info:', req.file); // debug
      aadhaarPublicId = req.file.filename || req.file.public_id;
      
      // ✅ Full URL - secure_url use karo
      aadhaarImage = req.file.path || req.file.secure_url;
    }
    
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name aur phone required' });
    }

    const customer = new Customer({
       adminId: req.user.id,  // ✅ Admin ID save karo
       name, phone, address, 
       aadhaarImage,  aadhaarPublicId  
      });
    await customer.save();
    res.status(201).json({ message: 'Customer added', customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single customer
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      adminId: req.user.id  // ✅ Sirf apna
    });
    if (!customer){
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update customer
router.put('/:id', auth, upload.single('aadhaarImage'), async (req, res) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.phone) update.phone = req.body.phone;
    if (req.body.address) update.address = req.body.address;
    
    if (req.file) {
      // ✅ Purani image delete karo Cloudinary se
      const customer = await Customer.findOne({
        _id: req.params.id,
        adminId: req.user.id
      });
      if (customer?.aadhaarPublicId) {
        await cloudinary.uploader.destroy(customer.aadhaarPublicId);
      }
      update.aadhaarImage = req.file.path;
      update.aadhaarPublicId = req.file.filename;
    }

    const customer = await Customer.findOneAndUpdate(
      {_id: req.params.id, adminId:req.user.id}, update, { new: true }
    );
    res.json({ message: 'Updated', customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete customer — loans aur payments bhi delete karo
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
       adminId:req.user.id}); // only our
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

     // ✅ Cloudinary se image delete karo
    if (customer.aadhaarPublicId) {
      await cloudinary.uploader.destroy(customer.aadhaarPublicId);
    }

    // Customer ke sabhi loans dhundho
    const loans = await Loan.find({ customerId: req.params.id });

    // Har loan ki payments delete karo
    for (const loan of loans) {
      await Payment.deleteMany({ loanId: loan._id });
    }

    // Sabhi loans delete karo
    await Loan.deleteMany({ customerId: req.params.id });

    // Customer delete karo
    await Customer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Customer deleted ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;