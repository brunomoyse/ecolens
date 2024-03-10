// Import createAsyncThunk
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {EconomicalActivityPark, Plot, Enterprise, Pagination} from '@/types';
import gql from "graphql-tag";
import apolloClient from "@/lib/apollo-client";

interface circleSearchResultsType {
    enterprises: Enterprise[];
    eaps: EconomicalActivityPark[];
    plots: Plot[];
}

// Define the initial state
interface EnterpriseState {
    isEnterpriseLoading: boolean
    enterprisesData: Enterprise[];
    enterprisesPagination: Pagination | null;
    selectedEnterprises: Enterprise[] | null;
    selectedEnterprise: Enterprise | null;
    circleSearchResults: circleSearchResultsType | null;
    filterEap: string | null;
    filterNace: string | null;
    filterEntityType: string | null;
    filterSector: string | null;
}

const initialState: EnterpriseState = {
    isEnterpriseLoading: false,
    enterprisesData: [],
    enterprisesPagination: null,
    selectedEnterprises: null,
    selectedEnterprise: null,
    circleSearchResults: null,
    filterEap: null,
    filterNace: null,
    filterEntityType: null,
    filterSector: null,
};

export const fetchEnterprises = createAsyncThunk(
    'enterprise/fetchEnterprises',
    async (args: any, { rejectWithValue }) => {
        try {
            let queryVariables: any = {
                page: args.page || 1,
                pageSize: args.pageSize || 5,
                filterEap: args.filterEap || null,
                filterNace: args.filterNace || null,
                filterEntityType: args.filterEntityType || null,
                filterSector: args.filterSector || null,
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
                    query (
                        $pageSize: Int, 
                        $page: Int, 
                        $bbox: [Float!], 
                        $wkt: String,
                        $filterEap: UUID,
                        $filterEntityType: String,
                        $filterSector: SectorEnum
                        $filterNace: String
                    ) {
                        enterprises(
                            pageSize: $pageSize, 
                            page: $page, 
                            bbox: $bbox, 
                            wkt: $wkt,
                            eapId: $filterEap,
                            naceLetter: $filterNace,
                            entityType: $filterEntityType,
                            sector: $filterSector
                        ) {
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
                                naceLetter
                                reliabilityIndex
                                coordinates {
                                    longitude
                                    latitude
                                }
                                economicalActivityPark {
                                    name
                                    codeCarto
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
                            id
                            establishmentNumber
                            enterpriseNumber
                            name
                            form
                            sector
                            naceMain
                            naceOther
                            reliabilityIndex
                            startDate
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
            // @todo replace with camelCase + use TS when will be fetched from graphql instead of Martin
            const uniqueEnterprises = action.payload.filter((enterprise: any, index: number, self: Enterprise[]) =>
                index === self.findIndex((t: any) => (
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
        setFilterEap: (state, action) => {
            state.filterEap = action.payload;
        },
        setFilterNace: (state, action) => {
            state.filterNace = action.payload;
        },
        setFilterEntityType: (state, action) => {
            state.filterEntityType = action.payload;
        },
        setFilterSector: (state, action) => {
            state.filterSector = action.payload;
        }
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
        builder.addCase(fetchEnterprise.fulfilled, (state, action) => {
            state.selectedEnterprise = action.payload
        });
        builder.addCase(fetchCircleSearchResults.fulfilled, (state, action) => {
            state.circleSearchResults = action.payload
        });
    },
});

export const { setFilterNace, setFilterEap, setFilterSector, setFilterEntityType, setSelectedEnterprises, setSelectedEnterprise } = enterpriseSlice.actions;
export default enterpriseSlice.reducer;
