import os
import random
import uuid
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
from faker import Faker

fake = Faker()

# Configuration
IMAGE_WIDTH = 400
IMAGE_HEIGHT = 600
OUTPUT_FOLDER = "receipts/new_fake_receipts"
NUM_RECEIPTS = 20

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def get_random_font():
    """Try to load different fonts for variation"""
    fonts = ["arial.ttf", "times.ttf", "calibri.ttf", "Georgia.ttf"]
    for font_name in fonts:
        try:
            return ImageFont.truetype(font_name, size=random.randint(12, 18))
        except IOError:
            continue
    return ImageFont.load_default()

def generate_fraudulent_vendor_name(fraud_type):
    """Generate suspicious vendor names based on fraud type"""
    if fraud_type == "gibberish":
        # Vendor names with suspicious characters
        return random.choice([
            "QuickMart123!!!",
            "St0re@#$%",
            "AAAAAAA Market",
            "xyz123store",
            "!@#$%^Store",
            "MarketPlace2024!!!",
            "Store_Name_Here",
            "TESTVENDOR123"
        ])
    elif fraud_type == "suspicious":
        # Overly generic or suspicious names
        return random.choice([
            "General Store",
            "Store",
            "Market",
            "Shop Here",
            "Food Place",
            "Buy Stuff",
            "Items Store",
            "Business Expenses Inc"
        ])
    else:
        return fake.company()

def generate_fraudulent_items(fraud_scenario):
    """Generate items based on fraud scenario"""
    items = []
    
    if fraud_scenario == "high_personal_expense":
        # Personal items disguised as business
        personal_items = [
            ("Gaming Laptop", 1299.99),
            ("Designer Shoes", 450.00),
            ("Expensive Wine", 189.99),
            ("Jewelry Set", 789.00),
            ("Luxury Watch", 2499.99),
            ("Personal Massage", 150.00),
            ("Spa Treatment", 300.00)
        ]
        return [random.choice(personal_items)]
    
    elif fraud_scenario == "price_inflation":
        # Normal items with inflated prices
        base_items = [
            ("Coffee", 8.99),  # Should be ~$3
            ("Sandwich", 25.99),  # Should be ~$8
            ("Water Bottle", 12.99),  # Should be ~$2
            ("Pen", 45.00),  # Should be ~$2
            ("Notepad", 35.99),  # Should be ~$5
        ]
        return random.sample(base_items, random.randint(2, 4))
    
    elif fraud_scenario == "inconsistent_items":
        # Items that don't make sense together or for amounts
        weird_items = [
            ("Paperclip", 99.99),
            ("Single Grape", 150.00),
            ("Air", 45.00),
            ("Consultation Fee", 999.99),
            ("Processing Fee", 250.00),
            ("Service Charge", 300.00)
        ]
        return random.sample(weird_items, random.randint(1, 3))
    
    else:
        # Normal-looking items
        normal_items = [
            ("Office Supplies", random.uniform(15, 85)),
            ("Business Lunch", random.uniform(25, 120)),
            ("Travel Expense", random.uniform(50, 200)),
            ("Meeting Snacks", random.uniform(10, 45)),
            ("Printing", random.uniform(5, 35))
        ]
        return random.sample(normal_items, random.randint(2, 5))

def calculate_fraudulent_total(items, fraud_type):
    """Calculate totals with various fraud patterns"""
    subtotal = sum(price for _, price in items)
    tax = round(subtotal * 0.08, 2)
    expected_total = subtotal + tax
    
    if fraud_type == "total_mismatch":
        # Obvious total calculation errors
        total = expected_total + random.choice([-50.0, 25.99, 100.0, -15.75])
        return round(subtotal, 2), round(tax, 2), round(total, 2)
    
    elif fraud_type == "round_numbers":
        # Suspiciously round numbers (common in fake receipts)
        total = random.choice([100.00, 150.00, 200.00, 250.00, 300.00, 500.00])
        tax = round(total * 0.08 / 1.08, 2)
        subtotal = total - tax
        return round(subtotal, 2), round(tax, 2), round(total, 2)
    
    elif fraud_type == "excessive_tip":
        # Suspicious tip patterns
        tip_ratio = random.choice([0.45, 0.60, 0.80, 1.0])  # 45-100% tip
        tip = round(expected_total * tip_ratio, 2)
        total = expected_total + tip
        return round(subtotal, 2), round(tax, 2), round(total, 2), round(tip, 2)
    
    else:
        return round(subtotal, 2), round(tax, 2), round(expected_total, 2)

