import Dexie, { type Table } from 'dexie';
import type { TestResult } from '../types';

type AppDatabase = Dexie & {
  testResults: Table<TestResult>;
};

let dbInstance: AppDatabase | null = null;

/**
 * Gets the singleton instance of the application database.
 * The database is initialized on the first call to this function.
 * This lazy initialization prevents crashes on application startup.
 * @returns The Dexie database instance.
 */
export const getDb = (): AppDatabase => {
  if (!dbInstance) {
    const db = new Dexie('quranAppDatabase') as AppDatabase;
    db.version(1).stores({
      testResults: '++id, surahName, date',
    });
    dbInstance = db;
  }
  return dbInstance;
};
