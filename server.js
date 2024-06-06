const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

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
app.post('/signup', (req, res) => {
  const data = readData();
  const { name, email, password, year } = req.body;

  if (data.some(user => user.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const firstName = name.split(' ')[0]; // Extract first name

  const newUser = {
    id: data.length ? data[data.length - 1].id + 1 : 1,
    name,
    email,
    password, // Note: In a real application, passwords should be hashed
    firstName, // Add first name
    year, // Add year
    classes: [],
    partnerStatus: [],
    academicInfo: "",
    personalInfo: ""
  };

  data.push(newUser);
  writeData(data);
  res.json(newUser);
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

// Endpoint to handle user login
app.post('/login', (req, res) => {
  const data = readData();
  const { email, password } = req.body;

  const user = data.find(user => user.email === email && user.password === password);

  if (user) {
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
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Endpoint to handle profile update
app.put('/user/:id', (req, res) => {
  const data = readData();
  const userId = parseInt(req.params.id);
  const { name, email, classes, partnerStatus, academicInfo, personalInfo, year } = req.body;

  const user = data.find(user => user.id === userId);
  if (user) {
    user.name = name;
    user.email = email;
    user.year = year; // Ensure the year is updated
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
