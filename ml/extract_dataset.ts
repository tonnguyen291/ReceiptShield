import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import { summarizeReceipt } from '@/ai/flows/summarize-receipt';
import { createObjectCsvWriter } from 'csv-writer';

const RECEIPTS_DIR = path.resolve(__dirname, './receipts');
const OUTPUT_CSV = path.resolve(__dirname, './receipts_dataset.csv');

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function imageToDataURI(filePath: string): Promise<string> {
  const ext = path.extname(filePath).slice(1);
  const data = await fs.readFile(filePath);
  const base64 = data.toString('base64');
  return `data:image/${ext};base64,${base64}`;
}

function extractFlatFeatures(items: { label: string; value: string }[]) {
  const map: Record<string, string> = {};
  for (const item of items) {
    map[item.label.toLowerCase().replace(/\s+/g, '_')] = item.value;
  }

  return {
    vendor: map.vendor || '',
    total_amount: parseFloat(map.total_amount?.replace(/[^0-9.]/g, '') || '0'),
    date: map.date || '',
    item_count: Object.keys(map).filter(k => k.startsWith('item_')).length,
    tip: parseFloat(map.tip?.replace(/[^0-9.]/g, '') || '0'),
    payment_method: map.payment_method || '',
  };
}

async function getAllImagePaths(): Promise<{ path: string, isFraud: boolean }[]> {
  const entries: { path: string, isFraud: boolean }[] = [];

  const realFolderPath = path.join(RECEIPTS_DIR, 'real');
  const files = await fs.readdir(realFolderPath);

  for (const file of files) {
    if (!file.endsWith('.jpg') && !file.endsWith('.jpeg')) continue;
    entries.push({ path: path.join(realFolderPath, file), isFraud: false });
  }

  return entries;
}


async function run() {
  const imageEntries = await getAllImagePaths();

  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_CSV,
    header: [
      { id: 'vendor', title: 'vendor' },
      { id: 'total_amount', title: 'total_amount' },
      { id: 'date', title: 'date' },
      { id: 'item_count', title: 'item_count' },
      { id: 'tip', title: 'tip' },
      { id: 'payment_method', title: 'payment_method' },
      { id: 'is_fraud', title: 'is_fraud' },
    ],
    append: false,
  });

  const records = [];

  for (const { path: filePath, isFraud } of imageEntries) {
    try {
      const photoDataUri = await imageToDataURI(filePath);
      const { items } = await summarizeReceipt({ photoDataUri });
      const features = extractFlatFeatures(items);
      records.push({ ...features, is_fraud: isFraud ? 1 : 0 });
      console.log(`✔ Processed: ${filePath}`);

      await sleep(5000);
    } catch (err) {
      console.error(`❌ Failed to process: ${filePath}`, err);
    }
  }

  await csvWriter.writeRecords(records);
  console.log('✅ Dataset saved to:', OUTPUT_CSV);
}

run().catch(console.error);
