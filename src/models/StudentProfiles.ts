// src/models/StudentProfile.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    nationality: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
  };
  educationalBackground: {
    highSchoolName: string;
    highSchoolGrade: number;
    highSchoolGraduationYear: number;
    previousInstitution?: string;
    previousQualification?: string;
    previousGrade?: number;
    previousGraduationYear?: number;
  };
  documents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      gender: { type: String, required: true },
      nationality: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    educationalBackground: {
      highSchoolName: { type: String, required: true },
      highSchoolGrade: { type: Number, required: true },
      highSchoolGraduationYear: { type: Number, required: true },
      previousInstitution: { type: String },
      previousQualification: { type: String },
      previousGrade: { type: Number },
      previousGraduationYear: { type: Number },
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);