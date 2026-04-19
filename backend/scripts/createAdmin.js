require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const [, , emailArg, passwordArg] = process.argv;

const printUsageAndExit = (message) => {
  if (message) {
    console.error(message);
  }
  console.log('Usage: node scripts/createAdmin.js <email> <password>');
  process.exit(1);
};

const createAdmin = async () => {
  if (!emailArg || !passwordArg) {
    printUsageAndExit('Email and password are required.');
  }

  const email = emailArg.toLowerCase().trim();
  const password = passwordArg.trim();

  if (password.length < 8) {
    printUsageAndExit('Password must be at least 8 characters long.');
  }

  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      printUsageAndExit(`Admin with email ${email} already exists.`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({
      email,
      passwordHash,
      role: 'admin'
    });

    console.log(`Admin created successfully for ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
