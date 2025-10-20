import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_selection import SelectKBest, f_classif
import joblib
import matplotlib.pyplot as plt
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.pipeline import Pipeline as ImbPipeline

print("Loading and preparing fraud detection dataset...")

# Load dataset
df = pd.read_csv("receipts_dataset.csv")
print(f"Loaded {len(df)} receipts")

# Check what columns are available
print(f"Available columns: {list(df.columns)}")

# ──────────────────────────────────────────────────────────────────────────────
#  Feature Engineering (based on available columns)
# ──────────────────────────────────────────────────────────────────────────────

# Convert date to datetime and extract features
df["date"] = pd.to_datetime(df["date"], errors='coerce')

# Temporal features
df["is_weekend"] = df["date"].dt.dayofweek >= 5
df["is_month_end"] = df["date"].dt.day >= 25
df["month"] = df["date"].dt.month
df["day_of_week"] = df["date"].dt.dayofweek

# Financial features
df["tip_ratio"] = df["tip"] / (df["total_amount"] + 1e-6)
df["avg_item_price"] = df["total_amount"] / (df["item_count"] + 1e-6)
df["has_tip"] = df["tip"] > 0
    
# Vendor analysis
df["vendor_name_length"] = df["vendor"].str.len()
df["vendor_has_numbers"] = df["vendor"].str.contains(r'\d', regex=True)
df["vendor_has_special_chars"] = df["vendor"].str.contains(r'[^a-zA-Z\s]', regex=True)
df["vendor_word_count"] = df["vendor"].str.split().str.len()

# Payment method analysis
df["has_payment_method"] = df["payment_method"].notna() & (df["payment_method"] != "")

# Amount analysis
df["amount_log"] = np.log(df["total_amount"] + 1)
df["is_high_amount"] = df["total_amount"] > df["total_amount"].quantile(0.9)
df["is_low_amount"] = df["total_amount"] < df["total_amount"].quantile(0.1)

# Item count analysis
df["has_items"] = df["item_count"] > 0
df["is_high_item_count"] = df["item_count"] > df["item_count"].quantile(0.9)

# ──────────────────────────────────────────────────────────────────────────────
#  Feature Selection (based on available columns)
# ──────────────────────────────────────────────────────────────────────────────

# Select features for the model based on what's available
available_feature_columns = [
    # Core receipt data
    'total_amount', 'tip', 'item_count', 'tip_ratio', 'avg_item_price',
    'amount_log', 'is_high_amount', 'is_low_amount',
    
    # Temporal features
    'is_weekend', 'is_month_end', 'month', 'day_of_week',
    
    # Vendor features
    'vendor_name_length', 'vendor_has_numbers', 'vendor_has_special_chars', 'vendor_word_count',
    
    # Payment features
    'has_payment_method',
    
    # Item features
    'has_items', 'is_high_item_count',
    
    # Tip features
    'has_tip'
]

# Remove any columns that don't exist
available_features = [col for col in available_feature_columns if col in df.columns]
print(f"Using {len(available_features)} features for training: {available_features}")

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
#  Model Training
# ──────────────────────────────────────────────────────────────────────────────

print("Training fraud detection model...")

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_balanced, test_size=0.2, random_state=42, stratify=y_balanced
)

# Train multiple models
models = {
    'Random Forest': RandomForestClassifier(
        n_estimators=200, 
        max_depth=10, 
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    ),
    'Gradient Boosting': GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        random_state=42
    )
}

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

print("\n Model Evaluation Results:")
print("=" * 50)

for name, result in results.items():
    print(f"\n {name}:")
    print(f"   Accuracy: {result['accuracy']:.4f}")
    print(f"   AUC Score: {result['auc']:.4f}")
    print("\n   Classification Report:")
    print(classification_report(y_test, result['predictions']))

# ──────────────────────────────────────────────────────────────────────────────
#  Feature Importance Analysis
# ──────────────────────────────────────────────────────────────────────────────

