
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
  explanation: z.string().describe('Explanation of why the receipt was flagged, structured with "Initial Check:" and "Detailed Analysis:" sections.'),
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
  prompt: `You are an AI expert in fraud detection for expense receipts. Your task is to perform a two-step analysis.

**Step 1: Initial Visual and Data Integrity Check.**
First, perform a quick assessment based on the provided image and data. Look for obvious red flags like:
- Does the image look like a real receipt?
- Are there clear signs of digital manipulation or editing?
- Is the data provided in 'receiptData' grossly inconsistent with a typical receipt?
- Is critical information (vendor, date, total) missing or nonsensical?

**Step 2: Detailed Fraud Analysis.**
Second, perform a deeper analysis considering common fraud schemes. Based on ALL the information, analyze for more subtle issues:
- Does the amount seem unusually high for the items listed?
- Could this be a duplicate submission? (Based on the data provided).
- Are there any other anomalies that suggest this could be a personal expense disguised as a business one, an altered receipt, or other form of fraud?

**Final Output:**
After both steps, combine your findings. Respond with a JSON object that contains:
- A "fraudulent" boolean field. If either Step 1 or Step 2 indicates high suspicion, this should be true.
- A "fraudProbability" number field representing the overall probability (0 to 1) that the receipt is fraudulent.
- An "explanation" string field. Your explanation MUST be structured with "Initial Check:" and "Detailed Analysis:" sections, summarizing your findings from both steps. This gives the human reviewer full context.

Receipt Data: {{{receiptData}}}
Transaction History: {{{transactionHistory}}}
Receipt Image: {{media url=receiptImage}}
`,
});

const flagFraudulentReceiptFlow = ai.defineFlow(
  {
    name: 'flagFraudulentReceiptFlow',
    inputSchema: FlagFraudulentReceiptInputSchema,
    outputSchema: FlagFraudulentReceiptOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);

      if (!output) {
        console.warn('flagFraudulentReceiptFlow: AI model returned null output. Using fallback.');
        return {
          fraudulent: true,
          fraudProbability: 0.85,
          explanation: "Initial Check: AI analysis failed to produce structured output.\nDetailed Analysis: Receipt flagged for caution due to analysis failure. Please review manually.",
        };
      }

      const finalExplanation = output.explanation || (output.fraudulent ? "Receipt flagged by AI; detailed explanation not provided by the model." : "AI analysis completed; no specific issues noted by AI.");

      return {
        ...output,
        explanation: finalExplanation,
      };
    } catch (error: any) {
      if (error.message && (error.message.includes('503 Service Unavailable') || error.message.includes('model is overloaded') || error.message.includes('The model is overloaded'))) {
        console.warn('flagFraudulentReceiptFlow: Model is overloaded. Returning fallback response.');
        return {
          fraudulent: true,
          fraudProbability: 0.9,
          explanation: "Initial Check: AI fraud analysis is temporarily unavailable due to high demand on the AI service.\nDetailed Analysis: The receipt has been flagged for caution. Please review manually or try re-analyzing later.",
        };
      }
      console.error('Error in flagFraudulentReceiptFlow:', error);
      // For other types of errors, return a default fraudulent state to be safe.
      return {
        fraudulent: true,
        fraudProbability: 0.8,
        explanation: "Initial Check: An unexpected error occurred during AI fraud analysis.\nDetailed Analysis: Receipt flagged for caution. Please try again or review manually.",
      };
    }
  }
);
