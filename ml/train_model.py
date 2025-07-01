import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# Load dataset
df = pd.read_csv("receipts_dataset.csv")

# Encode categorical fields (like vendor and payment_method)
df["vendor"] = df["vendor"].astype("category").cat.codes
df["payment_method"] = df["payment_method"].astype("category").cat.codes

# Feature/label split
X = df.drop(columns=["is_fraud"])
y = df["is_fraud"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
print(classification_report(y_test, model.predict(X_test)))

# Save model
joblib.dump(model, "fraud_model.pkl")
