import mongoose, { Schema, model, models } from 'mongoose';

export interface IBanner {
  _id: mongoose.Types.ObjectId;
  title: string;
  subtitle: string;
  image_url: string | null;
  image_key: string | null;
  cta_label: string;
  cta_href: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image_url: { type: String, default: null },
    image_key: { type: String, default: null },
    cta_label: { type: String, default: '' },
    cta_href: { type: String, default: '' },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, required: true, default: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

bannerSchema.index({ is_active: 1, sort_order: 1 });

export const Banner = models.Banner || model<IBanner>('Banner', bannerSchema);