def generate_suspicious_date():
    """Generate dates that might trigger fraud flags"""
    now = datetime.now()
    
    # Choose fraud pattern
    pattern = random.choice(["weekend", "month_end", "holiday", "late_night", "duplicate_day"])
    
    if pattern == "weekend":
        # Weekend submissions (higher fraud risk)
        base_date = now - timedelta(days=random.randint(1, 30))
        # Force to weekend
        days_ahead = 5 - base_date.weekday()  # Saturday
        if days_ahead <= 0:
            days_ahead += 7
        return base_date + timedelta(days=days_ahead)
    
    elif pattern == "month_end":
        # Month-end submissions (expense report deadlines)
        return now.replace(day=random.choice([28, 29, 30, 31]))
    
    elif pattern == "late_night":
        # Unusual hours
        base_date = now - timedelta(days=random.randint(1, 15))
        return base_date.replace(hour=random.choice([2, 3, 4, 23]), minute=random.randint(0, 59))
    
    else:
        return fake.date_time_this_year()

def add_visual_fraud_indicators(image, fraud_type):
    """Add visual elements that suggest fraud"""
    if fraud_type == "poor_quality":
        # Add blur and noise
        image = image.filter(ImageFilter.GaussianBlur(radius=1.5))
        
        # Add noise
        img_array = np.array(image)
        noise = np.random.randint(0, 50, img_array.shape, dtype=np.uint8)
        img_array = np.clip(img_array.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        image = Image.fromarray(img_array)
    
    elif fraud_type == "editing_artifacts":
        # Add suspicious rectangles/editing marks
        draw = ImageDraw.Draw(image)
        
        # Random white rectangles (like whited-out text)
        for _ in range(random.randint(1, 3)):
            x1 = random.randint(10, IMAGE_WIDTH - 100)
            y1 = random.randint(100, IMAGE_HEIGHT - 100)
            x2 = x1 + random.randint(30, 80)
            y2 = y1 + random.randint(10, 25)
            draw.rectangle([(x1, y1), (x2, y2)], fill=255, outline=200)
    
    elif fraud_type == "inconsistent_formatting":
        # This is handled in the text rendering
        pass
    
    return image

def generate_payment_method_fraud():
    """Generate suspicious payment methods"""
    return random.choice([
        "",  # Missing payment method
        "CASH ONLY",
        "Personal Card",
        "Gift Card",
        "Store Credit",
        "Comp",
        "Employee Discount",
        "Unknown"
    ])

def create_fraudulent_receipt(fraud_scenario, receipt_id):
    """Create a fraudulent receipt based on specific fraud scenario"""
    
    # Create base image
    image = Image.new("L", (IMAGE_WIDTH, IMAGE_HEIGHT), color=255)
    draw = ImageDraw.Draw(image)
    
    # Fraud-specific configurations
    scenarios = {
        "total_mismatch": {
            "vendor_type": "normal",
            "items_type": "normal", 
            "total_type": "total_mismatch",
            "visual_fraud": None
        },
        "gibberish_vendor": {
            "vendor_type": "gibberish",
            "items_type": "normal",
            "total_type": "normal",
            "visual_fraud": None
        },
        "high_personal_expense": {
            "vendor_type": "suspicious",
            "items_type": "high_personal_expense",
            "total_type": "normal",
            "visual_fraud": None
        },
        "price_inflation": {
            "vendor_type": "normal",
            "items_type": "price_inflation",
            "total_type": "normal", 
            "visual_fraud": None
        },
        "round_numbers": {
            "vendor_type": "normal",
            "items_type": "normal",
            "total_type": "round_numbers",
            "visual_fraud": None
        },
        "excessive_tip": {
            "vendor_type": "normal",
            "items_type": "normal",
            "total_type": "excessive_tip",
            "visual_fraud": None
        },
        "poor_quality": {
            "vendor_type": "normal",
            "items_type": "normal",
            "total_type": "normal",
            "visual_fraud": "poor_quality"
        },
        "editing_artifacts": {
            "vendor_type": "normal",
            "items_type": "normal",
            "total_type": "normal",
            "visual_fraud": "editing_artifacts"
        }
    }
    
    config = scenarios.get(fraud_scenario, scenarios["total_mismatch"])
    
    # Generate content based on fraud type
    vendor = generate_fraudulent_vendor_name(config["vendor_type"])
    items = generate_fraudulent_items(config["items_type"])
    receipt_date = generate_suspicious_date()
    payment_method = generate_payment_method_fraud()
    
    # Calculate totals with fraud
    total_result = calculate_fraudulent_total(items, config["total_type"])
    if len(total_result) == 4:
        subtotal, tax, total, tip = total_result
    else:
        subtotal, tax, total = total_result
        tip = 0
    
    # Font selection (inconsistent fonts for some fraud types)
    if config["visual_fraud"] == "inconsistent_formatting":
        fonts = [get_random_font() for _ in range(3)]
    else:
        font = get_random_font()
        fonts = [font] * 3
    
    # Draw receipt content
    y = 20
    
    # Header
    draw.text((10, y), f"Store: {vendor}", font=fonts[0], fill=0)
    y += 25
    
    # Address (sometimes fake/incomplete)
    if random.random() < 0.3:
        address = "123 Main St"  # Suspicious generic address
    else:
        address = fake.address().replace('\n', ', ')
    draw.text((10, y), f"Address: {address}", font=fonts[0], fill=0)
    y += 25
    
    # Date
    draw.text((10, y), f"Date: {receipt_date.strftime('%Y-%m-%d %H:%M:%S')}", font=fonts[0], fill=0)
    y += 30
    
    # Separator
    draw.text((10, y), "-" * 40, font=fonts[1], fill=0)
    y += 20
    
    # Items
    for item, price in items:
        draw.text((10, y), f"{item:<20} ${price:>6.2f}", font=fonts[1], fill=0)
        y += 20
    
    # Separator
    draw.text((10, y), "-" * 40, font=fonts[1], fill=0)
    y += 20
    
    # Totals
    draw.text((10, y), f"Subtotal:         ${subtotal:>6.2f}", font=fonts[2], fill=0)
    y += 20
    draw.text((10, y), f"Tax (8%):         ${tax:>6.2f}", font=fonts[2], fill=0)
    y += 20
    
    if tip > 0:
        draw.text((10, y), f"Tip:              ${tip:>6.2f}", font=fonts[2], fill=0)
        y += 20
    
    draw.text((10, y), f"TOTAL:            ${total:>6.2f}", font=fonts[2], fill=0)
    y += 30
    
    # Payment method
    if payment_method:
        draw.text((10, y), f"Payment: {payment_method}", font=fonts[2], fill=0)
        y += 20
    
    # Sometimes add suspicious elements
    if random.random() < 0.2:
        draw.text((10, y), "VOID - REPRINT", font=fonts[2], fill=0)
        y += 15
    
    # Footer
    draw.text((10, y + 10), "Thank you for your business!", font=fonts[2], fill=0)
    
    # Apply visual fraud indicators
    if config["visual_fraud"]:
        image = add_visual_fraud_indicators(image, config["visual_fraud"])
    
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
        "items": items
    }

