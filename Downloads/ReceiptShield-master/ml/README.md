# Machine Learning Module

This directory contains the machine learning components for fraud detection and receipt analysis.

## Directory Structure

```
ml/
├── models/           # Trained models and artifacts
│   ├── *.pkl        # Serialized model files
│   └── *.png        # Model visualization (feature importance, etc.)
├── scripts/         # Training and inference scripts
│   ├── train_model.py
│   ├── predict_server.py
│   ├── predict_single.py
│   └── requirements.txt
└── data/            # Training and test datasets
    ├── receipts/    # Receipt image datasets
    └── *.csv        # Processed datasets
```

## Getting Started

### 1. Setup Python Environment

```bash
cd ml/scripts
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Training the Model

```bash
python scripts/train_model.py
```

### 3. Running Predictions

**Single Prediction:**
```bash
python scripts/predict_single.py --image path/to/receipt.jpg
```

**Prediction Server:**
```bash
python scripts/predict_server.py
```

## Model Information

- **Type**: Fraud Detection Classification
- **Features**: Receipt metadata, OCR text analysis, image properties
- **Output**: Fraud probability score and classification

## Data Management

- Training data is stored in `data/receipts/`
- Datasets are versioned with timestamps
- Backups are automatically created before retraining

## Requirements

- Python 3.8+
- TensorFlow/PyTorch (see requirements.txt)
- OpenCV for image processing
- scikit-learn for ML utilities

## Performance Metrics

Model performance metrics are tracked in `models/` directory:
- Feature importance visualization
- Confusion matrix
- ROC curves
- Accuracy/Precision/Recall scores

