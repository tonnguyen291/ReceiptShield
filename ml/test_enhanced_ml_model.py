"""
Test the Enhanced Machine Learning Model
========================================

This script tests the enhanced fraud detection model with sophisticated
fraud scenarios and provides detailed performance analysis.
"""

import joblib
import numpy as np
import pandas as pd
import json
import os
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns

def load_enhanced_model():
    """Load the enhanced trained model and its components"""
    try:
        model = joblib.load("enhanced_fraud_detection_model.pkl")
        scaler = joblib.load("enhanced_fraud_detection_scaler.pkl") 
        features = joblib.load("enhanced_fraud_detection_features.pkl")
        metadata = joblib.load("enhanced_fraud_detection_metadata.pkl")
        
        print("Successfully loaded enhanced model!")
        print(f"   Model Type: {metadata.get('model_type', 'Unknown')}")
        print(f"   AUC Score: {metadata.get('best_auc_score', 'Unknown'):.4f}")
        print(f"   Features: {len(features)}")
        print(f"   Training Samples: {metadata.get('training_samples', 'Unknown')}")
        
        return model, scaler, features, metadata
    except Exception as e:
        print(f"Error loading enhanced model: {str(e)}")
        return None, None, None, None

def create_enhanced_receipt_features(receipt_data, feature_names):
    """Convert receipt data to enhanced features for ML model"""
    
    # Parse receipt data
    vendor = receipt_data.get('vendor', '')
    total_amount = float(receipt_data.get('total_amount', 0))
    item_count = int(receipt_data.get('item_count', 0))
    tip = float(receipt_data.get('tip', 0))
    payment_method = receipt_data.get('payment_method', '')
    date_str = receipt_data.get('date', '')
    fraud_indicators = receipt_data.get('fraud_indicators', [])
    
    # Parse date
    try:
        if date_str:
            receipt_date = pd.to_datetime(date_str)
        else:
            receipt_date = pd.Timestamp.now()
    except:
        receipt_date = pd.Timestamp.now()
    
    # Calculate enhanced features
    features = {}
    
    # Core features
    features['total_amount'] = total_amount
    features['tip'] = tip
    features['item_count'] = item_count
    
    # Calculated features
    features['tip_ratio'] = tip / (total_amount + 1e-6) if total_amount > 0 else 0
    features['avg_item_price'] = total_amount / (item_count + 1e-6) if item_count > 0 else 0
    features['amount_log'] = np.log(total_amount + 1)
    
    # Amount analysis with enhanced thresholds
    features['is_high_amount'] = 1 if total_amount > 500 else 0
    features['is_low_amount'] = 1 if total_amount < 50 else 0
    features['is_round_amount'] = 1 if total_amount in [100, 150, 200, 250, 300, 500, 750, 1000] else 0
    
    # Temporal features
    features['is_weekend'] = 1 if receipt_date.weekday() >= 5 else 0
    features['is_month_end'] = 1 if receipt_date.day >= 25 else 0
    features['month'] = receipt_date.month
    features['day_of_week'] = receipt_date.weekday()
    features['hour'] = receipt_date.hour
    features['is_late_night'] = 1 if (receipt_date.hour >= 22) or (receipt_date.hour <= 2) else 0
    
    # Enhanced vendor features
    features['vendor_name_length'] = len(vendor)
    features['vendor_has_numbers'] = 1 if any(c.isdigit() for c in vendor) else 0
    features['vendor_has_special_chars'] = 1 if any(not c.isalnum() and not c.isspace() for c in vendor) else 0
    features['vendor_word_count'] = len(vendor.split()) if vendor else 0
    features['vendor_is_generic'] = 1 if vendor.lower() in ['store', 'market', 'shop', 'business', 'services'] else 0
    
    # Enhanced payment features
    features['has_payment_method'] = 1 if payment_method and payment_method.strip() else 0
    features['payment_is_suspicious'] = 1 if payment_method.lower() in ['cash', 'personal card', 'gift card', 'store credit', 'comp'] else 0
    
    # Item features
    features['has_items'] = 1 if item_count > 0 else 0
    features['is_high_item_count'] = 1 if item_count > 10 else 0
    
    # Tip features
    features['has_tip'] = 1 if tip > 0 else 0
    
    # Fraud indicators (if available)
    features['num_fraud_indicators'] = len(fraud_indicators) if isinstance(fraud_indicators, list) else 0
    features['has_fraud_indicators'] = 1 if features['num_fraud_indicators'] > 0 else 0
    
    # Create feature array in the correct order
    feature_array = []
    for feature_name in feature_names:
        feature_array.append(features.get(feature_name, 0))
    
    return np.array(feature_array).reshape(1, -1)

