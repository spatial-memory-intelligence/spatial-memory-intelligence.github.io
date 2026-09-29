"""Build decorative SMI mosaics from the gallery's existing, approved footage.

Requires ffmpeg on PATH. Does not modify comparison videos or the manifest.
"""
import concurrent.futures
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'hero'
CASES = [
    'hy15-62003', 'hy15-69006', 'hy15-52', 'hy15-69002',
    'wan22-60083', 'hy15-64004', 'hy15-61002', 'wan22-60016',
    'hy15-11', 'wan22-60024', 'hy15-62002', 'wan22-33',
    'hy15-108', 'hy15-62001', 'wan22-91', 'wan22-60065',
]
START, DURATION, FPS, GAP = 0, 8, 24, 0


def build(name, columns, cell_width, cell_height, gallery):
    args = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']
    filters, layout, provenance = [], [], []
    for i, case_id in enumerate(CASES):
        case = gallery[case_id]
        source = ROOT / ('assets/videos/' + case['methods']['SMI'].split('/assets/videos/')[1])
        if not source.is_file():
            raise FileNotFoundError(source)
        args += ['-threads', '1', '-ss', str(START), '-t', str(DURATION), '-i', str(source)]
        filters.append(
            f'[{i}:v]setpts=PTS-STARTPTS,fps={FPS},'
            f'scale={cell_width}:{cell_height}:force_original_aspect_ratio=increase,'
            f'crop={cell_width}:{cell_height},setsar=1[v{i}]'
        )
        layout.append(f'{(i % columns)*(cell_width+GAP)}_{(i // columns)*(cell_height+GAP)}')
        provenance.append({'case': case_id, 'method': 'SMI', 'source': source.relative_to(ROOT).as_posix(), 'start': START, 'end': START+DURATION})
    inputs = ''.join(f'[v{i}]' for i in range(len(CASES)))
    filters.append(f'{inputs}xstack=inputs={len(CASES)}:layout={"|".join(layout)}:fill=0x0b1412:shortest=1[out]')
    target = OUT / f'{name}.mp4'
    args += ['-filter_complex_threads', '2', '-filter_complex', ';'.join(filters), '-map', '[out]',
             '-t', str(DURATION), '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
             '-threads', '6', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(target)]
    subprocess.run(args, check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(target),
                    '-frames:v', '1', '-q:v', '4', str(OUT / f'{name}.jpg')], check=True)
    return {'file': target.relative_to(ROOT).as_posix(), 'columns': columns, 'rows': len(CASES)//columns,
            'duration': DURATION, 'fps': FPS, 'gap': GAP, 'bytes': target.stat().st_size, 'tiles': provenance}


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    gallery = {c['id']: c for c in json.loads((ROOT/'demo-data.json').read_text(encoding='utf-8'))}
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        jobs = [pool.submit(build, 'wall-desktop', 4, 640, 360, gallery),
                pool.submit(build, 'wall-mobile', 2, 384, 172, gallery)]
        manifest = [job.result() for job in jobs]
    (OUT/'sources.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
    print(json.dumps([{k:v for k,v in item.items() if k != 'tiles'} for item in manifest], indent=2))
