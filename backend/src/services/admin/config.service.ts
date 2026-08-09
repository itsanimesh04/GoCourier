import { AppConfig, type IFaqItem } from '../../models/app-config.model';

function mapConfig(doc: InstanceType<typeof AppConfig>) {
  return {
    id: doc._id.toString(),
    key: doc.key,
    delivery_fee: doc.delivery_fee,
    custom_request_fee: doc.custom_request_fee,
    parcel_fee: doc.parcel_fee,
    faq: doc.faq,
    app_download_title: doc.app_download_title,
    app_download_subtitle: doc.app_download_subtitle,
    play_store_href: doc.play_store_href,
    app_store_href: doc.app_store_href,
    marquee_strings: doc.marquee_strings,
    updated_at: doc.updated_at
  };
}

export class AdminConfigService {
  async get() {
    let doc = await AppConfig.findOne({ key: 'default' }).exec();
    if (!doc) {
      doc = await AppConfig.create({ key: 'default' });
    }
    return mapConfig(doc);
  }

  async update(data: Partial<{
    delivery_fee: string;
    custom_request_fee: string;
    parcel_fee: string;
    faq: IFaqItem[];
    app_download_title: string;
    app_download_subtitle: string;
    play_store_href: string;
    app_store_href: string;
    marquee_strings: string[];
  }>) {
    const doc = await AppConfig.findOneAndUpdate(
      { key: 'default' },
      { $set: data },
      { new: true, upsert: true }
    ).exec();
    return mapConfig(doc!);
  }
}

export const adminConfigService = new AdminConfigService();