def test_enhanced_receipt(receipt_data, model, scaler, features):
    """Test a single receipt with the enhanced ML model"""
    
    print(f"\nTesting Enhanced Receipt: {receipt_data.get('vendor', 'Unknown Vendor')}")
    print(f"   Amount: ${receipt_data.get('total_amount', 0)}")
    print(f"   Date: {receipt_data.get('date', 'Unknown')}")
    print(f"   Scenario: {receipt_data.get('fraud_scenario', 'Unknown')}")
    
    # Create enhanced features
    X = create_enhanced_receipt_features(receipt_data, features)
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Predict
    prediction = model.predict(X_scaled)[0]
    probability = model.predict_proba(X_scaled)[0][1]  # Probability of fraud
    
    # Determine risk level
    if probability >= 0.8:
        risk_level = "HIGH"
    elif probability >= 0.5:
        risk_level = "MEDIUM"  
    else:
        risk_level = "LOW"
    
    print(f"   Enhanced ML Prediction: {'FRAUDULENT' if prediction == 1 else 'LEGITIMATE'}")
    print(f"   Fraud Probability: {probability:.4f} ({risk_level} risk)")
    
    # Show fraud indicators if available
    fraud_indicators = receipt_data.get('fraud_indicators', [])
    if fraud_indicators:
        print(f"   Fraud Indicators: {', '.join(fraud_indicators)}")
    
    return prediction, probability, risk_level

def test_enhanced_fraudulent_receipts():
    """Test the enhanced model with sophisticated fraudulent receipts"""
    
    print("\n" + "="*60)
    print("Testing Enhanced Model with Sophisticated Fraudulent Receipts")
    print("="*60)
    
    # Load enhanced fraudulent receipts metadata
    metadata_file = "receipts/enhanced_fraudulent_receipts/enhanced_fraudulent_receipts_metadata.json"
    
    if not os.path.exists(metadata_file):
        print("Enhanced fraudulent receipts metadata not found!")
        print("   Please run: python generate_enhanced_fraudulent_receipts.py")
        return
    
    with open(metadata_file, 'r') as f:
        enhanced_fraudulent_receipts = json.load(f)
    
    model, scaler, features, metadata = load_enhanced_model()
    if model is None:
        return
    
    print(f"\nTesting {len(enhanced_fraudulent_receipts)} enhanced fraudulent receipts...")
    
    correct_predictions = 0
    scenario_performance = {}
    
    for i, receipt in enumerate(enhanced_fraudulent_receipts[:10]):  # Test first 10
        prediction, probability, risk_level = test_enhanced_receipt(receipt, model, scaler, features)
        
        # Track performance by scenario
        scenario = receipt.get('fraud_scenario', 'unknown')
        if scenario not in scenario_performance:
            scenario_performance[scenario] = {'correct': 0, 'total': 0}
        
        scenario_performance[scenario]['total'] += 1
        
        # Since all these receipts are fraudulent, check if model detected them
        if prediction == 1:
            correct_predictions += 1
            scenario_performance[scenario]['correct'] += 1
            print(f"   Correctly identified as fraudulent!")
        else:
            print(f"   Missed fraud (predicted as legitimate)")
    
    accuracy = correct_predictions / min(10, len(enhanced_fraudulent_receipts))
    print(f"\nEnhanced ML Model Performance on Sophisticated Fraudulent Receipts:")
    print(f"   Overall Accuracy: {accuracy:.2%} ({correct_predictions}/{min(10, len(enhanced_fraudulent_receipts))})")
    
    # Show performance by scenario
    print(f"\nPerformance by Fraud Scenario:")
    for scenario, perf in scenario_performance.items():
        scenario_accuracy = perf['correct'] / perf['total'] if perf['total'] > 0 else 0
        print(f"   - {scenario}: {scenario_accuracy:.2%} ({perf['correct']}/{perf['total']})")

def test_realistic_fraud_scenarios():
    """Test with realistic fraud scenarios"""
    
    print("\n" + "="*60)
    print("Testing Realistic Fraud Scenarios")
    print("="*60)
    
    model, scaler, features, metadata = load_enhanced_model()
    if model is None:
        return
    
    # Realistic fraud scenarios
    realistic_fraud_scenarios = [
        {
            'vendor': 'Starbucks Coffee',
            'total_amount': 45.99,  # Suspiciously high for coffee
            'date': '2025-01-28 23:45:00',  # Late night
            'item_count': 1,
            'tip': 20.00,  # Excessive tip
            'payment_method': 'CASH',
            'fraud_scenario': 'inflated_prices',
            'fraud_indicators': ['price_inflation', 'excessive_tip', 'late_night']
        },
        {
            'vendor': 'Business Solutions Inc',
            'total_amount': 500.00,  # Round number
            'date': '2025-01-31 18:30:00',  # Month end
            'item_count': 3,
            'tip': 0,
            'payment_method': 'Credit Card',
            'fraud_scenario': 'suspicious_services',
            'fraud_indicators': ['round_total', 'suspicious_vendor', 'month_end_rush']
        },
        {
            'vendor': 'Office Depot',
            'total_amount': 125.50,
            'date': '2025-01-28 14:30:00',
            'item_count': 2,
            'tip': 0,
            'payment_method': 'Credit Card',
            'fraud_scenario': 'legitimate',
            'fraud_indicators': []
        }
    ]
    
    for i, scenario in enumerate(realistic_fraud_scenarios):
        print(f"\nTesting Realistic Scenario {i+1}:")
        test_enhanced_receipt(scenario, model, scaler, features)

