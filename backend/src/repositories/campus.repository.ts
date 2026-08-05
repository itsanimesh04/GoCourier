import { Campus, type ICampus } from '../models/campus.model';

export interface CampusRow {
  id: string;
  name: string;
  city: string;
  cutoff_time: string;
  delivery_time: string;
  is_active: boolean;
  created_at: Date;
}

function toCampusRow(doc: ICampus): CampusRow {
  return {
    id: doc._id.toString(),
    name: doc.name,
    city: doc.city,
    cutoff_time: doc.cutoff_time,
    delivery_time: doc.delivery_time,
    is_active: doc.is_active,
    created_at: doc.created_at
  };
}

export const campusRepository = {
  async listActive(): Promise<CampusRow[]> {
    const docs = await Campus.find({ is_active: true }).sort({ name: 1 }).exec();
    return docs.map(doc => toCampusRow(doc));
  },

  async findById(id: string): Promise<CampusRow | null> {
    const doc = await Campus.findById(id).exec();
    return doc ? toCampusRow(doc) : null;
  },

  async findActiveById(id: string): Promise<CampusRow | null> {
    const doc = await Campus.findOne({ _id: id, is_active: true }).exec();
    return doc ? toCampusRow(doc) : null;
  },

  async create(data: Partial<CampusRow>): Promise<CampusRow> {
    const doc = await Campus.create({
      name: data.name,
      city: data.city,
      cutoff_time: data.cutoff_time,
      delivery_time: data.delivery_time,
      is_active: data.is_active ?? true
    });
    return toCampusRow(doc);
  },

  async update(id: string, data: Partial<CampusRow>): Promise<CampusRow | null> {
    const updateData: Record<string, unknown> = {};
    const columns = ['name', 'city', 'cutoff_time', 'delivery_time', 'is_active'];
    for (const column of columns) {
      if (data[column as keyof CampusRow] !== undefined) {
        updateData[column] = data[column as keyof CampusRow];
      }
    }
    const doc = await Campus.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return doc ? toCampusRow(doc) : null;
  }
};