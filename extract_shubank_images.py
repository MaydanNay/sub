
import os

pdf_path = '/home/maydan/sub/frontend/src/pages/ShuBank/ShuBank Tushkan.pdf'
output_dir = '/home/maydan/.gemini/antigravity/brain/0de9117f-f123-4101-b844-d573aa3c7779/'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(pdf_path, 'rb') as f:
    content = f.read()

# Search for PNGs
start_index = 0
count = 0
while True:
    start = content.find(b'\x89PNG', start_index)
    if start == -1: break
    end = content.find(b'IEND', start)
    if end == -1: break
    end += 8 # Including IEND and CRC
    
    with open(os.path.join(output_dir, f'shubank_extracted_{count}.png'), 'wb') as img_f:
        img_f.write(content[start:end])
    count += 1
    start_index = end + 1

# Search for JPGs
start_index = 0
while True:
    start = content.find(b'\xff\xd8\xff', start_index)
    if start == -1: break
    end = content.find(b'\xff\xd9', start)
    if end == -1: break
    end += 2
    
    with open(os.path.join(output_dir, f'shubank_extracted_jpg_{count}.jpg'), 'wb') as img_f:
        img_f.write(content[start:end])
    count += 1
    start_index = end + 1

print(f"Extracted {count} potential images.")
