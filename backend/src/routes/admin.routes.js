import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middlewares/authmiddleware.js';

const router = express.Router();

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.userId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking admin status'
    });
  }
};

/**
 * @route   GET /admin/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/users', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    
    res.json({
      success: true,
      data: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        userId: user.userId,
        role: user.role,
        emailVerified: user.emailVerified,
        files: user.files || [],
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /admin/users/:userId
 * @desc    Delete a user (admin only)
 * @access  Private (Admin)
 */
router.delete('/users/:userId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    const currentAdmin = await User.findOne({ userId: req.userId });
    if (currentAdmin._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: deletedUser.username
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

/**
 * @route   GET /admin/stats
 * @desc    Get system statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    const totalFiles = await User.aggregate([
      { $group: { _id: null, count: { $sum: { $size: '$files' } } } }
    ]);

    const stats = {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      totalFiles: totalFiles[0]?.count || 0
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * @route   POST /admin/reports/send
 * @desc    Send reports to users (admin only)
 * @access  Private (Admin)
 */
router.post('/reports/send', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const { reportType, recipients } = req.body;

    if (!reportType || !recipients) {
      return res.status(400).json({
        success: false,
        message: 'reportType and recipients are required'
      });
    }

    // This would integrate with the report controller
    res.json({
      success: true,
      message: 'Report send triggered',
      reportType,
      recipients: recipients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send reports',
      error: error.message
    });
  }
});

export default router;
