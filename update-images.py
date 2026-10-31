"""Run after adding pictures to images/: python3 update-images.py"""
from pathlib import Path
root = Path(__file__).resolve().parent
images = sorted(p.relative_to(root).as_posix() for p in (root / 'images').rglob('*') if p.is_file() and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'})
(root / 'images.txt').write_text('# Generated image list; one path per line.\n' + '\n'.join(images) + '\n', encoding='utf-8')
print(f'Wrote {len(images)} image paths to images.txt.')
