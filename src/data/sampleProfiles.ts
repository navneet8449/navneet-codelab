export interface SampleProject {
  title: string;
  techStack: string;
  description: string;
  challenges: string;
}

export interface SampleProfile {
  name: string;
  roleTarget: string;
  skills: string[];
  projects: SampleProject[];
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    name: 'Backend & Systems Enthusiast',
    roleTarget: 'Backend Software Engineer (Fresher)',
    skills: ['C++', 'Data Structures & Algorithms', 'Node.js', 'PostgreSQL', 'Redis', 'Operating Systems', 'Docker'],
    projects: [
      {
        title: 'Distributed In-Memory Key-Value Store',
        techStack: 'C++, TCP Sockets, Multithreading, Mutexes',
        description: 'Engineered a lightweight Redis-like in-memory caching server supporting GET, SET, EXPIRE, and LRU eviction over raw TCP sockets.',
        challenges: 'Handling thread synchronization and race conditions when multiple client connections attempted simultaneous LRU eviction on a shared doubly linked list.',
      },
      {
        title: 'Campus Food Delivery REST API',
        techStack: 'Node.js, Express, PostgreSQL, Redis, JWT',
        description: 'Built a high-concurrency order placement backend with JWT authentication, transaction isolation, and Redis rate limiting.',
        challenges: 'Preventing double-booking of food items during flash discounts using database row-level locking (SELECT FOR UPDATE).',
      },
    ],
  },
  {
    name: 'Full-Stack Web Developer',
    roleTarget: 'Full-Stack SDE (Fresher)',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'REST APIs', 'Git', 'Computer Networks'],
    projects: [
      {
        title: 'Real-Time Collaborative Whiteboard',
        techStack: 'React, Canvas API, WebSockets (Socket.io), Express',
        description: 'Interactive canvas web app allowing multiple users to draw, annotate, and brainstorm in real time with room codes.',
        challenges: 'Minimizing network latency and reconciling out-of-order stroke coordinates across high-jitter connections using client interpolation.',
      },
      {
        title: 'Student Placement Tracker Portal',
        techStack: 'React, Tailwind CSS, Express, MongoDB, OAuth',
        description: 'Dashboard for college students to track company applications, interview rounds, and interview feedback with automated reminders.',
        challenges: 'Implementing role-based access control (Student vs Placement Officer) and file uploads with secure S3 pre-signed URLs.',
      },
    ],
  },
  {
    name: 'Core C++ & Algorithms Specialist',
    roleTarget: 'C++ Systems Engineer / Performance Engineer',
    skills: ['Modern C++ (C++17/20)', 'STL', 'Pointers & References', 'Object-Oriented Programming', 'Memory Management', 'Linux'],
    projects: [
      {
        title: 'Custom Memory Allocator & Pool',
        techStack: 'C++, Valgrind, Linux g++',
        description: 'Implemented a custom fixed-size block memory allocator to minimize heap fragmentation and benchmarked against standard malloc/free.',
        challenges: 'Handling pointer arithmetic, alignment boundaries on 64-bit architecture, and detecting memory leaks with Valgrind.',
      },
    ],
  },
];

export const POPULAR_SKILLS = [
  'C++',
  'Data Structures & Algorithms',
  'Object Oriented Programming',
  'Operating Systems',
  'DBMS & SQL',
  'Computer Networks',
  'Python',
  'Java',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Git & GitHub',
  'System Design (Basics)',
  'REST APIs',
];
