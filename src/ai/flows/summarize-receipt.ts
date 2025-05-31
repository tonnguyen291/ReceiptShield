'use server';

/**
 * @fileOverview Summarizes the details of a receipt, including vendor, amount, and date.
 *
 * - summarizeReceipt - A function that handles the receipt summarization process.
 * - SummarizeReceiptInput - The input type for the summarizeReceipt function.
 * - SummarizeReceiptOutput - The return type for the summarizeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReceiptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeReceiptInput = z.infer<typeof SummarizeReceiptInputSchema>;

const SummarizeReceiptOutputSchema = z.object({
  summary: z.string().describe('A summary of the receipt details, including vendor, amount, and date.'),
});
export type SummarizeReceiptOutput = z.infer<typeof SummarizeReceiptOutputSchema>;

export async function summarizeReceipt(input: SummarizeReceiptInput): Promise<SummarizeReceiptOutput> {
  return summarizeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReceiptPrompt',
  input: {schema: SummarizeReceiptInputSchema},
  output: {schema: SummarizeReceiptOutputSchema},
  prompt: `You are an expert financial assistant specializing in summarizing receipts for expense reports. Please provide a concise summary of the receipt, including the vendor, amount, and date.  If the date and amount are not in the receipt, respond with 'Date or amount not found'.

Receipt Image: {{media url=photoDataUri}}`,
});

const summarizeReceiptFlow = ai.defineFlow(
  {
    name: 'summarizeReceiptFlow',
    inputSchema: SummarizeReceiptInputSchema,
    outputSchema: SummarizeReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
