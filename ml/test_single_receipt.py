"""
Quick Test Script for Enhanced Fraud Detection
=============================================

Test the enhanced model with a single receipt to see how it performs.
"""

import joblib
import numpy as np
import pandas as pd
from datetime import datetime

def test_single_receipt():
    """Test the enhanced model with a custom receipt"""
    
    # Load the enhanced model
    try:
        model = joblib.load("enhanced_fraud_detection_model.pkl")
        scaler = joblib.load("enhanced_fraud_detection_scaler.pkl") 
        features = joblib.load("enhanced_fraud_detection_features.pkl")
        print("Successfully loaded enhanced model!")
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    # Create a test receipt (you can modify these values)
    test_receipt = {
        'vendor': 'Suspicious Business LLC',
        'total_amount': 500.00,  # Round amount (suspicious)
        'date': '2025-01-31 23:30:00',  # Late night, month-end
        'item_count': 1,
        'tip': 150.00,  # Excessive tip
        'payment_method': 'CASH',  # Suspicious payment
        'fraud_scenario': 'suspicious_services',
        'fraud_indicators': ['round_total', 'excessive_tip', 'suspicious_vendor', 'late_night', 'month_end_rush']
    }
    
    print(f"\nTesting Receipt:")
    print(f"   Vendor: {test_receipt['vendor']}")
    print(f"   Amount: ${test_receipt['total_amount']}")
    print(f"   Date: {test_receipt['date']}")
    print(f"   Tip: ${test_receipt['tip']}")
    print(f"   Payment: {test_receipt['payment_method']}")
    print(f"   Indicators: {', '.join(test_receipt['fraud_indicators'])}")
    
    # Convert to features
    receipt_date = pd.to_datetime(test_receipt['date'])
    
    # Calculate features (same as in the enhanced model)
    feature_values = []
    for feature_name in features:
        if feature_name == 'total_amount':
            feature_values.append(test_receipt['total_amount'])
        elif feature_name == 'tip':
            feature_values.append(test_receipt['tip'])
        elif feature_name == 'item_count':
            feature_values.append(test_receipt['item_count'])
        elif feature_name == 'tip_ratio':
            feature_values.append(test_receipt['tip'] / (test_receipt['total_amount'] + 1e-6))
        elif feature_name == 'avg_item_price':
            feature_values.append(test_receipt['total_amount'] / (test_receipt['item_count'] + 1e-6))
        elif feature_name == 'amount_log':
            feature_values.append(np.log(test_receipt['total_amount'] + 1))
        elif feature_name == 'is_high_amount':
            feature_values.append(1 if test_receipt['total_amount'] > 500 else 0)
        elif feature_name == 'is_low_amount':
            feature_values.append(1 if test_receipt['total_amount'] < 50 else 0)
        elif feature_name == 'is_round_amount':
            feature_values.append(1 if test_receipt['total_amount'] in [100, 150, 200, 250, 300, 500, 750, 1000] else 0)
        elif feature_name == 'is_weekend':
            feature_values.append(1 if receipt_date.weekday() >= 5 else 0)
        elif feature_name == 'is_month_end':
            feature_values.append(1 if receipt_date.day >= 25 else 0)
        elif feature_name == 'month':
            feature_values.append(receipt_date.month)
        elif feature_name == 'day_of_week':
            feature_values.append(receipt_date.weekday())
        elif feature_name == 'hour':
            feature_values.append(receipt_date.hour)
        elif feature_name == 'is_late_night':
            feature_values.append(1 if (receipt_date.hour >= 22) or (receipt_date.hour <= 2) else 0)
        elif feature_name == 'vendor_name_length':
            feature_values.append(len(test_receipt['vendor']))
        elif feature_name == 'vendor_has_numbers':
            feature_values.append(1 if any(c.isdigit() for c in test_receipt['vendor']) else 0)
        elif feature_name == 'vendor_has_special_chars':
            feature_values.append(1 if any(not c.isalnum() and not c.isspace() for c in test_receipt['vendor']) else 0)
        elif feature_name == 'vendor_word_count':
            feature_values.append(len(test_receipt['vendor'].split()))
        elif feature_name == 'vendor_is_generic':
            feature_values.append(1 if test_receipt['vendor'].lower() in ['store', 'market', 'shop', 'business', 'services'] else 0)
        elif feature_name == 'has_payment_method':
            feature_values.append(1 if test_receipt['payment_method'] and test_receipt['payment_method'].strip() else 0)
        elif feature_name == 'payment_is_suspicious':
            feature_values.append(1 if test_receipt['payment_method'].lower() in ['cash', 'personal card', 'gift card', 'store credit', 'comp'] else 0)
        elif feature_name == 'has_items':
            feature_values.append(1 if test_receipt['item_count'] > 0 else 0)
        elif feature_name == 'is_high_item_count':
            feature_values.append(1 if test_receipt['item_count'] > 10 else 0)
        elif feature_name == 'has_tip':
            feature_values.append(1 if test_receipt['tip'] > 0 else 0)
        elif feature_name == 'num_fraud_indicators':
            feature_values.append(len(test_receipt['fraud_indicators']))
        elif feature_name == 'has_fraud_indicators':
            feature_values.append(1 if len(test_receipt['fraud_indicators']) > 0 else 0)
        elif feature_name.startswith('scenario_'):
            scenario_name = feature_name.replace('scenario_', '')
            feature_values.append(1 if test_receipt['fraud_scenario'] == scenario_name else 0)
        else:
            feature_values.append(0)  # Default value
    
    # Create feature array
    X = np.array(feature_values).reshape(1, -1)
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Predict
    prediction = model.predict(X_scaled)[0]
    probability = model.predict_proba(X_scaled)[0][1]
    
    # Determine risk level
    if probability >= 0.8:
        risk_level = "HIGH"
    elif probability >= 0.5:
        risk_level = "MEDIUM"  
    else:
        risk_level = "LOW"
    
    print(f"\nEnhanced ML Prediction:")
    print(f"   Result: {'FRAUDULENT' if prediction == 1 else 'LEGITIMATE'}")
    print(f"   Fraud Probability: {probability:.4f} ({risk_level} risk)")
    
    # Show which features contributed most
    if hasattr(model, 'feature_importances_'):
        print(f"\nTop Contributing Features:")
        feature_importance = list(zip(features, model.feature_importances_))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        for i, (feature, importance) in enumerate(feature_importance[:10]):
            value = feature_values[features.index(feature)]
            print(f"   {i+1}. {feature}: {importance:.4f} (value: {value})")

if __name__ == "__main__":
    test_single_receipt()
