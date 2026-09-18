# Portfolio Backend CMS - Implementation Plan

## Project Status Overview

**Backend Status**: In Progress
- Node.js project initialized with Express, MongoDB, JWT auth
- MongoDB Atlas connection configured and working
- 5 MongoDB models defined (Profile, Skill, Experience, Project, Education)
- JWT authentication middleware created
- API routes created for all portfolio sections
- File upload middleware (Multer) configured
- Export/Import JSON endpoints created
- Server running on port 5000 with MongoDB connection

**Frontend Status**: Needs Integration
- React/Vite portfolio remains unchanged (static data imports)
- No API fetching implemented yet
- Admin dashboard not built

---

## Completed Backend Tasks

### Task 1: Backend Project Setup ✅
- Created `portfolio-backend/` directory structure
- Initialized Node.js project with `npm init -y`
- Installed dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `multer`, `cors`, `dotenv`
- Created folder structure: `config/`, `routes/`, `models/`, `middleware/`, `uploads/`

### Task 2: MongoDB Atlas Connection ✅
- Created `config/db.js` with Mongoose connection using Atlas URL
- Connection string: `mongodb+srv://maneshreyas272_db_user:GjP7nrHrqoVKRE1b@cluster0.clhbqx1.mongodb.net/?appName=Cluster0`
- Server successfully connects to MongoDB Atlas
- Verified: "MongoDB Connected: ac-hesnx6h-shard-00-02.clhbqx1.mongodb.net"

### Task 3: MongoDB Models ✅
- `models/profileModel.js` - Profile data with theme config
- `models/skillModel.js` - Skill categories with items and accent colors
- `models/experienceModel.js` - Work experience entries
- `models/projectModel.js` - Projects with tech, description, image
- `models/educationModel.js` - Education entries

### Task 4: JWT Authentication ✅
- Created `middleware/auth.js` - JWT verification middleware
- Created `routes/auth.js` - Login endpoint (`POST /api/login`)
- Login validates email and generates JWT token
- Default admin credentials: `admin@portfolio.com` / `admin123`

### Task 5: API Routes ✅
- `routes/profile.js` - GET/PUT `/api/profile` (protected)
- `routes/skills.js` - GET/POST/DELETE `/api/skills` (protected)
- `routes/experience.js` - GET/POST/DELETE `/api/experience` (protected)
- `routes/projects.js` - GET/POST/PUT/DELETE `/api/projects` (protected, with multer upload)
- `routes/education.js` - GET/POST/DELETE `/api/education` (protected)
- `routes/export.js` - GET `/api/export`, POST `/api/import` (protected)

### Task 6: File Upload Middleware ✅
- Created `middleware/upload.js` - Multer configuration
- Stores uploads in `uploads/` directory
- Filename: `Date.now() + extname`
- File filter: JPEG, PNG, GIF only

### Task 7: Server Entry Point ✅
- Created `server.js` - Express app configuration
- Middleware: cors, json parsing
- All API routes mounted
- Error handler middleware
- Listens on port 5000

---

## Remaining Backend Tasks

### Task 8: Export/Import JSON Endpoints ✅ (Partially Complete)
- Export endpoint (`GET /api/export`) creates JSON backup of all data
- Import endpoint (`POST /api/import`) clears and replaces all data
- Includes backup before import for safety

### Task 9: Admin Dashboard Route ❌ (Not Started)
- Need to create `GET /admin` route
- HTML page with forms for all portfolio sections
- Match existing portfolio design language
- Form fields: profile, skills, experience, projects, education
- Add/remove inputs dynamically
- Export/Import buttons
- Live preview panel

---

## Remaining Frontend Tasks

### Task 10: Create Data Fetching Utility ❌ (Not Started)
- Create `src/dataFetch.js` with async functions for each collection
- `fetchProfileData()` - Fetch from `/api/profile`
- `fetchSkillsData()` - Fetch from `/api/skills`
- `fetchExperienceData()` - Fetch from `/api/experience`
- `fetchProjectsData()` - Fetch from `/api/projects`
- `fetchEducationData()` - Fetch from `/api/education`
- Each function returns data with fallback to original `resumeData`

### Task 11: Update Home Page Integration ❌ (Not Started)
- `src/pages/Home.jsx` - Use `useEffect` to fetch data on mount
- State variables: `profile`, `skills`, `experience`, `projects`, `education`
- Fallback: if API fails, use imported `resumeData` as fallback
- All GSAP animations preserved - just change data sources
- `cardVisible` state logic maintained (mobile detection unchanged)

