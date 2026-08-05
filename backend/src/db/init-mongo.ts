import mongoose from 'mongoose';
import { env } from '../config/env';

async function initializeDatabase() {
  const mongoUri = env.MONGODB_URI;

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for initialization');

    // Create indexes
    await Promise.all([
      // User indexes
      mongoose.connection.db!.collection('users').createIndex({ phone: 1 }, { unique: true }),
      mongoose.connection.db!.collection('users').createIndex({ phone: 1, created_at: -1 }),
      
      // Campus indexes
      mongoose.connection.db!.collection('campuses').createIndex({ is_active: 1, name: 1 }),
      
      // Restaurant indexes
      mongoose.connection.db!.collection('restaurants').createIndex({ campus_id: 1, is_active: 1, name: 1 }),
      
      // Menu item indexes
      mongoose.connection.db!.collection('menuitems').createIndex({ restaurant_id: 1, is_available: 1 }),
      
      // Order indexes
      mongoose.connection.db!.collection('orders').createIndex({ student_id: 1, order_status: 1, payment_status: 1 }),
      mongoose.connection.db!.collection('orders').createIndex({ campus_id: 1, order_status: 1 }),
      mongoose.connection.db!.collection('orders').createIndex({ batch_id: 1 }),
      
      // Payment indexes
      mongoose.connection.db!.collection('payments').createIndex({ gateway: 1, gateway_order_id: 1 }),
      mongoose.connection.db!.collection('payments').createIndex({ gateway: 1, gateway_txn_id: 1 }),
      mongoose.connection.db!.collection('payments').createIndex({ order_id: 1, gateway: 1, status: 1 }),
      
      // Refund indexes
      mongoose.connection.db!.collection('refunds').createIndex({ gateway_refund_id: 1 }),
      mongoose.connection.db!.collection('refunds').createIndex({ status: 1 }),
      
      // Batch indexes
      mongoose.connection.db!.collection('batches').createIndex({ campus_id: 1, service_date: 1 }),
      
      // Audit log indexes
      mongoose.connection.db!.collection('auditlogs').createIndex({ order_id: 1, created_at: -1 }),
    ]);

    console.log('Database indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

initializeDatabase();