"""
Enhanced Fraudulent Receipt Generator
=====================================

This script generates more realistic fraudulent receipts that are harder to detect
than the basic faker-generated ones. It includes sophisticated fraud patterns
that mimic real-world fraud scenarios.

Key improvements:
- More realistic fraud scenarios
- Better visual authenticity
- Sophisticated manipulation techniques
- Real-world fraud patterns
- Enhanced metadata for training
"""

import os
import random
import uuid
import re
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np
from faker import Faker
import json

fake = Faker()

# Configuration
IMAGE_WIDTH = 400
IMAGE_HEIGHT = 600
OUTPUT_FOLDER = "receipts/enhanced_fraudulent_receipts"
NUM_RECEIPTS = 50  # Increased for better training data

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Real-world vendor names for more realistic scenarios
REAL_VENDORS = [
    "Starbucks", "McDonald's", "Subway", "Chipotle", "Panera Bread",
    "Target", "Walmart", "CVS Pharmacy", "Walgreens", "Home Depot",
    "Office Depot", "Staples", "Best Buy", "Amazon", "Uber Eats",
    "DoorDash", "Grubhub", "Postmates", "Lyft", "Uber"
]

# Suspicious vendor patterns
SUSPICIOUS_VENDORS = [
    "Business Expenses LLC", "Corporate Services Inc", "Expense Solutions",
    "Quick Reimbursement Co", "Business Solutions", "Corporate Services",
    "Expense Management", "Business Solutions Inc", "Corporate Reimbursement"
]

def get_realistic_font():
    """Get fonts that look more like real receipt printers"""
    receipt_fonts = [
        "Courier New", "Monaco", "Consolas", "Lucida Console"
    ]
    for font_name in receipt_fonts:
        try:
            return ImageFont.truetype(font_name, size=random.randint(10, 14))
        except IOError:
            continue
    return ImageFont.load_default()

def generate_realistic_vendor_name(fraud_type):
    """Generate vendor names based on fraud type with realistic patterns"""
    
    if fraud_type == "vendor_substitution":
        # Use real vendor names but for wrong purposes
        return random.choice(REAL_VENDORS)
    
    elif fraud_type == "suspicious_vendor":
        # Use suspicious but plausible vendor names
        return random.choice(SUSPICIOUS_VENDORS)
    
    elif fraud_type == "generic_vendor":
        # Overly generic names
        return random.choice([
            "Store", "Market", "Shop", "Business", "Services",
            "General Store", "Local Business", "Corner Store"
        ])
    
    elif fraud_type == "fake_chain":
        # Fake chain store names
        fake_chains = [
            "QuickMart Express", "City Market Plus", "Urban Store",
            "Metro Market", "Downtown Store", "Business Center"
        ]
        return random.choice(fake_chains)
    
    else:
        return fake.company()

