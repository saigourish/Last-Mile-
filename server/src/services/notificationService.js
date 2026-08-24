const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

let mailTransporter = null;

const initMailer = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('📧 SMTP Mailer configured.');
    } catch (e) {
      console.warn('⚠️ SMTP init error, falling back to simulated mailer:', e.message);
    }
  }
};

initMailer();

/**
 * Multi-channel notification dispatcher
 */
const sendNotification = async ({
  orderId = null,
  trackingNumber = '',
  recipient = { name: 'Customer', email: '', phone: '' },
  event,
  subject,
  message,
  type = 'EMAIL',
  metadata = {},
  io = null,
}) => {
  try {
    // 1. Create DB log
    const notification = await Notification.create({
      order: orderId,
      trackingNumber,
      recipient,
      type,
      event,
      subject,
      message,
      status: 'SENT',
      metadata,
    });

    console.log(`\n================== 🔔 [GOURISH NOTIFICATION: ${type}] ==================`);
    console.log(`To: ${recipient.name} <${recipient.email || recipient.phone}>`);
    console.log(`Event: [${event}] - Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`=========================================================================\n`);

    // 2. Real SMTP delivery if configured
    if (type === 'EMAIL' && mailTransporter && recipient.email) {
      try {
        await mailTransporter.sendMail({
          from: process.env.NOTIFICATION_SENDER || 'no-reply@gourish-logistics.com',
          to: recipient.email,
          subject: `[Gourish Logistics] ${subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5; margin-top: 0;">Gourish Logistics Network</h2>
              <p>Hello <strong>${recipient.name}</strong>,</p>
              <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0;">
                <p style="margin: 0; font-size: 16px;"><strong>${subject}</strong></p>
                <p style="margin: 10px 0 0 0; color: #475569;">${message}</p>
              </div>
              ${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8;">This is an automated notification from Gourish Smart Delivery System.</p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.warn('⚠️ SMTP send error:', mailErr.message);
      }
    }

    // 3. Broadcast real-time in-app notification via Socket.IO
    if (io) {
      io.emit('new_notification', {
        _id: notification._id,
        trackingNumber,
        event,
        subject,
        message,
        type,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    console.error('Error dispatching notification:', err);
    return null;
  }
};

module.exports = {
  sendNotification,
};
