const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  createAdmin,
  listAdmins,
  updateAdminPassword,
  deleteAdmin
} = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', requireAuth, requireRole('admin'), getCurrentAdmin);
router.get('/admins', requireAuth, requireRole('admin'), listAdmins);
router.post('/admins', requireAuth, requireRole('admin'), createAdmin);
router.patch('/admins/:id/password', requireAuth, requireRole('admin'), updateAdminPassword);
router.delete('/admins/:id', requireAuth, requireRole('admin'), deleteAdmin);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed` 
  }),
  (req, res) => {
    // Generate JWT token on successful login
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    // Redirect instantly back to the frontend with the token securely loaded
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-success?token=${token}`);
  }
);

module.exports = router;
