
// src/routes/userRoutes.ts
import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, checkRole(['admin', 'staff']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Only allow admin, staff, or the user themselves to access
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put(
  '/:id',
  auth,
  [
    body('name').optional().not().isEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only allow admin or the user themselves to update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    try {
      const { name, email } = req.body;
      const updateData: any = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      // Only admin can update role
      if (req.user.role === 'admin' && req.body.role) {
        updateData.role = req.body.role;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Create student profile
router.post(
  '/profile',
  auth,
  checkRole(['student']),
  [
    body('personalInfo.firstName').not().isEmpty().withMessage('First name is required'),
    body('personalInfo.lastName').not().isEmpty().withMessage('Last name is required'),
    body('personalInfo.dateOfBirth').isISO8601().withMessage('Invalid date format'),
    body('personalInfo.gender').not().isEmpty().withMessage('Gender is required'),
    body('personalInfo.phoneNumber').not().isEmpty().withMessage('Phone number is required'),
    // Add more validations as needed
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if profile already exists
      let profile = await StudentProfile.findOne({ user: req.user.id });
      
      if (profile) {
        return res.status(400).json({ message: 'Profile already exists' });
      }

      // Create new profile
      profile = new StudentProfile({
        user: req.user.id,
        personalInfo: req.body.personalInfo,
        educationalBackground: req.body.educationalBackground,
      });

      await profile.save();
      res.status(201).json(profile);
    } catch (error) {
      console.error('Create profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get student profile
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    // Admin and staff can view any profile, students can only view their own
    if (req.user.role === 'student' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const profile = await StudentProfile.findOne({ user: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile
router.put('/profile/:userId', auth, async (req, res) => {
  try {
    // Only admin or the user themselves can update the profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { personalInfo, educationalBackground } = req.body;
    const updateData: any = {};
    
    if (personalInfo) updateData.personalInfo = personalInfo;
    if (educationalBackground) updateData.educationalBackground = educationalBackground;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.params.userId },
      { $set: updateData },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;