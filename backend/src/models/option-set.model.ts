import mongoose, { Schema, model, models } from 'mongoose';

export interface IOptionChoice {
  _id: mongoose.Types.ObjectId;
  name: string;
  sort_order: number;
}

export interface IOptionSet {
  _id: mongoose.Types.ObjectId;
  name: string;
  is_active: boolean;
  sort_order: number;
  choices: IOptionChoice[];
  created_at: Date;
  updated_at: Date;
}

const optionChoiceSchema = new Schema<IOptionChoice>(
  {
    name: { type: String, required: true },
    sort_order: { type: Number, default: 0 }
  },
  { _id: true }
);

const optionSetSchema = new Schema<IOptionSet>(
  {
    name: { type: String, required: true },
    is_active: { type: Boolean, required: true, default: true },
    sort_order: { type: Number, default: 0 },
    choices: { type: [optionChoiceSchema], default: [] }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

optionSetSchema.index({ sort_order: 1, name: 1 });

export const OptionSet = models.OptionSet || model<IOptionSet>('OptionSet', optionSetSchema);
