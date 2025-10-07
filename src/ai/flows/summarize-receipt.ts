// Receipt summarization flow using AI
// This is a simplified version that works without Genkit AI dependencies

import { z } from 'zod';

// Input schema for receipt summarization
export const SummarizeReceiptInputSchema = z.object({
  photoDataUri: z.string().url(),
});

// Output schema for receipt summarization
export const SummarizeReceiptOutputSchema = z.object({
  merchantName: z.string(),
  merchantAddress: z.string(),
  transactionDate: z.string(),
  totalAmount: z.string(),
  taxAmount: z.string(),
  items: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.string(),
  })),
  receiptNumber: z.string(),
  paymentMethod: z.string(),
  category: z.string(),
  fraudIndicators: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.string(),
  })),
  confidence: z.number(),
});

export type SummarizeReceiptInput = z.infer<typeof SummarizeReceiptInputSchema>;
export type SummarizeReceiptOutput = z.infer<typeof SummarizeReceiptOutputSchema>;

// Simplified fallback implementation when AI is not available
const summarizeReceiptFlow = async (input: SummarizeReceiptInput): Promise<SummarizeReceiptOutput> => {
  try {
    console.log('🔍 Starting receipt analysis (fallback mode)...');
    
    // Fallback implementation when AI is not available
    return {
      merchantName: 'Not available',
      merchantAddress: 'Not available',
      transactionDate: 'Not available',
      totalAmount: 'Not available',
      taxAmount: 'Not available',
      items: [],
      receiptNumber: 'Not available',
      paymentMethod: 'Not available',
      category: 'Not available',
      fraudIndicators: [],
      confidence: 0,
    };
  } catch (error) {
    console.error('❌ Receipt analysis failed:', error);
    throw error;
  }
};

export async function summarizeReceipt(input: SummarizeReceiptInput): Promise<SummarizeReceiptOutput> {
  return summarizeReceiptFlow(input);
}