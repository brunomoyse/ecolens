// Import createAsyncThunk
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { NaceCode } from '@/types';
import gql from 'graphql-tag';
import apolloClient from '@/lib/apollo-client';

interface naceCodeState {
	naceCodes: NaceCode[];
}

const initialState: naceCodeState = {
	naceCodes: [],
};

export const fetchNaceCodes = createAsyncThunk('naceCodes/fetchNaceCodes', async () => {
	const response = await apolloClient.query({
		query: gql`
			query {
				naceCodes {
					code
					description
				}
			}
		`,
	});

	return response.data.naceCodes;
});

export const naceCodeSlice = createSlice({
	name: 'naceCode',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchNaceCodes.fulfilled, (state, action) => {
			state.naceCodes = action.payload;
		});
	},
});

export default naceCodeSlice.reducer;
