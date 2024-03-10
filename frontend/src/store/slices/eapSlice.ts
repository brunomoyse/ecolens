import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { EconomicalActivityPark } from "@/types";
import gql from "graphql-tag";
import apolloClient from "@/lib/apollo-client";

interface EapState {
    selectedEap: EconomicalActivityPark | null;
    economicalActivityParks: EconomicalActivityPark[]
}

const initialState: EapState = {
    selectedEap: null,
    economicalActivityParks: [],
};

export const fetchEaps = createAsyncThunk(
    'eap/fetchEaps',
    async () => {
        const response = await apolloClient.query({
            query: gql`
                    query {
                        economicalActivityParks {
                            id
                            name
                            codeCarto
                        }
                    }
                `,
        });

        return response.data.economicalActivityParks;
    }
);

export const eapSlice = createSlice({
    name: 'eap',
    initialState,
    reducers: {
        setSelectedEap: (state, action) => {
            state.selectedEap = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchEaps.fulfilled, (state, action) => {
            state.economicalActivityParks = action.payload
        });
    },
});

export const { setSelectedEap } = eapSlice.actions;
export default eapSlice.reducer;
