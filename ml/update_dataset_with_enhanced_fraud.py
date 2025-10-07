"""
Update Dataset with Enhanced Fraudulent Receipts
================================================

This script updates the training dataset with the new enhanced fraudulent receipts
and retrains the model with improved features for better fraud detection.
"""

import subprocess
import os
import pandas as pd
import json
import sys
from datetime import datetime
import numpy as np

def update_dataset_with_enhanced_fraud():
    """Add the enhanced fraudulent receipts to the training dataset"""
    
    print("Step 1: Updating dataset with enhanced fraudulent receipts...")
    
    # Load existing dataset
    dataset_file = "receipts_dataset.csv"
    backup_file = f"receipts_dataset_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    if os.path.exists(dataset_file):
        df_existing = pd.read_csv(dataset_file)
        # Create backup
        df_existing.to_csv(backup_file, index=False)
        print(f"Loaded existing dataset with {len(df_existing)} receipts")
        print(f"Created backup: {backup_file}")
    else:
        df_existing = pd.DataFrame(columns=[
            'vendor', 'total_amount', 'date', 'item_count', 'tip', 
            'payment_method', 'is_fraud', 'fraud_scenario', 'fraud_indicators'
        ])
        print("Created new dataset (no existing file found)")
    
    # Load enhanced fraudulent receipts metadata
    metadata_file = "receipts/enhanced_fraudulent_receipts/enhanced_fraudulent_receipts_metadata.json"
    
    if not os.path.exists(metadata_file):
        print(f"Error: {metadata_file} not found. Please generate enhanced fraudulent receipts first.")
        print("   Run: python generate_enhanced_fraudulent_receipts.py")
        return None, None
    
    with open(metadata_file, 'r') as f:
        enhanced_fraudulent_receipts = json.load(f)
    
    print(f"Found {len(enhanced_fraudulent_receipts)} enhanced fraudulent receipts to add")
    
    # Check for duplicates by receipt_id
    existing_fraud_count = len(df_existing[df_existing['is_fraud'] == 1])
    
    # Convert enhanced fraudulent receipts to dataset format
    new_rows = []
    
    for receipt in enhanced_fraudulent_receipts:
        # Parse the date
        try:
            receipt_date = datetime.fromisoformat(receipt['date'].replace('Z', '+00:00'))
            date_str = receipt_date.strftime('%Y-%m-%d %H:%M:%S')
        except:
            date_str = receipt['date']
        
        new_row = {
            'vendor': receipt['vendor'],
            'total_amount': receipt['total_amount'],
            'date': date_str,
            'item_count': receipt['item_count'],
            'tip': receipt.get('tip', 0),
            'payment_method': receipt.get('payment_method', ''),
            'is_fraud': 1,  # All new receipts are fraudulent
            'fraud_scenario': receipt.get('fraud_scenario', 'unknown'),
            'fraud_indicators': json.dumps(receipt.get('fraud_indicators', []))
        }
        new_rows.append(new_row)
    
    # Create DataFrame from new rows
    df_new = pd.DataFrame(new_rows)
    
    # Combine with existing dataset
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    
    # Save updated dataset
    df_combined.to_csv(dataset_file, index=False)
    
    print(f"\nDataset updated successfully!")
    print(f"Total receipts: {len(df_combined)}")
    print(f"Fraudulent receipts: {len(df_combined[df_combined['is_fraud'] == 1])} (was {existing_fraud_count})")
    print(f"Legitimate receipts: {len(df_combined[df_combined['is_fraud'] == 0])}")
    
    # Show fraud scenario breakdown
    fraud_scenarios = {}
    for receipt in enhanced_fraudulent_receipts:
        scenario = receipt['fraud_scenario']
        fraud_scenarios[scenario] = fraud_scenarios.get(scenario, 0) + 1
    
    print("\nEnhanced fraud scenarios added:")
    for scenario, count in fraud_scenarios.items():
        print(f"   - {scenario}: {count} receipts")
    
    return df_combined, fraud_scenarios

