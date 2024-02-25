import { createSlice } from '@reduxjs/toolkit';
import {Polygon} from "ol/geom";
import {Circle} from "ol/geom";

interface DrawingState {
    isDrawingPolygon: boolean;
    isDrawingCircle: boolean;
    drawnFeature: Polygon | null;
    drawnCircle: Circle | null
}

const initialState: DrawingState = {
    isDrawingPolygon: false,
    isDrawingCircle: false,
    drawnFeature: null,
    drawnCircle: null
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
        setDrawnCircle: (state, action) => {
            state.drawnCircle = action.payload;
        }
    },
});

export const { setDrawingPolygonState, setDrawingCircleState, setDrawnFeature, setDrawnCircle } = drawingSlice.actions;
export default drawingSlice.reducer;
