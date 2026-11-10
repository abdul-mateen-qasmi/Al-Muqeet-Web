import localforage from 'localforage';
import { Worker, Transaction, Settings } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Use localforage to simulate a database for the demo functionality
const db = {
  workers: localforage.createInstance({ name: 'loan-manager', storeName: 'workers' }),
  transactions: localforage.createInstance({ name: 'loan-manager', storeName: 'transactions' }),
  settings: localforage.createInstance({ name: 'loan-manager', storeName: 'settings' }),
};

export const MOCK_COMPANY_ID = 'demo-company';

export const getSettings = async (): Promise<Settings> => {
  const settings = await db.settings.getItem<Settings>(MOCK_COMPANY_ID);
  if (!settings) {
    const defaultSettings: Settings = {
      company_id: MOCK_COMPANY_ID,
      company_name: 'My Company',
      currency: 'AED',
      week_start: 'monday',
      theme: 'dark'
    };
    await db.settings.setItem(MOCK_COMPANY_ID, defaultSettings);
    return defaultSettings;
  }
  return settings;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await db.settings.setItem(MOCK_COMPANY_ID, settings);
};

export const getWorkers = async (): Promise<Worker[]> => {
  const workers: Worker[] = [];
  await db.workers.iterate((value: Worker) => {
    if (!value.archived) {
      workers.push(value);
    }
  });
  return workers;
};

export const addWorker = async (worker: Omit<Worker, 'id' | 'company_id' | 'created_at' | 'archived'>): Promise<Worker> => {
  const newWorker: Worker = {
    ...worker,
    id: uuidv4(),
    company_id: MOCK_COMPANY_ID,
    created_at: new Date().toISOString(),
    archived: false,
  };
  await db.workers.setItem(newWorker.id, newWorker);
  return newWorker;
};

export const updateWorker = async (id: string, updates: Partial<Worker>): Promise<Worker> => {
  const worker = await db.workers.getItem<Worker>(id);
  if (!worker) throw new Error('Worker not found');
  const updatedWorker = { ...worker, ...updates };
  await db.workers.setItem(id, updatedWorker);
  return updatedWorker;
};

export const archiveWorker = async (id: string): Promise<void> => {
  await updateWorker(id, { archived: true });
};

export const getTransactions = async (workerId?: string): Promise<Transaction[]> => {
  const transactions: Transaction[] = [];
  await db.transactions.iterate((value: Transaction) => {
    if (!value.deleted_at && (!workerId || value.worker_id === workerId)) {
      transactions.push(value);
    }
  });
  // Sort by date (descending), then created_at (descending)
  return transactions.sort((a, b) => {
    const dateCmp = new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime();
    if (dateCmp !== 0) return dateCmp;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export const addTransaction = async (tx: Omit<Transaction, 'id' | 'company_id' | 'created_at'>): Promise<Transaction> => {
  const newTx: Transaction = {
    ...tx,
    id: uuidv4(),
    company_id: MOCK_COMPANY_ID,
    created_at: new Date().toISOString(),
  };
  await db.transactions.setItem(newTx.id, newTx);
  return newTx;
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
  const tx = await db.transactions.getItem<Transaction>(id);
  if (!tx) throw new Error('Transaction not found');
  const updatedTx = { ...tx, ...updates };
  await db.transactions.setItem(id, updatedTx);
  return updatedTx;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await updateTransaction(id, { deleted_at: new Date().toISOString() });
};

export const clearDemoData = async () => {
  await db.workers.clear();
  await db.transactions.clear();
};

export const seedDemoData = async () => {
  await clearDemoData();

  const mockWorkers = [
    { name: 'Suraj Kumar', phone: '0501234567' },
    { name: 'Rahul Sharma', phone: '0501234568' },
    { name: 'Mohammed Ali', phone: '0501234569' },
    { name: 'John Smith', phone: '0501234570' },
    { name: 'David Lee', phone: '0501234571' },
    { name: 'Amit Patel', phone: '0501234572' },
    { name: 'Vikram Singh', phone: '0501234573' },
    { name: 'Sanjay Dutt', phone: '0501234574' }
  ];

  const addedWorkers: Worker[] = [];
  for (const w of mockWorkers) {
    addedWorkers.push(await addWorker(w));
  }

  // Add some transactions over the last 6 months
  const now = new Date();

  const generateRandomTransactions = async (worker: Worker, loanCount: number, repaymentCount: number) => {
    let currentBalance = 0;
    for (let i = 0; i < loanCount; i++) {
        const daysAgo = Math.floor(Math.random() * 180);
        const txDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        const amount = Math.floor(Math.random() * 500) + 100;
        await addTransaction({
            worker_id: worker.id,
            type: 'loan',
            amount: amount,
            tx_date: txDate.toISOString(),
            note: 'Advance'
        });
        currentBalance += amount;
    }
    for (let i = 0; i < repaymentCount; i++) {
        const daysAgo = Math.floor(Math.random() * 180);
        const txDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        const amount = Math.min(currentBalance, Math.floor(Math.random() * 300) + 50);
        if (amount > 0) {
            await addTransaction({
                worker_id: worker.id,
                type: 'repayment',
                amount: amount,
                tx_date: txDate.toISOString(),
            });
            currentBalance -= amount;
        }
    }
  }

  await generateRandomTransactions(addedWorkers[0], 5, 2);
  await generateRandomTransactions(addedWorkers[1], 3, 3);
  await generateRandomTransactions(addedWorkers[2], 8, 1);
  await generateRandomTransactions(addedWorkers[3], 2, 2);
  await generateRandomTransactions(addedWorkers[4], 1, 0);
  await generateRandomTransactions(addedWorkers[5], 6, 4);
  await generateRandomTransactions(addedWorkers[6], 4, 3);
  await generateRandomTransactions(addedWorkers[7], 3, 0);
};
