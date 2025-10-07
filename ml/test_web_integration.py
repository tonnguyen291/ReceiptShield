#!/usr/bin/env python3
"""
Test Web Integration with Enhanced ML Model
==========================================

This script tests the enhanced ML model integration with the web application
by simulating the same data flow that the web app uses.
"""

import sys
import json
import subprocess
import os
from datetime import datetime

def test_enhanced_prediction():
    """Test the enhanced prediction script directly"""
    
    print("Testing Enhanced ML Prediction Script")
    print("=" * 50)
    
    # Test data that mimics what the web app sends
    test_items = [
        {"id": "vendor", "label": "Vendor Name", "value": "Suspicious Business LLC"},
        {"id": "total", "label": "Total Amount", "value": "$300.00"},
        {"id": "date", "label": "Date", "value": "2025-01-31 23:30:00"},
        {"id": "items", "label": "Item Count", "value": "1"},
        {"id": "tip", "label": "Tip", "value": "$100.00"},
        {"id": "payment", "label": "Payment Method", "value": "CASH"}
    ]
    
    test_data = {"items": test_items}
    
    try:
        # Call the enhanced prediction script
        script_path = "predict_enhanced.py"
        
        if not os.path.exists(script_path):
            print(f"Error: {script_path} not found!")
            return False
        
        # Run the script with test data
        process = subprocess.Popen(
            ["python3", script_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=json.dumps(test_data))
        
        if process.returncode != 0:
            print(f"Script failed with return code {process.returncode}")
            print(f"Error output: {stderr}")
            return False
        
        # Parse the result - extract JSON from mixed output
        try:
            # Find the JSON part in the output
            json_start = stdout.find('{')
            if json_start != -1:
                json_output = stdout[json_start:]
                result = json.loads(json_output)
            else:
                result = json.loads(stdout)
                
            print("Enhanced prediction script executed successfully!")
            print(f"Success: {result.get('success', False)}")
            
            if result.get('success'):
                prediction = result.get('prediction', {})
                print(f"Fraudulent: {prediction.get('is_fraudulent', False)}")
                print(f"Probability: {prediction.get('fraud_probability', 0):.4f}")
                print(f"Risk Level: {prediction.get('risk_level', 'UNKNOWN')}")
                print(f"Model Type: {prediction.get('model_type', 'UNKNOWN')}")
                print(f"Features Used: {prediction.get('features_used', 0)}")
                
                model_info = result.get('model_info', {})
                print(f"Model AUC Score: {model_info.get('auc_score', 0):.4f}")
                print(f"Training Samples: {model_info.get('training_samples', 0)}")
                
                return True
            else:
                print(f"Prediction failed: {result.get('error', 'Unknown error')}")
                return False
                
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON output: {e}")
            print(f"Raw output: {stdout}")
            return False
            
    except Exception as e:
        print(f"Error running enhanced prediction script: {e}")
        return False

def test_original_prediction():
    """Test the original prediction script for comparison"""
    
    print("\nTesting Original ML Prediction Script")
    print("=" * 50)
    
    # Test data that mimics what the web app sends
    test_items = [
        {"id": "vendor", "label": "Vendor Name", "value": "Suspicious Business LLC"},
        {"id": "total", "label": "Total Amount", "value": "$300.00"},
        {"id": "date", "label": "Date", "value": "2025-01-31 23:30:00"},
        {"id": "items", "label": "Item Count", "value": "1"},
        {"id": "tip", "label": "Tip", "value": "$100.00"},
        {"id": "payment", "label": "Payment Method", "value": "CASH"}
    ]
    
    test_data = {"items": test_items}
    
    try:
        # Call the original prediction script
        script_path = "predict_single.py"
        
        if not os.path.exists(script_path):
            print(f"Warning: {script_path} not found - skipping original model test")
            return False
        
        # Run the script with test data
        process = subprocess.Popen(
            ["python3", script_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=json.dumps(test_data))
        
        if process.returncode != 0:
            print(f"Original script failed with return code {process.returncode}")
            print(f"Error output: {stderr}")
            return False
        
        # Parse the result
        try:
            result = json.loads(stdout)
            print("Original prediction script executed successfully!")
            print(f"Success: {result.get('success', False)}")
            
            if result.get('success'):
                prediction = result.get('prediction', {})
                print(f"Fraudulent: {prediction.get('is_fraudulent', False)}")
                print(f"Probability: {prediction.get('fraud_probability', 0):.4f}")
                print(f"Risk Level: {prediction.get('risk_level', 'UNKNOWN')}")
                
                return True
            else:
                print(f"Original prediction failed: {result.get('error', 'Unknown error')}")
                return False
                
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON output: {e}")
            print(f"Raw output: {stdout}")
            return False
            
    except Exception as e:
        print(f"Error running original prediction script: {e}")
        return False

def check_model_files():
    """Check if enhanced model files exist"""
    
    print("Checking Enhanced Model Files")
    print("=" * 50)
    
    required_files = [
        "enhanced_fraud_detection_model.pkl",
        "enhanced_fraud_detection_scaler.pkl",
        "enhanced_fraud_detection_features.pkl",
        "enhanced_fraud_detection_metadata.pkl"
    ]
    
    all_exist = True
    for file in required_files:
        exists = os.path.exists(file)
        status = "OK" if exists else "MISSING"
        print(f"[{status}] {file}")
        if not exists:
            all_exist = False
    
    return all_exist

def main():
    """Main test function"""
    
    print("Enhanced ML Model Web Integration Test")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("enhanced_fraud_detection_model.pkl"):
        print("Enhanced model files not found in current directory!")
        print("   Please run this script from the ml/ directory")
        print("   Or train the enhanced model first:")
        print("   python update_dataset_with_enhanced_fraud.py")
        return
    
    # Check model files
    enhanced_files_exist = check_model_files()
    
    if not enhanced_files_exist:
        print("\nEnhanced model files are missing!")
        print("   Please train the enhanced model first:")
        print("   python update_dataset_with_enhanced_fraud.py")
        return
    
    print(f"\nAll enhanced model files found!")
    
    # Test enhanced prediction
    enhanced_success = test_enhanced_prediction()
    
    # Test original prediction for comparison
    original_success = test_original_prediction()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    print(f"Enhanced Model: {'PASS' if enhanced_success else 'FAIL'}")
    print(f"Original Model: {'PASS' if original_success else 'FAIL'}")
    
    if enhanced_success:
        print("\nEnhanced ML model integration is working correctly!")
        print("   The web application will now use the enhanced model")
        print("   with improved fraud detection capabilities.")
    else:
        print("\nEnhanced ML model integration failed!")
        print("   The web application will fall back to the original model.")
    
    print("\nNext Steps:")
    print("   1. Test the web application receipt upload workflow")
    print("   2. Verify enhanced fraud detection in the UI")
    print("   3. Check that enhanced model results are displayed correctly")

if __name__ == "__main__":
    main()
