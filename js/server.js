const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abdullaevughur@gmail.com', // your email
        pass: 'uqtl vxsr wwzj obtc'     // app password, not your main password
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await transporter.sendMail({
            from: email,
            to: 'destination.email@example.com', // recipient email
            subject: 'Contact Form Message',
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(3000, () => console.log('Server running'));