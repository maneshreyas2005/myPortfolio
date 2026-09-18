require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('./models/adminModel');
const Profile = require('./models/profileModel');
const Skill = require('./models/skillModel');
const Experience = require('./models/experienceModel');
const Project = require('./models/projectModel');
const Education = require('./models/educationModel');
const Community = require('./models/communityModel');

const seedData = {
  profile: {
    name: "Shreyas Mane",
    title: "Full Stack Developer",
    summary: "IT Engineering student specializing in Full Stack Development with experience delivering AI-integrated and real-time web applications. Proficient in React.js, Node.js, REST APIs, and database design, with a focus on scalable architecture and performance optimization.",
    email: "maneshreyas272@gmail.com",
    phone: "+91 9324611953",
    github: "https://github.com/maneshreyas2005",
    linkedin: "https://www.linkedin.com/in/shreyas-mane-23s0204s12/",
    location: "Mumbai, India",
    profileImage: "/images/photo3.jpeg"
  },
  skills: [
    { category: "Languages", items: ["Java", "Python", "JavaScript", "SQL"], accent: "text-accent-orange" },
    { category: "Frontend", items: ["React.js", "HTML", "CSS", "TailwindCSS", "Bootstrap", "GSAP", "Shadcn UI"], accent: "text-accent-lime" },
    { category: "Backend", items: ["Node.js", "Express.js", "RESTful API", "JWT", "Socket.io"], accent: "text-accent-red" },
    { category: "AI & APIs", items: ["Gemini API", "Google Drive API", "OpenAI API", "REST APIs"], accent: "text-cyan-400" },
    { category: "Databases", items: ["MySQL", "MongoDB", "PostgreSQL", "Redis"], accent: "text-blue-400" },
    { category: "Tools", items: ["Git", "GitHub", "Docker", "Postman", "Vite"], accent: "text-purple-400" },
    { category: "Soft Skills", items: ["Leadership", "Team Management", "Public Speaking", "Cross-team Collaboration"], accent: "text-pink-400" }
  ],
  experience: [
    {
      role: "Full Stack Developer Intern",
      company: "GetFly Technologies",
      period: "Mar 2026 - Present",
      location: "Mumbai, Maharashtra, India",
      type: "On-site",
      points: [
        "Leading the development and UI teams while collaborating closely with the research team to translate concepts into practical solutions.",
        "Providing technical guidance, resolving challenges, and ensuring smooth project execution.",
        "Focused on improving code quality, system design, and overall team efficiency."
      ],
      sortOrder: 1
    },
    {
      role: "Portal Head",
      company: "PVPPCOE TPO",
      period: "Feb 2026 - Present",
      location: "Sion, Maharashtra, India",
      type: "On-site",
      points: [
        "Serving as the Portal & Technical Head at the Training and Placement Department, responsible for managing and enhancing the department's digital infrastructure.",
        "Led the development and maintenance of the placement portal, ensuring seamless coordination between students, recruiters, and the placement team.",
        "Additionally, led and headed the Industry Institute Conclave (IIC) event, coordinating with industry professionals, HRs, and academicians to ensure successful execution and meaningful engagement.",
        "Developed and managed web-based systems for student registrations and HR interactions.",
        "Streamlined placement workflows through efficient data handling.",
        "Coordinated cross-functional teams for both technical and event execution.",
        "Improved system reliability and performance through backend optimization."
      ],
      sortOrder: 2
    },
    {
      role: "Backend Developer Intern",
      company: "GetFly Technologies",
      period: "Dec 2025 - Mar 2026",
      location: "Mumbai, Maharashtra, India",
      type: "On-site",
      points: [
        "Worked on building and maintaining the backend for a Construction ERP system, focusing on scalable and efficient server-side architecture.",
        "Designed and developed RESTful APIs for core ERP modules (e.g., project management, user handling, and data tracking).",
        "Implemented database schemas and optimized queries for handling structured data efficiently.",
        "Integrated backend services with frontend applications to ensure seamless data flow.",
        "Worked on authentication and authorization mechanisms for secure access control.",
        "Collaborated with cross-functional teams to deliver reliable and maintainable features."
      ],
      sortOrder: 3
    },
    {
      role: "Training & Placement Student Coordinator",
      company: "PVPPCOE TPO",
      period: "May 2025 - Feb 2026",
      location: "Sion, Maharashtra, India",
      type: "On-site",
      points: [
        "Assisted the Training & Placement Office (TPO) in organizing and coordinating campus recruitment drives.",
        "Facilitated interactions between students and recruiters, and managed placement-related events and workshops.",
        "Developed strong leadership, communication, and crowd management skills.",
        "Proficient in data handling and documentation using MS Excel and MS Word."
      ],
      sortOrder: 4
    },
    {
      role: "Web Development Intern",
      company: "Starting Core",
      period: "Aug 2025 - Oct 2025",
      location: "Mumbai, Maharashtra, India",
      type: "Remote",
      points: [
        "Built 2 responsive frontend projects + 1 Full Stack project using React.js and Tailwind CSS, with one project deployed to production.",
        "Implemented modern, reusable UI components using Shadcn UI and enhanced user experience with smooth animations using GSAP.",
        "Collaborated closely with mentors and team members, following industry-level coding standards and component-based architecture best practices."
      ],
      sortOrder: 5
    },
    {
      role: "AI Developer Intern",
      company: "GetFly Technologies",
      period: "Apr 2025 - Jul 2025",
      location: "Mumbai, Maharashtra, India",
      type: "On-site",
      points: [
        "Contributed to the design and deployment of 3 scalable AI-powered web apps.",
        "Integrated real-time AI capabilities using Gemini API, reducing manual workload in app workflows.",
        "Engineered secure file storage and retrieval using Google Drive API.",
        "Improved chat latency using Socket.io for real-time communication."
      ],
      sortOrder: 6
    }
  ],
  projects: [
    {
      id: "ai-interviewer",
      title: "AI Interviewer",
      tech: ["React.js", "Node.js", "Socket.io", "Google Drive API", "Gemini API"],
      description: "AI-powered mock interview platform featuring real-time transcription, automated feedback, and secure cloud storage integration.",
      image: "/images/photo3.jpeg",
      sortOrder: 1
    },
    {
      id: "multiphase-digital",
      title: "Multiphase Digital",
      tech: ["React.js", "TailwindCSS", "GSAP"],
      description: "Responsive production-ready website with smooth animations and modular architecture.",
      image: "/images/photo3.jpeg",
      sortOrder: 2
    },
    {
      id: "pharmacy-management",
      title: "Pharmacy Management System",
      tech: ["React.js", "Node.js", "MongoDB"],
      description: "Full-stack ERP system with secure role-based access control and secure CRUD operations.",
      image: "/images/photo3.jpeg",
      sortOrder: 3
    },
    {
      id: "social-dashboard",
      title: "Social Media Dashboard",
      tech: ["Vue.js", "Firebase", "Chart.js"],
      description: "Real-time analytics dashboard tracking user engagement metrics with dynamic charting.",
      image: "/images/photo3.jpeg",
      sortOrder: 4
    },
    {
      id: "e-commerce-api",
      title: "E-Commerce REST API",
      tech: ["Node.js", "Express", "PostgreSQL", "Redis"],
      description: "High-performance backend service handling authentication, product catalog, and order processing.",
      image: "/images/photo3.jpeg",
      sortOrder: 5
    },
    {
      id: "task-manager",
      title: "Collaborative Task Manager",
      tech: ["Next.js", "TypeScript", "Prisma"],
      description: "Real-time task board with drag-and-drop functionality and team collaboration features.",
      image: "/images/photo3.jpeg",
      sortOrder: 6
    }
  ],
  education: [
    {
      degree: "B.E. in Information Technology",
      institution: "VPPCOE",
      period: "Nov 2024 - Present",
      grade: "CGPA: 8.92 / 10"
    },
    {
      degree: "HSC - Higher Secondary",
      institution: "State Board",
      period: "2023 - 2024",
      grade: "Percentage: 79.50%"
    },
    {
      degree: "SSC - Secondary School",
      institution: "State Board",
      period: "2021 - 2022",
      grade: "Percentage: 91.40%"
    }
  ],
  community: [
    {
      title: "Interactive Tech Workshop",
      description: "Mentoring engineering students on Full Stack architecture and AI APIs.",
      image: "/images/articles/featured-judge.jpg",
      tag: "Workshop",
      date: "2026",
      sortOrder: 1
    },
    {
      title: "Campus Developer Bootcamp",
      description: "Hands-on session building real-world React & Node.js applications.",
      image: "/images/photo3.jpeg",
      tag: "Mentorship",
      date: "2025",
      sortOrder: 2
    },
    {
      title: "Hackathon Evaluation & Keynote",
      description: "Reviewing student innovations and guiding them on system design.",
      image: "/images/articles/featured-judge.jpg",
      tag: "Speaker",
      date: "2025",
      sortOrder: 3
    }
  ]
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB!');

    // 1. Seed or update Admin
    console.log('Setting up Admin account...');
    const existingAdmin = await Admin.findOne({ email: 'admin@portfolio.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await Admin.create({
        email: 'admin@portfolio.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Created default admin: admin@portfolio.com / admin123');
    } else {
      console.log('Admin account already exists.');
    }

    // 2. Clear existing portfolio collections
    console.log('Refreshing portfolio collections...');
    await Promise.all([
      Profile.deleteMany({}),
      Skill.deleteMany({}),
      Experience.deleteMany({}),
      Project.deleteMany({}),
      Education.deleteMany({}),
      Community.deleteMany({})
    ]);

    // 3. Insert seed data
    await Profile.create(seedData.profile);
    await Skill.insertMany(seedData.skills);
    await Experience.insertMany(seedData.experience);
    await Project.insertMany(seedData.projects);
    await Education.insertMany(seedData.education);
    await Community.insertMany(seedData.community);

    console.log('All portfolio data successfully seeded into MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
