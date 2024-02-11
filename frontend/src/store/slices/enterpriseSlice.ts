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
                    wkt: args.wkt,
                }
            }

            const response = await apolloClient.query({
                query: gql`
                    query ($first: Int!, $bbox: [Float!], $wkt: String) {
                        enterprises(
                            first: $first, 
                            bbox: $bbox,
                            wkt: $wkt
                        ) {
                            id
                            establishmentNumber
                            enterpriseNumber
                            name
                            form
                            sector
                            naceMain
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
            // Make sure to only have unique enterprises (on establishment number)
            const uniqueEnterprises = action.payload.filter((enterprise: Enterprise, index: number, self: Enterprise[]) =>
                index === self.findIndex((t) => (
                    t.establishment_number === enterprise.establishment_number
                ))
            );

            // Filter alphabetically by name
            state.selectedEnterprises = uniqueEnterprises.sort((a: Enterprise, b: Enterprise) => {
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
