"""
Test the Trained Machine Learning Model
=====================================

This script allows you to test your trained fraud detection model
with specific receipt data to see how it performs.
"""

import joblib
import numpy as np
import pandas as pd
import json
import os
from datetime import datetime

def load_trained_model():
    """Load the trained model and its components"""
    try:
        model = joblib.load("fraud_detection_model.pkl")
        scaler = joblib.load("fraud_detection_scaler.pkl") 
        features = joblib.load("fraud_detection_features.pkl")
        metadata = joblib.load("fraud_detection_metadata.pkl")
        
        print("✅ Successfully loaded trained model!")
        print(f"   Model Type: {metadata.get('model_type', 'Unknown')}")
        print(f"   AUC Score: {metadata.get('best_auc_score', 'Unknown'):.4f}")
        print(f"   Features: {len(features)}")
        
        return model, scaler, features, metadata
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        return None, None, None, None

def create_receipt_features(receipt_data, feature_names):
    """Convert receipt data to features for ML model"""
    
    # Parse receipt data
    vendor = receipt_data.get('vendor', '')
    total_amount = float(receipt_data.get('total_amount', 0))
    item_count = int(receipt_data.get('item_count', 0))
    tip = float(receipt_data.get('tip', 0))
    payment_method = receipt_data.get('payment_method', '')
    date_str = receipt_data.get('date', '')
    
    # Parse date
    try:
        if date_str:
            receipt_date = pd.to_datetime(date_str)
        else:
            receipt_date = pd.Timestamp.now()
    except:
        receipt_date = pd.Timestamp.now()
    
    # Calculate features (same as in train_model.py)
    features = {}
    
    # Core features
    features['total_amount'] = total_amount
    features['tip'] = tip
    features['item_count'] = item_count
    
    # Calculated features
    features['tip_ratio'] = tip / (total_amount + 1e-6) if total_amount > 0 else 0
    features['avg_item_price'] = total_amount / (item_count + 1e-6) if item_count > 0 else 0
    features['amount_log'] = np.log(total_amount + 1)
    
    # Amount analysis  
    features['is_high_amount'] = 1 if total_amount > 500 else 0  # Threshold from training
    features['is_low_amount'] = 1 if total_amount < 50 else 0
    
    # Temporal features
    features['is_weekend'] = 1 if receipt_date.weekday() >= 5 else 0
    features['is_month_end'] = 1 if receipt_date.day >= 25 else 0
    features['month'] = receipt_date.month
    features['day_of_week'] = receipt_date.weekday()
    
    # Vendor features
    features['vendor_name_length'] = len(vendor)
    features['vendor_has_numbers'] = 1 if any(c.isdigit() for c in vendor) else 0
    features['vendor_has_special_chars'] = 1 if any(not c.isalnum() and not c.isspace() for c in vendor) else 0
    features['vendor_word_count'] = len(vendor.split()) if vendor else 0
    
    # Payment features
    features['has_payment_method'] = 1 if payment_method and payment_method.strip() else 0
    
    # Item features
    features['has_items'] = 1 if item_count > 0 else 0
    features['is_high_item_count'] = 1 if item_count > 10 else 0  # Threshold from training
    
    # Tip features
    features['has_tip'] = 1 if tip > 0 else 0
    
    # Create feature array in the correct order
    feature_array = []
    for feature_name in feature_names:
        feature_array.append(features.get(feature_name, 0))
    
    return np.array(feature_array).reshape(1, -1)

def test_receipt(receipt_data, model, scaler, features):
    """Test a single receipt with the ML model"""
    
    print(f"\n🧪 Testing Receipt: {receipt_data.get('vendor', 'Unknown Vendor')}")
    print(f"   Amount: ${receipt_data.get('total_amount', 0)}")
    print(f"   Date: {receipt_data.get('date', 'Unknown')}")
    
    # Create features
    X = create_receipt_features(receipt_data, features)
    
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
    
    print(f"   🎯 ML Prediction: {'FRAUDULENT' if prediction == 1 else 'LEGITIMATE'}")
    print(f"   📊 Fraud Probability: {probability:.4f} ({risk_level} risk)")
    
    return prediction, probability, risk_level

def test_fraudulent_receipts():
    """Test the model with the fraudulent receipts we generated"""
    
    print("\n" + "="*60)
    print("🎭 Testing with Generated Fraudulent Receipts")
    print("="*60)
    
    # Load fraudulent receipts metadata
    metadata_file = "receipts/new_fake_receipts/fraudulent_receipts_metadata.json"
    
    if not os.path.exists(metadata_file):
        print("❌ Fraudulent receipts metadata not found!")
        return
    
    with open(metadata_file, 'r') as f:
        fraudulent_receipts = json.load(f)
    
    model, scaler, features, metadata = load_trained_model()
    if model is None:
        return
    
    print(f"\n🧪 Testing {len(fraudulent_receipts)} fraudulent receipts...")
    
    correct_predictions = 0
    
    for i, receipt in enumerate(fraudulent_receipts[:5]):  # Test first 5
        prediction, probability, risk_level = test_receipt(receipt, model, scaler, features)
        
        # Since all these receipts are fraudulent, check if model detected them
        if prediction == 1:
            correct_predictions += 1
            print(f"   ✅ Correctly identified as fraudulent!")
        else:
            print(f"   ❌ Missed fraud (predicted as legitimate)")
        
        print(f"   📝 Fraud Scenario: {receipt['fraud_scenario']}")
    
    accuracy = correct_predictions / min(5, len(fraudulent_receipts))
    print(f"\n📊 ML Model Performance on Fraudulent Receipts:")
    print(f"   Accuracy: {accuracy:.2%} ({correct_predictions}/{min(5, len(fraudulent_receipts))})")

def test_custom_receipt():
    """Test with a custom receipt"""
    
    print("\n" + "="*60)
    print("🎯 Testing Custom Receipt")
    print("="*60)
    
    model, scaler, features, metadata = load_trained_model()
    if model is None:
        return
    
    # Example of a suspicious receipt
    suspicious_receipt = {
        'vendor': 'TESTVENDOR123!!!',  # Gibberish vendor name
        'total_amount': 999.99,        # Round number
        'date': '2025-01-28 23:45:00', # Late night
        'item_count': 1,
        'tip': 500.00,                 # Excessive tip
        'payment_method': 'CASH ONLY'  # Suspicious payment method
    }
    
    print("🔍 Testing Suspicious Receipt:")
    test_receipt(suspicious_receipt, model, scaler, features)
    
    # Example of a normal receipt
    normal_receipt = {
        'vendor': 'Starbucks Coffee',
        'total_amount': 12.45,
        'date': '2025-01-28 14:30:00',
        'item_count': 2,
        'tip': 2.00,
        'payment_method': 'Credit Card'
    }
    
    print("\n🔍 Testing Normal Receipt:")
    test_receipt(normal_receipt, model, scaler, features)

def main():
    """Main test function"""
    
    print("🤖 Machine Learning Model Testing")
    print("="*60)
    
    if not os.path.exists("fraud_detection_model.pkl"):
        print("❌ Model not found! Please train the model first.")
        print("   Run: python retrain_with_fraudulent_receipts.py")
        return
    
    # Test with fraudulent receipts
    test_fraudulent_receipts()
    
    # Test with custom examples
    test_custom_receipt()
    
    print("\n🎉 Testing completed!")
    print("\n💡 Tips:")
    print("   - Modify the receipts in test_custom_receipt() to test different scenarios")
    print("   - Check feature_importance.png to see which features matter most")
    print("   - The model achieved perfect accuracy on your training/test data")

if __name__ == "__main__":
    main() 