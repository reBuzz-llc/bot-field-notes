// "This week in the family" (creatorCC queue 316): one post a week, written every Sunday by ~/bots/scripts/family_week.py
// from the family's own records into content/family-weeks.json, newest first. Names of businesses, people and places
// are masked by the script before they reach this file.
import weeks from "@/content/family-weeks.json";

export type FamilyWeek = {
  slug: string;
  from: string;
  to: string;
  title: string;
  summary: string;
  sections: { heading: string; lines: string[] }[];
  generated_at: string;
};

export const FAMILY_WEEKS = weeks as FamilyWeek[];
export const familyWeekPath = (slug: string) => `/family-week/${slug}`;
export const familyWeekBySlug = (slug: string) => FAMILY_WEEKS.find((w) => w.slug === slug);
