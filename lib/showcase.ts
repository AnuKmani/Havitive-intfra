/** The Showcase menu: one page per section. Items come from Admin > Showcase (table showcase_items). */
export type ShowcaseSection = {
  /** URL part: /showcase/<slug> */
  slug: string;
  /** Value of showcase_items.section */
  key: "csr" | "handover" | "awards" | "media" | "project-videos";
  label: string;
  heading: string;
  intro: string;
  seoKey: string;
};

export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    slug: "csr-activities", key: "csr", label: "CSR Activities", seoKey: "page:csr-activities",
    heading: "CSR Activities",
    intro: "Giving back to the communities we build for: the social and community initiatives Havitive has taken part in.",
  },
  {
    slug: "handing-over-events", key: "handover", label: "Handing Over Events", seoKey: "page:handing-over-events",
    heading: "Handing Over Events",
    intro: "Moments from the day we hand a finished project over to its owners.",
  },
  {
    slug: "awards-and-recognition", key: "awards", label: "Awards & Recognition", seoKey: "page:awards-and-recognition",
    heading: "Awards & Recognition",
    intro: "Honours and recognition received for our work in architecture, engineering and construction.",
  },
  {
    slug: "media", key: "media", label: "Media", seoKey: "page:media",
    heading: "Havitive in the Media",
    intro: "News coverage, features and interviews about Havitive Infra.",
  },
  {
    slug: "project-videos", key: "project-videos", label: "Project Videos", seoKey: "page:project-videos",
    heading: "Project Videos",
    intro: "Walkthroughs and films of our projects. Press play and the video runs right in the box.",
  },
];

export const showcasePath = (slug: string) => `/showcase/${slug}`;
export const TESTIMONIALS_PATH = "/showcase/testimonials";
