import { createSlice } from '@reduxjs/toolkit';

interface WidgetState {
    selectedEnterpriseWidget: boolean;
    layerWidget: boolean
    legendWidget: boolean;
}

const initialState: WidgetState = {
    enterpriseListPanelObject: null,
    enterpriseListPanel: false,
    selectedEnterpriseWidget: false,
    layerWidget: true,
    legendWidget: true,
};

export const widgetSlice = createSlice({
    name: 'widget',
    initialState,
    reducers: {
        toggleSelectedEnterpriseWidget: (state) => {
            state.selectedEnterpriseWidget = !state.selectedEnterpriseWidget;
        },
        toggleLayerWidget: (state) => {
            state.layerWidget = !state.layerWidget;
        },
        toggleLegendWidget: (state) => {
            state.legendWidget = !state.legendWidget;
        },
    },
});

export const {
    toggleSelectedEnterpriseWidget,
    toggleLayerWidget,
    toggleLegendWidget
} = widgetSlice.actions;
export default widgetSlice.reducer;
