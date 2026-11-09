// content/samples.json as the pages read it (written by the fleet's scripts/samples-sync.py, creatorCC queue 383).
import data from "../content/samples.json";
import { safe, type Sample } from "./directory";

export const SAMPLES: Sample[] = ((data as { samples?: unknown[] }).samples ?? []).filter(safe);
export const SAMPLES_AT: string | null = (data as { at?: string | null }).at ?? null;
