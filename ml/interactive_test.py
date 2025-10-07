"""
Interactive Fraud Detection Testing
==================================

Test the enhanced model with your own custom receipts interactively.
"""

import joblib
import numpy as np
import pandas as pd
from datetime import datetime

def load_model():
    """Load the enhanced model"""
    try:
        model = joblib.load("enhanced_fraud_detection_model.pkl")
        scaler = joblib.load("enhanced_fraud_detection_scaler.pkl") 
        features = joblib.load("enhanced_fraud_detection_features.pkl")
        print("Successfully loaded enhanced model!")
        return model, scaler, features
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None, None

def predict_receipt(vendor, amount, date_str, tip, payment, model, scaler, features):
    """Predict fraud for a receipt"""
    
    # Create receipt data
    receipt_date = pd.to_datetime(date_str)
    item_count = 1 if amount < 100 else 2
    
    receipt_data = {
        'vendor': vendor,
        'total_amount': amount,
        'date': date_str,
        'item_count': item_count,
        'tip': tip,
        'payment_method': payment,
        'fraud_scenario': 'custom',
        'fraud_indicators': []
    }
    
    # Calculate features
    feature_values = []
    for feature_name in features:
        if feature_name == 'total_amount':
            feature_values.append(amount)
        elif feature_name == 'tip':
            feature_values.append(tip)
        elif feature_name == 'item_count':
            feature_values.append(item_count)
        elif feature_name == 'tip_ratio':
            feature_values.append(tip / (amount + 1e-6))
        elif feature_name == 'avg_item_price':
            feature_values.append(amount / (item_count + 1e-6))
        elif feature_name == 'amount_log':
            feature_values.append(np.log(amount + 1))
        elif feature_name == 'is_high_amount':
            feature_values.append(1 if amount > 500 else 0)
        elif feature_name == 'is_low_amount':
            feature_values.append(1 if amount < 50 else 0)
        elif feature_name == 'is_round_amount':
            feature_values.append(1 if amount in [100, 150, 200, 250, 300, 500, 750, 1000] else 0)
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
            feature_values.append(len(vendor))
        elif feature_name == 'vendor_has_numbers':
            feature_values.append(1 if any(c.isdigit() for c in vendor) else 0)
        elif feature_name == 'vendor_has_special_chars':
            feature_values.append(1 if any(not c.isalnum() and not c.isspace() for c in vendor) else 0)
        elif feature_name == 'vendor_word_count':
            feature_values.append(len(vendor.split()))
        elif feature_name == 'vendor_is_generic':
            feature_values.append(1 if vendor.lower() in ['store', 'market', 'shop', 'business', 'services'] else 0)
        elif feature_name == 'has_payment_method':
            feature_values.append(1 if payment and payment.strip() else 0)
        elif feature_name == 'payment_is_suspicious':
            feature_values.append(1 if payment.lower() in ['cash', 'personal card', 'gift card', 'store credit', 'comp'] else 0)
        elif feature_name == 'has_items':
            feature_values.append(1 if item_count > 0 else 0)
        elif feature_name == 'is_high_item_count':
            feature_values.append(1 if item_count > 10 else 0)
        elif feature_name == 'has_tip':
            feature_values.append(1 if tip > 0 else 0)
        elif feature_name == 'num_fraud_indicators':
            feature_values.append(0)  # Custom receipt has no indicators
        elif feature_name == 'has_fraud_indicators':
            feature_values.append(0)
        elif feature_name.startswith('scenario_'):
            feature_values.append(0)  # Custom receipt
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

def interactive_test():
    """Interactive testing interface"""
    
    model, scaler, features = load_model()
    if model is None:
        return
    
    print("\nEnhanced Fraud Detection - Interactive Testing")
    print("=" * 50)
    print("Enter receipt details to test fraud detection")
    print("Type 'quit' to exit")
    
    while True:
        print("\n" + "-" * 30)
        
        # Get vendor name
        vendor = input("Vendor name: ").strip()
        if vendor.lower() == 'quit':
            break
        
        # Get amount
        try:
            amount = float(input("Amount ($): "))
        except ValueError:
            print("Invalid amount. Please enter a number.")
            continue
        
        # Get date
        date_str = input("Date (YYYY-MM-DD HH:MM:SS) or press Enter for now: ").strip()
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Get tip
        try:
            tip = float(input("Tip amount ($): ") or "0")
        except ValueError:
            tip = 0
        
        # Get payment method
        payment = input("Payment method (Credit Card, Cash, etc.): ").strip() or "Credit Card"
        
        # Predict
        prediction, probability, risk_level = predict_receipt(
            vendor, amount, date_str, tip, payment, model, scaler, features
        )
        
        # Display results
        print(f"\nReceipt Analysis:")
        print(f"   Vendor: {vendor}")
        print(f"   Amount: ${amount}")
        print(f"   Date: {date_str}")
        print(f"   Tip: ${tip}")
        print(f"   Payment: {payment}")
        print(f"   Prediction: {'FRAUDULENT' if prediction == 1 else 'LEGITIMATE'}")
        print(f"   Fraud Probability: {probability:.4f} ({risk_level} risk)")
        
        # Show risk factors
        risk_factors = []
        if amount in [100, 150, 200, 250, 300, 500, 750, 1000]:
            risk_factors.append("Round amount")
        if tip > amount * 0.2:  # >20% tip
            risk_factors.append("High tip percentage")
        if payment.lower() in ['cash', 'personal card', 'gift card']:
            risk_factors.append("Suspicious payment method")
        if vendor.lower() in ['store', 'market', 'shop', 'business', 'services']:
            risk_factors.append("Generic vendor name")
        
        receipt_date = pd.to_datetime(date_str)
        if receipt_date.weekday() >= 5:  # Weekend
            risk_factors.append("Weekend business expense")
        if receipt_date.hour >= 22 or receipt_date.hour <= 2:  # Late night
            risk_factors.append("Late night transaction")
        if receipt_date.day >= 28:  # Month end
            risk_factors.append("Month-end rush")
        
        if risk_factors:
            print(f"   Risk Factors: {', '.join(risk_factors)}")

if __name__ == "__main__":
    interactive_test()

