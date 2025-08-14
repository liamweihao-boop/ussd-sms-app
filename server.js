// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Africa's Talking setup
const africastalking = require('africastalking')({
  username: process.env.AT_USERNAME,
  apiKey: process.env.AT_API_KEY,
});
const sms = africastalking.SMS;

// Health check
app.get('/', (_req, res) => res.send('FredTiger USSD Server is running'));

// USSD endpoint
app.post('/ussd', async (req, res) => {
  const { phoneNumber, text } = req.body;

  // USSD menu navigation
  if (!text || text.trim() === '') {
    // First screen
    res.type('text/plain');
    res.send(
      "CON Welcome to FredTiger Services\n" +
      "1. Accept\n" +
      "2. Exit"
    );
  } else if (text === '1') {
    // User accepted → Send SMS
    try {
      await sms.send({
        to: [phoneNumber],
        message: `Hello from FredTiger! 🎉\nHere’s your access link: ${process.env.WEBSITE_URL}\n\nInstructions:\nClick the link to visit our platform.\nPlease keep this link safe and do not share it.`,
        // If you have a sender ID approved by Africa's Talking, you can set it:
        // from: 'FredTiger'
      });
    } catch (err) {
      console.error('SMS error:', err);
    }

    // Congratulations message
    res.type('text/plain');
    res.send("END 🎉 Congratulations! You have received your link via SMS.");
  } else if (text === '2') {
    // User declined
    res.type('text/plain');
    res.send("END You have declined. No link will be sent. Goodbye!");
  } else {
    // Invalid input
    res.type('text/plain');
    res.send("CON Invalid choice. Please try again:\n1. Accept\n2. Exit");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