def generate_realistic_items(fraud_scenario):
    """Generate items that look realistic but contain fraud indicators"""
    
    if fraud_scenario == "personal_as_business":
        # Personal items disguised as business expenses
        personal_items = [
            ("Office Supplies", 89.99),  # Actually personal items
            ("Business Meeting", 125.00),  # Actually personal meal
            ("Client Entertainment", 200.00),  # Actually personal entertainment
            ("Travel Expense", 150.00),  # Actually personal travel
            ("Professional Development", 300.00)  # Actually personal course
        ]
        return random.sample(personal_items, random.randint(1, 3))
    
    elif fraud_scenario == "inflated_prices":
        # Realistic items with inflated prices
        inflated_items = [
            ("Coffee", 12.99),  # Should be ~$4
            ("Sandwich", 18.99),  # Should be ~$8
            ("Office Supplies", 45.99),  # Should be ~$15
            ("Parking", 25.00),  # Should be ~$8
            ("Printing", 35.99)  # Should be ~$5
        ]
        return random.sample(inflated_items, random.randint(2, 4))
    
    elif fraud_scenario == "duplicate_items":
        # Same items repeated (common fraud pattern)
        base_items = [
            ("Office Supplies", 25.99),
            ("Business Lunch", 45.00),
            ("Travel Expense", 75.00)
        ]
        # Duplicate some items
        items = base_items.copy()
        if random.random() < 0.7:
            items.append(random.choice(base_items))  # Duplicate
        return items
    
    elif fraud_scenario == "suspicious_services":
        # Suspicious service charges
        suspicious_items = [
            ("Consultation Fee", 500.00),
            ("Processing Fee", 150.00),
            ("Service Charge", 200.00),
            ("Administrative Fee", 100.00),
            ("Handling Fee", 75.00)
        ]
        return random.sample(suspicious_items, random.randint(1, 3))
    
    else:
        # Normal business items
        normal_items = [
            ("Office Supplies", random.uniform(15, 85)),
            ("Business Lunch", random.uniform(25, 120)),
            ("Travel Expense", random.uniform(50, 200)),
            ("Meeting Snacks", random.uniform(10, 45)),
            ("Printing", random.uniform(5, 35))
        ]
        return random.sample(normal_items, random.randint(2, 5))

def calculate_realistic_fraud_totals(items, fraud_type):
    """Calculate totals with realistic fraud patterns"""
    subtotal = sum(price for _, price in items)
    tax_rate = random.uniform(0.06, 0.10)  # Vary tax rate slightly
    tax = round(subtotal * tax_rate, 2)
    expected_total = subtotal + tax
    
    if fraud_type == "round_total":
        # Suspiciously round totals
        round_totals = [100.00, 150.00, 200.00, 250.00, 300.00, 500.00, 750.00, 1000.00]
        total = random.choice(round_totals)
        # Adjust tax to match
        tax = round(total * tax_rate / (1 + tax_rate), 2)
        subtotal = total - tax
        return round(subtotal, 2), round(tax, 2), round(total, 2)
    
    elif fraud_type == "excessive_tip":
        # Unusually high tips
        tip_percentages = [0.25, 0.30, 0.40, 0.50]  # 25-50% tips
        tip_pct = random.choice(tip_percentages)
        tip = round(expected_total * tip_pct, 2)
        total = expected_total + tip
        return round(subtotal, 2), round(tax, 2), round(total, 2), round(tip, 2)
    
    elif fraud_type == "tax_manipulation":
        # Incorrect tax calculation
        incorrect_tax = round(subtotal * random.uniform(0.12, 0.18), 2)  # Higher tax
        total = subtotal + incorrect_tax
        return round(subtotal, 2), round(incorrect_tax, 2), round(total, 2)
    
    else:
        return round(subtotal, 2), round(tax, 2), round(expected_total, 2)

def generate_suspicious_timing():
    """Generate dates with suspicious timing patterns"""
    now = datetime.now()
    
    patterns = [
        "month_end_rush",  # Last few days of month
        "weekend_business",  # Weekend business expenses
        "late_night",  # Unusual hours
        "holiday_weekend",  # Holiday periods
        "duplicate_timing"  # Same day as other receipts
    ]
    
    pattern = random.choice(patterns)
    
    if pattern == "month_end_rush":
        # Last 3 days of month
        base_date = now - timedelta(days=random.randint(1, 30))
        last_day = 28 if base_date.month == 2 else 30 if base_date.month in [4, 6, 9, 11] else 31
        day = random.choice([last_day-2, last_day-1, last_day])
        return base_date.replace(day=day)
    
    elif pattern == "weekend_business":
        # Weekend business expenses (suspicious)
        base_date = now - timedelta(days=random.randint(1, 30))
        days_ahead = 5 - base_date.weekday()  # Saturday
        if days_ahead <= 0:
            days_ahead += 7
        return base_date + timedelta(days=days_ahead)
    
    elif pattern == "late_night":
        # Unusual business hours
        base_date = now - timedelta(days=random.randint(1, 15))
        return base_date.replace(
            hour=random.choice([22, 23, 0, 1, 2]), 
            minute=random.randint(0, 59)
        )
    
    else:
        return fake.date_time_this_year()

