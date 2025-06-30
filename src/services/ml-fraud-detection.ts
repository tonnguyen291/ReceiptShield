'use server';
/**
 * @fileOverview A mock service to simulate a traditional ML fraud detection model.
 */

interface MlCheckInput {
  items: { label: string; value: string }[];
}

interface MlCheckOutput {
  preliminaryRiskScore: number; // 0 to 1
  reason: string;
}

/**
 * Simulates a simple, rule-based machine learning model for initial fraud screening.
 * In a real-world scenario, this would be a call to a deployed ML model endpoint.
 * @param {MlCheckInput} input The receipt items.
 * @returns {Promise<MlCheckOutput>} The result of the ML check.
 */
export async function runSimpleMlFraudCheck({ items }: MlCheckInput): Promise<MlCheckOutput> {
  let riskScore = 0.1; // Base risk score
  const reasons: string[] = ["Baseline check passed."];

  // Rule 1: High amount check
  const totalAmountItem = items.find(item => item.label.toLowerCase().includes('total amount'));
  if (totalAmountItem) {
    // Extract numbers from the value string
    const amountMatch = totalAmountItem.value.match(/[\d.]+/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[0]);
      if (amount > 1000) {
        riskScore = Math.min(1, riskScore + 0.5);
        reasons.push("High transaction amount (>$1000).");
      } else if (amount > 500) {
        riskScore = Math.min(1, riskScore + 0.3);
        reasons.push("Significant transaction amount (>$500).");
      }
    }
  }

  // Rule 2: Suspicious vendor check
  const vendorItem = items.find(item => item.label.toLowerCase().includes('vendor'));
  if (vendorItem) {
    const vendor = vendorItem.value.toLowerCase();
    if (vendor.includes('bar') || vendor.includes('club') || vendor.includes('lounge')) {
      riskScore = Math.min(1, riskScore + 0.4);
      reasons.push("Vendor category (e.g., bar, club) often corresponds to non-reimbursable expenses like alcohol.");
    }
  }

  // Rule 3: Check for missing critical info (as a simple model would)
  const hasVendor = items.some(item => item.label.toLowerCase().includes('vendor') && item.value.trim() !== '' && !item.value.toLowerCase().includes('not found'));
  const hasDate = items.some(item => item.label.toLowerCase().includes('date') && item.value.trim() !== '' && !item.value.toLowerCase().includes('not found'));
  const hasTotal = items.some(item => item.label.toLowerCase().includes('total') && item.value.trim() !== '' && !item.value.toLowerCase().includes('not found'));

  if (!hasVendor || !hasDate || !hasTotal) {
    riskScore = Math.min(1, riskScore + 0.5);
    reasons.push("Missing one or more critical fields (Vendor, Date, Total).");
  }

  // Clean up reasons
  if (reasons.length > 1 && reasons[0] === "Baseline check passed.") {
    reasons.shift();
  }

  return {
    preliminaryRiskScore: parseFloat(riskScore.toFixed(2)),
    reason: reasons.join(' '),
  };
}
