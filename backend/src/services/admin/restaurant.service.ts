import { Restaurant } from '../../models/restaurant.model';
import { Campus } from '../../models/campus.model';
import { NotFoundError } from '../../utils/errors';

async function ensureCampusExists(campusId: string) {
  const campus = await Campus.findById(campusId);
  if (!campus) {
    throw new NotFoundError('Campus not found');
  }
}

export const restaurantService = {
  async create(data: {
    campus_id: string;
    name: string;
    is_active?: boolean;
    commission_rate?: string;
    manual_priority?: number;
    refund_risk_penalty?: string;
  }) {
    if (!data.campus_id) {
      throw new NotFoundError('Campus not found');
    }

    await ensureCampusExists(data.campus_id);
    
    const doc = await Restaurant.create({
      campus_id: data.campus_id,
      name: data.name,
      is_active: data.is_active ?? true,
      commission_rate: data.commission_rate ?? '0.00',
      manual_priority: data.manual_priority ?? 0,
      refund_risk_penalty: data.refund_risk_penalty ?? '0.00'
    });

    return {
      id: doc._id.toString(),
      campus_id: doc.campus_id.toString(),
      name: doc.name,
      is_active: doc.is_active,
      commission_rate: doc.commission_rate,
      manual_priority: doc.manual_priority,
      refund_risk_penalty: doc.refund_risk_penalty,
      created_at: doc.created_at
    };
  },

  async update(id: string, data: {
    campus_id?: string;
    name?: string;
    is_active?: boolean;
    commission_rate?: string;
    manual_priority?: number;
    refund_risk_penalty?: string;
  }) {
    if (data.campus_id) {
      await ensureCampusExists(data.campus_id);
    }

    const doc = await Restaurant.findByIdAndUpdate(id, data, { new: true }).exec();

    if (!doc) {
      throw new NotFoundError('Restaurant not found');
    }

    return {
      id: doc._id.toString(),
      campus_id: doc.campus_id.toString(),
      name: doc.name,
      is_active: doc.is_active,
      commission_rate: doc.commission_rate,
      manual_priority: doc.manual_priority,
      refund_risk_penalty: doc.refund_risk_penalty,
      created_at: doc.created_at
    };
  }
};