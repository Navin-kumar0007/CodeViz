const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const instructors = await User.countDocuments({ role: 'instructor' });
        const admins = await User.countDocuments({ role: 'admin' });
        const totalClassrooms = await Classroom.countDocuments();
        const suspendedUsers = await User.countDocuments({ isActive: false });

        // Users registered today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

        res.json({
            totalUsers,
            students,
            instructors,
            admins,
            totalClassrooms,
            newUsersToday,
            suspendedUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    List all users with pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select('name email role isActive lastLogin createdAt')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Prevent self-demotion
        if (req.params.id === req.user._id.toString() && role !== 'admin') {
            return res.status(400).json({ message: 'Cannot demote yourself' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('name email role isActive');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: `${user.name} is now ${role}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Toggle user suspension status
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { isActive } = req.body;

        // Prevent self-suspension
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot suspend yourself' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('name email role isActive');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const status = isActive ? 'activated' : 'suspended';
        res.json({ message: `${user.name}'s account ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: `User ${user.name} deleted` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// NOTE: Public promote endpoint REMOVED for security
// Admin must use the protected /users/:id/role endpoint

module.exports = router;
