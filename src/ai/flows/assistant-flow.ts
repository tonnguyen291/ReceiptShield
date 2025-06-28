'use server';
/**
 * @fileOverview An AI assistant flow to help users with expense-related queries.
 *
 * - runAssistant - A function that handles user queries about expense policies and receipt status.
 * - AssistantInput - The input type for the runAssistant function.
 * - AssistantOutput - The return type for the runAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question or command.'),
  userEmail: z.string().describe('The email address of the user making the request.'),
  receiptHistory: z
    .string()
    .describe('A JSON string representing the user\'s receipt submission history.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
  suggestUpload: z.boolean().optional().describe('Set to true if the user seems to want to upload a receipt.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function runAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const companyPolicy = `
- **Meals:** Up to $50 per person per day. Alcohol is not covered.
- **Travel:** Economy class flights only. Hotel stays should not exceed $300 per night.
- **Software:** Subscriptions under $100 per month are pre-approved. Anything over requires manager pre-approval.
- **Submission:** All expenses must be submitted within 30 days of the expense date. To submit an expense, go to the Employee Dashboard and click the "Upload New Receipt" button.
`;

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are "Receipt Shield Assistant," a helpful and friendly AI assistant for an expense management application. Your user is {{userEmail}}.

Your capabilities are:
1.  **Answering questions about company expense policy.**
2.  **Checking the status of the user's submitted receipts.**
3.  **Guiding users on how to use the application.**

Here is the company expense policy:
<policy>
${companyPolicy}
</policy>

Here is the user's receipt submission history as a JSON string:
<history>
{{{receiptHistory}}}
</history>

Please answer the user's query based on the policy and their history. Be concise and clear in your responses.
If the user's query is about submitting an expense, uploading a receipt, or starting a new expense report, set the 'suggestUpload' field to true in your JSON response, in addition to providing a helpful text response.
If the user asks a question outside of these topics, politely state that you can only help with expense-related queries.

User Query: "{{query}}"
`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    try {
        const {output} = await prompt(input);
        if (!output) {
            return { response: "I'm sorry, I couldn't process your request at the moment. Please try again later." };
        }
        return output;
    } catch (error) {
        console.error("Error in assistantFlow:", error);
        return { response: "I encountered an error. Please try asking in a different way or check back later." };
    }
  }
);
