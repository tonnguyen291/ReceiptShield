#!/bin/bash

# Setup Python Environment for ML Prediction
# ==========================================

echo "🐍 Setting up Python environment for ML prediction..."

# Check if we're in the ml directory
if [ ! -f "predict_single.py" ]; then
    echo "❌ Error: Please run this script from the ml directory"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📥 Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

echo "✅ Python environment setup complete!"
echo ""
echo "To test the ML prediction:"
echo "  source venv/bin/activate"
echo "  echo '{\"items\": [{\"label\": \"vendor\", \"value\": \"Test Store\"}, {\"label\": \"total amount\", \"value\": \"25.50\"}]}' | python3 predict_single.py"
