from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('public/icons', exist_ok=True)

for size in [192, 512]:
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255)) # Dark slate background
    draw = ImageDraw.Draw(img)
    
    # Draw rounded rectangle border or accent
    padding = size // 10
    draw.rounded_rectangle([padding, padding, size - padding, size - padding], radius=size//8, fill=(30, 58, 138, 255), outline=(245, 158, 11, 255), width=size//32)
    
    # Roof triangle
    center_x = size // 2
    top_y = size // 3
    base_y = size // 2
    left_x = size // 4
    right_x = size * 3 // 4
    draw.polygon([(center_x, top_y), (left_x, base_y), (right_x, base_y)], fill=(245, 158, 11, 255))
    
    # House body
    body_bottom = size * 3 // 4
    draw.rectangle([left_x + size//20, base_y, right_x - size//20, body_bottom], fill=(241, 245, 249, 255))
    
    # Door
    door_w = size // 8
    door_h = size // 6
    draw.rectangle([center_x - door_w//2, body_bottom - door_h, center_x + door_w//2, body_bottom], fill=(15, 23, 42, 255))
    
    # Windows
    win_s = size // 12
    draw.rectangle([left_x + size//10, base_y + size//16, left_x + size//10 + win_s, base_y + size//16 + win_s], fill=(56, 189, 248, 255))
    draw.rectangle([right_x - size//10 - win_s, base_y + size//16, right_x - size//10, base_y + size//16 + win_s], fill=(56, 189, 248, 255))

    img.save(f'public/icons/icon-{size}.png', 'PNG')

print("Icons generated successfully!")
