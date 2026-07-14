import { pool } from '../db/pool';
import { cutoffJobService } from '../services/cutoffJob.service';

async function main() {
  const result = await cutoffJobService.run();
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error('Cutoff job failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
