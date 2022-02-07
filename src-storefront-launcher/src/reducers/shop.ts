import { SHOP_DATA } from '../actions/types';

export const shop = (state = {}, action: any) => {
    switch (action.type) {
        case SHOP_DATA: 
            return action.payload;
        default: 
            return state;
    }    
}
