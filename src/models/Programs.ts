// src/models/Program.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProgram extends Document {
  name: string;
  description: string;
  programType: 'BTech' | 'MTech' | 'PhD' | 'Diploma';
  department: string;
  duration: number; // in years
  seats: number;
  applicationFee: number;
  tuitionFee: number;
  eligibility: string;
  applicationDeadline: Date;
  startDate: Date;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    programType: {
      type: String,
      enum: ['BTech', 'MTech', 'PhD', 'Diploma'],
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    applicationFee: {
      type: Number,
      required: true,
    },
    tuitionFee: {
      type: Number,
      required: true,
    },
    eligibility: {
      type: String,
      required: true,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProgram>('Program', ProgramSchema);