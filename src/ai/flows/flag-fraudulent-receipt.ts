// This is a Genkit flow that flags fraudulent receipts.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview Flow for flagging potentially fraudulent expense receipts.
 *
 * - flagFraudulentReceipt - Function to analyze receipt data and flag potential fraud.
 * - FlagFraudulentReceiptInput - Input type for the flagFraudulentReceipt function.
 * - FlagFraudulentReceiptOutput - Output type for the flagFraudulentReceipt function.
 */

const FlagFraudulentReceiptInputSchema = z.object({
  receiptData: z
    .string()
    .describe('The extracted data from the receipt (date, amount, vendor, etc.) as a string.'),
  transactionHistory: z
    .string()
    .optional()
    .describe('Optional: User transaction history data as a string.'),
  receiptImage: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type FlagFraudulentReceiptInput = z.infer<typeof FlagFraudulentReceiptInputSchema>;

const FlagFraudulentReceiptOutputSchema = z.object({
  fraudulent: z.boolean().describe('Whether the receipt is potentially fraudulent.'),
  fraudProbability: z
    .number()
    .min(0)
    .max(1)
    .describe('The probability (0 to 1) that the receipt is fraudulent.'),
  explanation: z.string().describe('Explanation of why the receipt was flagged.'),
});

export type FlagFraudulentReceiptOutput = z.infer<typeof FlagFraudulentReceiptOutputSchema>;

export async function flagFraudulentReceipt(
  input: FlagFraudulentReceiptInput
): Promise<FlagFraudulentReceiptOutput> {
  return flagFraudulentReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flagFraudulentReceiptPrompt',
  input: {schema: FlagFraudulentReceiptInputSchema},
  output: {schema: FlagFraudulentReceiptOutputSchema},
  prompt: `You are an AI expert in fraud detection.

You are provided with data extracted from an expense receipt, and transaction history, if available.

Analyze the data and determine if the receipt is potentially fraudulent.

Receipt Data: {{{receiptData}}}
Transaction History: {{{transactionHistory}}}
Receipt Image: {{media url=receiptImage}}

Respond with a JSON object that contains:
- A "fraudulent" boolean field (true if fraudulent, false otherwise).
- A "fraudProbability" number field representing the probability (0 to 1) that the receipt is fraudulent.
- An "explanation" string field explaining the reasoning behind the fraud determination.
`,
});

const flagFraudulentReceiptFlow = ai.defineFlow(
  {
    name: 'flagFraudulentReceiptFlow',
    inputSchema: FlagFraudulentReceiptInputSchema,
    outputSchema: FlagFraudulentReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
