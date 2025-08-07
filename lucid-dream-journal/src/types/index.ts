export type DreamEntryDTO = {
  _id?: string;
  date: string; // ISO date string (yyyy-MM-dd)
  quality: number; // 1-10
  sleepDurationHours: number; // 0-24
  wbtbCount: number; // 0-10
  lucid: boolean;
  lucidity: number; // 0-10 when lucid
  notes?: string;
  tags?: string[];
  techniques?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Technique = {
  _id?: string;
  name: string;
  slug: string;
  isDefault?: boolean;
};