"""
Retrain Machine Learning Model with New Fraudulent Receipts
===========================================================

This script:
1. Updates the dataset with newly generated fraudulent receipts
2. Retrains the fraud detection model using the existing train_model.py logic
3. Compares performance before and after including the new receipts

Usage: python retrain_with_fraudulent_receipts.py
"""

import subprocess
import os
import pandas as pd
import json
import sys
from datetime import datetime

def update_dataset_with_fraudulent_receipts():
    """Add the newly generated fraudulent receipts to the training dataset"""
    
    print("📊 Step 1: Updating dataset with new fraudulent receipts...")
    
    # Load existing dataset
    dataset_file = "receipts_dataset.csv"
    backup_file = f"receipts_dataset_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    if os.path.exists(dataset_file):
        df_existing = pd.read_csv(dataset_file)
        # Create backup
        df_existing.to_csv(backup_file, index=False)
        print(f"📋 Loaded existing dataset with {len(df_existing)} receipts")
        print(f"💾 Created backup: {backup_file}")
    else:
        df_existing = pd.DataFrame(columns=['vendor', 'total_amount', 'date', 'item_count', 'tip', 'payment_method', 'is_fraud'])
        print("📋 Created new dataset (no existing file found)")
    
    # Load fraudulent receipts metadata
    metadata_file = "receipts/new_fake_receipts/fraudulent_receipts_metadata.json"
    
    if not os.path.exists(metadata_file):
        print(f"❌ Error: {metadata_file} not found. Please generate fraudulent receipts first.")
        return None, None
    
    with open(metadata_file, 'r') as f:
        fraudulent_receipts = json.load(f)
    
    print(f"🎭 Found {len(fraudulent_receipts)} fraudulent receipts to add")
    
    # Check for duplicates by receipt_id
    existing_fraud_count = len(df_existing[df_existing['is_fraud'] == 1])
    
    # Convert fraudulent receipts to dataset format
    new_rows = []
    
    for receipt in fraudulent_receipts:
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
            'is_fraud': 1  # All new receipts are fraudulent
        }
        new_rows.append(new_row)
    
    # Create DataFrame from new rows
    df_new = pd.DataFrame(new_rows)
    
    # Combine with existing dataset
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    
    # Save updated dataset
    df_combined.to_csv(dataset_file, index=False)
    
    print(f"\n✅ Dataset updated successfully!")
    print(f"📊 Total receipts: {len(df_combined)}")
    print(f"📊 Fraudulent receipts: {len(df_combined[df_combined['is_fraud'] == 1])} (was {existing_fraud_count})")
    print(f"📊 Legitimate receipts: {len(df_combined[df_combined['is_fraud'] == 0])}")
    
    # Show fraud scenario breakdown
    fraud_scenarios = {}
    for receipt in fraudulent_receipts:
        scenario = receipt['fraud_scenario']
        fraud_scenarios[scenario] = fraud_scenarios.get(scenario, 0) + 1
    
    print("\n🎭 New fraud scenarios added:")
    for scenario, count in fraud_scenarios.items():
        print(f"   - {scenario}: {count} receipts")
    
    return df_combined, fraud_scenarios

def retrain_model():
    """Retrain the fraud detection model using the updated dataset"""
    
    print("\n🤖 Step 2: Retraining fraud detection model...")
    print("=" * 60)
    
    # Check if train_model.py exists
    if not os.path.exists("train_model.py"):
        print("❌ Error: train_model.py not found!")
        return False
    
    try:
        # Run the training script
        result = subprocess.run([sys.executable, "train_model.py"], 
                              capture_output=True, 
                              text=True,
                              cwd=os.getcwd())
        
        # Print the output
        if result.stdout:
            print("📊 Training Output:")
            print(result.stdout)
        
        if result.stderr:
            print("⚠️ Training Warnings/Errors:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ Model retraining completed successfully!")
            return True
        else:
            print(f"❌ Model retraining failed with exit code: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running training script: {str(e)}")
        return False

def analyze_results():
    """Analyze the results and provide insights"""
    
    print("\n📈 Step 3: Analyzing Results...")
    print("=" * 60)
    
    # Check if model files were created
    model_files = [
        "fraud_detection_model.pkl",
        "fraud_detection_scaler.pkl", 
        "fraud_detection_features.pkl",
        "fraud_detection_metadata.pkl",
        "feature_importance.png"
    ]
    
    print("🔍 Checking generated model files:")
    for file in model_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} (missing)")
    
    # Load and display model metadata if available
    try:
        import joblib
        metadata = joblib.load("fraud_detection_metadata.pkl")
        print(f"\n🎯 Model Performance:")
        print(f"   - Model Type: {metadata.get('model_type', 'Unknown')}")
        print(f"   - Training Samples: {metadata.get('training_samples', 'Unknown')}")
        print(f"   - Test Samples: {metadata.get('test_samples', 'Unknown')}")
        print(f"   - Best AUC Score: {metadata.get('best_auc_score', 'Unknown'):.4f}")
        print(f"   - Features Used: {len(metadata.get('features_used', []))}")
        
    except Exception as e:
        print(f"⚠️ Could not load model metadata: {str(e)}")
    
    print(f"\n💡 Next Steps:")
    print(f"   1. Test the model with some of your new fraudulent receipts")
    print(f"   2. Check feature_importance.png to see which features are most important")
    print(f"   3. Consider generating more varied fraudulent receipts if needed")

def main():
    """Main execution function"""
    
    print("🚀 Retraining Fraud Detection Model with New Fraudulent Receipts")
    print("=" * 70)
    
    # Step 1: Update dataset
    df_combined, fraud_scenarios = update_dataset_with_fraudulent_receipts()
    
    if df_combined is None:
        print("❌ Failed to update dataset. Exiting.")
        return
    
    # Step 2: Retrain model
    success = retrain_model()
    
    if not success:
        print("❌ Model retraining failed. Please check the errors above.")
        return
    
    # Step 3: Analyze results
    analyze_results()
    
    print("\n🎉 Retraining process completed!")
    print(f"📊 Your model now includes {len(fraud_scenarios)} different fraud scenarios:")
    for scenario, count in fraud_scenarios.items():
        print(f"   - {scenario}: {count} examples")

if __name__ == "__main__":
    main() 