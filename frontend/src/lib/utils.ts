import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import TileLayer from 'ol/layer/Tile';
import { TileArcGISRest } from 'ol/source';

const createTileLayerFromUrl = (url: string) => {
  return new TileLayer({
    source: new TileArcGISRest({
      url: url
    })
  });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export {createTileLayerFromUrl};
