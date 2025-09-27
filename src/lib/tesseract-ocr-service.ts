/**
 * Tesseract OCR Service
 * =====================
 * 
 * This service provides OCR functionality using Google Tesseract.js
 * as an alternative to the Google AI-based OCR system.
 */

import Tesseract from 'tesseract.js';
import { ReceiptDataItem } from '@/types';

export interface TesseractOCRResult {
  text: string;
  confidence: number;
  items: ReceiptDataItem[];
  processingTime: number;
  errorLog: string[];
}

/**
 * Extract text from an image using Tesseract OCR
 * @param imageDataUri - The image as a data URI
 * @returns Promise with OCR results
 */
export async function extractTextWithTesseract(imageDataUri: string): Promise<TesseractOCRResult> {
  const startTime = Date.now();
  const errorLog: string[] = [];
  
  try {
    console.log('🔍 Starting Tesseract OCR analysis...');
    
    // Configure Tesseract worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`📝 OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    // Perform OCR
    const { data: { text, confidence } } = await worker.recognize(imageDataUri);
    
    // Terminate worker
    await worker.terminate();
    
    console.log('✅ Tesseract OCR completed');
    console.log('📊 OCR Confidence:', confidence);
    console.log('📝 Extracted text length:', text.length);
    
    // Parse the extracted text into structured data
    const items = parseReceiptText(text);
    
    const processingTime = Date.now() - startTime;
    
    return {
      text,
      confidence: confidence / 100, // Convert to 0-1 scale
      items,
      processingTime,
      errorLog
    };
    
  } catch (error) {
    const errorMsg = `Tesseract OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errorLog.push(errorMsg);
    console.error(errorMsg, error);
    
    return {
      text: '',
      confidence: 0,
      items: [],
      processingTime: Date.now() - startTime,
      errorLog
    };
  }
}

/**
 * Parse OCR text into structured receipt data
 * @param text - Raw OCR text
 * @returns Array of structured receipt items
 */
function parseReceiptText(text: string): ReceiptDataItem[] {
  const items: ReceiptDataItem[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  console.log('📋 Parsing receipt text into structured data...');
  console.log('📄 Total lines to process:', lines.length);
  
  for (const line of lines) {
    // Skip very short lines (likely noise)
    if (line.length < 3) continue;
    
    // Extract vendor/store name (usually at the top)
    if (isVendorLine(line)) {
      items.push({
        id: `vendor-${items.length}`,
        label: 'Vendor',
        value: line
      });
      continue;
    }
    
    // Extract date
    const dateMatch = extractDate(line);
    if (dateMatch) {
      items.push({
        id: `date-${items.length}`,
        label: 'Date',
        value: dateMatch
      });
      continue;
    }
    
    // Extract total amount
    const totalMatch = extractTotalAmount(line);
    if (totalMatch) {
      items.push({
        id: `total-${items.length}`,
        label: 'Total Amount',
        value: totalMatch
      });
      continue;
    }
    
    // Extract tip
    const tipMatch = extractTip(line);
    if (tipMatch) {
      items.push({
        id: `tip-${items.length}`,
        label: 'Tip',
        value: tipMatch
      });
      continue;
    }
    
    // Extract payment method
    const paymentMatch = extractPaymentMethod(line);
    if (paymentMatch) {
      items.push({
        id: `payment-${items.length}`,
        label: 'Payment Method',
        value: paymentMatch
      });
      continue;
    }
    
    // Extract individual items (product names with prices)
    const itemMatch = extractItem(line);
    if (itemMatch) {
      items.push({
        id: `item-${items.length}`,
        label: 'Item',
        value: `${itemMatch.name} - $${itemMatch.price}`
      });
      continue;
    }
    
    // If no specific pattern matches, treat as general text
    if (line.length > 5 && !isLikelyNoise(line)) {
      items.push({
        id: `text-${items.length}`,
        label: 'Text',
        value: line
      });
    }
  }
  
  console.log('✅ Parsed receipt items:', items.length);
  return items;
}

/**
 * Check if a line is likely a vendor/store name
 */
function isVendorLine(line: string): boolean {
  const vendorKeywords = ['store', 'shop', 'market', 'restaurant', 'cafe', 'bar', 'pharmacy', 'gas', 'station'];
  const lowerLine = line.toLowerCase();
  
  // Check for vendor keywords
  if (vendorKeywords.some(keyword => lowerLine.includes(keyword))) {
    return true;
  }
  
  // Check if line is at the beginning and doesn't contain numbers
  if (line.length > 5 && line.length < 50 && !/\d/.test(line)) {
    return true;
  }
  
  return false;
}

/**
 * Extract date from text
 */
function extractDate(line: string): string | null {
  // Common date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{1,2}\.\d{1,2}\.\d{2,4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{2,4}/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  ];
  
  for (const pattern of datePatterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract total amount from text - only match actual totals, not individual prices
 */
function extractTotalAmount(line: string): string | null {
  // Skip lines that look like individual items (contain product names)
  const itemKeywords = ['burrito', 'meal', 'drink', 'beer', 'chicken', 'kids', 'large', 'domestic'];
  const hasItemKeywords = itemKeywords.some(keyword => 
    line.toLowerCase().includes(keyword)
  );
  
  if (hasItemKeywords) {
    return null; // This is likely an individual item, not a total
  }
  
  // Priority patterns for final totals (most important first)
  const finalTotalPatterns = [
    /balance[:\s]*due[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*due[:\s]*\$?(\d+\.?\d*)/i,
    /grand[:\s]*total[:\s]*\$?(\d+\.?\d*)/i,
    /final[:\s]*total[:\s]*\$?(\d+\.?\d*)/i,
    /total[:\s]*due[:\s]*\$?(\d+\.?\d*)/i
  ];
  
  // Check for final totals first
  for (const pattern of finalTotalPatterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  // Fallback patterns for any total
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /subtotal[:\s]*\$?(\d+\.?\d*)/i,
    /^total[:\s]*\$?(\d+\.?\d*)$/i,
    /^subtotal[:\s]*\$?(\d+\.?\d*)$/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract tip amount from text
 */
function extractTip(line: string): string | null {
  const tipPatterns = [
    /tip[:\s]*\$?(\d+\.?\d*)/i,
    /gratuity[:\s]*\$?(\d+\.?\d*)/i
  ];
  
  for (const pattern of tipPatterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract payment method from text
 */
function extractPaymentMethod(line: string): string | null {
  const paymentMethods = ['cash', 'credit', 'debit', 'card', 'visa', 'mastercard', 'amex', 'paypal', 'apple pay', 'google pay'];
  const lowerLine = line.toLowerCase();
  
  for (const method of paymentMethods) {
    if (lowerLine.includes(method)) {
      return method.toUpperCase();
    }
  }
  
  return null;
}

/**
 * Extract individual item with price
 */
function extractItem(line: string): { name: string; price: string } | null {
  // More flexible patterns for items with prices
  const itemPatterns = [
    /^(.+?)\s+\$(\d+\.?\d*)$/, // "ITEM NAME $8.79"
    /^(.+?)\s+(\d+\.?\d*)\s*$/, // "ITEM NAME 8.79"
    /^(.+?)\s+\$(\d+\.?\d*)\s*$/ // "ITEM NAME $8.79 "
  ];
  
  for (const pattern of itemPatterns) {
    const match = line.match(pattern);
    if (match) {
      const name = match[1].trim();
      const price = match[2];
      
      // Filter out obvious non-items and totals
      const isNotTotal = !name.toLowerCase().includes('total') && 
                        !name.toLowerCase().includes('subtotal') &&
                        !name.toLowerCase().includes('tax') &&
                        !name.toLowerCase().includes('balance');
      
      const isNotNoise = name.length > 2 && name.length < 50 && !isLikelyNoise(name);
      
      if (isNotTotal && isNotNoise) {
        return { name, price };
      }
    }
  }
  
  return null;
}

/**
 * Check if text is likely noise/irrelevant
 */
function isLikelyNoise(text: string): boolean {
  const noisePatterns = [
    /^[^a-zA-Z]*$/, // Only numbers/symbols
    /^(receipt|invoice|bill|total|subtotal|tax|tip)$/i, // Common receipt words
    /^\d+$/, // Only numbers
    /^[^a-zA-Z0-9]*$/, // Only symbols
    /^(thank|you|visit|again|welcome)$/i // Common footer text
  ];
  
  return noisePatterns.some(pattern => pattern.test(text));
}

/**
 * Get OCR service information
 */
export function getTesseractOCRInfo() {
  return {
    name: 'Tesseract.js',
    version: '5.x',
    language: 'English',
    description: 'Google Tesseract OCR engine for text extraction from images'
  };
}
