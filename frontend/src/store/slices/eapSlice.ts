import { createSlice } from '@reduxjs/toolkit';
import {EconomicalActivityPark} from "@/types";

interface EapState {
    selectedEap: EconomicalActivityPark | null;
}

const initialState: EapState = {
    selectedEap: null,
};

export const eapSlice = createSlice({
    name: 'eap',
    initialState,
    reducers: {
        setSelectedEap: (state, action) => {
            state.selectedEap = action.payload;
        },
    },
});

export const { setSelectedEap } = eapSlice.actions;
export default eapSlice.reducer;
