const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Configure sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Path to your JSON file
const dataFilePath = path.join(__dirname, 'data', 'users.json');

// Function to read JSON data
const readData = () => {
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

// Function to write JSON data
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to handle user signup
app.post('/signup', async (req, res) => {
  const data = readData();
  const { name, email, password, year } = req.body;

  if (data.some(user => user.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const firstName = name.split(' ')[0]; // Extract first name

  // Hash the email and password
  const hashedEmail = await bcrypt.hash(email, 10);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: data.length ? data[data.length - 1].id + 1 : 1,
    name,
    email: hashedEmail,
    password: hashedPassword,
    firstName, // Add first name
    year, // Add year
    classes: [],
    partnerStatus: [],
    academicInfo: "",
    personalInfo: ""
  };

  data.push(newUser);
  writeData(data);
  req.session.user = { ...newUser, email }; // Store the original email in session
  res.json(newUser);
});

// Endpoint to handle user login
app.post('/login', async (req, res) => {
  const data = readData();
  const { email, password } = req.body;

  const user = data.find(user => bcrypt.compareSync(email, user.email) && bcrypt.compareSync(password, user.password));

  if (user) {
    req.session.user = { ...user, email }; // Store the original email in session
    res.json(user);
  } else {
    res.status(400).json({ message: 'Invalid email or password' });
  }
});

// Endpoint to get user data by ID
app.get('/user/:id', (req, res) => {
  const data = readData();
  const userId = parseInt(req.params.id);
  const user = data.find(user => user.id === userId);

  if (user) {
    // Return the original email if the user is logged in
    if (req.session.user && req.session.user.id === userId) {
      user.email = req.session.user.email;
    }
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Endpoint to handle additional information update
app.patch('/user/:id', (req, res) => {
  const data = readData();
  const userId = parseInt(req.params.id);
  const { classes, partnerStatus, academicInfo, personalInfo } = req.body;

  const user = data.find(user => user.id === userId);
  if (user) {
    user.classes = Array.isArray(classes) ? classes : classes.split(',').map(cls => cls.trim());
    user.partnerStatus = Array.isArray(partnerStatus) ? partnerStatus : partnerStatus.split(',').map(status => status.trim());
    user.academicInfo = academicInfo;
    user.personalInfo = personalInfo;
    writeData(data);
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.get('/users', (req, res) => {
  const data = readData();
  res.json(data);
});

// Add this endpoint to handle sending emails
app.post('/send-email', (req, res) => {
    const { recipientEmail, message } = req.body;

    // Configure your email transport using your preferred email service
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'studdies56@gmail.com',
            pass: 'studdies@2024'
        }
    });

    const mailOptions = {
        from: 'studdies56@gmail.com',
        // to: recipientEmail,
        to: 'aryangul@stanford.edu',
        subject: 'Group Request',
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false });
        }
        res.status(200).json({ success: true });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
