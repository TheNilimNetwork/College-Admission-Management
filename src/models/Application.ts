// src/models/Application.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  student: mongoose.Types.ObjectId;
  program: mongoose.Types.ObjectId;
  applicationNumber: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Documents Pending' | 'Rejected' | 'Approved' | 'Waitlisted';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  submissionDate?: Date;
  decisionDate?: Date;
  paymentStatus: 'Pending' | 'Completed';
  paymentDetails?: {
    amount: number;
    transactionId: string;
    paymentDate: Date;
    paymentMethod: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    program: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Documents Pending', 'Rejected', 'Approved', 'Waitlisted'],
      default: 'Draft',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
    },
    submissionDate: {
      type: Date,
    },
    decisionDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    paymentDetails: {
      amount: { type: Number },
      transactionId: { type: String },
      paymentDate: { type: Date },
      paymentMethod: { type: String },
    },
  },
  { timestamps: true }
);

// Generate unique application number before saving
ApplicationSchema.pre('save', async function (next) {
  if (this.isNew) {
    const currentYear = new Date().getFullYear();
    const count = await mongoose.model('Application').countDocuments();
    this.applicationNumber = `APP-${currentYear}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);