import mongoose, { Schema, model, models } from 'mongoose';

export interface IFaqItem {
  question: string;
  answer: string;
}

export interface IAppConfig {
  _id: mongoose.Types.ObjectId;
  key: string;
  delivery_fee: string;
  custom_request_fee: string;
  parcel_fee: string;
  faq: IFaqItem[];
  app_download_title: string;
  app_download_subtitle: string;
  play_store_href: string;
  app_store_href: string;
  marquee_strings: string[];
  created_at: Date;
  updated_at: Date;
}

const appConfigSchema = new Schema<IAppConfig>(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    delivery_fee: { type: String, required: true, default: '20.00' },
    custom_request_fee: { type: String, required: true, default: '49.00' },
    parcel_fee: { type: String, required: true, default: '79.00' },
    faq: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true }
        }
      ],
      default: []
    },
    app_download_title: { type: String, default: 'Get the GoCourier app' },
    app_download_subtitle: { type: String, default: 'Order food to your hostel in one batch.' },
    play_store_href: { type: String, default: '' },
    app_store_href: { type: String, default: '' },
    marquee_strings: { type: [String], default: [] }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const AppConfig = models.AppConfig || model<IAppConfig>('AppConfig', appConfigSchema);
