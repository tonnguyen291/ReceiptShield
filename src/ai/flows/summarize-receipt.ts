
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
Analyze the receipt image and extract key pieces of information.
Return these as a list of items, where each item has a "label" and its corresponding "value".

**Crucially, always attempt to include the following labels, even if their values must be "Not found" or "N/A":**
- "Vendor"
- "Date"
- "Total Amount"

For other details found on the receipt:
If the receipt contains multiple line items, extract each as a separate item (e.g., {label: "Item 1 Description", value: "Coffee"}, {label: "Item 1 Amount", value: "$2.50"}).
Extract any other relevant information you find, such as tax, tip, payment method, etc., as separate items with appropriate labels.
Strive for accuracy. Do not invent information that is not present on the receipt, but use "Not found" or "N/A" for the critical fields if their values are genuinely not ascertainable from the image.

Receipt Image: {{media url=photoDataUri}}`,
});

const summarizeReceiptFlow = ai.defineFlow(
  {
    name: 'summarizeReceiptFlow',
    inputSchema: SummarizeReceiptInputSchema,
    outputSchema: SummarizeReceiptOutputSchema,
  },
  async (input: any) => {
    const {output} = await prompt(input);
    if (!output || !output.items) {
      // If the model fails to produce schema-compliant output or items are missing,
      // return a default structure indicating failure for key fields.
      // This allows the user to still see the verification page and manually enter data.
      return { items: [
        { label: "Vendor", value: "Extraction Failed - Edit me" },
        { label: "Date", value: "Extraction Failed - Edit me" },
        { label: "Total Amount", value: "Extraction Failed - Edit me" },
        { label: "Note", value: "AI could not extract details. Please review the image and fill in the fields above. Try uploading a clearer image if needed."}
      ] };
    }
    // Ensure at least the critical fields are present, even if returned by AI as "Not found"
    const ensureField = (label: string, items: Array<{label: string, value: string}>) => {
        if (!items.some(item => item.label.toLowerCase() === label.toLowerCase())) {
            items.push({label: label, value: "Not found - Edit me"});
        }
    };

    let resultItems = [...output.items];
    ensureField("Vendor", resultItems);
    ensureField("Date", resultItems);
    ensureField("Total Amount", resultItems);
    
    // Filter out any potential duplicate "Not found" items if the AI already provided them
    // and then we added our own "Not found - Edit me"
    const uniqueItems = resultItems.reduce((acc, current) => {
      const x = acc.find((item:any) => item.label === current.label);
      if (!x) {
        return acc.concat([current]);
      } else {
        // Prefer non-"Extraction Failed" or non-"Not found - Edit me" if duplicates exist
        if (x.value.includes("Extraction Failed") || x.value.includes("Not found - Edit me")) {
            acc = acc.filter((item:any) => item.label !== x.label);
            return acc.concat([current]);
        }
        return acc;
      }
    }, [] as Array<{label: string, value: string}>);


    return { items: uniqueItems };
  }
);

