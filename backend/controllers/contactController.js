const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    // Save to database
    const contactMessage = await ContactMessage.create({ name, email, message });

    // Send email to support using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL_USER,
        pass: process.env.CONTACT_EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.CONTACT_EMAIL_USER,
      to: process.env.CONTACT_EMAIL_TO,
      subject: 'New Contact Message from ReOwnold',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<h3>New Contact Message</h3><p><b>Name:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Message:</b><br/>${message}</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      // Log but don't fail the request if email fails
      console.error('Failed to send contact email:', emailErr);
    }

    res.status(201).json({ success: true, message: 'Message received. Thank you!', data: contactMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { submitContactMessage }; 