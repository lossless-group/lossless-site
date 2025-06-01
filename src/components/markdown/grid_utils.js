import yaml from 'js-yaml';
import { extname, resolve } from 'path';
import sharp from 'sharp';

const getFilenameWithoutExtension = (filepath) => {
  const parts = filepath.replaceAll("\\", "/").split('/');
  const filename = parts.pop();
  const dot = filename.lastIndexOf('.');
  return dot <= 0 ? filename : filename.slice(0, dot);
};

const resolveAbsoluteSrcPath = (relativeSrcPath) => {
  return resolve('public', '.' + relativeSrcPath); // path to actual image on disk
};

export async function yaml_to_grid_images(code, dirpath) {
  const entries = yaml.load(code);
  if (!Array.isArray(entries)) {
    throw new Error('Expected a YAML array of image paths.');
  }

  const result = [];

  for (const src of entries) {
    if (typeof src !== 'string') continue;

    const isRemote = /^https?:\/\//.test(src);
    const name = getFilenameWithoutExtension(src);
    const ext = extname(src).toLowerCase();

    if (isRemote) {
      result.push({
        url: src,
        name,
        ext,
        width: undefined,
        height: undefined,
        ratio: undefined
      });
      continue;
    }

    const absPath = resolveAbsoluteSrcPath(src, dirpath);
    console.log(`[grid_utils] Processing local image: ${absPath}`);

    try {
      const metadata = await sharp(absPath).metadata();
      let { width, height, orientation } = metadata;

      if (orientation >= 5 && orientation <= 8) {
        [width, height] = [height, width];
      }

      result.push({
        url: src,
        name,
        ext,
        width,
        height,
        ratio: width / height
      });
    } catch (err) {
      console.error(`[grid_utils] Error processing ${absPath}:`, err.message);
    }
  }

  return result;
}


export function select_masonry(images) {
  const wideCount = images.filter(img => img.ratio >= 1).length;
  return wideCount > images.length / 2;
}
