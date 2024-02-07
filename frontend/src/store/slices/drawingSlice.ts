import { createSlice } from '@reduxjs/toolkit';

interface DrawingState {
    isDrawing: boolean;
    isDrawn: boolean;
}

const initialState: DrawingState = {
    isDrawing: false,
    isDrawn: false,
};

export const drawingSlice = createSlice({
    name: 'drawing',
    initialState,
    reducers: {
        toggleDrawing: (state) => {
            state.isDrawing = !state.isDrawing;
        },
        toggleDrawn: (state) => {
            state.isDrawn = !state.isDrawn;
        },
    },
});

export const { toggleDrawing, toggleDrawn } = drawingSlice.actions;
export default drawingSlice.reducer;