def add_sophisticated_visual_fraud(image, fraud_type):
    """Add sophisticated visual fraud indicators"""
    
    if fraud_type == "digital_manipulation":
        # Signs of digital editing
        draw = ImageDraw.Draw(image)
        
        # Add subtle editing artifacts
        for _ in range(random.randint(1, 2)):
            # Slightly different font weights in same line
            x = random.randint(10, IMAGE_WIDTH - 100)
            y = random.randint(100, IMAGE_HEIGHT - 100)
            draw.rectangle([(x, y), (x+50, y+15)], fill=240, outline=200)
    
    elif fraud_type == "poor_scan_quality":
        # Poor quality scan (common in fraud)
        image = image.filter(ImageFilter.GaussianBlur(radius=0.8))
        
        # Add scan artifacts
        img_array = np.array(image)
        noise = np.random.randint(-20, 20, img_array.shape, dtype=np.int16)
        img_array = np.clip(img_array.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        image = Image.fromarray(img_array)
    
    elif fraud_type == "inconsistent_formatting":
        # Inconsistent formatting (sign of editing)
        # This is handled in the text rendering
        pass
    
    return image

def generate_realistic_payment_method(fraud_type):
    """Generate payment methods with fraud indicators"""
    
    if fraud_type == "missing_payment":
        return ""  # Missing payment method
    
    elif fraud_type == "suspicious_payment":
        return random.choice([
            "CASH", "Personal Card", "Gift Card", "Store Credit",
            "Employee Discount", "Comp", "Void"
        ])
    
    elif fraud_type == "generic_payment":
        return "Card"  # Too generic
    
    else:
        return random.choice([
            "Credit Card", "Debit Card", "Cash", "Check", "Mobile Payment"
        ])

def create_enhanced_fraudulent_receipt(fraud_scenario, receipt_id):
    """Create a sophisticated fraudulent receipt"""
    
    # Enhanced fraud scenarios
    scenarios = {
        "personal_as_business": {
            "vendor_type": "vendor_substitution",
            "items_type": "personal_as_business",
            "total_type": "normal",
            "visual_fraud": None,
            "payment_type": "normal"
        },
        "inflated_prices": {
            "vendor_type": "normal",
            "items_type": "inflated_prices", 
            "total_type": "normal",
            "visual_fraud": None,
            "payment_type": "normal"
        },
        "duplicate_submission": {
            "vendor_type": "normal",
            "items_type": "duplicate_items",
            "total_type": "round_total",
            "visual_fraud": None,
            "payment_type": "normal"
        },
        "suspicious_services": {
            "vendor_type": "suspicious_vendor",
            "items_type": "suspicious_services",
            "total_type": "excessive_tip",
            "visual_fraud": None,
            "payment_type": "suspicious_payment"
        },
        "digital_manipulation": {
            "vendor_type": "normal",
            "items_type": "normal",
            "total_type": "tax_manipulation",
            "visual_fraud": "digital_manipulation",
            "payment_type": "normal"
        },
        "poor_quality_scan": {
            "vendor_type": "normal",
            "items_type": "normal",
            "total_type": "round_total",
            "visual_fraud": "poor_scan_quality",
            "payment_type": "missing_payment"
        },
        "vendor_substitution": {
            "vendor_type": "vendor_substitution",
            "items_type": "normal",
            "total_type": "normal",
            "visual_fraud": None,
            "payment_type": "normal"
        },
        "timing_fraud": {
            "vendor_type": "normal",
            "items_type": "normal",
            "total_type": "excessive_tip",
            "visual_fraud": None,
            "payment_type": "normal"
        }
    }
    
    config = scenarios.get(fraud_scenario, scenarios["personal_as_business"])
    
    # Generate content
    vendor = generate_realistic_vendor_name(config["vendor_type"])
    items = generate_realistic_items(config["items_type"])
    receipt_date = generate_suspicious_timing()
    payment_method = generate_realistic_payment_method(config["payment_type"])
    
    # Calculate totals
    total_result = calculate_realistic_fraud_totals(items, config["total_type"])
    if len(total_result) == 4:
        subtotal, tax, total, tip = total_result
    else:
        subtotal, tax, total = total_result
        tip = 0
    
    # Create receipt image
    image = Image.new("L", (IMAGE_WIDTH, IMAGE_HEIGHT), color=255)
    draw = ImageDraw.Draw(image)
    font = get_realistic_font()
    
    # Draw receipt with realistic formatting
    y = 20
    
    # Header with realistic formatting
    draw.text((10, y), f"{vendor.upper()}", font=font, fill=0)
    y += 25
    
    # Address
    if random.random() < 0.8:  # Most receipts have addresses
        address = fake.address().replace('\n', ', ')
        draw.text((10, y), f"Address: {address}", font=font, fill=0)
        y += 20
    
    # Date and time
    draw.text((10, y), f"Date: {receipt_date.strftime('%m/%d/%Y %I:%M %p')}", font=font, fill=0)
    y += 25
    
    # Receipt number
    receipt_num = f"#{random.randint(1000, 9999)}"
    draw.text((10, y), f"Receipt: {receipt_num}", font=font, fill=0)
    y += 30
    
    # Separator
    draw.text((10, y), "-" * 40, font=font, fill=0)
    y += 20
    
    # Items with realistic formatting
    for item, price in items:
        # Add quantity sometimes
        if random.random() < 0.3:
            qty = random.randint(1, 3)
            draw.text((10, y), f"{qty}x {item:<20} ${price:>6.2f}", font=font, fill=0)
        else:
            draw.text((10, y), f"{item:<25} ${price:>6.2f}", font=font, fill=0)
        y += 18
    
    # Separator
    draw.text((10, y), "-" * 40, font=font, fill=0)
    y += 20
    
    # Totals with realistic formatting
    draw.text((10, y), f"Subtotal:         ${subtotal:>6.2f}", font=font, fill=0)
    y += 18
    draw.text((10, y), f"Tax:              ${tax:>6.2f}", font=font, fill=0)
    y += 18
    
    if tip > 0:
        draw.text((10, y), f"Tip:              ${tip:>6.2f}", font=font, fill=0)
        y += 18
    
    # Total line
    draw.text((10, y), "=" * 40, font=font, fill=0)
    y += 20
    draw.text((10, y), f"TOTAL:            ${total:>6.2f}", font=font, fill=0)
    y += 30
    
    # Payment method
    if payment_method:
        draw.text((10, y), f"Payment: {payment_method}", font=font, fill=0)
        y += 20
    
    # Add realistic footer elements
    if random.random() < 0.5:
        draw.text((10, y), "Thank you for your business!", font=font, fill=0)
        y += 20
    
    if random.random() < 0.3:
        draw.text((10, y), f"Cashier: {fake.first_name()}", font=font, fill=0)
    
    # Apply visual fraud
    if config["visual_fraud"]:
        image = add_sophisticated_visual_fraud(image, config["visual_fraud"])
    
    return image, {
        "fraud_scenario": fraud_scenario,
        "vendor": vendor,
        "total_amount": total,
        "subtotal": subtotal,
        "tax": tax,
        "tip": tip,
        "date": receipt_date.isoformat(),
        "payment_method": payment_method,
        "item_count": len(items),
        "items": items,
        "receipt_number": receipt_num,
        "fraud_indicators": get_fraud_indicators(fraud_scenario, vendor, items, total, receipt_date)
    }

def get_fraud_indicators(scenario, vendor, items, total, date):
    """Identify specific fraud indicators for this receipt"""
    indicators = []
    
    if scenario == "personal_as_business":
        indicators.extend(["personal_items_disguised", "suspicious_vendor"])
    
    if scenario == "inflated_prices":
        indicators.extend(["price_inflation", "unrealistic_pricing"])
    
    if scenario == "duplicate_submission":
        indicators.extend(["duplicate_items", "round_total"])
    
    if scenario == "suspicious_services":
        indicators.extend(["excessive_tip", "suspicious_services", "suspicious_payment"])
    
    if scenario == "digital_manipulation":
        indicators.extend(["tax_manipulation", "digital_artifacts"])
    
    if scenario == "poor_quality_scan":
        indicators.extend(["poor_quality", "missing_payment", "round_total"])
    
    if scenario == "vendor_substitution":
        indicators.extend(["vendor_mismatch", "wrong_vendor_type"])
    
    if scenario == "timing_fraud":
        indicators.extend(["suspicious_timing", "excessive_tip"])
    
    # Add amount-based indicators
    if total in [100.00, 150.00, 200.00, 250.00, 300.00, 500.00]:
        indicators.append("round_total")
    
    # Add timing-based indicators
    if date.weekday() >= 5:  # Weekend
        indicators.append("weekend_business")
    
    if date.day >= 28:  # Month end
        indicators.append("month_end_rush")
    
    return indicators

def generate_enhanced_fraudulent_receipts():
    """Generate sophisticated fraudulent receipts"""
    
    fraud_scenarios = [
        "personal_as_business",
        "inflated_prices", 
        "duplicate_submission",
        "suspicious_services",
        "digital_manipulation",
        "poor_quality_scan",
        "vendor_substitution",
        "timing_fraud"
    ]
    
    receipt_data = []
    
    print(f"🎭 Generating {NUM_RECEIPTS} enhanced fraudulent receipts...")
    
    for i in range(NUM_RECEIPTS):
        scenario = random.choice(fraud_scenarios)
        receipt_id = str(uuid.uuid4())
        
        # Generate receipt
        image, metadata = create_enhanced_fraudulent_receipt(scenario, receipt_id)
        
        # Save image
        filename = f"{receipt_id}.png"
        filepath = os.path.join(OUTPUT_FOLDER, filename)
        image.save(filepath)
        
        # Store metadata
        metadata["filename"] = filename
        metadata["receipt_id"] = receipt_id
        receipt_data.append(metadata)
        
        print(f"✅ Generated enhanced fraudulent receipt {i+1}/{NUM_RECEIPTS}: {scenario}")
    
    # Save metadata
    metadata_file = os.path.join(OUTPUT_FOLDER, "enhanced_fraudulent_receipts_metadata.json")
    with open(metadata_file, 'w') as f:
        json.dump(receipt_data, f, indent=2, default=str)
    
    print(f"\n🎉 Successfully generated {NUM_RECEIPTS} enhanced fraudulent receipts!")
    print(f"📁 Saved to: {OUTPUT_FOLDER}")
    print(f"📋 Metadata saved to: {metadata_file}")
    
    # Show fraud scenario breakdown
    scenario_counts = {}
    for receipt in receipt_data:
        scenario = receipt["fraud_scenario"]
        scenario_counts[scenario] = scenario_counts.get(scenario, 0) + 1
    
    print("\n📊 Enhanced fraud scenarios generated:")
    for scenario, count in scenario_counts.items():
        print(f"   - {scenario}: {count} receipts")
    
    # Show fraud indicators summary
    all_indicators = []
    for receipt in receipt_data:
        all_indicators.extend(receipt["fraud_indicators"])
    
    indicator_counts = {}
    for indicator in all_indicators:
        indicator_counts[indicator] = indicator_counts.get(indicator, 0) + 1
    
    print("\n🔍 Fraud indicators included:")
    for indicator, count in sorted(indicator_counts.items()):
        print(f"   - {indicator}: {count} occurrences")
    
    return receipt_data

if __name__ == "__main__":
    generate_enhanced_fraudulent_receipts()
