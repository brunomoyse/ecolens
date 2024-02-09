import { configureStore } from '@reduxjs/toolkit';
import drawingReducer from './slices/drawingSlice';
import enterpriseReducer from './slices/enterpriseSlice';
import widgetReducer from './slices/widgetSlice';
import eapReducer from './slices/eapSlice';
import legendReducer from './slices/legendSlice';

export const store = configureStore({
    reducer: {
        drawing: drawingReducer,
        enterprise: enterpriseReducer,
        widget: widgetReducer,
        eap: eapReducer,
        legend: legendReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
