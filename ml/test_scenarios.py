"""
Test Different Fraud Scenarios
==============================

Test the enhanced model with various realistic fraud scenarios.
"""

import joblib
import numpy as np
import pandas as pd
from datetime import datetime

def create_test_receipt(vendor, amount, date_str, tip, payment, scenario, indicators):
    """Create a test receipt with specified parameters"""
    return {
        'vendor': vendor,
        'total_amount': amount,
        'date': date_str,
        'item_count': 1 if amount < 100 else 2,
        'tip': tip,
        'payment_method': payment,
        'fraud_scenario': scenario,
        'fraud_indicators': indicators
    }

def predict_fraud(receipt_data, model, scaler, features):
    """Predict fraud for a receipt"""
    receipt_date = pd.to_datetime(receipt_data['date'])
    
    # Calculate features
    feature_values = []
    for feature_name in features:
        if feature_name == 'total_amount':
            feature_values.append(receipt_data['total_amount'])
        elif feature_name == 'tip':
            feature_values.append(receipt_data['tip'])
        elif feature_name == 'item_count':
            feature_values.append(receipt_data['item_count'])
        elif feature_name == 'tip_ratio':
            feature_values.append(receipt_data['tip'] / (receipt_data['total_amount'] + 1e-6))
        elif feature_name == 'avg_item_price':
            feature_values.append(receipt_data['total_amount'] / (receipt_data['item_count'] + 1e-6))
        elif feature_name == 'amount_log':
            feature_values.append(np.log(receipt_data['total_amount'] + 1))
        elif feature_name == 'is_high_amount':
            feature_values.append(1 if receipt_data['total_amount'] > 500 else 0)
        elif feature_name == 'is_low_amount':
            feature_values.append(1 if receipt_data['total_amount'] < 50 else 0)
        elif feature_name == 'is_round_amount':
            feature_values.append(1 if receipt_data['total_amount'] in [100, 150, 200, 250, 300, 500, 750, 1000] else 0)
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
            feature_values.append(len(receipt_data['vendor']))
        elif feature_name == 'vendor_has_numbers':
            feature_values.append(1 if any(c.isdigit() for c in receipt_data['vendor']) else 0)
        elif feature_name == 'vendor_has_special_chars':
            feature_values.append(1 if any(not c.isalnum() and not c.isspace() for c in receipt_data['vendor']) else 0)
        elif feature_name == 'vendor_word_count':
            feature_values.append(len(receipt_data['vendor'].split()))
        elif feature_name == 'vendor_is_generic':
            feature_values.append(1 if receipt_data['vendor'].lower() in ['store', 'market', 'shop', 'business', 'services'] else 0)
        elif feature_name == 'has_payment_method':
            feature_values.append(1 if receipt_data['payment_method'] and receipt_data['payment_method'].strip() else 0)
        elif feature_name == 'payment_is_suspicious':
            feature_values.append(1 if receipt_data['payment_method'].lower() in ['cash', 'personal card', 'gift card', 'store credit', 'comp'] else 0)
        elif feature_name == 'has_items':
            feature_values.append(1 if receipt_data['item_count'] > 0 else 0)
        elif feature_name == 'is_high_item_count':
            feature_values.append(1 if receipt_data['item_count'] > 10 else 0)
        elif feature_name == 'has_tip':
            feature_values.append(1 if receipt_data['tip'] > 0 else 0)
        elif feature_name == 'num_fraud_indicators':
            feature_values.append(len(receipt_data['fraud_indicators']))
        elif feature_name == 'has_fraud_indicators':
            feature_values.append(1 if len(receipt_data['fraud_indicators']) > 0 else 0)
        elif feature_name.startswith('scenario_'):
            scenario_name = feature_name.replace('scenario_', '')
            feature_values.append(1 if receipt_data['fraud_scenario'] == scenario_name else 0)
        else:
            feature_values.append(0)
    
    X = np.array(feature_values).reshape(1, -1)
    X_scaled = scaler.transform(X)
    
    prediction = model.predict(X_scaled)[0]
    probability = model.predict_proba(X_scaled)[0][1]
    
    if probability >= 0.8:
        risk_level = "HIGH"
    elif probability >= 0.5:
        risk_level = "MEDIUM"  
    else:
        risk_level = "LOW"
    
    return prediction, probability, risk_level

