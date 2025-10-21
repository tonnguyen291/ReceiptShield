import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const receiptData = await request.json();
    console.log('🤖 ML Prediction Request:', receiptData);

    // Prepare data for Python ML model
    const mlInput = {
      items: receiptData.items || []
    };

    // Path to the ML directory and prediction script
    const mlDir = path.join(process.cwd(), 'ml');
    const predictScript = path.join(mlDir, 'predict_single.py');

    console.log('🐍 Calling Python ML model...');

    // Call Python ML model via child process
    const pythonProcess = spawn('python', [predictScript], {
      cwd: mlDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send data to Python process
    pythonProcess.stdin.write(JSON.stringify(mlInput));
    pythonProcess.stdin.end();

    // Collect output from Python process
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Wait for Python process to complete
    const result = await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const prediction = JSON.parse(output);
            console.log('✅ ML Prediction Result:', prediction);
            resolve(prediction);
          } catch (parseError) {
            console.error('❌ Failed to parse ML output:', parseError);
            reject(new Error('Failed to parse ML model output'));
          }
        } else {
          console.error('❌ Python ML process failed:', errorOutput);
          reject(new Error(`ML model failed with code ${code}: ${errorOutput}`));
        }
      });
    });

    return NextResponse.json({ prediction: result });

  } catch (error) {
    console.error('❌ ML Prediction Error:', error);
    
    // Fallback to basic analysis if ML model fails
    const fallbackPrediction = {
      is_fraudulent: false,
      fraud_probability: 0.1,
      risk_level: 'LOW' as const,
      confidence: 0.5,
      error: 'ML model unavailable, using fallback analysis'
    };

    return NextResponse.json({ prediction: fallbackPrediction });
  }
}
