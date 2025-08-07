import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export type UserDoc = {
  _id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export const User = models.User || model('User', UserSchema);
