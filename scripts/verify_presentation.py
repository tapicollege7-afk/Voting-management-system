import pymupdf

doc = pymupdf.open('docs/VotePulse_Seminar_Presentation.pdf')
print(f'Total pages in PDF: {len(doc)}')

for i in range(len(doc)):
    page = doc[i]
    lines = [l.strip() for l in page.get_text().split('\n') if l.strip()]
    header = lines[0] if lines else '[ORIGINAL SOURCE COVER PAGE - VECTOR & RASTER]'
    sub = lines[1] if len(lines) > 1 else ''
    print(f'Slide {i+1:2d} (w={page.rect.width:.0f}, h={page.rect.height:.0f}): {header} | {sub}')
