import { configureStore } from '@reduxjs/toolkit';
import drawingReducer from './slices/drawingSlice';
import enterpriseReducer from './slices/enterpriseSlice';
import widgetReducer from './slices/widgetSlice';

export const store = configureStore({
    reducer: {
        drawing: drawingReducer,
        enterprise: enterpriseReducer,
        widget: widgetReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
