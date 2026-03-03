const Room = require('../models/Room');

/**
 * Room Controller
 * REST endpoints for creating and joining collaboration rooms
 */

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Protected
const createRoom = async (req, res) => {
    try {
        const { name, language, isPublic, mode } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ message: 'Room name is required' });
        }

        const roomCode = await Room.generateCode();

        const room = await Room.create({
            roomCode,
            name: name.trim(),
            host: req.user._id,
            participants: [req.user._id],
            language: language || 'python',
            isPublic: isPublic !== false,
            mode: mode || 'collaborate'
        });

        const populated = await Room.findById(room._id)
            .populate('host', 'name')
            .populate('participants', 'name');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Failed to create room' });
    }
};

// @desc    Join a room by code
// @route   POST /api/rooms/join
// @access  Protected
const joinRoom = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code?.trim()) {
            return res.status(400).json({ message: 'Room code is required' });
        }

        const room = await Room.findOne({
            roomCode: code.toUpperCase(),
            isActive: true
        }).populate('host', 'name').populate('participants', 'name');

        if (!room) {
            return res.status(404).json({ message: 'Room not found or expired' });
        }

        // Check capacity
        if (room.participants.length >= room.maxParticipants &&
            !room.participants.some(p => p._id.toString() === req.user._id.toString())) {
            return res.status(400).json({ message: 'Room is full' });
        }

        // Add participant if not already in
        if (!room.participants.some(p => p._id.toString() === req.user._id.toString())) {
            room.participants.push(req.user._id);
            await room.save();
        }

        const populated = await Room.findById(room._id)
            .populate('host', 'name')
            .populate('participants', 'name');

        res.json(populated);
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ message: 'Failed to join room' });
    }
};

// @desc    Get active public rooms
// @route   GET /api/rooms/active
// @access  Protected
const getActiveRooms = async (req, res) => {
    try {
        const rooms = await Room.find({
            isActive: true,
            isPublic: true
        })
            .populate('host', 'name')
            .populate('participants', 'name')
            .select('roomCode name host participants language maxParticipants mode createdAt')
            .sort('-createdAt')
            .limit(20);

        res.json(rooms);
    } catch (error) {
        console.error('Get active rooms error:', error);
        res.status(500).json({ message: 'Failed to get rooms' });
    }
};

module.exports = { createRoom, joinRoom, getActiveRooms };
