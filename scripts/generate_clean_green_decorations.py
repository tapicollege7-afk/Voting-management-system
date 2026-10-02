import pymupdf

doc = pymupdf.open('docs/MinorProject_PPT.pdf')
p1 = doc[0]
drawings = p1.get_drawings()

# Create a clean page with 960x540
new_doc = pymupdf.open()
new_page = new_doc.new_page(width=960, height=540)
shape = new_page.new_shape()

# Drawings 1 to 9: Right green facets and construction lines
# Drawing 10: Bottom-left accent
for i in list(range(1, 10)) + [10]:
    d = drawings[i]
    for item in d['items']:
        op = item[0]
        if op == 'l':
            shape.draw_line(item[1], item[2])
        elif op == 'c':
            shape.draw_bezier(item[1], item[2], item[3], item[4])
        elif op == 're':
            shape.draw_rect(item[1])
        elif op == 'qu':
            shape.draw_quad(item[1])
    
    kwargs = {}
    if d.get('fill'):
        kwargs['fill'] = d['fill']
    if d.get('color'):
        kwargs['color'] = d['color']
    if 'width' in d and d['width'] is not None:
        kwargs['width'] = d['width']
    if 'lineCap' in d and d['lineCap'] is not None:
        kwargs['lineCap'] = d['lineCap']
    if 'lineJoin' in d and d['lineJoin'] is not None:
        kwargs['lineJoin'] = d['lineJoin']
    if 'dashes' in d and d['dashes'] is not None:
        kwargs['dashes'] = d['dashes']
    if 'even_odd' in d and d['even_odd'] is not None:
        kwargs['even_odd'] = d['even_odd']

    shape.finish(**kwargs)

shape.commit()

# Render at 4x scale (3840 x 2160) with transparent background
pix = new_page.get_pixmap(dpi=288, alpha=True)
output_path = 'docs/slide1_green_theme_clean.png'
pix.save(output_path)
print(f"Saved {output_path}: {pix.width}x{pix.height}, alpha={pix.alpha}")
