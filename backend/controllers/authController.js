const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const COOKIE_NAME = 'adminToken';

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: 1000 * 60 * 60 * 24
});

const signToken = (admin) =>
  jwt.sign(
    {
      adminId: admin._id,
      role: admin.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

const sanitizeAdmin = (admin) => ({
  id: admin._id,
  email: admin.email,
  role: admin.role
});

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(admin);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({
      success: true,
      admin: sanitizeAdmin(admin)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while logging in' });
  }
};

const logoutAdmin = async (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });

  res.json({ success: true, message: 'Logged out successfully' });
};

const getCurrentAdmin = async (req, res) => {
  res.json({
    success: true,
    admin: sanitizeAdmin(req.admin)
  });
};

const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.trim().length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(409).json({ message: 'An admin with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const admin = await Admin.create({
      email: normalizedEmail,
      passwordHash,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: sanitizeAdmin(admin)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating admin' });
  }
};

const listAdmins = async (_req, res) => {
  try {
    const admins = await Admin.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      admins: admins.map(sanitizeAdmin)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching admins' });
  }
};

const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.trim().length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.passwordHash = await bcrypt.hash(password.trim(), 10);
    await admin.save();

    res.json({
      success: true,
      message: `Password updated for ${admin.email}`,
      admin: sanitizeAdmin(admin)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating password' });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.admin && String(req.admin._id) === id) {
      return res.status(400).json({ message: 'You cannot delete your own active admin account' });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      success: true,
      message: `Admin ${deletedAdmin.email} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting admin' });
  }
};

const ensureBootstrapAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD missing');
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingAdmin = await Admin.findOne({ email: normalizedEmail });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({
    email: normalizedEmail,
    passwordHash,
    role: 'admin'
  });

  console.log(`Bootstrap admin created for ${normalizedEmail}`);
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  createAdmin,
  listAdmins,
  updateAdminPassword,
  deleteAdmin,
  ensureBootstrapAdmin
};
