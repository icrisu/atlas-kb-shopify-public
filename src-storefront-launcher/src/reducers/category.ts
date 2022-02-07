import { CATEGORY } from '../actions/types';

export const category = (state = {}, action: any) => {
    switch (action.type) {
        case CATEGORY: 
            return action.payload;
        default: 
            return state;
    }    
}
