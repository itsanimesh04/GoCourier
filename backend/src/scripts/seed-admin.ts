/**
 * Seed an admin user.
 * Usage: npx tsx src/scripts/seed-admin.ts admin@gocourier.com 'YourStrongPassword' "Admin Name"
 */
import { connectDatabase } from '../config/database';
import { User } from '../models/user.model';
import { passwordService } from '../services/password.service';

async function main() {
  const email = (process.argv[2] || 'gocourier365@gmail.com').toLowerCase().trim();
  const password = process.argv[3] || 'Admin@12345';
  const name = process.argv[4] || 'GoCourier Admin';

  await connectDatabase();

  const password_hash = await passwordService.hash(password);
  const existing = await User.findOne({ email }).exec();

  if (existing) {
    existing.role = 'admin';
    existing.password_hash = password_hash;
    existing.name = name;
    existing.is_active = true;
    await existing.save();
    console.log(`Updated existing user to admin: ${email}`);
  } else {
    await User.create({
      email,
      name,
      password_hash,
      role: 'admin',
      is_active: true
    });
    console.log(`Created admin user: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
