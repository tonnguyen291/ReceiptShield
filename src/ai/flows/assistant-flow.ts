
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
  query: z.string().describe("The user's question or command."),
  userEmail: z.string().describe('The email address of the user making the request.'),
  userRole: z.enum(['employee', 'manager', 'admin']).describe('The role of the user.'),
  receiptHistory: z
    .string()
    .describe('A JSON string representing receipt submission history. For employees, this is their own history. For managers, this is for their team. For admins, this is for the entire organization.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
  suggestUpload: z.boolean().optional().describe('Set to true if the user seems to want to upload a receipt.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function runAssistant(input: AssistantInput): Promise<AssistantOutput> {
  // Add flags for Handlebars template
  const extendedInput = { 
      ...input, 
      isManager: input.userRole === 'manager',
      isAdmin: input.userRole === 'admin' 
  };
  return assistantFlow(extendedInput);
}

const companyPolicy = `
Expense Reimbursement Policy

1. Purpose
The Board of Directors of Receipt Shield recognizes that board members, officers, and employees (“Personnel”) of Receipt Shield may be required to travel or incur other expenses from time to time to conduct organizational business and to further the mission of this non-profit organization. The purpose of this Policy is to ensure that (a) adequate cost controls are in place, (b) travel and other expenditures are appropriate, and (c) to provide a uniform and consistent approach for the timely reimbursement of authorized expenses incurred by Personnel. It is the policy of Receipt Shield to reimburse only reasonable and necessary expenses actually incurred by Personnel. When incurring business expenses, Receipt Shield expects Personnel to:
•	Exercise discretion and good business judgment with respect to those expenses.
•	Be cost conscious and spend Receipt Shield’s money as carefully and judiciously as the individual would spend his or her own funds.
•	Report expenses, supported by required documentation, as they were actually spent.

2. Expense Report
Expenses will not be reimbursed unless the individual requesting reimbursement submits a written Expense Report. The Expense Report, which shall be submitted at least monthly or within two weeks of the completion of travel, if travel expense reimbursement is requested, must include:
•	The individual’s name,
•	If reimbursement for travel is requested, the date, origin, destination and purpose of the trip, including a description of each Receipt Shield-related activity during the trip,
•	The name and affiliation of all people for whom expenses are claimed (i.e., people on whom money is spent in order to conduct Receipt Shield’s business), and
•	An itemized list of all expenses for which reimbursement is requested.

3. Receipts
Receipts are required for all expenditures billed directly to Receipt Shield such as airfare and hotel charges. No expense in excess of $25.00 will be reimbursed to Personnel unless the individual requesting reimbursement submits with the Expense Report written receipts from each vendor (not a credit card receipt or statement) showing the vendor’s name, a description of the services provided (if not otherwise obvious), the date, and the total expenses, including tips (if applicable).

4. General Travel Requirements
Advance Approval
All trips involving air travel or at least one overnight stay must be approved in advance by the individual’s supervisor; however, any out-of-state travel must be approved by Receipt Shield’s Chair of the Board or the Chair’s designee.
Necessity of Travel
In determining the reasonableness and necessity of travel expenses, Personnel and the person authorizing the travel shall consider the ways in which Receipt Shield will benefit from the travel and weigh those benefits against the anticipated costs of the travel. The same considerations shall be taken into account in deciding whether a particular individual’s presence on a trip is necessary. In determining whether the benefits to Receipt Shield outweigh the costs, less expensive alternatives, such as participation by telephone or video conferencing, or the availability of local programs or training opportunities, shall be considered.
Personal and Spousal Travel Expenses
Individuals traveling on behalf of Receipt Shield may incorporate personal travel or business with their Receipt Shield-related trips; however, Personnel shall not arrange Receipt Shield travel at a time that is less advantageous to Receipt Shield or involving greater expense to Receipt Shield in order to accommodate personal travel plans. Any additional expenses incurred as a result of personal travel, including but not limited to extra hotel nights, additional stopovers, meals or transportation, are the sole responsibility of the individual and will not be reimbursed by Receipt Shield. Expenses associated with travel of an individual’s spouse, family or friends will not be reimbursed by Receipt Shield.

5. Air Travel
General
Air travel reservations should be made as far in advance as possible in order to take advantage of reduced fares. Receipt Shield will reimburse or pay only the cost of the lowest coach class fare available for direct, non-stop flights from the airport nearest the individual’s home or office to the airport nearest the destination.

Saturday Stays
Personnel traveling on behalf of Receipt Shield are not required to stay over Saturday nights in order to reduce the price of an airline ticket. An individual who chooses to stay over a Saturday night shall be reimbursed for reasonable lodging and meal expenses incurred over the weekend to the extent the expenses incurred do not exceed the difference between the price of the Saturday night stay ticket and the price of the lowest price available ticket that would not include a Saturday night stay. To receive reimbursement for such lodging and meal expenses, the individual must supply, along with the Expense Report, documentation of the amount of the difference between the price of the Saturday stay and non-Saturday stay airline tickets.

Frequent Flyer Miles and Compensation for Denied Boarding
Personnel traveling on behalf of Receipt Shield may accept and retain frequent flyer miles and compensation for denied boarding for their personal use. Individuals may not deliberately patronize a single airline to accumulate frequent flyer miles if less expensive comparable tickets are available on another airline.

6. Lodging
Personnel traveling on behalf of Receipt Shield may be reimbursed at the single room rate for the reasonable cost of hotel accommodations. Convenience, the cost of staying in the city in which the hotel is located, and proximity to other venues on the individual’s itinerary shall be considered in determining reasonableness. Personnel shall make use of available corporate and discount rates for hotels. “Deluxe” or “luxury” hotel rates will not be reimbursed.

7. Out-of-Town Meals
Personnel traveling on behalf of Receipt Shield are reimbursed for the reasonable and actual cost of meals (including tips) subject to a maximum per diem meal allowance of $60.00 per day and the terms and conditions established by Receipt Shield relating to the per diem meal allowance. In addition, reasonable and necessary gratuities that are not covered under meals may be reimbursed.

8. Ground Transportation
Employees are expected to use the most economical ground transportation appropriate under the circumstances and should generally use the following, in this order of desirability:
•	Courtesy Cars: Many hotels have courtesy cars, which will take you to and from the airport at no charge. The hotel will generally have a well-marked courtesy phone at the airport if this service is available. Employees should take advantage of this free service whenever possible.
•	Airport Shuttle or Bus: Airport shuttles or buses generally travel to and from all major hotels for a small fee. At major airports such services are as quick as a taxi and considerably less expensive. Airport shuttle or bus services are generally located near the airport’s baggage claim area.
•	Taxis: When courtesy cars and airport shuttles are not available, a taxi is often the next most economical and convenient form of transportation when the trip is for a limited time and minimal mileage is involved. A taxi may also be the most economical mode of transportation between an individual’s home and the airport.
•	Rental Cars: Car rentals are expensive so other forms of transportation should be considered when practical. Employees will be allowed to rent a car while out of town provided that advance approval has been given by the individual’s supervisor and that the cost is less than alternative methods of transportation.

9. Personal Cars
Personnel are compensated for use of their personal cars when used for Receipt Shield business. When individuals use their personal car for such travel, including travel to and from the airport, mileage will be allowed at the currently approved IRS rate per mile. In the case of individuals using their personal cars to take a trip that would normally be made by air, e.g., Minneapolis to Milwaukee, mileage will be allowed at the currently approved rate; however, the total mileage reimbursement will not exceed the sum of the lowest available round trip coach airfare.

10. Parking and Tolls
Parking and toll expenses, including charges for hotel parking, incurred by Personnel traveling on Receipt Shield business will be reimbursed. The costs of parking tickets, fines, car washes, valet service, etc., are the responsibility of the employee and will not be reimbursed. On-airport parking is permitted for short business trips. For extended trips, Personnel should use off-airport facilities.

11. Entertainment and Business Meetings
Reasonable expenses incurred for business meetings or other types of business-related entertainment will be reimbursed only if the expenditures are approved in advance by [designated officer or director] of Receipt Shield and qualify as tax deductible expenses. Detailed documentation for any such expense must be provided, including:
•	The date and place of entertainment,
•	The nature of expense,
•	The names, titles and corporate affiliation of those entertained,
•	A complete description of the business purpose for the activity including the specific business matter discussed, and
•	Vendor receipts (not a credit card receipt or statement) showing the vendor’s name, a description of the services provided, the date, and the total expenses, including tips (if applicable).

12. Non-Reimbursable Expenditures
Receipt Shield maintains a strict policy that expenses in any category that could be perceived as lavish or excessive will not be reimbursed, as such expenses are inappropriate for reimbursement by a nonprofit, charitable organization. Expenses that are not reimbursable include, but are not limited to:
•	Travel insurance.
•	First class tickets or upgrades.
•	When lodging accommodations have been arranged by Receipt Shield and the individual elects to stay elsewhere, reimbursement is made at the amount no higher than the rate negotiated by Receipt Shield. Reimbursement shall not be made for transportation between the alternate lodging and the meeting site.
•	Limousine travel.
	Movies, liquor or bar costs.
•	Membership dues at any country club, private club, athletic club, golf club, tennis club or similar recreational organization.
•	Participation in or attendance at golf, tennis or sporting events, without the advance approval of the Chair of the Board or the Chair’s designee.
•	Purchase of golf clubs or any other sporting equipment.
•	Spa or exercise charges.
•	Clothing purchases. 
•	Business conferences and entertainment which are not approved by a [designated officer or director] of Receipt Shield.
•	Valet service.
•	Car washes.
•	Toiletry articles.
•	Expenses for spouses, friends or relatives. If a spouse, friend or relative accompanies Personnel on a trip, it is the responsibility of the Personnel to determine any added cost for double occupancy and related expenses and to make the appropriate adjustment in the reimbursement request.
•	Overnight retreats without the prior approval of the Chair of the Board or the Chair’s designee.
Review of Policy
This policy will be reviewed at least every two years and recommendations for amendments will be approved by the board.
`;

const AssistantPromptInputSchema = AssistantInputSchema.extend({
    isManager: z.boolean(),
    isAdmin: z.boolean(),
});

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantPromptInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are "Receipt Shield Assistant," a helpful AI assistant for an expense management application.
Your user is {{userEmail}}, and their role is **{{userRole}}**.

Your capabilities are:
1.  **Answering questions about company expense policy.**
2.  **Checking the status of submitted receipts.**
{{#if isManager}}
3.  **Providing summaries of your team-wide expense data (e.g., total number of pending receipts). You can perform calculations on the provided history data to answer questions.**
{{/if}}
{{#if isAdmin}}
3.  **Providing summaries of organization-wide expense data. You can perform calculations on the provided history data to answer questions.**
{{/if}}
4.  **Guiding users on how to use the application.**

Here is the company expense policy:
<policy>
${companyPolicy}
</policy>

Here is the receipt submission history as a JSON string.
- For an **employee**, this contains only their own receipts.
- For a **manager**, this contains all receipts from their direct reports.
- For an **admin**, this contains all receipts from all users in the organization. 
You can see who submitted each receipt in the 'uploadedBy' field.
<history>
{{{receiptHistory}}}
</history>

**Instructions for your response style:**
- Be **direct and clear**. Get straight to the point.
- Use **bold markdown** (\`**text**\`) to highlight key terms, amounts, and actions.
- Use bullet points (e.g., * or -) to break down information into easy-to-scan lists.
- Use relevant emojis to make your answers more visual and engaging (e.g., ✅ for approvals, ❌ for rejections, 💰 for money, 📄 for documents, 📊 for summaries).

Answer the user's query based on their role, the policy, and their history, following the style instructions above.

{{#if isManager}}
**Manager-specific instructions:** When a manager asks for a summary (e.g., "how many receipts are pending?"), analyze the provided team history JSON and give them a direct number or summary.
{{/if}}
{{#if isAdmin}}
**Admin-specific instructions:** When an admin asks for a summary (e.g., "how many total receipts are flagged across the company?"), analyze the full organizational history JSON provided and give them a direct number or summary.
{{/if}}

If the user's query is about submitting an expense, uploading a receipt, or starting a new expense report, set the 'suggestUpload' field to true in your JSON response, in addition to providing a helpful text response.
If the user asks a question outside of these topics, politely state that you can only help with expense-related queries.

User Query: "{{query}}"
`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantPromptInputSchema,
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

    