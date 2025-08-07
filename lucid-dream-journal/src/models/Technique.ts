import { Schema, model, models } from 'mongoose';

const TechniqueSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

TechniqueSchema.index({ userId: 1, name: 1 }, { unique: true });
TechniqueSchema.index({ userId: 1, slug: 1 }, { unique: true });

export type TechniqueDoc = {
  _id: string;
  userId: string;
  name: string;
  slug: string;
  isDefault: boolean;
};

export const Technique = models.Technique || model('Technique', TechniqueSchema);
