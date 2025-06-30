import { config } from 'dotenv';
config();

import '@/ai/flows/flag-fraudulent-receipt.ts';
import '@/ai/flows/summarize-receipt.ts';
import '@/ai/flows/assistant-flow.ts';
