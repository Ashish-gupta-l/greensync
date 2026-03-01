require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
const connectDB = require('./config/db');

const hashPwd = async (pwd) => bcrypt.hash(pwd, await bcrypt.genSalt(10));

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Subject.deleteMany({});
  await Assignment.deleteMany({});

  console.log('🌱 Seeding database...');

  // Create Admin (use create() so pre-save hook runs, or hash manually)
  await User.create({
    name: 'Admin User',
    email: 'admin@greensync.com',
    password: await hashPwd('admin123'),
    role: 'admin',
  });

  // Create Teachers (hash manually since insertMany skips pre-save hooks in Mongoose 9)
  const teachers = await User.insertMany([
    { name: 'Dr. Priya Sharma', email: 'priya@greensync.com', password: await hashPwd('teacher123'), role: 'teacher', department: 'Computer Science' },
    { name: 'Prof. Raj Kumar', email: 'raj@greensync.com', password: await hashPwd('teacher123'), role: 'teacher', department: 'Mathematics' },
    { name: 'Ms. Anita Desai', email: 'anita@greensync.com', password: await hashPwd('teacher123'), role: 'teacher', department: 'Physics' },
  ]);

  // Create Students
  const students = await User.insertMany([
    { name: 'Amit Gupta', email: 'amit@greensync.com', password: await hashPwd('student123'), role: 'student', rollNumber: 'CS001', department: 'Computer Science' },
    { name: 'Priya Singh', email: 'priya.s@greensync.com', password: await hashPwd('student123'), role: 'student', rollNumber: 'CS002', department: 'Computer Science' },
    { name: 'Rahul Verma', email: 'rahul@greensync.com', password: await hashPwd('student123'), role: 'student', rollNumber: 'CS003', department: 'Computer Science' },
    { name: 'Neha Patel', email: 'neha@greensync.com', password: await hashPwd('student123'), role: 'student', rollNumber: 'MT001', department: 'Mathematics' },
    { name: 'Arjun Mehta', email: 'arjun@greensync.com', password: await hashPwd('student123'), role: 'student', rollNumber: 'MT002', department: 'Mathematics' },
  ]);

  // Create Subjects
  const subjects = await Subject.insertMany([
    { name: 'Data Structures & Algorithms', code: 'CS301', description: 'Fundamental data structures and algorithmic techniques', colorIndex: 0, teacher: teachers[0]._id, students: [students[0]._id, students[1]._id, students[2]._id] },
    { name: 'Linear Algebra', code: 'MT201', description: 'Vectors, matrices, and linear transformations', colorIndex: 2, teacher: teachers[1]._id, students: [students[3]._id, students[4]._id] },
    { name: 'Web Development', code: 'CS402', description: 'Full-stack web development with modern frameworks', colorIndex: 1, teacher: teachers[0]._id, students: [students[0]._id, students[1]._id] },
    { name: 'Quantum Physics', code: 'PH301', description: 'Introduction to quantum mechanics', colorIndex: 4, teacher: teachers[2]._id, students: [students[2]._id, students[3]._id] },
    { name: 'Operating Systems', code: 'CS303', description: 'Process management, memory, and file systems', colorIndex: 3, teacher: teachers[0]._id, students: [students[0]._id, students[2]._id] },
  ]);

  // Update user subjects arrays
  for (const sub of subjects) {
    if (sub.teacher) {
      await User.findByIdAndUpdate(sub.teacher, { $addToSet: { subjects: sub._id } });
    }
    for (const sid of sub.students) {
      await User.findByIdAndUpdate(sid, { $addToSet: { subjects: sub._id } });
    }
  }

  // Create Assignments
  const future1 = new Date(); future1.setDate(future1.getDate() + 7);
  const future2 = new Date(); future2.setDate(future2.getDate() + 14);
  const past1 = new Date(); past1.setDate(past1.getDate() - 3);

  await Assignment.insertMany([
    { title: 'Sorting Algorithms Report', description: 'Write a detailed report comparing QuickSort, MergeSort, and HeapSort.', subject: subjects[0]._id, createdBy: teachers[0]._id, deadline: future1, maxMarks: 50 },
    { title: 'Graph Traversal Implementation', description: 'Implement BFS and DFS with visualizations.', subject: subjects[0]._id, createdBy: teachers[0]._id, deadline: future2, maxMarks: 100 },
    { title: 'Matrix Operations Assignment', description: 'Solve the given matrix problems using Gaussian elimination.', subject: subjects[1]._id, createdBy: teachers[1]._id, deadline: future1, maxMarks: 75 },
    { title: 'React Portfolio Project', description: 'Build a personal portfolio website using React and Tailwind CSS.', subject: subjects[2]._id, createdBy: teachers[0]._id, deadline: past1, maxMarks: 100 },
    { title: 'Wave-Particle Duality Essay', description: 'Explain the wave-particle duality concept with examples.', subject: subjects[3]._id, createdBy: teachers[2]._id, deadline: future2, maxMarks: 60 },
  ]);

  console.log('✅ Seed complete!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin:   admin@greensync.com     / admin123');
  console.log('Teacher: priya@greensync.com     / teacher123');
  console.log('Teacher: raj@greensync.com       / teacher123');
  console.log('Student: amit@greensync.com      / student123');
  console.log('Student: priya.s@greensync.com   / student123');

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
