from PIL import Image

img = Image.open("images/musicpane-logo.png")
width, height = img.size

# Crop the right logo portion
# The right logo occupies the right 52% of the image width
left_x = int(width * 0.47)
cropped = img.crop((left_x, 0, width, height))

# Save back over musicpane-logo.png
cropped.save("images/musicpane-logo.png")
print(f"Original size: {width}x{height}, Cropped right logo size: {cropped.size}")
