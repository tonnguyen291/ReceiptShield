import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { ReceiptDataItem, MLFraudPrediction } from '@/types';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 ML Predict API called');
    
    const body = await request.json();
    console.log('📥 Request body received, items count:', body?.items?.length || 0);
    
    const { items }: { items: ReceiptDataItem[] } = body;

    if (!items || !Array.isArray(items)) {
      console.error('❌ Invalid request: items array is required or not an array');
      return NextResponse.json({
        success: false,
        error: 'Invalid request: items array is required'
      }, { status: 400 });
    }

    console.log('✅ Items validation passed, calling Python ML model...');

    // Call Python script directly
    const prediction = await callPythonMLModel(items);
    
    if (!prediction) {
      console.error('❌ ML model prediction failed - no prediction returned');
      return NextResponse.json({
        success: false,
        error: 'ML model prediction failed'
      }, { status: 500 });
    }

    console.log('✅ ML prediction successful:', prediction);

    return NextResponse.json({
      success: true,
      prediction
    });

  } catch (error) {
    console.error('💥 ML prediction API error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function callPythonMLModel(items: ReceiptDataItem[]): Promise<MLFraudPrediction | null> {
  return new Promise((resolve) => {
    console.log('🐍 Starting Python ML model process...');
    
    const scriptPath = path.join(process.cwd(), 'ml', 'predict_single.py');
    const inputData = JSON.stringify({ items });
    
    console.log('📁 Script path:', scriptPath);
    console.log('📊 Input data length:', inputData.length);
    
    const pythonProcess = spawn('python', [scriptPath], {
      cwd: path.join(process.cwd(), 'ml'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
      console.log('🐍 Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.log('🐍 Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log('🐍 Python process closed with code:', code);
      console.log('📤 Python output data:', outputData);
      console.log('❌ Python error data:', errorData);
      
      if (code === 0 && outputData) {
        try {
          const result = JSON.parse(outputData);
          console.log('✅ Successfully parsed Python output:', result);
          resolve(result);
        } catch (e) {
          console.error('❌ Failed to parse Python output:', e);
          console.error('Raw output data:', outputData);
          resolve(null);
        }
      } else {
        console.error('❌ Python script error - exit code:', code);
        console.error('Error output:', errorData);
        resolve(null);
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('❌ Python process error:', error);
      resolve(null);
    });

    // Send input data to Python script
    try {
      pythonProcess.stdin.write(inputData);
      pythonProcess.stdin.end();
      console.log('📤 Input data sent to Python process');
    } catch (error) {
      console.error('❌ Error writing to Python stdin:', error);
      resolve(null);
    }

    // Timeout after 30 seconds
    setTimeout(() => {
      console.log('⏰ Python process timeout - killing process');
      pythonProcess.kill();
      resolve(null);
    }, 30000);
  });
} 