def test_fraud_scenarios():
    """Test various fraud scenarios"""
    
    # Load model
    try:
        model = joblib.load("enhanced_fraud_detection_model.pkl")
        scaler = joblib.load("enhanced_fraud_detection_scaler.pkl") 
        features = joblib.load("enhanced_fraud_detection_features.pkl")
        print("Successfully loaded enhanced model!")
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    # Test scenarios
    test_scenarios = [
        {
            'name': 'Inflated Coffee Price',
            'receipt': create_test_receipt(
                'Starbucks Coffee', 45.99, '2025-01-28 14:30:00', 0, 'Credit Card',
                'inflated_prices', ['price_inflation', 'unrealistic_pricing']
            )
        },
        {
            'name': 'Suspicious Business Services',
            'receipt': create_test_receipt(
                'Business Solutions Inc', 500.00, '2025-01-31 18:30:00', 0, 'Credit Card',
                'suspicious_services', ['round_total', 'suspicious_vendor', 'month_end_rush']
            )
        },
        {
            'name': 'Personal Items as Business',
            'receipt': create_test_receipt(
                'Best Buy', 899.99, '2025-01-28 16:45:00', 0, 'Credit Card',
                'personal_as_business', ['personal_items_disguised', 'wrong_vendor_type']
            )
        },
        {
            'name': 'Late Night Cash Transaction',
            'receipt': create_test_receipt(
                'Local Store', 150.00, '2025-01-28 23:45:00', 50.00, 'CASH',
                'timing_fraud', ['round_total', 'excessive_tip', 'late_night']
            )
        },
        {
            'name': 'Legitimate Business Expense',
            'receipt': create_test_receipt(
                'Office Depot', 125.50, '2025-01-28 14:30:00', 0, 'Credit Card',
                'legitimate', []
            )
        },
        {
            'name': 'Weekend Business Expense',
            'receipt': create_test_receipt(
                'CVS Pharmacy', 75.25, '2025-01-26 10:15:00', 0, 'Credit Card',
                'timing_fraud', ['weekend_business']
            )
        },
        {
            'name': 'Duplicate Submission',
            'receipt': create_test_receipt(
                'McDonald\'s', 200.00, '2025-01-28 12:30:00', 0, 'Credit Card',
                'duplicate_submission', ['duplicate_items', 'round_total']
            )
        },
        {
            'name': 'Generic Vendor Name',
            'receipt': create_test_receipt(
                'Store', 300.00, '2025-01-28 15:00:00', 0, 'Credit Card',
                'suspicious_services', ['generic_vendor', 'round_total']
            )
        }
    ]
    
    print(f"\nTesting {len(test_scenarios)} Different Fraud Scenarios:")
    print("=" * 60)
    
    for i, scenario in enumerate(test_scenarios, 1):
        receipt = scenario['receipt']
        prediction, probability, risk_level = predict_fraud(receipt, model, scaler, features)
        
        print(f"\n{i}. {scenario['name']}")
        print(f"   Vendor: {receipt['vendor']}")
        print(f"   Amount: ${receipt['total_amount']}")
        print(f"   Date: {receipt['date']}")
        print(f"   Payment: {receipt['payment_method']}")
        print(f"   Prediction: {'FRAUDULENT' if prediction == 1 else 'LEGITIMATE'}")
        print(f"   Probability: {probability:.4f} ({risk_level} risk)")
        if receipt['fraud_indicators']:
            print(f"   Indicators: {', '.join(receipt['fraud_indicators'])}")

if __name__ == "__main__":
    test_fraud_scenarios()

