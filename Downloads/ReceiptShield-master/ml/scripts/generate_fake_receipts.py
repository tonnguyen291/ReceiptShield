import os
import random
from PIL import Image, ImageDraw, ImageFont
from faker import Faker

fake = Faker()

# Load a basic monospace font
FONT_PATH = "arial.ttf"  # Replace with a monospace font path if needed
IMAGE_WIDTH = 400
IMAGE_HEIGHT = 600
OUTPUT_FOLDER = "fake_receipts"
NUM_RECEIPTS = 100  # Generate 100 receipts

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def generate_items():
    items = []
    for _ in range(random.randint(3, 7)):
        item_name = fake.word().capitalize()
        price = round(random.uniform(1, 100), 2)

        # Inject fraud: price doesn't match the item type
        if random.random() < 0.3:
            price *= random.randint(2, 4)

        items.append((item_name, price))
    return items

def calculate_total(items):
    subtotal = sum(price for _, price in items)
    tax = round(subtotal * 0.08, 2)
    total = subtotal + tax

    # Fraud case: mismatch total
    if random.random() < 0.4:
        total += random.choice([-2.5, 3.99, 5.0])

    return round(subtotal, 2), round(tax, 2), round(total, 2)

def draw_receipt(filename):
    image = Image.new("L", (IMAGE_WIDTH, IMAGE_HEIGHT), color=255)
    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype(FONT_PATH, size=16)
    except IOError:
        font = ImageFont.load_default()

    y = 20
    draw.text((10, y), f"Store: {fake.company()}", font=font, fill=0); y += 25
    draw.text((10, y), f"Address: {fake.address().replace('\n', ', ')}", font=font, fill=0); y += 25
    draw.text((10, y), f"Date: {fake.date_time_this_year()}", font=font, fill=0); y += 30

    draw.text((10, y), "-" * 40, font=font, fill=0); y += 20

    items = generate_items()
    for item, price in items:
        draw.text((10, y), f"{item:<20} ${price:>6.2f}", font=font, fill=0)
        y += 20

    draw.text((10, y), "-" * 40, font=font, fill=0); y += 20

    subtotal, tax, total = calculate_total(items)
    draw.text((10, y), f"Subtotal:         ${subtotal:>6.2f}", font=font, fill=0); y += 20
    draw.text((10, y), f"Tax (8%):         ${tax:>6.2f}", font=font, fill=0); y += 20
    draw.text((10, y), f"TOTAL:            ${total:>6.2f}", font=font, fill=0); y += 30

    if random.random() < 0.3:
        # Fraud indicator: smudged signature / barcode
        draw.rectangle([(50, y), (300, y + 10)], fill=0); y += 15

    draw.text((10, y), "Thank you for shopping!", font=font, fill=0)

    image.save(os.path.join(OUTPUT_FOLDER, filename))

# Generate receipts
for i in range(NUM_RECEIPTS):
    filename = f"fake_receipt_{i+1}.jpg"
    draw_receipt(filename)

print(f"Generated {NUM_RECEIPTS} fake receipts in '{OUTPUT_FOLDER}/'")
