const Notification = require('../models/Notification');

/**
 * Get all notifications with optional filters
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.trackingNumber) filter.trackingNumber = req.query.trackingNumber;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    return res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
