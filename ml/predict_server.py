from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load("fraud_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    # Same transformation logic as training
    data["vendor"] = hash(data["vendor"]) % 1000
    data["payment_method"] = hash(data["payment_method"]) % 100
    features = [
        data["vendor"],
        data["total_amount"],
        data["item_count"],
        data["tip"],
        data["payment_method"]
    ]
    prediction = model.predict([features])[0]
    return jsonify({"is_fraud": bool(prediction)})

app.run(port=5000)
