import {
  siAngular,
  siDocker,
  siDynatrace,
  siExpress,
  siGit,
  siGithub,
  siGitlab,
  siGooglecloud,
  siGraphql,
  siGsap,
  siHtml5,
  siJavascript,
  siJetpackcompose,
  siJira,
  siKotlin,
  siLooker,
  siMongodb,
  siMongoose,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siOwasp,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siSupabase,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siAstro,
  siWhatsapp,
  siZod,
} from 'simple-icons';

export type BrandIcon = { path: string; viewBox: string; color: string };

const brand = (icon: { path: string; hex: string }): BrandIcon => ({
  path: icon.path,
  viewBox: '0 0 24 24',
  // Near-black logos follow the text color, so they stay visible on dark paper.
  color: parseInt(icon.hex.slice(0, 2), 16) < 0x40 && parseInt(icon.hex.slice(4, 6), 16) < 0x60 ? 'currentColor' : `#${icon.hex}`,
});

// Microsoft and LinkedIn marks aren't in Simple Icons, so these three come from Devicon (MIT).
const azure: BrandIcon = {
  viewBox: '0 0 128 128',
  color: '#0078d4',
  path: 'M43.983 4.653a5.911 5.911 0 015.6 4.022l35.91 106.396a5.911 5.911 0 01-5.603 7.802h41.38a5.917 5.917 0 004.8-2.465 5.909 5.909 0 00.798-5.34L90.961 8.672a5.91 5.91 0 00-5.602-4.022zm-1.336.478a5.92 5.92 0 00-5.61 4.029L1.132 115.55a5.91 5.91 0 005.6 7.8h28.893c1.239 0 2.446-.41 3.452-1.113a5.923 5.923 0 002.157-2.916l7.019-20.71-13.411-12.857c-.246-.273-1.353-2.274-.369-4.002 1.108-1.659 2.955-1.659 2.955-1.659h17.285l9.074-26.145L48.274 8.321c-.042-.205-.914-1.365-2.281-2.28-1.37-.915-3.345-.909-3.345-.909zm-4.88 75.74a2.724 2.724 0 00-1.86 4.718l37.83 35.31c1.101 1.03 2.502 1.631 4.007 1.631 0 0 1.282.068 2.055-.033 1.817-.273 3.525-1.768 4.09-2.39 1.457-1.939.794-4.95.794-4.95l-11.45-34.28z',
};
const azureDevops: BrandIcon = {
  viewBox: '0 0 128 128',
  color: '#0078d4',
  path: 'M120.89 28.445v69.262l-28.445 23.324-44.09-16.07v15.93L23.395 88.25l72.746 5.688V31.574ZM96.64 31.93 55.82 7.11v16.285L18.348 34.418 7.109 48.852v32.785l16.075 7.11V46.718Zm0 0',
};
export const linkedinIcon: BrandIcon = {
  viewBox: '0 0 128 128',
  color: 'currentColor',
  path: 'M116 3H12a8.91 8.91 0 00-9 8.8v104.42a8.91 8.91 0 009 8.78h104a8.93 8.93 0 009-8.81V11.77A8.93 8.93 0 00116 3zM39.17 107H21.06V48.73h18.11zm-9-66.21a10.5 10.5 0 1110.49-10.5 10.5 10.5 0 01-10.54 10.48zM107 107H88.89V78.65c0-6.75-.12-15.44-9.41-15.44s-10.87 7.36-10.87 15V107H50.53V48.73h17.36v8h.24c2.42-4.58 8.32-9.41 17.13-9.41C103.6 47.28 107 59.35 107 75z',
};
export const githubIcon: BrandIcon = { ...brand(siGithub), color: 'currentColor' };
export const whatsappIcon: BrandIcon = { ...brand(siWhatsapp), color: 'currentColor' };

const icons: Record<string, BrandIcon> = {
  TypeScript: brand(siTypescript),
  JavaScript: brand(siJavascript),
  Kotlin: brand(siKotlin),
  Python: brand(siPython),
  'HTML/CSS': brand(siHtml5),
  'Next.js': brand(siNextdotjs),
  React: brand(siReact),
  'Node.js': brand(siNodedotjs),
  Express: brand(siExpress),
  'Tailwind CSS': brand(siTailwindcss),
  Zod: brand(siZod),
  'Jetpack Compose': brand(siJetpackcompose),
  GraphQL: brand(siGraphql),
  Azure: azure,
  'Azure DevOps': azureDevops,
  GCP: brand(siGooglecloud),
  'Google Cloud': brand(siGooglecloud),
  Docker: brand(siDocker),
  'GitLab CI/CD': brand(siGitlab),
  Git: brand(siGit),
  Vercel: brand(siVercel),
  Dynatrace: brand(siDynatrace),
  PostgreSQL: brand(siPostgresql),
  MongoDB: brand(siMongodb),
  MySQL: brand(siMysql),
  Prisma: brand(siPrisma),
  Mongoose: brand(siMongoose),
  Supabase: brand(siSupabase),
  Angular: brand(siAngular),
  OWASP: brand(siOwasp),
  Jira: brand(siJira),
  Looker: brand(siLooker),
  Astro: brand(siAstro),
  GSAP: brand(siGsap),
  'Three.js': brand(siThreedotjs),
};

// Accepts names with a version, such as "Next.js 16".
export function iconFor(name: string): BrandIcon | undefined {
  return icons[name] ?? icons[name.replace(/\s+\d+$/, '')];
}
