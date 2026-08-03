export type RichSegment =
  | { type: 'text'; text: string }
  | { type: 'highlight'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'link'; text: string; href: string; external?: boolean };

export interface SiteMeta {
  name: string;
  legalName: string;
  logo: string;
  email: string;
  headline: string;
}

export interface NavContent {
  home: string;
  about: string;
  speaking: string;
  resume: string;
  projects: string;
  repoAria: string;
}

export interface HeroContent {
  topLines: string[];
  typewriter: string[];
  nextTalkLabel: string;
  yourEvent: string;
  talkSubject: string;
  checkOut: string;
  slidesPath: string;
  spaceshipAlt: string;
}

export interface AboutContent {
  title: string;
  paragraphs: RichSegment[][];
  photoAlt: string;
}

export interface TalkContent {
  id: string;
  title?: string;
  kind?: string;
  event: string;
  date: string;
  website: string;
  slides?: string;
  repo?: string;
  video?: string;
  location?: string;
}

export interface SpeakingContent {
  title: string;
  intro: RichSegment[][];
  cta: RichSegment[];
  ctaSubject: string;
  groupLabels: {
    upcoming: string;
    past: string;
  };
  linkLabels: {
    event: string;
    slides: string;
    repo: string;
    watch: string;
  };
  empty: RichSegment[];
  videoUrl: string;
  talks: TalkContent[];
}

export interface TechnologyGroup {
  languages: string[];
  frameworks: string[];
  libraries: string[];
}

export interface ProjectContent {
  id: string;
  title: string;
  description: string;
  image: string;
  featured: boolean;
  category: 'big' | 'small';
  technologies: TechnologyGroup;
  tags: string[];
  links: {
    github: string;
    demo: string | null;
  };
}

export interface ProjectsContent {
  title: string;
  searchPlaceholder: string;
  showAllLabel: string;
  showFeaturedLabel: string;
  allTags: string;
  noResults: string;
  seeOnGithub: string;
  tryItOut: string;
  visitWebsite: string;
  usesLabel: string;
  comingSoonAlert: string;
  comingSoon: {
    title: string;
    description: string;
    github: string;
    website: string;
  };
  altTemplate: string;
  items: ProjectContent[];
}

export interface ResumeEntryContent {
  title: string;
  company: string;
  dates: string;
  bulletPoints?: string[];
}

export interface ResumeSectionContent {
  key: string;
  title: string;
  entries: ResumeEntryContent[];
}

export interface ResumeContent {
  title: string;
  iframeTitle: string;
  iframeUrl: string;
  sections: ResumeSectionContent[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface SocialsContent {
  title: string;
  description: RichSegment[];
  links: SocialLink[];
}

export interface FooterContent {
  credit: RichSegment[];
  copyright: string;
}

export interface ChatBubbleCommandContent {
  code: string;
  output: string;
  duration: number;
}

export interface ChatBubbleContent {
  title: string;
  ariaLabel: string;
  prompt: string;
  cursor: string;
  statuses: {
    ready: string;
    running: string;
    done: string;
    connected: string;
  };
  commands: ChatBubbleCommandContent[];
}

export interface ContributionMapContent {
  months: string[];
  weekdays: string[];
  totalCount: string;
  legend: {
    less: string;
    more: string;
  };
  years: number[];
}

export interface SiteContent {
  meta: SiteMeta;
  nav: NavContent;
  hero: HeroContent;
  about: AboutContent;
  speaking: SpeakingContent;
  projects: ProjectsContent;
  resume: ResumeContent;
  socials: SocialsContent;
  footer: FooterContent;
  chatBubble: ChatBubbleContent;
  contributionMap: ContributionMapContent;
}

export type Language = 'en' | 'qc';
