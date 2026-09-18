require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const profileRoutes = require('./routes/profile');
const skillRoutes = require('./routes/skills');
const experienceRoutes = require('./routes/experience');
const projectRoutes = require('./routes/projects');
const educationRoutes = require('./routes/education');
const exportRoutes = require('./routes/export');
const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api', exportRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Backend API is running...',
    endpoints: {
      auth: '/api/auth/login',
      profile: '/api/profile',
      skills: '/api/skills',
      experience: '/api/experience',
      projects: '/api/projects',
      education: '/api/education',
      export: '/api/export',
      import: '/api/import',
      admin: '/admin'
    }
  });
});

// Admin redirect route to frontend CMS
app.get('/admin', (req, res) => {
  res.redirect('http://localhost:5173/admin');
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});