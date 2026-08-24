const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gourish_quantum_super_secure_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone, companyName, address } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      companyName,
      address,
    });

    // If registered as agent, create an agent profile automatically
    if (role === 'agent') {
      await Agent.create({
        user: user._id,
        name: user.name,
        phone: user.phone || '9876543210',
        currentLocation: {
          city: 'Bengaluru',
          area: 'Koramangala',
          coordinates: { lat: 12.9352, lng: 77.6245 },
        },
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    let agentProfile = null;
    if (user.role === 'agent') {
      agentProfile = await Agent.findOne({ user: user._id });
    }

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        agentProfileId: agentProfile ? agentProfile._id : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let agentProfile = null;
    if (user.role === 'agent') {
      agentProfile = await Agent.findOne({ user: user._id });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        address: user.address,
        agentProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Quick Persona Login for Demo & Testing
 * POST /api/auth/quick-persona
 */
const quickPersonaLogin = async (req, res) => {
  try {
    const { persona } = req.body; // 'admin', 'agent', 'customer'
    let targetEmail = 'admin@gourish.logistics';

    if (persona === 'agent') {
      targetEmail = 'rahul.agent@gourish.logistics';
    } else if (persona === 'customer') {
      targetEmail = 'priya.customer@gourish.logistics';
    }

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = await User.findOne({ role: persona });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: `Persona ${persona} not found in database. Please run seed script.` });
    }

    const token = generateToken(user._id);
    let agentProfile = null;
    if (user.role === 'agent') {
      agentProfile = await Agent.findOne({ user: user._id });
    }

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        agentProfileId: agentProfile ? agentProfile._id : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  quickPersonaLogin,
};
