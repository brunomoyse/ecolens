import { createSlice } from '@reduxjs/toolkit';
import {Polygon} from "ol/geom";

interface DrawingState {
    isDrawing: boolean;
    drawnFeature: Polygon | null;
}

const initialState: DrawingState = {
    isDrawing: false,
    drawnFeature: null
};

export const drawingSlice = createSlice({
    name: 'drawing',
    initialState,
    reducers: {
        setDrawingState: (state, action) => {
            state.isDrawing = action.payload;
        },
        setDrawnFeature: (state, action) => {
            state.drawnFeature = action.payload;
        }
    },
});

export const { setDrawingState, setDrawnFeature } = drawingSlice.actions;
export default drawingSlice.reducer;
