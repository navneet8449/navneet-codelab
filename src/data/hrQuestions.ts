import { HrQuestionItem } from '../types';

export const HR_QUESTIONS: HrQuestionItem[] = [
  {
    id: 'hr-1',
    category: 'Introduction',
    question: 'Tell me about yourself and why you chose Computer Science.',
    whyAsked: 'The opening question tests your communication structure, clarity of thought, passion for tech, and whether you can give a concise 90-second summary without reading your resume word-for-word.',
    starTip: 'Use the Present-Past-Future model: What you study and build now, key milestones/projects, and what excites you about this role.',
    starterTemplates: {
      situation: 'I am a final-year Computer Science student passionate about backend systems and problem-solving.',
      task: 'Over the past three years, I have built several projects using C++, Node.js, and SQL, and solved over 200 data structures problems.',
      action: 'Recently, I led a 3-person team to develop a real-time collaborative tool where I designed the database schema and optimized API latency.',
      result: 'Now, I am eager to apply my strong foundation in algorithms and clean code as a Junior Software Engineer at your team.',
    },
  },
  {
    id: 'hr-2',
    category: 'Teamwork & Conflict',
    question: 'Describe a situation where you had a conflict or disagreement in a college group project.',
    whyAsked: 'Recruiters want to see emotional maturity, objective problem-solving, empathy, and whether you prioritize project success over personal ego.',
    starTip: 'Focus on a professional disagreement (e.g. choice of database or architecture), NOT personal drama. Highlight how you reached consensus with data.',
    starterTemplates: {
      situation: 'In our web development capstone, my teammate and I disagreed on whether to use MongoDB or PostgreSQL for our user order system.',
      task: 'We had to decide quickly without delaying our sprint deadline.',
      action: 'Instead of debating endlessly, I suggested listing our query patterns and benchmarking write vs read frequency. We discovered our orders required ACID transactions.',
      result: 'We agreed on PostgreSQL, delivered the module 2 days ahead of schedule, and maintained a great working friendship.',
    },
  },
  {
    id: 'hr-3',
    category: 'Strengths & Growth',
    question: 'What is your greatest weakness, and what steps are you taking to improve it?',
    whyAsked: 'Checks self-awareness, authenticity, and growth mindset. Never say "I am a perfectionist" or "I work too hard"—give a real, non-fatal area and tangible improvement steps.',
    starTip: 'State a real area of growth (e.g., public speaking, over-optimizing code too early, delegating tasks) followed immediately by the proactive system you use to improve.',
    starterTemplates: {
      situation: 'Earlier in college, I found it challenging to speak up and present technical architecture in large groups or project reviews.',
      task: 'I realized that clear communication is just as vital as writing good code.',
      action: 'To improve, I volunteered to lead our weekly college coding club meetups and practiced explaining algorithms in simple terms to first-year juniors.',
      result: 'This helped me build confidence. Now I feel comfortable presenting my ideas clearly and welcoming questions.',
    },
  },
  {
    id: 'hr-4',
    category: 'Company Fit',
    question: 'Why should we hire you as a fresh graduate over candidates with prior experience?',
    whyAsked: 'Tests your enthusiasm, quick learning ability, culture alignment, and foundational grasp of computer science fundamentals.',
    starTip: 'Emphasize high learning velocity, adaptability, solid fundamental grasp of algorithms and systems, and lack of rigid bad habits.',
    starterTemplates: {
      situation: 'While experienced candidates have past domain history, fresh graduates bring high energy, fast learning capability, and unbiased curiosity.',
      task: 'My goal is to quickly absorb your engineering practices and contribute to shipping production-ready code.',
      action: 'Throughout college, whenever assigned a new technology—such as Docker or TypeScript—I built working prototypes within a week through self-study.',
      result: 'You get a dedicated junior engineer with strong CS fundamentals who is eager to take ownership of tasks and grow with your team.',
    },
  },
  {
    id: 'hr-5',
    category: 'Pressure & Deadlines',
    question: 'Tell me about a time you had to deal with tight deadlines and high stress.',
    whyAsked: 'Assesses time management, prioritization under stress, and whether you panic or stay methodical when unexpected roadblocks occur.',
    starTip: 'Demonstrate breaking large problems into manageable chunks, communicating transparently, and maintaining focus.',
    starterTemplates: {
      situation: 'During semester finals week, our semester project server crashed 48 hours before our final professor demo due to an unhandled memory leak.',
      task: 'I had to identify the root cause while preparing for another exam.',
      action: 'I used logging and memory profiling to locate a circular reference, wrote a hotfix, and created automated unit tests to prevent regression.',
      result: 'The demo was successful with zero crashes, and I managed my time to score an A in both the project and the exam.',
    },
  },
];
