from PIL import Image

img = Image.open("images/musicpane-logo.png").convert("RGBA")
datas = img.getdata()

newData = []
for item in datas:
    r, g, b, a = item
    # Calculate luminance/brightness
    brightness = (r * 0.299 + g * 0.587 + b * 0.114)
    
    # Threshold dark background to transparent
    if brightness < 28:
        newData.append((0, 0, 0, 0))
    elif brightness < 65:
        # Smooth alpha transition
        alpha = int(((brightness - 28) / 37.0) * 255)
        newData.append((r, g, b, alpha))
    else:
        newData.append((r, g, b, 255))

img.putdata(newData)
img.save("images/musicpane-logo-clean.png", "PNG")
print("Transparent logo saved to images/musicpane-logo-clean.png")
