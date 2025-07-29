import pandas as pd
import json
import os
from datetime import datetime

def update_dataset_with_fraudulent_receipts():
    """Add the newly generated fraudulent receipts to the training dataset"""
    
    print("📊 Updating dataset with new fraudulent receipts...")
    
    # Load existing dataset
    dataset_file = "receipts_dataset.csv"
    if os.path.exists(dataset_file):
        df_existing = pd.read_csv(dataset_file)
        print(f"📋 Loaded existing dataset with {len(df_existing)} receipts")
    else:
        # Create new dataset with proper columns
        df_existing = pd.DataFrame(columns=['vendor', 'total_amount', 'date', 'item_count', 'tip', 'payment_method', 'is_fraud'])
        print("📋 Created new dataset (no existing file found)")
    
    # Load fraudulent receipts metadata
    metadata_file = "receipts/new_fake_receipts/fraudulent_receipts_metadata.json"
    
    if not os.path.exists(metadata_file):
        print(f"❌ Error: {metadata_file} not found. Please generate fraudulent receipts first.")
        return
    
    with open(metadata_file, 'r') as f:
        fraudulent_receipts = json.load(f)
    
    print(f"🎭 Found {len(fraudulent_receipts)} fraudulent receipts to add")
    
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
        
        print(f"✅ Added fraudulent receipt: {receipt['fraud_scenario']} - {receipt['vendor']} (${receipt['total_amount']})")
    
    # Create DataFrame from new rows
    df_new = pd.DataFrame(new_rows)
    
    # Combine with existing dataset
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    
    # Save updated dataset
    df_combined.to_csv(dataset_file, index=False)
    
    print(f"\n🎉 Successfully updated dataset!")
    print(f"📊 Total receipts: {len(df_combined)}")
    print(f"📊 Fraudulent receipts: {len(df_combined[df_combined['is_fraud'] == 1])}")
    print(f"📊 Legitimate receipts: {len(df_combined[df_combined['is_fraud'] == 0])}")
    
    # Show fraud scenario breakdown
    fraud_scenarios = {}
    for receipt in fraudulent_receipts:
        scenario = receipt['fraud_scenario']
        fraud_scenarios[scenario] = fraud_scenarios.get(scenario, 0) + 1
    
    print("\n🎭 New fraud scenarios added:")
    for scenario, count in fraud_scenarios.items():
        print(f"   - {scenario}: {count} receipts")
    
    return df_combined

if __name__ == "__main__":
    update_dataset_with_fraudulent_receipts() 