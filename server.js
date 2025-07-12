const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;
const SECRET_KEY = '183f3fa477eac939b97f87d995f4671580a0564993537aea2d0277eab05c4f03'; // Replace with a secure key in production

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data file paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const REQUESTS_FILE = path.join(__dirname, 'data', 'requests.json');
const NOTIFICATIONS_FILE = path.join(__dirname, 'data', 'notifications.json');

// Ensure data directory exists
async function initializeDataFiles() {
  await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([]));
  }
  try {
    await fs.access(REQUESTS_FILE);
  } catch {
    await fs.writeFile(REQUESTS_FILE, JSON.stringify([]));
  }
  try {
    await fs.access(NOTIFICATIONS_FILE);
  } catch {
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify([]));
  }
}

// Middleware to verify JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const users = JSON.parse(await fs.readFile(USERS_FILE));
    const user = users.find(u => u.id === decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Helper function to save data
async function saveData(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, location } = req.body;
  if (!name || !email || !password || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE));
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      location,
      profilePhoto: name.charAt(0).toUpperCase(), // Default to first letter
      skillsOffered: [],
      skillsWanted: [],
      availability: 'weekends',
      profileVisibility: 'public',
      bio: '',
      rating: 0,
      totalSwaps: 0,
      responseTime: 'within a day'
    };

    users.push(user);
    await saveData(USERS_FILE, users);

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE));
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.get('/api/users', authenticateToken, async (req, res) => {
  const { page = 1, limit = 4, search = '', availability = 'all' } = req.query;
  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE));
    let filteredUsers = users.filter(u => u.profileVisibility === 'public' && u.id !== req.user.id);

    if (search) {
      filteredUsers = filteredUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.skillsOffered.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        u.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (availability !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.availability === availability);
    }

    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + parseInt(limit));
    res.json({ users: paginatedUsers });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  res.json(req.user);
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, location, skillsOffered, skillsWanted, availability, profileVisibility, bio } = req.body;
  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE));
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      location: location || users[userIndex].location,
      skillsOffered: skillsOffered || users[userIndex].skillsOffered,
      skillsWanted: skillsWanted || users[userIndex].skillsWanted,
      availability: availability || users[userIndex].availability,
      profileVisibility: profileVisibility || users[userIndex].profileVisibility,
      bio: bio || users[userIndex].bio
    };

    await saveData(USERS_FILE, users);
    res.json({ user: users[userIndex] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Request Routes
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const requests = JSON.parse(await fs.readFile(REQUESTS_FILE));
    const userRequests = requests.filter(r => r.fromUser.id === req.user.id || r.toUser.id === req.user.id);
    res.json({ requests: userRequests });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/requests', authenticateToken, async (req, res) => {
  const { toUserId, offeredSkill, wantedSkill, message } = req.body;
  if (!toUserId || !offeredSkill || !wantedSkill || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE));
    const toUser = users.find(u => u.id === toUserId);
    if (!toUser) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const requests = JSON.parse(await fs.readFile(REQUESTS_FILE));
    const requestId = uuidv4();
    const newRequest = {
      id: requestId,
      fromUser: {
        id: req.user.id,
        name: req.user.name,
        profilePhoto: req.user.profilePhoto,
        rating: req.user.rating
      },
      toUser: {
        id: toUser.id,
        name: toUser.name,
        profilePhoto: toUser.profilePhoto,
        rating: toUser.rating
      },
      offeredSkill,
      wantedSkill,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    await saveData(REQUESTS_FILE, requests);

    const notifications = JSON.parse(await fs.readFile(NOTIFICATIONS_FILE));
    notifications.push({
      id: uuidv4(),
      userId: toUserId,
      type: 'request_received',
      message: `New skill swap request from ${req.user.name}`,
      read: false,
      createdAt: new Date().toISOString()
    });
    await saveData(NOTIFICATIONS_FILE, notifications);

    res.json({ requestId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/requests/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const requests = JSON.parse(await fs.readFile(REQUESTS_FILE));
    const requestIndex = requests.findIndex(r => r.id === id && r.toUser.id === req.user.id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found or unauthorized' });
    }

    requests[requestIndex].status = status;
    requests[requestIndex].updatedAt = new Date().toISOString();
    await saveData(REQUESTS_FILE, requests);

    const notifications = JSON.parse(await fs.readFile(NOTIFICATIONS_FILE));
    notifications.push({
      id: uuidv4(),
      userId: requests[requestIndex].fromUser.id,
      type: `request_${status}`,
      message: `Your request to ${req.user.name} was ${status}`,
      read: false,
      createdAt: new Date().toISOString()
    });
    await saveData(NOTIFICATIONS_FILE, notifications);

    res.json({ request: requests[requestIndex] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Notification Routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = JSON.parse(await fs.readFile(NOTIFICATIONS_FILE));
    const userNotifications = notifications.filter(n => n.userId === req.user.id);
    res.json({ notifications: userNotifications });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
async function startServer() {
  await initializeDataFiles();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();