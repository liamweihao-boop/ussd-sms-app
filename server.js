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

// Health check route (optional)
app.get('/', (_req, res) => res.send('USSD Server is running'));

// USSD endpoint
app.post('/ussd', async (req, res) => {
  const { phoneNumber, text } = req.body;

  if (!text || text.trim() === '') {
    // Send the SMS with the link
    sms.send({
      to: [phoneNumber],
      message: `Here’s your link: ${process.env.WEBSITE_URL}`,
    }).catch(err => {
      console.error('SMS error:', err);
    });

    // First screen
    res.type('text/plain');
    res.send("CON Thanks! We will nooooooooooo.");
  } else {
    // End the USSD session
    res.type('text/plain');
    res.send("END Check your SMS for the link. Goodbye!");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
