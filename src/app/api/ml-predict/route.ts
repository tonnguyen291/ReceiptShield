import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { ReceiptDataItem, MLFraudPrediction } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: ReceiptDataItem[] } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: items array is required'
      }, { status: 400 });
    }

    // Call Python script directly
    const prediction = await callPythonMLModel(items);
    
    if (!prediction) {
      return NextResponse.json({
        success: false,
        error: 'ML model prediction failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      prediction
    });

  } catch (error) {
    console.error('ML prediction API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function callPythonMLModel(items: ReceiptDataItem[]): Promise<MLFraudPrediction | null> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'ml', 'predict_single.py');
    const inputData = JSON.stringify({ items });
    
    const pythonProcess = spawn('python', [scriptPath], {
      cwd: path.join(process.cwd(), 'ml'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && outputData) {
        try {
          const result = JSON.parse(outputData);
          resolve(result);
        } catch (e) {
          console.error('Failed to parse Python output:', outputData);
          resolve(null);
        }
      } else {
        console.error('Python script error:', errorData);
        resolve(null);
      }
    });

    // Send input data to Python script
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    // Timeout after 30 seconds
    setTimeout(() => {
      pythonProcess.kill();
      resolve(null);
    }, 30000);
  });
} 