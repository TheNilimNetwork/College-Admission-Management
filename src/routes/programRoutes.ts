
// src/routes/programRoutes.ts
import express from 'express';
import { body, validationResult } from 'express-validator';
import Program from '../models/Program';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Get all programs
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find({ status: 'Active' });
    res.json(programs);
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all programs (including inactive) - admin only
router.get('/all', auth, checkRole(['admin', 'staff']), async (req, res) => {
  try {
    const programs = await Program.find();
    res.json(programs);
  } catch (error) {
    console.error('Get all programs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get program by ID
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.json(program);
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create program (admin only)
router.post(
  '/',
  auth,
  checkRole(['admin']),
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('programType').isIn(['BTech', 'MTech', 'PhD', 'Diploma']).withMessage('Invalid program type'),
    body('department').not().isEmpty().withMessage('Department is required'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('seats').isNumeric().withMessage('Seats must be a number'),
    body('applicationFee').isNumeric().withMessage('Application fee must be a number'),
    body('tuitionFee').isNumeric().withMessage('Tuition fee must be a number'),
    body('eligibility').not().isEmpty().withMessage('Eligibility is required'),
    body('applicationDeadline').isISO8601().withMessage('Invalid date format'),
    body('startDate').isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        description,
        programType,
        department,
        duration,
        seats,
        applicationFee,
        tuitionFee,
        eligibility,
        applicationDeadline,
        startDate,
        status,
      } = req.body;

      const program = new Program({
        name,
        description,
        programType,
        department,
        duration,
        seats,
        
// Continuing from where we left off in program routes
applicationFee,
tuitionFee,
eligibility,
applicationDeadline,
startDate,
status: status || 'Active',
});

await program.save();
res.status(201).json(program);
} catch (error) {
console.error('Create program error:', error);
res.status(500).json({ message: 'Server error' });
}
}
);

// Update program (admin only)
router.put(
'/:id',
auth,
checkRole(['admin']),
async (req, res) => {
try {
const program = await Program.findByIdAndUpdate(
req.params.id,
{ $set: req.body },
{ new: true }
);

if (!program) {
return res.status(404).json({ message: 'Program not found' });
}

res.json(program);
} catch (error) {
console.error('Update program error:', error);
res.status(500).json({ message: 'Server error' });
}
}
);

// Delete program (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
try {
const program = await Program.findById(req.params.id);

if (!program) {
return res.status(404).json({ message: 'Program not found' });
}

await program.deleteOne();
res.json({ message: 'Program removed' });
} catch (error) {
console.error('Delete program error:', error);
res.status(500).json({ message: 'Server error' });
}
});

export default router;