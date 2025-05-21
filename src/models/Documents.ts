// src/models/Document.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  student: mongoose.Types.ObjectId;
  application?: mongoose.Types.ObjectId;
  documentType: 
    | 'Photo' 
    | 'ID Proof' 
    | 'Address Proof' 
    | 'Birth Certificate' 
    | 'High School Certificate' 
    | 'High School Transcripts' 
    | 'Undergraduate Certificate' 
    | 'Undergraduate Transcripts' 
    | 'Postgraduate Certificate' 
    | 'Postgraduate Transcripts' 
    | 'Entrance Exam Score' 
    | 'Recommendation Letter' 
    | 'Statement of Purpose' 
    | 'Other';
  documentName: string;
  filePath: string;
  uploadDate: Date;
  verified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    documentType: {
      type: String,
      enum: [
        'Photo',
        'ID Proof',
        'Address Proof',
        'Birth Certificate',
        'High School Certificate',
        'High School Transcripts',
        'Undergraduate Certificate',
        'Undergraduate Transcripts',
        'Postgraduate Certificate',
        'Postgraduate Transcripts',
        'Entrance Exam Score',
        'Recommendation Letter',
        'Statement of Purpose',
        'Other',
      ],
      required: true,
    },
    documentName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);