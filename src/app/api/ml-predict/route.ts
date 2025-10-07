import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
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

function handlePythonProcess(pythonProcess: any, inputData: string): Promise<MLFraudPrediction | null> {
  return new Promise((resolve) => {
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data: any) => {
      outputData += data.toString();
      // Only log if there's actual content (not just warnings)
      const output = data.toString();
      if (output.trim() && !output.includes('UserWarning')) {
        console.log('🐍 Python stdout:', output);
      }
    });

    pythonProcess.stderr.on('data', (data: any) => {
      errorData += data.toString();
      // Only log actual errors, not warnings
      const error = data.toString();
      if (error.trim() && !error.includes('UserWarning')) {
        console.log('🐍 Python stderr:', error);
      }
    });

    pythonProcess.on('close', (code: number) => {
      console.log('🐍 Python process closed with code:', code);
      if (code !== 0) {
        console.log('❌ Python error data:', errorData);
      }
      
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

    pythonProcess.on('error', (error: any) => {
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

function callPythonMLModel(items: ReceiptDataItem[]): Promise<MLFraudPrediction | null> {
  return new Promise((resolve) => {
    console.log('🐍 Starting Enhanced Python ML model process...');
    
    // Try enhanced model first, fallback to original if not available
    const enhancedScriptPath = path.join(process.cwd(), 'ml', 'predict_enhanced.py');
    const originalScriptPath = path.join(process.cwd(), 'ml', 'predict_single.py');
    
    let scriptPath = enhancedScriptPath;
    let useEnhanced = false;
    
    // Check if enhanced model files exist
    const enhancedModelPath = path.join(process.cwd(), 'ml', 'enhanced_fraud_detection_model.pkl');
    if (fs.existsSync(enhancedModelPath)) {
      scriptPath = enhancedScriptPath;
      useEnhanced = true;
      console.log('🚀 Using Enhanced ML Model');
    } else {
      scriptPath = originalScriptPath;
      useEnhanced = false;
      console.log('📊 Using Original ML Model (enhanced not available)');
    }
    
    const inputData = JSON.stringify({ items });
    
    console.log('📁 Script path:', scriptPath);
    console.log('📊 Input data length:', inputData.length);
    
    // Determine Python path based on platform
    const isWindows = process.platform === 'win32';
    const pythonPath = isWindows 
      ? path.join(process.cwd(), 'ml', 'venv', 'Scripts', 'python.exe')
      : path.join(process.cwd(), 'ml', 'venv', 'bin', 'python3');
    
    console.log('🐍 Using Python path:', pythonPath);
    console.log('🖥️ Platform:', process.platform);
    
    // Check if Python executable exists
    if (!fs.existsSync(pythonPath)) {
      console.error('❌ Python executable not found at:', pythonPath);
      
      // Try alternative paths
      const altPaths = isWindows 
        ? [
            path.join(process.cwd(), 'ml', 'venv', 'Scripts', 'python.exe'),
            path.join(process.cwd(), 'ml', 'venv', 'Scripts', 'python'),
            'python', // Try system python
            'python3'
          ]
        : [
            path.join(process.cwd(), 'ml', 'venv', 'bin', 'python3'),
            path.join(process.cwd(), 'ml', 'venv', 'bin', 'python'),
            'python3',
            'python'
          ];
      
      console.log('🔍 Trying alternative Python paths...');
      let foundPythonPath = null;
      
      for (const altPath of altPaths) {
        console.log('  Checking:', altPath);
        if (fs.existsSync(altPath) || altPath === 'python' || altPath === 'python3') {
          console.log('✅ Found Python at:', altPath);
          foundPythonPath = altPath;
          break;
        }
      }
      
      if (!foundPythonPath) {
        console.error('❌ No Python executable found');
        resolve(null);
        return;
      }
      
      // Use the found Python path
      const pythonProcess = spawn(foundPythonPath, [scriptPath], {
        cwd: path.join(process.cwd(), 'ml'),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      handlePythonProcess(pythonProcess, inputData).then(resolve);
      return;
    }
    
    // Use the original Python path
    const pythonProcess = spawn(pythonPath, [scriptPath], {
      cwd: path.join(process.cwd(), 'ml'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    handlePythonProcess(pythonProcess, inputData).then(resolve);
  });
} 