def create_enhanced_training_script():
    """Create an enhanced training script with better features"""
    
    enhanced_training_script = '''
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_selection import SelectKBest, f_classif
import joblib
import matplotlib.pyplot as plt
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.pipeline import Pipeline as ImbPipeline
import json
import re

print("Loading and preparing enhanced fraud detection dataset...")

# Load dataset
df = pd.read_csv("receipts_dataset.csv")
print(f"Loaded {len(df)} receipts")

# Check what columns are available
print(f"Available columns: {list(df.columns)}")

# ──────────────────────────────────────────────────────────────────────────────
#  Enhanced Feature Engineering
# ──────────────────────────────────────────────────────────────────────────────

# Convert date to datetime and extract features
df["date"] = pd.to_datetime(df["date"], errors='coerce')

# Temporal features
df["is_weekend"] = df["date"].dt.dayofweek >= 5
df["is_month_end"] = df["date"].dt.day >= 25
df["month"] = df["date"].dt.month
df["day_of_week"] = df["date"].dt.dayofweek
df["hour"] = df["date"].dt.hour
df["is_late_night"] = (df["hour"] >= 22) | (df["hour"] <= 2)

# Financial features
df["tip_ratio"] = df["tip"] / (df["total_amount"] + 1e-6)
df["avg_item_price"] = df["total_amount"] / (df["item_count"] + 1e-6)
df["has_tip"] = df["tip"] > 0
df["amount_log"] = np.log(df["total_amount"] + 1)

# Amount analysis with better thresholds
df["is_high_amount"] = df["total_amount"] > df["total_amount"].quantile(0.9)
df["is_low_amount"] = df["total_amount"] < df["total_amount"].quantile(0.1)
df["is_round_amount"] = df["total_amount"].apply(lambda x: x in [100, 150, 200, 250, 300, 500, 750, 1000])

# Vendor analysis - Enhanced
df["vendor_name_length"] = df["vendor"].str.len()
df["vendor_has_numbers"] = df["vendor"].str.contains(r'\\d', regex=True)
df["vendor_has_special_chars"] = df["vendor"].str.contains(r'[^a-zA-Z\\s]', regex=True)
df["vendor_word_count"] = df["vendor"].str.split().str.len()
df["vendor_is_generic"] = df["vendor"].str.lower().isin(['store', 'market', 'shop', 'business', 'services'])

# Payment method analysis
df["has_payment_method"] = df["payment_method"].notna() & (df["payment_method"] != "")
df["payment_is_suspicious"] = df["payment_method"].str.lower().isin(['cash', 'personal card', 'gift card', 'store credit', 'comp'])

# Item count analysis
df["has_items"] = df["item_count"] > 0
df["is_high_item_count"] = df["item_count"] > df["item_count"].quantile(0.9)

# Fraud scenario features (if available)
if 'fraud_scenario' in df.columns:
    df["has_fraud_scenario"] = df["fraud_scenario"].notna()
    # Create dummy variables for fraud scenarios
    fraud_scenarios = pd.get_dummies(df["fraud_scenario"], prefix="scenario")
    df = pd.concat([df, fraud_scenarios], axis=1)

# Fraud indicators analysis (if available)
if 'fraud_indicators' in df.columns:
    # Parse fraud indicators JSON
    df["fraud_indicators_parsed"] = df["fraud_indicators"].apply(
        lambda x: json.loads(x) if pd.notna(x) and x != '' else []
    )
    df["num_fraud_indicators"] = df["fraud_indicators_parsed"].str.len()
    df["has_fraud_indicators"] = df["num_fraud_indicators"] > 0

# ──────────────────────────────────────────────────────────────────────────────
#  Feature Selection
# ──────────────────────────────────────────────────────────────────────────────

# Enhanced feature set
enhanced_feature_columns = [
    # Core receipt data
    'total_amount', 'tip', 'item_count', 'tip_ratio', 'avg_item_price',
    'amount_log', 'is_high_amount', 'is_low_amount', 'is_round_amount',
    
    # Temporal features
    'is_weekend', 'is_month_end', 'month', 'day_of_week', 'hour', 'is_late_night',
    
    # Vendor features
    'vendor_name_length', 'vendor_has_numbers', 'vendor_has_special_chars', 
    'vendor_word_count', 'vendor_is_generic',
    
    # Payment features
    'has_payment_method', 'payment_is_suspicious',
    
    # Item features
    'has_items', 'is_high_item_count',
    
    # Tip features
    'has_tip',
    
    # Fraud indicators (if available)
    'num_fraud_indicators', 'has_fraud_indicators'
]

# Add fraud scenario dummy variables if available
if 'fraud_scenario' in df.columns:
    scenario_cols = [col for col in df.columns if col.startswith('scenario_')]
    enhanced_feature_columns.extend(scenario_cols)

# Remove any columns that don't exist
available_features = [col for col in enhanced_feature_columns if col in df.columns]
print(f"Using {len(available_features)} enhanced features for training: {available_features}")

# Prepare features and target
X = df[available_features].fillna(0)
y = df["is_fraud"]

print(f"Feature matrix shape: {X.shape}")
print(f"Target distribution: {y.value_counts().to_dict()}")

# ──────────────────────────────────────────────────────────────────────────────
#  Handle Class Imbalance
# ──────────────────────────────────────────────────────────────────────────────

print("Handling class imbalance...")

# Use SMOTE to balance the dataset
smote = SMOTE(random_state=42, k_neighbors=3)
smote_result = smote.fit_resample(X, y)
X_balanced, y_balanced = smote_result[0], smote_result[1]

print(f"After balancing: {y_balanced.value_counts().to_dict()}")

# ──────────────────────────────────────────────────────────────────────────────
#  Feature Scaling
# ──────────────────────────────────────────────────────────────────────────────

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_balanced)

# ──────────────────────────────────────────────────────────────────────────────
#  Enhanced Model Training
# ──────────────────────────────────────────────────────────────────────────────

print("Training enhanced fraud detection model...")

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_balanced, test_size=0.2, random_state=42, stratify=y_balanced
)

# Enhanced models with better parameters
models = {
    'Random Forest': RandomForestClassifier(
        n_estimators=300, 
        max_depth=15, 
        min_samples_split=3,
        min_samples_leaf=1,
        random_state=42,
        class_weight='balanced',
        max_features='sqrt'
    ),
    'Gradient Boosting': GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=8,
        random_state=42,
        subsample=0.8
    )
}

# Create ensemble model
ensemble = VotingClassifier([
    ('rf', models['Random Forest']),
    ('gb', models['Gradient Boosting'])
], voting='soft')

models['Ensemble'] = ensemble

best_model = None
best_score = 0
results = {}

for name, model in models.items():
    print(f"Training {name}...")
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Metrics
    accuracy = model.score(X_test, y_test)
    auc_score = roc_auc_score(y_test, y_pred_proba)
    
    results[name] = {
        'model': model,
        'accuracy': accuracy,
        'auc': auc_score,
        'predictions': y_pred,
        'probabilities': y_pred_proba
    }
    
    print(f"DONE {name} - Accuracy: {accuracy:.4f}, AUC: {auc_score:.4f}")
    
    if auc_score > best_score:
        best_score = auc_score
        best_model = model

# ──────────────────────────────────────────────────────────────────────────────
#  Model Evaluation
# ──────────────────────────────────────────────────────────────────────────────

print("\\nEnhanced Model Evaluation Results:")
print("=" * 50)

for name, result in results.items():
    print(f"\\n {name}:")
    print(f"   Accuracy: {result['accuracy']:.4f}")
    print(f"   AUC Score: {result['auc']:.4f}")
    print("\\n   Classification Report:")
    print(classification_report(y_test, result['predictions']))

# ──────────────────────────────────────────────────────────────────────────────
#  Feature Importance Analysis
# ──────────────────────────────────────────────────────────────────────────────

if best_model is not None and hasattr(best_model, 'feature_importances_'):
    print("\\nEnhanced Feature Importance Analysis:")
    print("=" * 50)
    
    feature_importance = pd.DataFrame({
        'feature': available_features,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\\nTop 15 Most Important Features:")
    print(feature_importance.head(15).to_string(index=False))
    
    # Plot feature importance
    plt.figure(figsize=(12, 8))
    top_features = feature_importance.head(15)
    plt.barh(range(len(top_features)), top_features['importance'])
    plt.yticks(range(len(top_features)), top_features['feature'].tolist())
    plt.xlabel('Feature Importance')
    plt.title('Top 15 Most Important Features for Enhanced Fraud Detection')
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig('enhanced_feature_importance.png', dpi=300, bbox_inches='tight')
    plt.close()

# ──────────────────────────────────────────────────────────────────────────────
#  Save Enhanced Models and Artifacts
# ──────────────────────────────────────────────────────────────────────────────

print("\\nSaving enhanced models and artifacts...")

# Save the best model
if best_model is not None:
    joblib.dump(best_model, "enhanced_fraud_detection_model.pkl")
    
    # Save the scaler
    joblib.dump(scaler, "enhanced_fraud_detection_scaler.pkl")
    
    # Save feature names
    joblib.dump(available_features, "enhanced_fraud_detection_features.pkl")
    
    # Save model metadata
    model_metadata = {
        'model_type': type(best_model).__name__,
        'features_used': available_features,
        'training_samples': len(X_balanced),
        'test_samples': len(X_test),
        'best_auc_score': best_score,
        'dataset_columns': list(df.columns),
        'note': 'Enhanced model trained on sophisticated fraud scenarios with advanced features.'
    }
    
    joblib.dump(model_metadata, "enhanced_fraud_detection_metadata.pkl")
    
    print("Enhanced models saved successfully!")
    print(f"Best model: {type(best_model).__name__} with AUC: {best_score:.4f}")
    
    print("\\nEnhanced fraud detection model training completed!")
    print("Saved files:")
    print("   - enhanced_fraud_detection_model.pkl (trained model)")
    print("   - enhanced_fraud_detection_scaler.pkl (feature scaler)")
    print("   - enhanced_fraud_detection_features.pkl (feature names)")
    print("   - enhanced_fraud_detection_metadata.pkl (model metadata)")
    print("   - enhanced_feature_importance.png (feature importance plot)")
    
    print("\\nNext Steps:")
    print("   1. Test the enhanced model with realistic fraudulent receipts")
    print("   2. Check enhanced_feature_importance.png to see which features matter most")
    print("   3. The model now includes sophisticated fraud detection capabilities")
else:
    print("No model was successfully trained!")
'''
    
    with open("enhanced_train_model.py", "w", encoding='utf-8') as f:
        f.write(enhanced_training_script)
    
    print("Created enhanced training script: enhanced_train_model.py")

