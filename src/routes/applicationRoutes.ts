
// src/routes/applicationRoutes.ts
import express from 'express';
import { body, validationResult } from 'express-validator';
import Application from '../models/Application';
import Program from '../models/Program';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Get all applications (admin/staff only)
router.get('/', auth, checkRole(['admin', 'staff']), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email')
      .populate('program', 'name programType department');
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications by student ID
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Admin and staff can view any applications, students can only view their own
    if (req.user.role === 'student' && req.user.id !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ student: req.params.studentId })
      .populate('program', 'name programType department');
    
    res.json(applications);
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('program', 'name programType department')
      .populate('reviewedBy', 'name');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Admin and staff can view any application, students can only view their own
    if (req.user.role === 'student' && req.user.id !== application.student.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create application (student only)
router.post(
  '/',
  auth,
  checkRole(['student']),
  [
    body('program').not().isEmpty().withMessage('Program ID is required'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { program } = req.body;

      // Check if program exists
      const programExists = await Program.findById(program);
      if (!programExists) {
        return res.status(404).json({ message: 'Program not found' });
      }

      // Check if student already applied for this program
      const existingApplication = await Application.findOne({
        student: req.user.id,
        program,
      });

      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied for this program' });
      }

      const application = new Application({
        student: req.user.id,
        program,
        status: 'Draft',
      });

      await application.save();
      res.status(201).json(application);
    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Submit application
router.put('/submit/:id', auth, checkRole(['student']), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if the application belongs to the student
    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if the application is already submitted
    if (application.status !== 'Draft') {
      return res.status(400).json({ message: 'Application is already submitted' });
    }
    
    application.status = 'Submitted';
    application.submissionDate = new Date();
    
    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (admin/staff only)
router.put(
  '/status/:id',
  auth,
  checkRole(['admin', 'staff']),
  [
    body('status').isIn(['Under Review', 'Documents Pending', 'Rejected', 'Approved', 'Waitlisted']).withMessage('Invalid status'),
    body('reviewNotes').optional(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status, reviewNotes } = req.body;
      
      const application = await Application.findById(req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Update application
      application.status = status;
      if (reviewNotes) application.reviewNotes = reviewNotes;
      application.reviewedBy = req.user.id;
      
      // If status is final decision, set decision date
      if (['Rejected', 'Approved', 'Waitlisted'].includes(status)) {
        application.decisionDate = new Date();
      }
      
      await application.save();
      res.json(application);
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update payment status
router.put(
  '/payment/:id',
  auth,
  [
    body('paymentStatus').isIn(['Pending', 'Completed']).withMessage('Invalid payment status'),
    body('paymentDetails').optional(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { paymentStatus, paymentDetails } = req.body;
      
      const application = await Application.findById(req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Admin can update any application, students can only update their own
      if (req.user.role === 'student' && application.student.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update payment info
      application.paymentStatus = paymentStatus;
      if (paymentDetails) application.paymentDetails = paymentDetails;
      
      await application.save();
      res.json(application);
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;