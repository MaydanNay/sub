import os
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM
from PIL import Image
import io

def convert_svg_to_ico(input_path, output_path):
    # Проверка пути
    if not os.path.exists(input_path):
        print(f"❌ Файл не найден: {input_path}")
        return

    print(f"⚙️  Начинаю конвертацию: {input_path}")

    try:
        # 1. Читаем SVG файл с помощью svglib
        drawing = svg2rlg(input_path)
        
        # 2. Конвертируем вектор в PNG (в байтовый поток в памяти)
        png_data = io.BytesIO()
        # DPI=300 делает картинку большой и качественной перед уменьшением
        renderPM.drawToFile(drawing, png_data, fmt="PNG", dpi=300)
        
        # 3. Открываем картинку в Pillow
        img = Image.open(png_data)
        
        # 4. Сохраняем как ICO (со всеми нужными размерами для веба)
        icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        img.save(output_path, format='ICO', sizes=icon_sizes)
        
        print(f"✅ Готово! Иконка создана: {output_path}")

    except Exception as e:
        print(f"❌ Ошибка: {e}")

# --- Пути ---
# Путь к твоему файлу (с пробелом в названии)
input_svg = r"frontend\public\icon-192 1.svg"
output_ico = r"frontend\public\favicon.ico"

# Запуск
convert_svg_to_ico(input_svg, output_ico)