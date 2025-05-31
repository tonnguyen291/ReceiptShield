
'use server';

/**
 * @fileOverview Summarizes the details of a receipt, extracting key information into structured items.
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

const ReceiptItemSchema = z.object({
  label: z.string().describe('The label or category of the extracted information (e.g., "Vendor", "Date", "Total Amount", "Item Name").'),
  value: z.string().describe('The extracted value for the corresponding label.'),
});

const SummarizeReceiptOutputSchema = z.object({
  items: z.array(ReceiptItemSchema).describe('A list of key information items extracted from the receipt. Each item has a label and a value.'),
});
export type SummarizeReceiptOutput = z.infer<typeof SummarizeReceiptOutputSchema>;

export async function summarizeReceipt(input: SummarizeReceiptInput): Promise<SummarizeReceiptOutput> {
  return summarizeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReceiptPrompt',
  input: {schema: SummarizeReceiptInputSchema},
  output: {schema: SummarizeReceiptOutputSchema},
  prompt: `You are an expert financial assistant specializing in extracting structured information from receipts for expense reports.
Please analyze the receipt image and extract key pieces of information.
Return these as a list of items, where each item has a "label" (e.g., "Vendor", "Date", "Total Amount", "Item 1 Description", "Item 1 Amount") and its corresponding "value".
If the receipt contains multiple line items, extract each as a separate item (e.g., {label: "Item 1", value: "Coffee - $2.50"}, {label: "Item 2", value: "Sandwich - $5.00"}).
If specific common fields like Date or Total Amount are not found, include an item like {label: "Date", value: "Not found"} or {label: "Total Amount", value: "Not found"}.
Do not invent items if they are not on the receipt. Strive for accuracy.

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
