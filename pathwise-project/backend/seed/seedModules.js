const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Module = require('../models/Module')
const dns = require('dns')

// Force DNS to use Google DNS for reliable Atlas SRV resolution
dns.setServers(['8.8.8.8'])

dotenv.config()

const modules = [

  // ── DATA SCIENCE (8 modules) ──────────────────────────────
  {
    subject: 'Data Science', name: 'Python Fundamentals',
    base_hours: 10, complexity_weight: 1.0, priority: 1, prerequisites: [],
    resource: { platform: 'YouTube', title: 'Python for Beginners – Full Course', url: 'https://www.youtube.com/watch?v=eWRFZrdiwLY', duration_mins: 240 },
  },
  {
    subject: 'Data Science', name: 'NumPy & Pandas',
    base_hours: 12, complexity_weight: 1.2, priority: 2, prerequisites: ['Python Fundamentals'],
    resource: { platform: 'YouTube', title: 'Pandas & NumPy Full Tutorial', url: 'https://www.youtube.com/watch?v=vmEHCJofslg', duration_mins: 200 },
  },
  {
    subject: 'Data Science', name: 'Data Visualisation',
    base_hours: 8, complexity_weight: 1.0, priority: 3, prerequisites: ['NumPy & Pandas'],
    resource: { platform: 'YouTube', title: 'Matplotlib & Seaborn Complete Guide', url: 'https://www.youtube.com/watch?v=3Xc3CA655Y4', duration_mins: 150 },
  },
  {
    subject: 'Data Science', name: 'Statistics & Probability',
    base_hours: 14, complexity_weight: 1.4, priority: 4, prerequisites: [],
    resource: { platform: 'Coursera', title: 'Statistics with Python Specialization – U of Michigan', url: 'https://www.coursera.org/specializations/statistics-with-python', duration_mins: null },
  },
  {
    subject: 'Data Science', name: 'SQL for Data Analysis',
    base_hours: 10, complexity_weight: 1.1, priority: 5, prerequisites: [],
    resource: { platform: 'YouTube', title: 'SQL Full Course for Data Analysts', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', duration_mins: 180 },
  },
  {
    subject: 'Data Science', name: 'Exploratory Data Analysis',
    base_hours: 12, complexity_weight: 1.3, priority: 6, prerequisites: ['NumPy & Pandas', 'Statistics & Probability'],
    resource: { platform: 'YouTube', title: 'EDA with Python – Step by Step', url: 'https://www.youtube.com/watch?v=xi0vhXFPegw', duration_mins: 120 },
  },
  {
    subject: 'Data Science', name: 'Machine Learning Basics',
    base_hours: 16, complexity_weight: 1.5, priority: 7, prerequisites: ['Statistics & Probability', 'NumPy & Pandas'],
    resource: { platform: 'Coursera', title: 'Machine Learning by Andrew Ng – Stanford', url: 'https://www.coursera.org/learn/machine-learning', duration_mins: null },
  },
  {
    subject: 'Data Science', name: 'Capstone Project',
    base_hours: 20, complexity_weight: 1.6, priority: 8, prerequisites: ['Machine Learning Basics', 'Exploratory Data Analysis'],
    resource: { platform: 'YouTube', title: 'Data Science Project from Scratch', url: 'https://www.youtube.com/watch?v=MpF9HENQjDo', duration_mins: 90 },
  },

  // ── WEB DEVELOPMENT (8 modules) ──────────────────────────
  {
    subject: 'Web Development', name: 'HTML & CSS Foundations',
    base_hours: 8, complexity_weight: 0.9, priority: 1, prerequisites: [],
    resource: { platform: 'YouTube', title: 'HTML & CSS Full Course – Beginner to Pro', url: 'https://www.youtube.com/watch?v=mU6anWqZJcc', duration_mins: 360 },
  },
  {
    subject: 'Web Development', name: 'JavaScript Essentials',
    base_hours: 14, complexity_weight: 1.2, priority: 2, prerequisites: ['HTML & CSS Foundations'],
    resource: { platform: 'YouTube', title: 'JavaScript Full Course for Beginners', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', duration_mins: 212 },
  },
  {
    subject: 'Web Development', name: 'Responsive Design',
    base_hours: 8, complexity_weight: 1.0, priority: 3, prerequisites: ['HTML & CSS Foundations'],
    resource: { platform: 'YouTube', title: 'Responsive Web Design – CSS Flexbox & Grid', url: 'https://www.youtube.com/watch?v=srvUrASNj0s', duration_mins: 90 },
  },
  {
    subject: 'Web Development', name: 'React.js',
    base_hours: 18, complexity_weight: 1.4, priority: 4, prerequisites: ['JavaScript Essentials'],
    resource: { platform: 'YouTube', title: 'React JS Full Course 2024', url: 'https://www.youtube.com/watch?v=f55qeKGgB_M', duration_mins: 300 },
  },
  {
    subject: 'Web Development', name: 'Node.js & Express',
    base_hours: 14, complexity_weight: 1.3, priority: 5, prerequisites: ['JavaScript Essentials'],
    resource: { platform: 'YouTube', title: 'Node.js & Express.js – Full Course', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', duration_mins: 240 },
  },
  {
    subject: 'Web Development', name: 'Databases & REST APIs',
    base_hours: 12, complexity_weight: 1.3, priority: 6, prerequisites: ['Node.js & Express'],
    resource: { platform: 'YouTube', title: 'REST API with Node, Express & MongoDB', url: 'https://www.youtube.com/watch?v=fgTGADljAeg', duration_mins: 150 },
  },
  {
    subject: 'Web Development', name: 'Authentication & Security',
    base_hours: 10, complexity_weight: 1.4, priority: 7, prerequisites: ['Databases & REST APIs'],
    resource: { platform: 'Coursera', title: 'Web Security Fundamentals – KU Leuven', url: 'https://www.coursera.org/learn/web-security-fundamentals', duration_mins: null },
  },
  {
    subject: 'Web Development', name: 'Deployment & DevOps Basics',
    base_hours: 10, complexity_weight: 1.2, priority: 8, prerequisites: ['Authentication & Security'],
    resource: { platform: 'YouTube', title: 'Deploy MERN Stack App – Full Guide', url: 'https://www.youtube.com/watch?v=l134cBAJCuc', duration_mins: 90 },
  },

  // ── MATHEMATICS (7 modules) ───────────────────────────────
  {
    subject: 'Mathematics', name: 'Algebra & Functions',
    base_hours: 10, complexity_weight: 1.0, priority: 1, prerequisites: [],
    resource: { platform: 'YouTube', title: 'College Algebra – Full Free Course', url: 'https://www.youtube.com/watch?v=LwCRRUa8yTU', duration_mins: 330 },
  },
  {
    subject: 'Mathematics', name: 'Trigonometry',
    base_hours: 8, complexity_weight: 1.1, priority: 2, prerequisites: ['Algebra & Functions'],
    resource: { platform: 'YouTube', title: 'Trigonometry – Full College Course', url: 'https://www.youtube.com/watch?v=g8VCHoSk5_o', duration_mins: 240 },
  },
  {
    subject: 'Mathematics', name: 'Calculus I – Limits & Derivatives',
    base_hours: 14, complexity_weight: 1.4, priority: 3, prerequisites: ['Algebra & Functions'],
    resource: { platform: 'Coursera', title: 'Introduction to Calculus – University of Sydney', url: 'https://www.coursera.org/learn/introduction-to-calculus', duration_mins: null },
  },
  {
    subject: 'Mathematics', name: 'Calculus II – Integrals',
    base_hours: 14, complexity_weight: 1.5, priority: 4, prerequisites: ['Calculus I – Limits & Derivatives'],
    resource: { platform: 'YouTube', title: 'Calculus 2 – Full College Course', url: 'https://www.youtube.com/watch?v=7gigNsz4Oe8', duration_mins: 360 },
  },
  {
    subject: 'Mathematics', name: 'Linear Algebra',
    base_hours: 16, complexity_weight: 1.5, priority: 5, prerequisites: ['Algebra & Functions'],
    resource: { platform: 'YouTube', title: 'Linear Algebra – Full University Course', url: 'https://www.youtube.com/watch?v=JnTa9XtvmfI', duration_mins: 300 },
  },
  {
    subject: 'Mathematics', name: 'Probability & Statistics',
    base_hours: 12, complexity_weight: 1.3, priority: 6, prerequisites: ['Algebra & Functions'],
    resource: { platform: 'Coursera', title: 'Probability Theory – Duke University', url: 'https://www.coursera.org/learn/probability-theory-statistics', duration_mins: null },
  },
  {
    subject: 'Mathematics', name: 'Discrete Mathematics',
    base_hours: 12, complexity_weight: 1.4, priority: 7, prerequisites: ['Algebra & Functions'],
    resource: { platform: 'YouTube', title: 'Discrete Math – Full Course', url: 'https://www.youtube.com/watch?v=rdXw7Ps9vxc', duration_mins: 280 },
  },

  // ── MACHINE LEARNING (8 modules) ─────────────────────────
  {
    subject: 'Machine Learning', name: 'Python for ML',
    base_hours: 10, complexity_weight: 1.0, priority: 1, prerequisites: [],
    resource: { platform: 'YouTube', title: 'Python for Machine Learning – Crash Course', url: 'https://www.youtube.com/watch?v=7eh4d6sabA0', duration_mins: 150 },
  },
  {
    subject: 'Machine Learning', name: 'Math for ML (Linear Algebra + Stats)',
    base_hours: 16, complexity_weight: 1.5, priority: 2, prerequisites: [],
    resource: { platform: 'Coursera', title: 'Mathematics for Machine Learning – Imperial College', url: 'https://www.coursera.org/specializations/mathematics-machine-learning', duration_mins: null },
  },
  {
    subject: 'Machine Learning', name: 'Supervised Learning',
    base_hours: 16, complexity_weight: 1.4, priority: 3, prerequisites: ['Python for ML', 'Math for ML (Linear Algebra + Stats)'],
    resource: { platform: 'Coursera', title: 'Supervised Machine Learning – Stanford / DeepLearning.AI', url: 'https://www.coursera.org/learn/machine-learning', duration_mins: null },
  },
  {
    subject: 'Machine Learning', name: 'Unsupervised Learning',
    base_hours: 12, complexity_weight: 1.3, priority: 4, prerequisites: ['Supervised Learning'],
    resource: { platform: 'YouTube', title: 'Unsupervised Learning – Clustering & PCA', url: 'https://www.youtube.com/watch?v=IUn8k5zSI6g', duration_mins: 120 },
  },
  {
    subject: 'Machine Learning', name: 'Neural Networks & Deep Learning',
    base_hours: 20, complexity_weight: 1.6, priority: 5, prerequisites: ['Supervised Learning'],
    resource: { platform: 'Coursera', title: 'Deep Learning Specialization – DeepLearning.AI', url: 'https://www.coursera.org/specializations/deep-learning', duration_mins: null },
  },
  {
    subject: 'Machine Learning', name: 'Model Evaluation & Tuning',
    base_hours: 10, complexity_weight: 1.3, priority: 6, prerequisites: ['Supervised Learning'],
    resource: { platform: 'YouTube', title: 'Model Evaluation & Hyperparameter Tuning', url: 'https://www.youtube.com/watch?v=fSytzGwwBVw', duration_mins: 90 },
  },
  {
    subject: 'Machine Learning', name: 'Natural Language Processing',
    base_hours: 16, complexity_weight: 1.5, priority: 7, prerequisites: ['Neural Networks & Deep Learning'],
    resource: { platform: 'YouTube', title: 'NLP with Python – Full Course', url: 'https://www.youtube.com/watch?v=X2vAabgKiuM', duration_mins: 180 },
  },
  {
    subject: 'Machine Learning', name: 'ML Deployment & MLOps',
    base_hours: 12, complexity_weight: 1.4, priority: 8, prerequisites: ['Model Evaluation & Tuning'],
    resource: { platform: 'YouTube', title: 'Deploy ML Models with Flask & Docker', url: 'https://www.youtube.com/watch?v=bi0cKgmRuiA', duration_mins: 120 },
  },

  // ── CYBERSECURITY (7 modules) ─────────────────────────────
  {
    subject: 'Cybersecurity', name: 'Networking Fundamentals',
    base_hours: 10, complexity_weight: 1.1, priority: 1, prerequisites: [],
    resource: { platform: 'YouTube', title: 'Computer Networking Full Course', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8', duration_mins: 210 },
  },
  {
    subject: 'Cybersecurity', name: 'Linux & Command Line',
    base_hours: 10, complexity_weight: 1.1, priority: 2, prerequisites: [],
    resource: { platform: 'YouTube', title: 'Linux Command Line Full Course', url: 'https://www.youtube.com/watch?v=sWbUDq4S6Y8', duration_mins: 180 },
  },
  {
    subject: 'Cybersecurity', name: 'Cryptography Basics',
    base_hours: 12, complexity_weight: 1.4, priority: 3, prerequisites: ['Networking Fundamentals'],
    resource: { platform: 'Coursera', title: 'Cryptography I – Stanford University', url: 'https://www.coursera.org/learn/crypto', duration_mins: null },
  },
  {
    subject: 'Cybersecurity', name: 'Ethical Hacking & Penetration Testing',
    base_hours: 16, complexity_weight: 1.5, priority: 4, prerequisites: ['Networking Fundamentals', 'Linux & Command Line'],
    resource: { platform: 'YouTube', title: 'Ethical Hacking Full Course 2024', url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', duration_mins: 360 },
  },
  {
    subject: 'Cybersecurity', name: 'Web Application Security',
    base_hours: 12, complexity_weight: 1.4, priority: 5, prerequisites: ['Ethical Hacking & Penetration Testing'],
    resource: { platform: 'Coursera', title: 'Web Security Fundamentals – KU Leuven', url: 'https://www.coursera.org/learn/web-security-fundamentals', duration_mins: null },
  },
  {
    subject: 'Cybersecurity', name: 'Security Operations & SIEM',
    base_hours: 12, complexity_weight: 1.3, priority: 6, prerequisites: ['Networking Fundamentals'],
    resource: { platform: 'YouTube', title: 'SOC Analyst Full Training Course', url: 'https://www.youtube.com/watch?v=EWcO-9S8p-U', duration_mins: 240 },
  },
  {
    subject: 'Cybersecurity', name: 'CTF & Practical Labs',
    base_hours: 14, complexity_weight: 1.5, priority: 7, prerequisites: ['Ethical Hacking & Penetration Testing'],
    resource: { platform: 'YouTube', title: 'TryHackMe – Beginner Path Walkthrough', url: 'https://www.youtube.com/watch?v=kG-MGqCPZRs', duration_mins: 90 },
  },

  // ── MOBILE DEVELOPMENT (7 modules) ───────────────────────
  {
    subject: 'Mobile Development', name: 'JavaScript & ES6+',
    base_hours: 12, complexity_weight: 1.1, priority: 1, prerequisites: [],
    resource: { platform: 'YouTube', title: 'JavaScript ES6+ – Full Tutorial', url: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc', duration_mins: 180 },
  },
  {
    subject: 'Mobile Development', name: 'React Native Fundamentals',
    base_hours: 16, complexity_weight: 1.3, priority: 2, prerequisites: ['JavaScript & ES6+'],
    resource: { platform: 'YouTube', title: 'React Native Full Course 2024', url: 'https://www.youtube.com/watch?v=0-S5a0eXPoc', duration_mins: 300 },
  },
  {
    subject: 'Mobile Development', name: 'Navigation & UI Components',
    base_hours: 10, complexity_weight: 1.2, priority: 3, prerequisites: ['React Native Fundamentals'],
    resource: { platform: 'YouTube', title: 'React Navigation – Full Guide', url: 'https://www.youtube.com/watch?v=OmQCU-3KPms', duration_mins: 120 },
  },
  {
    subject: 'Mobile Development', name: 'State Management',
    base_hours: 12, complexity_weight: 1.3, priority: 4, prerequisites: ['React Native Fundamentals'],
    resource: { platform: 'YouTube', title: 'Redux Toolkit & Zustand in React Native', url: 'https://www.youtube.com/watch?v=9boMnm5X9ak', duration_mins: 100 },
  },
  {
    subject: 'Mobile Development', name: 'Backend Integration & APIs',
    base_hours: 12, complexity_weight: 1.3, priority: 5, prerequisites: ['State Management'],
    resource: { platform: 'YouTube', title: 'React Native with Firebase – Full Course', url: 'https://www.youtube.com/watch?v=ql4J6SpLXZA', duration_mins: 180 },
  },
  {
    subject: 'Mobile Development', name: 'Device Features & Permissions',
    base_hours: 8, complexity_weight: 1.2, priority: 6, prerequisites: ['Backend Integration & APIs'],
    resource: { platform: 'YouTube', title: 'React Native Camera, Location & Notifications', url: 'https://www.youtube.com/watch?v=Vp0mR0XUrGo', duration_mins: 90 },
  },
  {
    subject: 'Mobile Development', name: 'App Store Deployment',
    base_hours: 8, complexity_weight: 1.2, priority: 7, prerequisites: ['Device Features & Permissions'],
    resource: { platform: 'Coursera', title: 'React Native – Meta iOS & Android Specialization', url: 'https://www.coursera.org/professional-certificates/meta-react-native', duration_mins: null },
  },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    await Module.deleteMany({})
    console.log('🗑  Cleared existing modules')

    const inserted = await Module.insertMany(modules)
    console.log(`✅ Seeded ${inserted.length} modules across 6 subjects:`)

    const subjects = [...new Set(inserted.map(m => m.subject))]
    subjects.forEach(s => {
      const count = inserted.filter(m => m.subject === s).length
      console.log(`   📚 ${s}: ${count} modules`)
    })

    console.log('\n🎉 Seed complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
