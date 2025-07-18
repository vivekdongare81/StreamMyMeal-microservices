import os
import random
import shutil
import re

# Use absolute path for SQL file
SQL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../db/migration/V2__seed_data.sql'))
IMG_DIR = os.path.abspath(os.path.dirname(__file__))

print(f"SQL_PATH: {SQL_PATH}")
print(f"IMG_DIR: {IMG_DIR}")

# Read SQL file and extract all .jpg image filenames from menu_items section only
with open(SQL_PATH) as f:
    lines = f.readlines()

# Find the start of the menu_items insert
start = None
for i, line in enumerate(lines):
    if 'INSERT INTO menu_items' in line:
        start = i
        break

if start is not None:
    menu_lines = lines[start:]
    data = ''.join(menu_lines)
    imgs = re.findall(r"'([^']+\.jpg)'", data)
else:
    imgs = []

print(f"Extracted menu item images: {imgs}")

existing = set(os.listdir(IMG_DIR))
actual_imgs = [f for f in existing if f.endswith('.jpg')]
print(f"Actual images in folder: {actual_imgs}")

pool = [f for f in actual_imgs]
missing = [img for img in imgs if img not in existing]

print(f"Missing images: {missing}")

if not pool:
    print('No source images found in menu folder!')
    exit(1)

for img in missing:
    src = os.path.join(IMG_DIR, random.choice(pool))
    dst = os.path.join(IMG_DIR, img)
    shutil.copyfile(src, dst)
    print(f'Created {img} from {os.path.basename(src)}')

print('Done!') 