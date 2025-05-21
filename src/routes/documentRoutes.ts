
// src/routes/documentRoutes.ts
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import Document from '../models/Document';
import { auth, checkRole } from '../middleware/auth';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  // Allow only pdf, jpg, jpeg, png
  const allowedFileTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only .jpeg, .jpg, .png, and .pdf files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

// Upload document
router.post(
  '/upload',
  auth,
  upload.single('file'),
  [
    body('documentType').not().isEmpty().withMessage('Document type is required'),
    body('documentName').not().isEmpty().withMessage('Document name is required'),
    body('application').optional(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const { documentType, documentName, application } = req.body;

      const document = new Document({
        student: req.user.id,
        documentType,
        documentName,
        filePath: req.file.path,
        application: application || null,
      });

      await document.save();
      res.status(201).json(document);
    } catch (error) {
      // Delete uploaded file if error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Upload document error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get documents by student ID
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Admin and staff can view any documents, students can only view their own
    if (req.user.role === 'student' && req.user.id !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const documents = await Document.find({ student: req.params.studentId });
    res.json(documents);
  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get documents by application ID
router.get('/application/:applicationId', auth, async (req, res) => {
  try {
    const documents = await Document.find({ application: req.params.applicationId });
    res.json(documents);
  } catch (error) {
    console.error('Get application documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify document (admin/staff only)
router.put(
  '/verify/:id',
  auth,
  checkRole(['admin', 'staff']),
  [
    body('status').isIn(['Pending', 'Approved', 'Rejected']).withMessage('Invalid status'),
    body('remarks').optional(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status, remarks } = req.body;
      
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Update document verification
      document.status = status;
      document.verified = status === 'Approved';
      document.verifiedBy = req.user.id;
      document.verificationDate = new Date();
      if (remarks) document.remarks = remarks;
      
      await document.save();
      res.json(document);
    } catch (error) {
      console.error('Verify document error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Admin can delete any document, students can only delete their own
    if (req.user.role === 'student' && document.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    await document.deleteOne();
    res.json({ message: 'Document removed' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
