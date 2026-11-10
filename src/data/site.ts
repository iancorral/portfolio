import type { ImageMetadata } from 'astro';
import tallerFull from '../assets/taller-full.png';

export const person = {
  name: 'Ian Corral',
  fullName: 'Ian Alejandro Corral Marín',
  role: 'DevOps Engineer & Full-Stack Developer',
  location: 'Chihuahua, MX',
  email: 'ian.corr.mar@gmail.com',
  github: 'https://github.com/iancorral',
  linkedin: 'https://www.linkedin.com/in/iancorral/',
  resume: '/Ian_Corral_Resume.pdf',
  description:
    'Portfolio of Ian Corral, a DevOps engineer and full-stack developer building custom web products, internal tools and reliable cloud systems from Chihuahua, Mexico.',
};

export type FolderId = 'home' | 'projects' | 'experience' | 'services' | 'about' | 'contact';

export type Folder = {
  id: FolderId;
  label: string;
};

// Tab order, left to right. Each folder's color lives in global.css under .tone-<id>.
export const folders: Folder[] = [
  { id: 'home', label: 'Hello' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const hero = {
  lead: 'I build custom web products and internal tools around the way each client actually works, from the first rough idea to the changes that appear once people start using it.',
  sub: 'I also work in DevOps at Intelectix, on the pipelines and deployments behind Singrafos, a notary SaaS used across Mexico and Latin America.',
};

export type Stat = { prefix?: string; value: number; suffix?: string; label: string; tone: FolderId };

export const stats: Stat[] = [
  { value: 200, suffix: '+', label: 'real appointments booked in Tangible’s first three months', tone: 'projects' },
  { prefix: '~', value: 30, label: 'Azure DevOps pipelines migrated and built', tone: 'home' },
  { value: 15, suffix: '+', label: 'teachers across 6 languages running on DARPE Admin', tone: 'experience' },
  { value: 0, label: 'long-lived credentials left in the deployment path', tone: 'about' },
];

export type Project = {
  id: string;
  file: string;
  title: string;
  status: string;
  stamp: string;
  year: string;
  summary: string;
  impactLabel: string;
  impact: string;
  story: string;
  demo: 'slots' | 'zones' | 'site';
  preview?: { image: ImageMetadata; alt: string; url: string };
  stack: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    id: 'tangible',
    file: 'File 01',
    title: 'Tangible',
    status: 'Live product',
    stamp: 'Live',
    year: '2026',
    summary: 'A mobile-first booking platform built around the way a nail studio actually works.',
    impactLabel: 'What changed',
    impact: '200+ real client appointments in three months, replacing a fully manual process.',
    story:
      'The owner runs the studio from her phone, so it had to feel effortless there first. Most of the day happens in a protected admin dashboard: rescheduling, payments, revenue and a loyalty program.',
    demo: 'slots',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'MongoDB', 'Tailwind CSS', 'Vercel'],
    links: [
      { label: 'Visit live site', href: 'https://studiotangible.com.mx' },
      { label: 'GitHub', href: 'https://github.com/iancorral/Tangible' },
    ],
  },
  {
    id: 'luevano',
    file: 'File 02',
    title: 'Taller Luevano',
    status: 'Online, pre-launch',
    stamp: 'Online',
    year: '2026',
    summary: 'A custom website for a family-owned wheel alignment and suspension shop in Chihuahua, open since 1968.',
    impactLabel: 'What it has to do',
    impact: 'Customers find the shop, see what it fixes, and call or message on WhatsApp in one tap.',
    story:
      'A quote builder turns symptoms, car and preferred day into a WhatsApp message the customer reviews and sends. Each service has its own page and structured data for local search.',
    demo: 'site',
    preview: {
      image: tallerFull,
      alt: 'Full page of the Auto Alineaciones Luevano website, from the hero through services, quote builder, location and FAQ.',
      url: 'taller-luevano-web.vercel.app',
    },
    stack: ['Astro', 'TypeScript', 'GSAP', 'Three.js', 'Vercel'],
    links: [
      { label: 'Visit site', href: 'https://taller-luevano-web.vercel.app/' },
      { label: 'GitHub', href: 'https://github.com/iancorral/luevano-web' },
    ],
  },
  {
    id: 'darpe',
    file: 'File 03',
    title: 'DARPE Admin',
    status: 'Delivered',
    stamp: 'Delivered',
    year: '2026',
    summary: 'A custom operations platform shaped around the real scheduling rules of a language school.',
    impactLabel: 'The scope',
    impact: '6 languages, 15+ teachers and one shared workflow, in place of scattered spreadsheets.',
    story:
      'One dependable space for students, multilingual teachers, recurring schedules and class sessions. The school’s rules live in a typed PostgreSQL schema, including the small exceptions that make daily operations complicated.',
    demo: 'zones',
    stack: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Supabase', 'Prisma 7', 'Zod', 'Tailwind CSS'],
    links: [{ label: 'GitHub', href: 'https://github.com/iancorral/DARPE-Global-admin-platform' }],
  },
];

export const inProgress = {
  title: 'More in progress',
  text: 'New projects are on the bench right now. I’ll file them here as they ship.',
};

export type Job = {
  id: string;
  tab: string;
  role: string;
  roleNote?: string;
  company: string;
  context: string;
  period: string;
  location: string;
  points: string[];
  tech: string[];
  highlights?: { value: string; label: string }[];
};

