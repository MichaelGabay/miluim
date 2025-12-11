import express from 'express';
import Business from '../models/Business.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all businesses (public)
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single business (public)
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create business (public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, fieldOfWork, city, notes } = req.body;
    
    if (!name || !phone || !fieldOfWork) {
      return res.status(400).json({ error: 'Name, phone, and field of work are required' });
    }

    const business = new Business({
      name,
      phone,
      fieldOfWork,
      city: city || '',
      notes: notes || ''
    });

    const savedBusiness = await business.save();
    res.status(201).json(savedBusiness);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update business (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, phone, fieldOfWork, city, notes } = req.body;
    
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    business.name = name || business.name;
    business.phone = phone || business.phone;
    business.fieldOfWork = fieldOfWork || business.fieldOfWork;
    business.city = city !== undefined ? city : business.city;
    business.notes = notes !== undefined ? notes : business.notes;

    const updatedBusiness = await business.save();
    res.json(updatedBusiness);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE business (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

