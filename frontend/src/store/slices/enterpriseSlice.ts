// Import createAsyncThunk
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {EconomicalActivityPark, Enterprise, Pagination} from '@/types';
import gql from "graphql-tag";
import apolloClient from "@/lib/apollo-client";

interface circleSearchResultsType {
    enterprises: Enterprise[];
    eaps: EconomicalActivityPark[];
    plots: any;
}

// Define the initial state
interface EnterpriseState {
    isEnterpriseLoading: boolean
    enterprisesData: Enterprise[];
    enterprisesPagination: Pagination | null;
    selectedEnterprises: Enterprise[] | null;
    selectedEnterprise: Enterprise | null;
    circleSearchResults: circleSearchResultsType | null;
}

const initialState: EnterpriseState = {
    isEnterpriseLoading: false,
    enterprisesData: [],
    enterprisesPagination: null,
    selectedEnterprises: null,
    selectedEnterprise: null,
    circleSearchResults: null,
};

export const fetchEnterprises = createAsyncThunk(
    'enterprise/fetchEnterprises',
    async (args: any, { rejectWithValue }) => {
        try {
            let queryVariables: any = {
                page: args.page || 1,
                pageSize: args.pageSize || 5,
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
                    query ($pageSize: Int, $page: Int, $bbox: [Float!], $wkt: String) {
                        enterprises(pageSize: $pageSize, page: $page, bbox: $bbox, wkt: $wkt) {
                            pagination {
                                total
                                perPage
                                currentPage
                                lastPage
                                firstPage
                            }
                            data {
                                id
                                establishmentNumber
                                enterpriseNumber
                                name
                                form
                                sector
                                naceMain
                                naceOther
                                reliabilityIndex
                                coordinates {
                                    longitude
                                    latitude
                                }
                                economicalActivityPark {
                                    name
                                }
                                __typename
                            }

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

export const fetchCircleSearchResults = createAsyncThunk(
    'enterprise/fetchCircleSearchResults',
    async (args: any, { rejectWithValue }) => {
        try {
            if (args.wkt === null) return;

            let queryVariables: any = {
                wkt: args.wkt,
            };

            const response = await apolloClient.query({
                query: gql`
                    query ($wkt: String!) {
                        resolverDetailSearch(wkt: $wkt) {
                            enterprises {
                                name
                                distanceToCentroid
                            }
                            eaps {
                                name
                                distanceToCentroid
                            }
                            plots {
                                capakey
                                distanceToCentroid
                            }
                        }
                    }
                `,
                variables: queryVariables,
            });

            return response.data.resolverDetailSearch;
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
        },
    },
    extraReducers: (builder) => {
        // Handle actions defined by createAsyncThunk or other extraReducers
        builder.addCase(fetchEnterprises.pending, (state, action) => {
            state.isEnterpriseLoading = true
        });
        builder.addCase(fetchEnterprises.fulfilled, (state, action) => {
            state.isEnterpriseLoading = false
            state.enterprisesData = action.payload.data
            state.enterprisesPagination = { ...action.payload.pagination };
        });
        builder.addCase(fetchCircleSearchResults.fulfilled, (state, action) => {
            state.circleSearchResults = action.payload
        });
    },
});

export const { setSelectedEnterprises, setSelectedEnterprise } = enterpriseSlice.actions;
export default enterpriseSlice.reducer;
