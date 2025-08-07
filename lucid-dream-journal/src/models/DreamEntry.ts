import { Schema, model, models } from 'mongoose';

const DreamEntrySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // yyyy-MM-dd
    quality: { type: Number, min: 1, max: 10, required: true },
    sleepDurationHours: { type: Number, min: 0, max: 24, required: true },
    wbtbCount: { type: Number, min: 0, max: 10, required: true },
    lucid: { type: Boolean, default: false },
    lucidity: { type: Number, min: 0, max: 10, default: 0 },
    notes: { type: String },
    tags: { type: [String], default: [] },
    techniques: { type: [String], default: [] }
  },
  { timestamps: true }
);

export type DreamEntryDoc = {
  _id: string;
  userId: string;
  date: string;
  quality: number;
  sleepDurationHours: number;
  wbtbCount: number;
  lucid: boolean;
  lucidity: number;
  notes?: string;
  tags?: string[];
  techniques?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export const DreamEntry = models.DreamEntry || model('DreamEntry', DreamEntrySchema);