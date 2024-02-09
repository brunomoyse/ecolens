import { createSlice } from '@reduxjs/toolkit';

interface WidgetState {
    selectedEnterpriseWidget: boolean;
    layerWidget: boolean
    legendWidget: boolean;
}

const initialState: WidgetState = {
    selectedEnterpriseWidget: false,
    layerWidget: true,
    legendWidget: true,
};

export const widgetSlice = createSlice({
    name: 'widget',
    initialState,
    reducers: {
        toggleLayerWidget: (state) => {
            state.layerWidget = !state.layerWidget;
        },
        toggleLegendWidget: (state) => {
            state.legendWidget = !state.legendWidget;
        },
    },
});

export const {
    toggleLayerWidget,
    toggleLegendWidget
} = widgetSlice.actions;
export default widgetSlice.reducer;
