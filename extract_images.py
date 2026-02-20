
import os

pdf_path = '/home/maydan/sub/frontend/src/pages/ShuBeauty/ShuBeauty Spring Maze (1).pdf'
output_dir = '/home/maydan/.gemini/antigravity/brain/7cf40820-4190-42de-ba47-ba2aec52189b/'

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
    
    with open(os.path.join(output_dir, f'extracted_image_{count}.png'), 'wb') as img_f:
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
    
    with open(os.path.join(output_dir, f'extracted_image_jpg_{count}.jpg'), 'wb') as img_f:
        img_f.write(content[start:end])
    count += 1
    start_index = end + 1

print(f"Extracted {count} potential images.")
