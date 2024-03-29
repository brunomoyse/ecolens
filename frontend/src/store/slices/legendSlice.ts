import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { legendArcGis } from '@/types';

interface geoPortalLegendItem {
	layerName: string;
	legendData: legendArcGis;
}

interface LegendState {
	eapLegend: legendArcGis | null;
	geoPortalLegends: geoPortalLegendItem[] | [];
}

const initialState: LegendState = {
	eapLegend: null,
	geoPortalLegends: [],
};

export const fetchGeoPortalLegend = createAsyncThunk('legend/fetchLegend', async (args: any, { rejectWithValue }) => {
	try {
		const response = await fetch(
			`https://geoservices.wallonie.be/arcgis/rest/services/${args.category}/${args.subCategory}/MapServer/legend?f=pjson`,
		);
		const legendData = await response.json();

		return {
			layerName: args.layerName,
			legendData: legendData as legendArcGis,
		};
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const legendSlice = createSlice({
	name: 'legend',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		// Handle actions defined by createAsyncThunk or other extraReducers
		builder.addCase(fetchGeoPortalLegend.fulfilled, (state, action) => {
			const legendItem = action.payload as geoPortalLegendItem;
			// @ts-ignore
			state.geoPortalLegends.push(legendItem);
		});
	},
});

export default legendSlice.reducer;
