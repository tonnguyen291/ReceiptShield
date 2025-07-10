import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report
from sklearn.preprocessing import OrdinalEncoder
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt

# Load dataset
df = pd.read_csv("receipts_dataset.csv")

# --- Feature Engineering --- #
df["date"] = pd.to_datetime(df["date"], errors='coerce')
df["is_weekend"] = df["date"].dt.dayofweek >= 5
df["avg_item_price"] = df["total_amount"] / (df["item_count"] + 1e-5)
df["tip_ratio"] = df["tip"] / (df["total_amount"] + 1e-5)

# --- Fraud Flag Features --- #
df["flag_total_mismatch"] = abs((df["tip"] + df["total_amount"]) - df["total_amount"]) > 0.01
df["flag_tip_outlier"] = (df["tip_ratio"] > 0.3) | (df["tip_ratio"] < 0)
df["flag_vendor_gibberish"] = df["vendor"].astype(str).str.contains(r'[^a-zA-Z\s]', regex=True)
df["flag_high_item_price"] = df["avg_item_price"] > 50
df["flag_weekend_surcharge"] = df["is_weekend"] & (df["avg_item_price"] > 40)

# --- Encode categorical features --- #
categorical_cols = ["vendor", "payment_method"]
encoder = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)
df[categorical_cols] = encoder.fit_transform(df[categorical_cols])
joblib.dump(encoder, "encoder.pkl")

# Drop or fill any remaining NaNs
df = df.fillna(0)

# --- Feature/label split --- #
X = df.drop(columns=["is_fraud", "date"])
y = df["is_fraud"]

# --- Handle class imbalance --- #
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

# --- Train/test split --- #
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)

# --- Train model --- #
model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
model.fit(X_train, y_train)

# --- Evaluate --- #
y_pred = model.predict(X_test)
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# --- Cross-validation --- #
scores = cross_val_score(model, X_resampled, y_resampled, cv=5, scoring='f1')
print("\nCross-validated F1 scores:", scores)

# --- Save model --- #
joblib.dump(model, "fraud_model.pkl")

# --- Feature Importance Plot --- #
importances = model.feature_importances_
feature_names = X.columns
plt.figure(figsize=(10, 6))
plt.barh(feature_names, importances)
plt.title("Feature Importance")
plt.tight_layout()
plt.savefig("feature_importance.png")
plt.show()
