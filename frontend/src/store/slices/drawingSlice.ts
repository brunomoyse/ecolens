import { createSlice } from '@reduxjs/toolkit';
import { Polygon } from 'ol/geom';

interface DrawingState {
	isDrawingPolygon: boolean;
	isDrawingCircle: boolean;
	drawnFeature: Polygon | null;
	drawnCircleRadius: number | null;
	drawnCircleCenter: [number, number] | null;
}

const initialState: DrawingState = {
	isDrawingPolygon: false,
	isDrawingCircle: false,
	drawnFeature: null,
	drawnCircleRadius: null,
	drawnCircleCenter: null,
};

export const drawingSlice = createSlice({
	name: 'drawing',
	initialState,
	reducers: {
		setDrawingCircleState: (state, action) => {
			state.isDrawingCircle = action.payload;
		},
		setDrawingPolygonState: (state, action) => {
			state.isDrawingPolygon = action.payload;
		},
		setDrawnFeature: (state, action) => {
			state.drawnFeature = action.payload;
		},
		setDrawnCircleRadius: (state, action) => {
			state.drawnCircleRadius = action.payload === null ? null : Math.round(action.payload);
		},
		setDrawnCircleCenter: (state, action) => {
			state.drawnCircleCenter = action.payload;
		},
	},
});

export const {
	setDrawingPolygonState,
	setDrawingCircleState,
	setDrawnFeature,
	setDrawnCircleRadius,
	setDrawnCircleCenter,
} = drawingSlice.actions;
export default drawingSlice.reducer;
