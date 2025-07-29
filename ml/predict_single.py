#!/usr/bin/env python3
"""
Standalone ML Prediction Script
===============================

This script loads the trained ML model and makes a single prediction.
Designed to be called from Next.js API routes via child process.
"""

import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os

def load_model():
    """Load the trained ML model and its components"""
    try:
        model = joblib.load("fraud_detection_model.pkl")
        scaler = joblib.load("fraud_detection_scaler.pkl") 
        features = joblib.load("fraud_detection_features.pkl")
        metadata = joblib.load("fraud_detection_metadata.pkl")
        return model, scaler, features, metadata
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model: {str(e)}"}), file=sys.stderr)
        return None, None, None, None

def create_receipt_features(receipt_data, feature_names):
    """Convert receipt data to features for ML model"""
    
    # Parse receipt data with safe defaults
    vendor = str(receipt_data.get('vendor', ''))
    total_amount = float(receipt_data.get('total_amount', 0))
    item_count = int(receipt_data.get('item_count', 0))
    tip = float(receipt_data.get('tip', 0))
    payment_method = str(receipt_data.get('payment_method', ''))
    date_str = str(receipt_data.get('date', ''))
    
    # Parse date
    try:
        if date_str and date_str.strip():
            receipt_date = pd.to_datetime(date_str)
        else:
            receipt_date = pd.Timestamp.now()
    except:
        receipt_date = pd.Timestamp.now()
    
    # Calculate features (same as in train_model.py)
    features_dict = {}
    
    # Core features
    features_dict['total_amount'] = total_amount
    features_dict['tip'] = tip
    features_dict['item_count'] = item_count
    
    # Calculated features
    features_dict['tip_ratio'] = tip / (total_amount + 1e-6) if total_amount > 0 else 0
    features_dict['avg_item_price'] = total_amount / (item_count + 1e-6) if item_count > 0 else 0
    features_dict['amount_log'] = np.log(total_amount + 1)
    
    # Amount analysis  
    features_dict['is_high_amount'] = 1 if total_amount > 500 else 0
    features_dict['is_low_amount'] = 1 if total_amount < 50 else 0
    
    # Temporal features
    features_dict['is_weekend'] = 1 if receipt_date.weekday() >= 5 else 0
    features_dict['is_month_end'] = 1 if receipt_date.day >= 25 else 0
    features_dict['month'] = receipt_date.month
    features_dict['day_of_week'] = receipt_date.weekday()
    
    # Vendor features
    features_dict['vendor_name_length'] = len(vendor)
    features_dict['vendor_has_numbers'] = 1 if any(c.isdigit() for c in vendor) else 0
    features_dict['vendor_has_special_chars'] = 1 if any(not c.isalnum() and not c.isspace() for c in vendor) else 0
    features_dict['vendor_word_count'] = len(vendor.split()) if vendor else 0
    
    # Payment features
    features_dict['has_payment_method'] = 1 if payment_method and payment_method.strip() else 0
    
    # Item features
    features_dict['has_items'] = 1 if item_count > 0 else 0
    features_dict['is_high_item_count'] = 1 if item_count > 10 else 0
    
    # Tip features
    features_dict['has_tip'] = 1 if tip > 0 else 0
    
    # Create feature array in the correct order
    feature_array = []
    for feature_name in feature_names:
        feature_array.append(features_dict.get(feature_name, 0))
    
    return np.array(feature_array).reshape(1, -1)

def extract_receipt_data_from_items(items):
    """Extract receipt data from the items format"""
    receipt_data = {}
    
    # Map from the receipt items format to what the ML model expects
    for item in items:
        label = item.get('label', '').lower()
        value = item.get('value', '')
        
        if 'vendor' in label:
            receipt_data['vendor'] = value
        elif 'total' in label and 'amount' in label:
            # Clean numeric value
            clean_value = ''.join(c for c in str(value) if c.isdigit() or c == '.')
            receipt_data['total_amount'] = float(clean_value) if clean_value else 0
        elif 'date' in label:
            receipt_data['date'] = value
        elif 'tip' in label:
            clean_value = ''.join(c for c in str(value) if c.isdigit() or c == '.')
            receipt_data['tip'] = float(clean_value) if clean_value else 0
        elif 'payment' in label or 'method' in label:
            receipt_data['payment_method'] = value
    
    # Set defaults for missing values
    receipt_data.setdefault('vendor', '')
    receipt_data.setdefault('total_amount', 0)
    receipt_data.setdefault('date', '')
    receipt_data.setdefault('tip', 0)
    receipt_data.setdefault('payment_method', '')
    receipt_data.setdefault('item_count', len(items))
    
    return receipt_data

def main():
    """Main function"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        
        if not input_data.strip():
            print(json.dumps({"error": "No input data provided"}), file=sys.stderr)
            sys.exit(1)
        
        # Parse JSON input
        try:
            data = json.loads(input_data)
            items = data.get('items', [])
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"Invalid JSON: {str(e)}"}), file=sys.stderr)
            sys.exit(1)
        
        # Load model
        model, scaler, features, metadata = load_model()
        if model is None:
            sys.exit(1)
        
        # Extract receipt data
        receipt_data = extract_receipt_data_from_items(items)
        
        # Create features
        X = create_receipt_features(receipt_data, features)
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Make prediction
        prediction = model.predict(X_scaled)[0]
        probability = model.predict_proba(X_scaled)[0][1]  # Probability of fraud
        
        # Determine risk level
        if probability >= 0.8:
            risk_level = "HIGH"
        elif probability >= 0.5:
            risk_level = "MEDIUM"  
        else:
            risk_level = "LOW"
        
        # Return results as JSON
        result = {
            "is_fraudulent": bool(prediction == 1),
            "fraud_probability": float(probability),
            "risk_level": risk_level,
            "confidence": float(max(probability, 1 - probability))
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 