def retrain_enhanced_model():
    """Retrain the fraud detection model using the enhanced dataset"""
    
    print("\nStep 2: Retraining with enhanced fraud detection model...")
    print("=" * 60)
    
    # Check if enhanced training script exists
    if not os.path.exists("enhanced_train_model.py"):
        print("Error: enhanced_train_model.py not found!")
        return False
    
    try:
        # Run the enhanced training script
        result = subprocess.run([sys.executable, "enhanced_train_model.py"], 
                              capture_output=True, 
                              text=True,
                              cwd=os.getcwd())
        
        # Print the output
        if result.stdout:
            print("Enhanced Training Output:")
            print(result.stdout)
        
        if result.stderr:
            print("Enhanced Training Warnings/Errors:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("Enhanced model retraining completed successfully!")
            return True
        else:
            print(f"Enhanced model retraining failed with exit code: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"Error running enhanced training script: {str(e)}")
        return False

def analyze_enhanced_results():
    """Analyze the enhanced results and provide insights"""
    
    print("\nStep 3: Analyzing Enhanced Results...")
    print("=" * 60)
    
    # Check if enhanced model files were created
    enhanced_model_files = [
        "enhanced_fraud_detection_model.pkl",
        "enhanced_fraud_detection_scaler.pkl", 
        "enhanced_fraud_detection_features.pkl",
        "enhanced_fraud_detection_metadata.pkl",
        "enhanced_feature_importance.png"
    ]
    
    print("Checking generated enhanced model files:")
    for file in enhanced_model_files:
        if os.path.exists(file):
            print(f"   {file}")
        else:
            print(f"   {file} (missing)")
    
    # Load and display enhanced model metadata if available
    try:
        import joblib
        metadata = joblib.load("enhanced_fraud_detection_metadata.pkl")
        print(f"\nEnhanced Model Performance:")
        print(f"   - Model Type: {metadata.get('model_type', 'Unknown')}")
        print(f"   - Training Samples: {metadata.get('training_samples', 'Unknown')}")
        print(f"   - Test Samples: {metadata.get('test_samples', 'Unknown')}")
        print(f"   - Best AUC Score: {metadata.get('best_auc_score', 'Unknown'):.4f}")
        print(f"   - Features Used: {len(metadata.get('features_used', []))}")
        
    except Exception as e:
        print(f"Could not load enhanced model metadata: {str(e)}")
    
    print(f"\nEnhanced Model Benefits:")
    print(f"   1. More sophisticated fraud scenarios")
    print(f"   2. Advanced feature engineering")
    print(f"   3. Better handling of realistic fraud patterns")
    print(f"   4. Enhanced visual and temporal analysis")
    print(f"   5. Improved accuracy on realistic fraudulent receipts")

def main():
    """Main execution function"""
    
    print("Enhanced Fraud Detection Model Training")
    print("=" * 70)
    
    # Step 1: Update dataset
    df_combined, fraud_scenarios = update_dataset_with_enhanced_fraud()
    
    if df_combined is None:
        print("Failed to update dataset. Exiting.")
        return
    
    # Step 2: Create enhanced training script
    create_enhanced_training_script()
    
    # Step 3: Retrain model
    success = retrain_enhanced_model()
    
    if not success:
        print("Enhanced model retraining failed. Please check the errors above.")
        return
    
    # Step 4: Analyze results
    analyze_enhanced_results()
    
    print("\nEnhanced fraud detection model training completed!")
    print(f"Your enhanced model now includes {len(fraud_scenarios)} sophisticated fraud scenarios:")
    for scenario, count in fraud_scenarios.items():
        print(f"   - {scenario}: {count} examples")
    
    print("\nNext Steps:")
    print("   1. Test the enhanced model with realistic fraudulent receipts")
    print("   2. Compare performance with your original model")
    print("   3. Consider generating even more sophisticated fraud scenarios")
    print("   4. Integrate the enhanced model into your application")

if __name__ == "__main__":
    main()