def generate_fraudulent_receipts():
    """Generate various types of fraudulent receipts"""
    
    fraud_scenarios = [
        "total_mismatch",
        "gibberish_vendor", 
        "high_personal_expense",
        "price_inflation",
        "round_numbers",
        "excessive_tip",
        "poor_quality",
        "editing_artifacts"
    ]
    
    receipt_data = []
    
    print(f"🎭 Generating {NUM_RECEIPTS} fraudulent receipts...")
    
    for i in range(NUM_RECEIPTS):
        # Choose fraud scenario (with some variety)
        scenario = random.choice(fraud_scenarios)
        receipt_id = str(uuid.uuid4())
        
        # Generate receipt
        image, metadata = create_fraudulent_receipt(scenario, receipt_id)
        
        # Save image
        filename = f"{receipt_id}.png"
        filepath = os.path.join(OUTPUT_FOLDER, filename)
        image.save(filepath)
        
        # Store metadata
        metadata["filename"] = filename
        metadata["receipt_id"] = receipt_id
        receipt_data.append(metadata)
        
        print(f"✅ Generated fraudulent receipt {i+1}/{NUM_RECEIPTS}: {scenario}")
    
    # Save metadata for analysis
    import json
    metadata_file = os.path.join(OUTPUT_FOLDER, "fraudulent_receipts_metadata.json")
    with open(metadata_file, 'w') as f:
        json.dump(receipt_data, f, indent=2, default=str)
    
    print(f"\n🎉 Successfully generated {NUM_RECEIPTS} fraudulent receipts!")
    print(f"📁 Saved to: {OUTPUT_FOLDER}")
    print(f"📋 Metadata saved to: {metadata_file}")
    print("\n📊 Fraud scenarios generated:")
    
    scenario_counts = {}
    for receipt in receipt_data:
        scenario = receipt["fraud_scenario"]
        scenario_counts[scenario] = scenario_counts.get(scenario, 0) + 1
    
    for scenario, count in scenario_counts.items():
        print(f"   - {scenario}: {count} receipts")
    
    return receipt_data

if __name__ == "__main__":
    generate_fraudulent_receipts() 