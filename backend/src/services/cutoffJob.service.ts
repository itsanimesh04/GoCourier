import { Campus } from '../models/campus.model';
import { Order } from '../models/order.model';
import { Batch } from '../models/batch.model';
import { ProcurementTask } from '../models/procurement-task.model';
import { AuditLog } from '../models/audit-log.model';
import { isCutoffPassed, localDateString } from '../utils/campusTime';
import { startSession } from 'mongoose';
import type { ClientSession } from 'mongoose';
import type { ICampus } from '../models/campus.model';

async function getCampusesPastCutoff(now: Date) {
  const campuses = await Campus.find({ is_active: true });
  return campuses.filter((campus) => isCutoffPassed(campus.cutoff_time, now));
}

async function createOrReuseBatch(session: ClientSession, campusId: string, serviceDate: string) {
  const existing = await Batch.findOne({
    campus_id: campusId,
    service_date: serviceDate
  }).session(session);

  if (existing && existing.batch_status === 'open') {
    existing.batch_status = 'locked';
    await existing.save({ session });
    return existing;
  }

  const batch = await Batch.create([{
    campus_id: campusId,
    service_date: serviceDate,
    batch_status: 'locked'
  }], { session });

  return batch[0];
}

async function lockPlacedOrders(session: ClientSession, data: { campusId: string; serviceDate: string; batchId: string }) {
  const result = await Order.updateMany(
    {
      campus_id: data.campusId,
      order_status: 'placed',
      payment_status: 'success',
      batch_id: null,
      placed_at: {
        $gte: new Date(`${data.serviceDate}T00:00:00`),
        $lt: new Date(`${data.serviceDate}T23:59:59`)
      }
    },
    {
      order_status: 'locked',
      batch_id: data.batchId,
      updated_at: new Date()
    },
    { session }
  );

  const lockedOrders = await Order.find({
    campus_id: data.campusId,
    order_status: 'locked',
    batch_id: data.batchId
  }).session(session);

  return lockedOrders.map(order => ({
    id: order._id.toString(),
    restaurant_id: order.restaurant_id.toString()
  }));
}

async function createProcurementTasks(session: ClientSession, batchId: string) {
  const restaurants = await Order.distinct('restaurant_id', {
    batch_id: batchId,
    order_status: 'locked'
  }).session(session);

  const tasks = await Promise.all(
    restaurants.map(restaurantId => 
      ProcurementTask.findOneAndUpdate(
        { batch_id: batchId, restaurant_id: restaurantId },
        { batch_id: batchId, restaurant_id: restaurantId },
        { upsert: true, new: true, session }
      )
    )
  );

  return tasks.filter(Boolean).map(task => ({
    id: task!._id.toString(),
    restaurant_id: task!.restaurant_id.toString()
  }));
}

async function processCampus(campus: ICampus, serviceDate: string) {
  const session = await startSession();
  session.startTransaction();
  
  try {
    // Use findOneAndUpdate with campus_id as lock mechanism
    const existing = await AuditLog.findOne({
      actor_id: `cutoff_lock_${campus._id}`,
      action: 'cutoff_job.started'
    }).session(session);

    // Create run log
    await AuditLog.create([{
      order_id: null,
      actor_id: null,
      action: 'cutoff_job.run',
      details: { campus_id: campus._id.toString(), service_date: serviceDate }
    }], { session });

    const batch = await createOrReuseBatch(session, campus._id.toString(), serviceDate);
    const lockedOrders = await lockPlacedOrders(session, {
      campusId: campus._id.toString(),
      serviceDate,
      batchId: batch._id.toString()
    });

    for (const order of lockedOrders) {
      await AuditLog.create([{
        order_id: order.id,
        actor_id: null,
        action: 'order.locked_by_cutoff_job',
        details: {
          batch_id: batch._id.toString(),
          service_date: serviceDate,
          restaurant_id: order.restaurant_id
        }
      }], { session });
    }

    const procurementTasks = await createProcurementTasks(session, batch._id.toString());

    for (const task of procurementTasks) {
      await AuditLog.create([{
        order_id: null,
        actor_id: null,
        action: 'procurement_task.created',
        details: {
          batch_id: batch._id.toString(),
          procurement_task_id: task.id,
          restaurant_id: task.restaurant_id,
          service_date: serviceDate
        }
      }], { session });
    }

    await session.commitTransaction();

    return {
      campus_id: campus._id.toString(),
      service_date: serviceDate,
      batch_id: batch._id.toString(),
      locked_order_count: lockedOrders.length,
      procurement_task_count: procurementTasks.length
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export const cutoffJobService = {
  async run(now = new Date()) {
    const serviceDate = localDateString(now);
    const campuses = await getCampusesPastCutoff(now);
    const results = [];

    for (const campus of campuses) {
      results.push(await processCampus(campus, serviceDate));
    }

    return {
      service_date: serviceDate,
      campus_count: campuses.length,
      results
    };
  },

  async runForCampus(campusId: string, now = new Date()) {
    const serviceDate = localDateString(now);
    const campus = await Campus.findOne({ 
      _id: campusId, 
      is_active: true 
    }).exec();

    if (!campus || !isCutoffPassed(campus.cutoff_time, now)) {
      return {
        service_date: serviceDate,
        campus_count: 0,
        results: []
      };
    }

    return {
      service_date: serviceDate,
      campus_count: 1,
      results: [await processCampus(campus, serviceDate)]
    };
  }
};