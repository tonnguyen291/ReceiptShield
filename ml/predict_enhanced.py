#!/usr/bin/env python3
"""
Enhanced ML Prediction Script for ReceiptShield
==============================================

This script uses the enhanced fraud detection model to make predictions
on receipt data. It provides more sophisticated fraud detection capabilities
with advanced feature engineering and improved accuracy.
"""

import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def load_enhanced_model():
    """Load the enhanced trained model and its components"""
    try:
        model = joblib.load("enhanced_fraud_detection_model.pkl")
        scaler = joblib.load("enhanced_fraud_detection_scaler.pkl") 
        features = joblib.load("enhanced_fraud_detection_features.pkl")
        metadata = joblib.load("enhanced_fraud_detection_metadata.pkl")
        
        return model, scaler, features, metadata
    except Exception as e:
        print(f"Error loading enhanced model: {str(e)}", file=sys.stderr)
        return None, None, None, None

def extract_receipt_data_from_items(items):
    """Extract receipt data from the items array with improved logic"""
    receipt_data = {
        'vendor': '',
        'total_amount': 0.0,
        'date': '',
        'item_count': 0,
        'tip': 0.0,
        'payment_method': '',
        'fraud_indicators': []
    }
    
    # Collect all values for each category to find the best one
    vendors = []
    total_amounts = []
    dates = []
    item_counts = []
    tips = []
    payment_methods = []
    
    # Extract data from items
    for item in items:
        label = item.get('label', '').lower()
        value = item.get('value', '').strip()
        
        # Skip empty or invalid values
        if not value or value.lower() in ['not found', 'extraction failed', 'not found - edit me']:
            continue
            
        if 'vendor' in label or 'business' in label or 'store' in label:
            # Filter out common OCR errors
            if len(value) > 2 and not value.isdigit() and value not in ['THANK YOU!', 'Clad to see you again!']:
                vendors.append(value)
        elif 'total' in label and 'amount' in label:
            try:
                # Extract numeric value from total amount
                numeric_value = ''.join(c for c in value if c.isdigit() or c == '.')
                if numeric_value and float(numeric_value) > 0:
                    total_amounts.append(float(numeric_value))
            except:
                continue
        elif 'date' in label:
            if value and len(value) > 5:  # Basic date validation
                dates.append(value)
        elif 'item' in label and 'count' in label:
            try:
                count = int(value) if value.isdigit() else 0
                if count > 0:
                    item_counts.append(count)
            except:
                continue
        elif 'tip' in label:
            try:
                numeric_value = ''.join(c for c in value if c.isdigit() or c == '.')
                if numeric_value:
                    tips.append(float(numeric_value))
            except:
                continue
        elif 'payment' in label and 'method' in label:
            if value and len(value) > 1:
                payment_methods.append(value)
    
    # Select the best values (highest amounts, most reasonable values)
    if vendors:
        # Prefer longer, more descriptive vendor names
        receipt_data['vendor'] = max(vendors, key=len)
    
    if total_amounts:
        # Use the highest reasonable amount (likely the actual total)
        reasonable_amounts = [amt for amt in total_amounts if 1 <= amt <= 10000]
        if reasonable_amounts:
            receipt_data['total_amount'] = max(reasonable_amounts)
        else:
            receipt_data['total_amount'] = max(total_amounts)
    
    if dates:
        # Use the first reasonable date
        receipt_data['date'] = dates[0]
    
    if item_counts:
        # Use the highest reasonable item count
        receipt_data['item_count'] = max(item_counts)
    
    if tips:
        # Use the highest tip amount
        receipt_data['tip'] = max(tips)
    
    if payment_methods:
        # Use the first payment method
        receipt_data['payment_method'] = payment_methods[0]
    
    # Set defaults if not found
    if not receipt_data['vendor']:
        receipt_data['vendor'] = 'Unknown Vendor'
    if not receipt_data['date']:
        receipt_data['date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return receipt_data

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
    
    # Calculate enhanced features with validation
    features = {}
    
    # Core features with validation
    features['total_amount'] = max(0.0, float(total_amount)) if total_amount is not None else 0.0
    features['tip'] = max(0.0, float(tip)) if tip is not None else 0.0
    features['item_count'] = max(0, int(item_count)) if item_count is not None else 0
    
    # Calculated features with validation
    features['tip_ratio'] = features['tip'] / (features['total_amount'] + 1e-6) if features['total_amount'] > 0 else 0
    features['avg_item_price'] = features['total_amount'] / (features['item_count'] + 1e-6) if features['item_count'] > 0 else 0
    features['amount_log'] = np.log(features['total_amount'] + 1)
    
    # Amount analysis with enhanced thresholds
    features['is_high_amount'] = 1 if features['total_amount'] > 500 else 0
    features['is_low_amount'] = 1 if features['total_amount'] < 50 else 0
    features['is_round_amount'] = 1 if features['total_amount'] in [100, 150, 200, 250, 300, 500, 750, 1000] else 0
    
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

def predict_enhanced_fraud(receipt_data, model, scaler, features):
    """Make enhanced fraud prediction with error handling"""
    
    try:
        # Create enhanced features
        X = create_enhanced_receipt_features(receipt_data, features)
        
        # Validate features
        if np.isnan(X).any() or np.isinf(X).any():
            print("Warning: Invalid features detected, using defaults")
            # Create default features
            X = np.zeros((1, len(features)))
            X[0, 0] = receipt_data.get('total_amount', 0.0)  # total_amount
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Validate scaled features
        if np.isnan(X_scaled).any() or np.isinf(X_scaled).any():
            print("Warning: Invalid scaled features detected")
            return {
                'is_fraudulent': False,
                'fraud_probability': 0.0,
                'risk_level': 'LOW',
                'model_type': 'Enhanced ML Model (Fallback)',
                'features_used': len(features),
                'analysis_timestamp': datetime.now().isoformat(),
                'error': 'Invalid feature data'
            }
        
        # Predict
        prediction = model.predict(X_scaled)[0]
        probability = model.predict_proba(X_scaled)[0][1]  # Probability of fraud
        
        # Validate prediction results
        if np.isnan(probability) or np.isinf(probability):
            print("Warning: Invalid prediction probability, using default")
            probability = 0.0
            prediction = 0
        
        # Determine risk level
        if probability >= 0.8:
            risk_level = "HIGH"
        elif probability >= 0.5:
            risk_level = "MEDIUM"  
        else:
            risk_level = "LOW"
        
        return {
            'is_fraudulent': bool(prediction),
            'fraud_probability': float(probability),
            'risk_level': risk_level,
            'model_type': 'Enhanced ML Model',
            'features_used': len(features),
            'analysis_timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return {
            'is_fraudulent': False,
            'fraud_probability': 0.0,
            'risk_level': 'LOW',
            'model_type': 'Enhanced ML Model (Error)',
            'features_used': len(features),
            'analysis_timestamp': datetime.now().isoformat(),
            'error': str(e)
        }

def main():
    """Main prediction function"""
    try:
        # Load enhanced model
        model, scaler, features, metadata = load_enhanced_model()
        if model is None:
            print(json.dumps({
                'success': False,
                'error': 'Enhanced model not found or failed to load'
            }))
            sys.exit(1)
        
        # Read input from stdin
        input_data = sys.stdin.read()
        
        if not input_data.strip():
            print(json.dumps({
                'success': False,
                'error': 'No input data provided'
            }))
            sys.exit(1)
        
        # Parse input JSON
        try:
            data = json.loads(input_data)
            items = data.get('items', [])
        except json.JSONDecodeError as e:
            print(json.dumps({
                'success': False,
                'error': f'Invalid JSON input: {str(e)}'
            }))
            sys.exit(1)
        
        if not items:
            print(json.dumps({
                'success': False,
                'error': 'No items provided in input data'
            }))
            sys.exit(1)
        
        # Extract receipt data from items
        receipt_data = extract_receipt_data_from_items(items)
        
        # Make enhanced prediction
        prediction_result = predict_enhanced_fraud(receipt_data, model, scaler, features)
        
        # Output result
        result = {
            'success': True,
            'prediction': prediction_result,
            'receipt_data': receipt_data,
            'model_info': {
                'type': metadata.get('model_type', 'Unknown'),
                'auc_score': metadata.get('best_auc_score', 0),
                'features_count': len(features),
                'training_samples': metadata.get('training_samples', 0)
            }
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