### Task 12: Update Other Pages ❌ (Not Started)
- `ProjectDetails.jsx` - Fetch project by ID from API
- `Navbar.jsx` - Fetch profile for nav items, contact info
- `Skills.jsx` - Fetch skills categories from API, map to UI components
- `Projects.jsx` - Fetch projects from API, display with hover effects preserved
- `Experience.jsx` - Fetch experience entries from API, render with same dotted line design
- `Education.jsx` - Fetch education entries from API, render with same grid design
- `Footer.jsx` - Fetch profile for email/phone/links

### Task 13: Admin Dashboard ❌ (Not Started)
- HTML page matching portfolio design language
- Sections:
  - Profile editor (text inputs, image preview + upload button)
  - Skills manager (add/remove categories, accent color selector)
  - Experience table (add/edit/delete rows, inline editing)
  - Projects grid (sortable via sortOrder, image upload preview)
  - Education entries manager
- Buttons: Save Changes, Export JSON, Import JSON
- Live preview panel showing frontend changes

### Task 14: TypeScript/Eslint Verification ❌ (Not Started)
- Run `npm run lint` - ensure zero errors
- Run `npm run build` - ensure frontend compiles
- Check all `fetch()` calls have proper error handling

---

## Data Migration from Static to Dynamic

### Current Data Source (`src/data.js`)
```js
export const resumeData = {
  name: "Shreyas Mane",
  title: "Full Stack Developer",
  // ... all static data
};
```

### New Data Flow
1. Frontend fetches from backend API on startup
2. Data stored in React state/context
3. Fallback to static `resumeData` if API fails
4. Admin can modify data via CMS
5. Export/Import JSON for backup/migration

### Profile Data Structure (MongoDB)
```json
{
  "name": "Shreyas Mane",
  "title": "Full Stack Developer",
  "email": "shreyasmane100@gmail.com",
  "phone": "+91 9324611953",
  "github": "https://github.com/maneshreyas2005",
  "linkedin": "https://www.linkedin.com/in/shreyas-mane-16s1104s12/",
  "location": "Mumbai, India",
  "profileImage": "/uploads/image.jpg",
  "theme": {
    "accentColors": {},
    "fonts": {}
  }
}
```

### Skill Data Structure
```json
{
  "category": "Frontend",
  "items": ["React.js", "HTML", "CSS", "TailwindCSS"],
  "accent": "text-accent-lime"
}
```

### Project Data Structure
```json
{
  "title": "AI Interviewer",
  "tech": ["React.js", "Node.js", "Socket.io"],
  "description": "AI-powered mock interview platform",
  "image": "/images/photo3.jpeg",
  "sortOrder": 1
}
```

---

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | No | Admin login, get JWT token |
| `/api/profile` | GET/PUT | Yes | Profile data |
| `/api/skills` | GET/POST/DELETE | Yes | Skill categories |
| `/api/experience` | GET/POST/DELETE | Yes | Work experience |
| `/api/projects` | GET/POST/PUT/DELETE | Yes | Projects with images |
| `/api/education` | GET/POST/DELETE | Yes | Education entries |
| `/api/export` | GET | Yes | Download JSON backup |
| `/api/import` | POST | Yes | Upload JSON to reset data |
| `/api/uploads/:filename` | GET | Yes | Serve uploaded images |

---

## Next Steps - Priority Order

1. **Test existing backend** - Verify all CRUD operations work
2. **Create admin dashboard** - Build HTML admin interface
3. **Update frontend to use API** - Data fetching with fallbacks
4. **Test full workflow** - Admin modifies data, frontend reflects changes
5. **Run lint/build** - Ensure zero errors

---

## How to Run Backend

```bash
cd portfolio-backend
node server.js
# Server runs on port 5000
# MongoDB Atlas connection required
```

## How to Test APIs

1. **Login**: `POST /api/auth/login` with `{ "email": "admin@portfolio.com" }`
2. **Get profile**: `GET /api/profile` (requires JWT token in Authorization header)
3. **CRUD operations** - All routes protected with JWT auth
4. **Export**: `GET /api/export` - downloads JSON file
5. **Import**: `POST /api/import` - body must contain all collections

---

## Admin Credentials

- **Email**: `admin@portfolio.com`
- **Password**: `admin123` (default, hashed on first login)
- **JWT Secret**: `portfolio-jwt-secret-key-2026` (from .env)