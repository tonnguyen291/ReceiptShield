"""
ML Fraud Detection Prediction Server
===================================

Flask server that serves the trained ML fraud detection model.
Provides REST API endpoint for getting fraud risk predictions.
"""

import joblib
import numpy as np
import pandas as pd
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Global variables for model components
model = None
scaler = None 
features = None
metadata = None

def load_model():
    """Load the trained ML model and its components"""
    global model, scaler, features, metadata
    
    try:
        model = joblib.load("fraud_detection_model.pkl")
        scaler = joblib.load("fraud_detection_scaler.pkl") 
        features = joblib.load("fraud_detection_features.pkl")
        metadata = joblib.load("fraud_detection_metadata.pkl")
        
        print("✅ Successfully loaded trained model!")
        print(f"   Model Type: {metadata.get('model_type', 'Unknown')}")
        print(f"   AUC Score: {metadata.get('best_auc_score', 'Unknown'):.4f}")
        print(f"   Features: {len(features)}")
        
        return True
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        return False

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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_fraud():
    """Main prediction endpoint"""
    
    if model is None:
        return jsonify({
            'error': 'Model not loaded',
            'message': 'ML model failed to load at startup'
        }), 500
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'No JSON data provided'
            }), 400
        
        # Extract receipt data from the request
        receipt_data = {}
        
        # Map from the receipt items format to what the ML model expects
        if 'items' in data:
            items = data['items']
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
        receipt_data.setdefault('item_count', len(data.get('items', [])))
        
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
        
        # Return results
        return jsonify({
            'success': True,
            'prediction': {
                'is_fraudulent': bool(prediction == 1),
                'fraud_probability': float(probability),
                'risk_level': risk_level,
                'confidence': float(max(probability, 1 - probability))  # Confidence in prediction
            },
            'model_info': {
                'version': metadata.get('model_type', 'Unknown'),
                'auc_score': metadata.get('best_auc_score', 0)
            },
            'receipt_data': receipt_data  # Echo back processed data for debugging
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'service': 'ML Fraud Detection Server',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'Health check',
            '/predict': 'POST - Fraud prediction'
        },
        'model_loaded': model is not None
    })

def main():
    """Main function to start the server"""
    print("🤖 Starting ML Fraud Detection Server...")
    print("="*50)
    
    # Check if model files exist
    required_files = [
        "fraud_detection_model.pkl",
        "fraud_detection_scaler.pkl", 
        "fraud_detection_features.pkl",
        "fraud_detection_metadata.pkl"
    ]
    
    missing_files = [f for f in required_files if not os.path.exists(f)]
    if missing_files:
        print(f"❌ Missing model files: {missing_files}")
        print("   Please train the model first:")
        print("   python retrain_with_fraudulent_receipts.py")
        return
    
    # Load the model
    if not load_model():
        print("❌ Failed to load model. Server not starting.")
        return
    
    print("🚀 Server starting on http://localhost:5001")
    print("   Use /health to check status")
    print("   Use /predict to get fraud predictions")
    print("="*50)
    
    # Start the Flask server
    app.run(host='0.0.0.0', port=5001, debug=True)

if __name__ == "__main__":
    main()