if best_model is not None and hasattr(best_model, 'feature_importances_'):
    print("\n Feature Importance Analysis:")
    print("=" * 50)
    
    feature_importance = pd.DataFrame({
        'feature': available_features,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 10 Most Important Features:")
    print(feature_importance.head(10).to_string(index=False))
    
    # Plot feature importance
    plt.figure(figsize=(10, 6))
    top_features = feature_importance.head(10)
    plt.barh(range(len(top_features)), top_features['importance'])
    plt.yticks(range(len(top_features)), top_features['feature'].tolist())
    plt.xlabel('Feature Importance')
    plt.title('Top 10 Most Important Features for Fraud Detection')
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
    plt.close()

# ──────────────────────────────────────────────────────────────────────────────
#  Save Models and Artifacts
# ──────────────────────────────────────────────────────────────────────────────

print("\n Saving models and artifacts...")

# Save the best model
if best_model is not None:
    joblib.dump(best_model, "fraud_detection_model.pkl")
    
    # Save the scaler
    joblib.dump(scaler, "fraud_detection_scaler.pkl")
    
    # Save feature names
    joblib.dump(available_features, "fraud_detection_features.pkl")
    
    # Save model metadata
    model_metadata = {
        'model_type': type(best_model).__name__,
        'features_used': available_features,
        'training_samples': len(X_balanced),
        'test_samples': len(X_test),
        'best_auc_score': best_score,
        'dataset_columns': list(df.columns),
        'note': 'Model trained on basic features. Run extract_dataset.ts first for enhanced fraud detection.'
    }
    
    joblib.dump(model_metadata, "fraud_detection_metadata.pkl")
    
    print("Models saved successfully!")
    print(f"Best model: {type(best_model).__name__} with AUC: {best_score:.4f}")
    
    # ──────────────────────────────────────────────────────────────────────────────
    #  Create Prediction Function
    # ──────────────────────────────────────────────────────────────────────────────
    
    print("\n Creating prediction function...")
    
    def predict_fraud_probability(receipt_data):
        """
        Predict fraud probability for a single receipt.
        
        Args:
            receipt_data (dict): Dictionary containing receipt features
            
        Returns:
            dict: Prediction results with probability and risk level
        """
        if best_model is None:
            return {
                'fraud_probability': 0.5,
                'risk_level': "UNKNOWN",
                'is_fraudulent': False,
                'error': 'Model not available'
            }
        
        # Ensure all required features are present
        features = {}
        for feature in available_features:
            features[feature] = receipt_data.get(feature, 0)
        
        # Convert to array and scale
        X_input = np.array([list(features.values())]).reshape(1, -1)
        X_scaled_input = scaler.transform(X_input)
        
        # Predict
        probability = best_model.predict_proba(X_scaled_input)[0][1]
        
        # Determine risk level
        if probability >= 0.8:
            risk_level = "HIGH"
        elif probability >= 0.5:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            'fraud_probability': probability,
            'risk_level': risk_level,
            'is_fraudulent': probability >= 0.5
        }
    
    # Save the prediction function
    joblib.dump(predict_fraud_probability, "fraud_prediction_function.pkl")
    
    print("Prediction function created and saved!")
    
    print("\n Fraud detection model training completed!")
    print("Saved files:")
    print("   - fraud_detection_model.pkl (trained model)")
    print("   - fraud_detection_scaler.pkl (feature scaler)")
    print("   - fraud_detection_features.pkl (feature names)")
    print("   - fraud_detection_metadata.pkl (model metadata)")
    print("   - fraud_prediction_function.pkl (prediction function)")
    print("   - feature_importance.png (feature importance plot)")
    
    print("\n Next Steps:")
    print("   1. Run 'npm run extract-dataset' to generate enhanced dataset with fraud flags")
    print("   2. Re-run this script to train a more sophisticated model")
else:
    print("No model was successfully trained!")
