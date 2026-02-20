
import re
import zlib

def extract_pdf_info(pdf_path):
    with open(pdf_path, 'rb') as f:
        data = f.read()

    # Find hex codes like #FFFFFF or #FFF
    hex_pattern = re.compile(b'#[0-9a-fA-F]{3,6}')
    hex_matches = hex_pattern.findall(data)
    
    # Find FlateDecode streams
    stream_pattern = re.compile(b'stream\r?\n(.*?)\r?\nendstream', re.DOTALL)
    streams = stream_pattern.findall(data)
    
    text_content = []
    for stream in streams:
        try:
            decompressed = zlib.decompress(stream)
            # Look for readable text in the decompressed stream
            text_matches = re.findall(b'[(](.*?)[)]', decompressed)
            for m in text_matches:
                try:
                    text_content.append(m.decode('utf-8'))
                except:
                    pass
        except:
            continue
            
    return set(hex_matches), text_content

hex_codes, texts = extract_pdf_info('/home/maydan/sub/frontend/src/pages/ShuBeauty/ShuBeauty Spring Maze (1).pdf')

print("Potential Hex Codes:", [h.decode() for h in hex_codes])
print("Extracted Text Snippets:", texts[:50])
