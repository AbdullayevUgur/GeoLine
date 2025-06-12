const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.abdullaevughur@gmail.com,
        pass: process.env.uqtl vxsr wwzj obtc
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'All fields required' });
    }
    try {
        await transporter.sendMail({
            from: email,
            to: process.env.abdullaevugur8@gmail.com,gi
            subject: 'Contact Form Message',
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

app.listen(3000, () => console.log('Server running'));