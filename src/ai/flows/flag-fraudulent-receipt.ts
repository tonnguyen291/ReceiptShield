
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { runSimpleMlFraudCheck } from '@/services/ml-fraud-detection';

/**
 * @fileOverview Flow for flagging potentially fraudulent expense receipts using a multi-layered approach.
 *
 * - flagFraudulentReceipt - Function to analyze receipt data and flag potential fraud.
 * - FlagFraudulentReceiptInput - Input type for the flagFraudulentReceipt function.
 * - FlagFraudulentReceiptOutput - Output type for the flagFraudulentReceipt function.
 */

const ReceiptItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

const FlagFraudulentReceiptInputSchema = z.object({
  items: z.array(ReceiptItemSchema).describe('The extracted and verified items from the receipt.'),
  transactionHistory: z
    .string()
    .optional()
    .describe('Optional: User transaction history data as a string.'),
  receiptImage: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type FlagFraudulentReceiptInput = z.infer<typeof FlagFraudulentReceiptInputSchema>;

const FlagFraudulentReceiptOutputSchema = z.object({
  fraudulent: z.boolean().describe('Whether the receipt is potentially fraudulent.'),
  fraudProbability: z
    .number()
    .min(0)
    .max(1)
    .describe('The combined probability (0 to 1) that the receipt is fraudulent.'),
  explanation: z.string().describe('Explanation of why the receipt was flagged, structured with "ML Model Check:", "Initial Check:", and "Detailed Analysis:" sections.'),
});

export type FlagFraudulentReceiptOutput = z.infer<typeof FlagFraudulentReceiptOutputSchema>;

export async function flagFraudulentReceipt(
  input: FlagFraudulentReceiptInput
): Promise<FlagFraudulentReceiptOutput> {
  return flagFraudulentReceiptFlow(input);
}

const PromptInputSchema = FlagFraudulentReceiptInputSchema.extend({
  mlCheckResult: z.string().describe("The result from a preliminary ML model check."),
});


const prompt = ai.definePrompt({
  name: 'flagFraudulentReceiptPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: FlagFraudulentReceiptOutputSchema},
  prompt: `You are an AI expert in fraud detection for expense receipts. Your task is to perform a three-step analysis, using a preliminary check from another model as a starting point.

**Step 0: Preliminary ML Model Check.**
An initial check was run using a standard ML model. Here are its findings:
<ml_findings>
{{{mlCheckResult}}}
</ml_findings>
Use this as a starting point. It may be correct or it may have missed something. Your job is to provide a more detailed, contextual analysis.

**Step 1: Visual and Data Integrity Check.**
First, perform a quick assessment based on the provided image and data. Look for obvious red flags like:
- Does the image look like a real receipt?
- Are there clear signs of digital manipulation or editing?
- Are the receipt items grossly inconsistent with a typical receipt?
- Is critical information (vendor, date, total) missing or nonsensical?

**Step 2: Detailed Fraud Analysis.**
Second, perform a deeper analysis considering common fraud schemes. Based on ALL the information, analyze for more subtle issues:
- Does the amount seem unusually high for the items listed?
- Could this be a duplicate submission? (Based on the data provided).
- Are there any other anomalies that suggest this could be a personal expense disguised as a business one, an altered receipt, or other form of fraud?

**Final Output:**
After all steps, combine your findings. Respond with a JSON object that contains:
- A "fraudulent" boolean field. If any step indicates high suspicion, this should be true.
- A "fraudProbability" number field representing the overall probability (0 to 1) from YOUR analysis that the receipt is fraudulent.
- An "explanation" string field. Your explanation MUST be structured with "ML Model Check:", "Initial Check:", and "Detailed Analysis:" sections, summarizing your findings from all steps. This gives the human reviewer full context.

Receipt Items:
{{#each items}}
- {{this.label}}: {{this.value}}
{{/each}}
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
  async (input) => {
    try {
      // Step 1: Run the simulated ML model check
      const mlResult = await runSimpleMlFraudCheck({ items: input.items });
      const mlResultString = `Risk Score: ${mlResult.preliminaryRiskScore * 100}%. Reason: ${mlResult.reason}`;

      // Step 2: Call the GenAI prompt with the ML result as additional context
      const promptInput = {
        ...input,
        mlCheckResult: mlResultString,
      };

      const {output} = await prompt(promptInput);

      if (!output) {
        console.warn('flagFraudulentReceiptFlow: AI model returned null output. Using fallback.');
        return {
          fraudulent: true,
          fraudProbability: 0.85,
          explanation: "ML Model Check: Preliminary check was run.\nInitial Check: AI analysis failed to produce structured output.\nDetailed Analysis: Receipt flagged for caution due to analysis failure. Please review manually.",
        };
      }
      
      // Combine ML risk with AI risk. We weight the more nuanced AI's opinion higher.
      const finalProbability = (mlResult.preliminaryRiskScore * 0.3) + (output.fraudProbability * 0.7);
      
      const finalExplanation = output.explanation.includes("ML Model Check:") 
        ? output.explanation 
        : `ML Model Check: ${mlResultString}\n${output.explanation}`;

      return {
        ...output,
        fraudProbability: Math.min(1, parseFloat(finalProbability.toFixed(2))), // Cap at 1 and format
        explanation: finalExplanation,
      };

    } catch (error: any) {
      if (error.message && (error.message.includes('503 Service Unavailable') || error.message.includes('model is overloaded') || error.message.includes('The model is overloaded'))) {
        console.warn('flagFraudulentReceiptFlow: Model is overloaded. Returning fallback response.');
        return {
          fraudulent: true,
          fraudProbability: 0.9,
          explanation: "ML Model Check: Preliminary check was run.\nInitial Check: AI fraud analysis is temporarily unavailable due to high demand on the AI service.\nDetailed Analysis: The receipt has been flagged for caution. Please review manually or try re-analyzing later.",
        };
      }
      console.error('Error in flagFraudulentReceiptFlow:', error);
      // For other types of errors, return a default fraudulent state to be safe.
      return {
        fraudulent: true,
        fraudProbability: 0.8,
        explanation: "ML Model Check: Preliminary check was run.\nInitial Check: An unexpected error occurred during AI fraud analysis.\nDetailed Analysis: Receipt flagged for caution. Please try again or review manually.",
      };
    }
  }
);