export const jobs: Job[] = [
  {
    id: 'intelectix',
    tab: 'Intelectix',
    role: 'DevOps Engineer',
    roleNote: '(Part-time)',
    company: 'Intelectix',
    context: 'Singrafos, notary SaaS used across Mexico & Latin America',
    period: 'Jul. 2026 – Present',
    location: 'Chihuahua, MX',
    tech: ['Azure DevOps', 'Azure', 'Angular', 'OWASP'],
    points: [
      'Migrated and built ~30 Azure DevOps pipelines, moving classic definitions to YAML pipeline-as-code.',
      'Created PR-validation pipelines that gate every pull request to development and main, with full unit and end-to-end suites for the Angular frontend and the API.',
      'Added OWASP dependency-audit pipelines on every PR to development, in an ISO 27001:2022 environment.',
      'Replaced secret-based Azure service connections, renewed by hand every two years, with Workload Identity Federation (OIDC).',
    ],
  },
  {
    id: 'autozone',
    tab: 'AutoZone',
    role: 'Business Intelligence Intern',
    company: 'AutoZone',
    context: 'Business & Technology Store Support Center',
    period: 'Jun. 2025 – Jul. 2026',
    location: 'Chihuahua, MX',
    tech: ['Google Cloud', 'Looker', 'Jira', 'GitLab CI/CD', 'Docker'],
    points: [
      'Migrated internal training reports from WebFOCUS to Google Looker on a GCP pipeline (Cloud Storage, Dataform SQL), delivering director-level dashboards.',
      'Cut incident reporting time by 40% with a custom Jira Issue Collector.',
      'Migrated 300+ legacy SAS jobs from FTP to SFTP and maintained portals in a GitLab CI/CD and Docker environment.',
    ],
    highlights: [
      { value: '40%', label: 'less time to report an incident' },
      { value: '300+', label: 'legacy SAS jobs moved to SFTP' },
      { value: 'Looker', label: 'director-level dashboards, migrated from WebFOCUS' },
    ],
  },
];

export const pipeline = [
  {
    label: 'Pull request',
    note: 'Every pull request to development or main has to clear these checks before it can merge.',
  },
  {
    label: 'Unit tests',
    note: 'The full unit suites run for both the Angular frontend and the API.',
  },
  {
    label: 'E2E tests',
    note: 'End-to-end suites run the same way, as a required gate before any merge.',
  },
  {
    label: 'OWASP audit',
    note: 'On PRs to development, a dependency audit catches vulnerable third-party packages before they reach shared branches.',
  },
  {
    label: 'Merge',
    note: 'Only a PR that clears its gates reaches the shared branch.',
  },
  {
    label: 'Deploy via OIDC',
    note: 'Service connections use Workload Identity Federation, so no long-lived secret sits in the deployment path.',
  },
];

export const education = {
  degree: 'B.S. in Information and Telecommunication Technologies Engineering',
  school: 'Universidad La Salle Chihuahua',
  period: 'Aug. 2022 – Present',
};

export const certification = {
  name: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
  date: 'Aug. 2026',
};

export const spoken = 'Spanish (native), English (professional working proficiency)';

export const about = {
  lead: 'I’m Ian, a software developer and Information & Telecommunications Technologies Engineering student based in Chihuahua.',
  paragraphs: [
    'I currently work in DevOps at Intelectix, supporting Singrafos and learning how reliable cloud infrastructure, deployments and product decisions connect behind the scenes.',
    'What I enjoy most is getting close to the people who will actually use what I build. I ask how their day works, where things get stuck and what would make the product feel natural to them. That is how Tangible and DARPE started, and it is the kind of work I want to keep doing.',
    'Outside of work and client projects, I keep building things of my own, mostly because I want to understand how they work.',
  ],
};

export const services = {
  intro:
    'I do not want to force a client into one fixed way of working. The goal is to understand what you need, build it with you and keep adapting it until it truly fits.',
  cta: 'Tell me about your project',
  page: 'See the full services page (in Spanish)',
  items: [
    {
      icon: 'browser',
      tag: 'From idea to working product',
      title: 'Custom websites & web apps',
      text: 'Websites, web apps and digital products built around your workflow, your clients and the way you want the business to feel, not around a generic template.',
    },
    {
      icon: 'panel',
      tag: 'Clearer day-to-day operations',
      title: 'Internal tools',
      text: 'Admin panels, booking systems and operational platforms that replace repetitive work and bring scattered information into one useful place.',
    },
    {
      icon: 'loop',
      tag: 'Flexible by design',
      title: 'Iteration & cloud delivery',
      text: 'I stay close to the project after the first version: we test it, change what does not fit and keep improving it as real needs appear.',
    },
  ],
};

export const toolkit = [
  { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Kotlin', 'Python', 'SQL', 'HTML/CSS', 'SAS', 'WebFOCUS'] },
  { group: 'Frameworks', items: ['Next.js', 'React', 'Node.js', 'Express', 'Tailwind CSS', 'Zod', 'Jetpack Compose', 'GraphQL'] },
  { group: 'Cloud & DevOps', items: ['Azure', 'Azure DevOps', 'Entra ID', 'GCP', 'Docker', 'GitLab CI/CD', 'Git', 'Vercel', 'Dynatrace'] },
  { group: 'Data', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Prisma', 'Mongoose', 'Supabase'] },
];
