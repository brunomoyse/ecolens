// Import createAsyncThunk
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Enterprise} from '@/types';
import gql from "graphql-tag";
import apolloClient from "@/lib/apollo-client";

// Define the initial state
interface EnterpriseState {
    enterprises: Enterprise[];
    selectedEnterprises: Enterprise[] | null;
    selectedEnterprise: Enterprise | null;
}

const initialState: EnterpriseState = {
    enterprises: [],
    selectedEnterprises: null,
    selectedEnterprise: null,
};

export const fetchEnterprises = createAsyncThunk(
    'enterprise/fetchEnterprises',
    async (args: any, { rejectWithValue }) => {
        try {
            let queryVariables: any = {
                first: args.first || 5,
            };

            if (args.bbox) {
                queryVariables = {
                    ...queryVariables,
                    bbox: args.bbox,
                }
            }

            if (args.wkt) {
                queryVariables = {
                    ...queryVariables,
                    polygon: args.wkt,
                }
            }

            const response = await apolloClient.query({
                query: gql`
                    query ($first: Int!, $bbox: [Float!], $polygon: JSONString) {
                        enterprises(
                            first: $first, 
                            bbox: $bbox,
                            polygon: $polygon
                        ) {
                            name
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
                variables: queryVariables,
            });
            return response.data.enterprises;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchEnterprise = createAsyncThunk(
    'enterprise/fetchEnterprise',
    async (args: any, { rejectWithValue }) => {
        try {
            const response = await apolloClient.query({
                query: gql`
                    query ($id: ID!) {
                        enterprise(
                            id: $id
                        ) {
                            name
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
                    id: args.id,
                },
            });
            return response.data.enterprise;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const enterpriseSlice = createSlice({
    name: 'enterprise',
    initialState,
    reducers: {
        setSelectedEnterprises: (state, action) => {
            // Filter alphabetically by name
            state.selectedEnterprises = action.payload.sort((a: Enterprise, b: Enterprise) => {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        },
        setSelectedEnterprise: (state, action) => {
            state.selectedEnterprise = action.payload;
            console.log(state.selectedEnterprise);
        }
    },
    extraReducers: (builder) => {
        // Handle actions defined by createAsyncThunk or other extraReducers
        builder.addCase(fetchEnterprises.fulfilled, (state, action) => {
            state.enterprises = action.payload;
        });
    },
});

export const { setSelectedEnterprises, setSelectedEnterprise } = enterpriseSlice.actions;
export default enterpriseSlice.reducer;
