import { useEffect } from 'react';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import TileLayer from 'ol/layer/Tile';
import { TileArcGISRest } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';

type UseDraggableProps = {
  elementId: string;
};

const formatDateBE = (date: string) => {
    return new Date(date).toLocaleDateString('fr-BE', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
}

const createTileLayerFromUrl = (url: string) => {
  return new TileLayer({
    source: new TileArcGISRest({
      url: url
    })
  });
}

const createEmptyVectorLayerForDrawing = (vectorSource: VectorSource): VectorLayer<any> => {
  return new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.05)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 255, 1)',
        width: 2,
      }),
    }),
  });
}

const createCircleWkt = (center: number[], angularRadiusInDegrees: number, numPoints: number = 32) => {
  const earthRadius = 6371000; // Earth's radius in meters
  const latitudeRadians = center[1] * Math.PI / 180;
  // Convert angular radius in degrees to meters; 1 degree of latitude is approximately 111 km
  const angularRadiusInMeters = angularRadiusInDegrees * 111000; // Rough approximation
  const coordinates = [];
  const angleStep = (Math.PI * 2) / numPoints;

  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    // Approximate conversion of radius from meters to degrees
    const dx = angularRadiusInMeters * Math.cos(angle);
    const dy = angularRadiusInMeters * Math.sin(angle);
    // Convert offsets in meters back to degrees for latitude and longitude
    const deltaLongitude = dx / (earthRadius * Math.cos(latitudeRadians)) * (180 / Math.PI);
    const deltaLatitude = dy / earthRadius * (180 / Math.PI);
    const longitude = center[0] + deltaLongitude;
    const latitude = center[1] + deltaLatitude;
    coordinates.push([longitude.toFixed(6), latitude.toFixed(6)]);
  }

  // Close the polygon by repeating the first coordinate
  coordinates.push(coordinates[0]);

  // Convert coordinates to WKT
  const wkt = "POLYGON((" + coordinates.map(coord => coord.join(" ")).join(", ") + "))";
  return wkt;
};


const useDraggable = (elementId: string, dragHandleId: string) => {
  useEffect(() => {
    const draggableElement = document.getElementById(elementId);
    const dragHandle = document.getElementById(dragHandleId);

    if (!draggableElement || !dragHandle) return;

    let active = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e: MouseEvent | TouchEvent) => {
      // Check if the target is the dragHandle or if the dragHandle is the same as draggableElement
      if (dragHandle !== e.target && !dragHandle.contains(e.target as Node) && dragHandleId !== elementId) return;

      initialX = 'touches' in e ? e.touches[0].clientX - xOffset : e.clientX - xOffset;
      initialY = 'touches' in e ? e.touches[0].clientY - yOffset : e.clientY - yOffset;
      active = true;

      // Optional: Prevent default action if it's a touch event to prevent scrolling
      if ('touches' in e) {
        e.preventDefault();
      }
    };

    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;
      active = false;
    };

    const drag = (e: MouseEvent | TouchEvent) => {
      if (!active) return;

      currentX = 'touches' in e ? e.touches[0].clientX - initialX : e.clientX - initialX;
      currentY = 'touches' in e ? e.touches[0].clientY - initialY : e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;
      setTranslate(currentX, currentY, draggableElement);
    };

    const setTranslate = (xPos: number, yPos: number, el: HTMLElement) => {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    };

    // Attach the event listener based on the provided dragHandleId
    draggableElement.addEventListener("mousedown", dragStart, false);
    draggableElement.addEventListener("touchstart", dragStart, { passive: false });

    // Move and dragEnd events should be on the whole window to ensure smooth dragging and proper end of drag
    window.addEventListener("mousemove", drag, { passive: false });
    window.addEventListener("touchmove", drag, { passive: false });
    window.addEventListener("mouseup", dragEnd, { passive: true });
    window.addEventListener("touchend", dragEnd, { passive: true });

    return () => {
      draggableElement.removeEventListener("mousedown", dragStart, false);
      draggableElement.removeEventListener("touchstart", dragStart, false);
      window.removeEventListener("mousemove", drag, false);
      window.removeEventListener("touchmove", drag, false);
      window.removeEventListener("mouseup", dragEnd, false);
      window.removeEventListener("touchend", dragEnd, false);
    };
  }, [elementId, dragHandleId]);
};

const debounce = <F extends (...args: any[]) => any>(func: F, wait: number): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export {createCircleWkt, formatDateBE, createTileLayerFromUrl, createEmptyVectorLayerForDrawing, useDraggable};
