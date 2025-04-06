import { addMeasurementUnitToGoals } from '@/db/migrations/add_measurement_unit_to_goals';

export async function runPendingMigrations() {
  // Check if migrations have been run
  const migrationsRun = localStorage.getItem('migrationsRun');
  const migrations = migrationsRun ? JSON.parse(migrationsRun) : {};
  
  // Run measurement_unit migration if needed
  if (!migrations.addMeasurementUnitToGoals) {
    const success = await addMeasurementUnitToGoals();
    if (success) {
      migrations.addMeasurementUnitToGoals = true;
      localStorage.setItem('migrationsRun', JSON.stringify(migrations));
    }
  }
} 