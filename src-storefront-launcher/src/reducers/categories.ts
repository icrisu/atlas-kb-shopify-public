import { CATEGORIES } from '../actions/types';

export const categories = (state = {}, action: any) => {
    switch (action.type) {
        case CATEGORIES: 
            return action.payload;
        default: 
            return state;
    }    
}
