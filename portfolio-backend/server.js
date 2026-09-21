require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
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

// Trust reverse proxy (Render, load balancers) for accurate client IP in express-rate-limit
app.set('trust proxy', 1);

// Connect to MongoDB Atlas
connectDB();

// 1. Security HTTP Headers with Helmet
// Allow cross-origin resource policy so images and uploads can load on frontend
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS Configuration (Allow configured frontend domain & local dev)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin is explicitly allowed or matches a deploy preview
    const isAllowed = allowedOrigins.some(allowed => 
      allowed === origin || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')
    );
    
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy: Access denied for this origin.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api', generalApiLimiter);

// 4. Request Body Parsing & NoSQL Injection Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());

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

// Secure Health check route (does not expose internal endpoints)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});