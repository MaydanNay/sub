
import re
import zlib

def extract_pdf_info(pdf_path):
    with open(pdf_path, 'rb') as f:
        data = f.read()

    # Find FlateDecode streams
    stream_pattern = re.compile(b'stream\r?\n(.*?)\r?\nendstream', re.DOTALL)
    streams = stream_pattern.findall(data)
    
    text_content = []
    for stream in streams:
        try:
            decompressed = zlib.decompress(stream)
            # Look for readable text in the decompressed stream - PDF text is often in Tj or TJ operators
            # Tj: (text) Tj
            # TJ: [(text) 123 (text)] TJ
            text_matches = re.findall(b'[(](.*?)[)]', decompressed)
            for m in text_matches:
                try:
                    decoded = m.decode('utf-8')
                    if len(decoded) > 2: # Filter out short noise
                        text_content.append(decoded)
                except:
                    pass
        except:
            continue
            
    return text_content

texts = extract_pdf_info('/home/maydan/sub/frontend/src/pages/ShuBank/ShuBank Tushkan.pdf')

print("Extracted Text Content:")
for t in texts:
    print(t)
