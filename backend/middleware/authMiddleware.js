const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role hierarchy — higher ranks include the powers of lower ones.
const ROLE_RANK = { student: 1, instructor: 2, admin: 3 };
const rankOf = (role) => ROLE_RANK[role] || 0;

// requireRole('instructor') — passes for that role AND anything above it.
// So an admin satisfies instructorOnly (fixes the "admin blocked" bug).
const requireRole = (minRole) => (req, res, next) => {
    if (req.user && rankOf(req.user.role) >= rankOf(minRole)) return next();
    res.status(403).json({ message: `Not authorized — ${minRole} access required` });
};

const instructorOnly = requireRole('instructor'); // admin also passes
const adminOnly = requireRole('admin');

module.exports = { protect, requireRole, instructorOnly, adminOnly, ROLE_RANK };