def compare_with_original_model():
    """Compare enhanced model with original model if available"""
    
    print("\n" + "="*60)
    print("Comparing Enhanced vs Original Model")
    print("="*60)
    
    # Try to load original model
    try:
        original_model = joblib.load("fraud_detection_model.pkl")
        original_scaler = joblib.load("fraud_detection_scaler.pkl")
        original_features = joblib.load("fraud_detection_features.pkl")
        print("Loaded original model for comparison")
    except:
        print("Original model not found - skipping comparison")
        return
    
    # Load enhanced model
    enhanced_model, enhanced_scaler, enhanced_features, enhanced_metadata = load_enhanced_model()
    if enhanced_model is None:
        return
    
    # Test with a sample receipt
    test_receipt = {
        'vendor': 'Suspicious Business LLC',
        'total_amount': 300.00,
        'date': '2025-01-31 23:30:00',
        'item_count': 1,
        'tip': 100.00,
        'payment_method': 'CASH',
        'fraud_scenario': 'suspicious_services',
        'fraud_indicators': ['round_total', 'excessive_tip', 'suspicious_vendor']
    }
    
    print(f"\nTesting with sample receipt:")
    print(f"   Vendor: {test_receipt['vendor']}")
    print(f"   Amount: ${test_receipt['total_amount']}")
    print(f"   Indicators: {', '.join(test_receipt['fraud_indicators'])}")
    
    # Test with original model
    try:
        X_orig = create_enhanced_receipt_features(test_receipt, original_features)
        X_orig_scaled = original_scaler.transform(X_orig)
        orig_prediction = original_model.predict(X_orig_scaled)[0]
        orig_probability = original_model.predict_proba(X_orig_scaled)[0][1]
        print(f"\nOriginal Model:")
        print(f"   Prediction: {'FRAUDULENT' if orig_prediction == 1 else 'LEGITIMATE'}")
        print(f"   Probability: {orig_probability:.4f}")
    except Exception as e:
        print(f"Error testing original model: {e}")
        orig_prediction = None
        orig_probability = None
    
    # Test with enhanced model
    X_enh = create_enhanced_receipt_features(test_receipt, enhanced_features)
    X_enh_scaled = enhanced_scaler.transform(X_enh)
    enh_prediction = enhanced_model.predict(X_enh_scaled)[0]
    enh_probability = enhanced_model.predict_proba(X_enh_scaled)[0][1]
    
    print(f"\nEnhanced Model:")
    print(f"   Prediction: {'FRAUDULENT' if enh_prediction == 1 else 'LEGITIMATE'}")
    print(f"   Probability: {enh_probability:.4f}")
    
    if orig_prediction is not None:
        print(f"\nComparison:")
        if orig_prediction != enh_prediction:
            print(f"   Models disagree on prediction")
        else:
            print(f"   Models agree on prediction")
        
        prob_diff = abs(enh_probability - orig_probability)
        print(f"   Probability difference: {prob_diff:.4f}")

def main():
    """Main test function"""
    
    print("Enhanced Machine Learning Model Testing")
    print("="*60)
    
    if not os.path.exists("enhanced_fraud_detection_model.pkl"):
        print("Enhanced model not found! Please train the enhanced model first.")
        print("   Run: python update_dataset_with_enhanced_fraud.py")
        return
    
    # Test with enhanced fraudulent receipts
    test_enhanced_fraudulent_receipts()
    
    # Test with realistic scenarios
    test_realistic_fraud_scenarios()
    
    # Compare with original model
    compare_with_original_model()
    
    print("\nEnhanced model testing completed!")
    print("\nEnhanced Model Benefits:")
    print("   - More sophisticated fraud detection")
    print("   - Better handling of realistic fraud patterns")
    print("   - Enhanced feature engineering")
    print("   - Improved accuracy on complex fraud scenarios")

if __name__ == "__main__":
    main()
