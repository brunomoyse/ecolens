// Import createAsyncThunk
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Enterprise } from '@/types';
import gql from "graphql-tag";
import apolloClient from "@/lib/apollo-client";

// Define the initial state
interface EnterpriseState {
    enterprises: Enterprise[];
    selectedEnterprise: Enterprise | null;
}

const initialState: EnterpriseState = {
    enterprises: [],
    selectedEnterprise: null,
};

// Define an async thunk for fetching enterprises
export const fetchEnterprises = createAsyncThunk(
    'enterprise/fetchEnterprises',
    async (args: any, { rejectWithValue }) => {
        try {
            const response = await apolloClient.query({
                query: gql`
                    query ($first: Int!) {
                        enterprises(first: $first) {
                            nomDuSiegeDExploitation
                            #id
                            #establishment_number
                            #enterprise_number
                            #name
                            #form
                            #sector
                            #nace_main
                        }
                    }
                `,
                variables: {
                    first: args.first || 5,
                },
            });
            return response.data.enterprises;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Create the slice
export const enterpriseSlice = createSlice({
    name: 'enterprise',
    initialState,
    reducers: {
        setSelectedEnterprise: (state, action) => {
            state.selectedEnterprise = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle actions defined by createAsyncThunk or other extraReducers
        builder.addCase(fetchEnterprises.fulfilled, (state, action) => {
            state.enterprises = action.payload;
        });
    },
});

export const { setSelectedEnterprise } = enterpriseSlice.actions;
export default enterpriseSlice.reducer;
