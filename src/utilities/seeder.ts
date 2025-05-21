
// src/utils/seeder.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Program from '../models/Program';

// Initialize dotenv
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-admission-system')
  .then(() => {
    console.log('Connected to MongoDB');
    seedData();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    verified: true,
  },
  {
    name: 'Staff User',
    email: 'staff@college.edu',
    password: 'staff123',
    role: 'staff',
    verified: true,
  },
  {
    name: 'Test Student',
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
    verified: true,
  },
];

const programs = [
  {
    name: 'Computer Science Engineering',
    description: 'B.Tech program in Computer Science Engineering focuses on the theoretical and practical aspects of computer science and its applications.',
    programType: 'BTech',
    department: 'Computer Science',
    duration: 4,
    seats: 120,
    applicationFee: 1000,
    tuitionFee: 125000,
    eligibility: 'Minimum 60% in 10+2 with PCM',
    applicationDeadline: new Date('2025-06-30'),
    startDate: new Date('2025-08-01'),
    status: 'Active',
  },
  {
    name: 'Electrical Engineering',
    description: 'B.Tech program in Electrical Engineering covers the study of electricity, electronics, and electromagnetism.',
    programType: 'BTech',
    department: 'Electrical Engineering',
    duration: 4,
    seats: 100,
    applicationFee: 1000,
    tuitionFee: 120000,
    eligibility: 'Minimum 60% in 10+2 with PCM',
    applicationDeadline: new Date('2025-06-30'),
    startDate: new Date('2025-08-01'),
    status: 'Active',
  },
  {
    name: 'Machine Learning & AI',
    description: 'M.Tech program in Machine Learning & AI focuses on advanced concepts and applications of artificial intelligence.',
    programType: 'MTech',
    department: 'Computer Science',
    duration: 2,
    seats: 60,
    applicationFee: 1500,
    tuitionFee: 150000,
    eligibility: 'B.Tech in CSE/IT/ECE with minimum 60%',
    applicationDeadline: new Date('2025-06-15'),
    startDate: new Date('2025-08-01'),
    status: 'Active',
  },
  {
    name: 'Computer Science PhD',
    description: 'Doctoral program in Computer Science for advanced research and academic excellence.',
    programType: 'PhD',
    department: 'Computer Science',
    duration: 3,
    seats: 15,
    applicationFee: 2000,
    tuitionFee: 100000,
    eligibility: 'M.Tech/M.E. in related field with minimum 65%',
    applicationDeadline: new Date('2025-05-31'),
    startDate: new Date('2025-08-01'),
    status: 'Active',
  },
  {
    name: 'Information Technology',
    description: 'Diploma program in Information Technology for entry-level IT professionals.',
    programType: 'Diploma',
    department: 'Information Technology',
    duration: 3,
    seats: 80,
    applicationFee: 800,
    tuitionFee: 75000,
    eligibility: 'Minimum 55% in 10th standard',
    applicationDeadline: new Date('2025-06-30'),
    startDate: new Date('2025-08-01'),
    status: 'Active',
  },
];

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Program.deleteMany({});

    // Insert new data
    await User.insertMany(users);
    await Program.insertMany(programs);

    console.log('Data seeded successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Seeding error:', error);
    mongoose.disconnect();
  }
};