import { ARTICLE } from '../actions/types';

export const article = (state = {}, action: any) => {
    switch (action.type) {
        case ARTICLE: 
            return action.payload;
        default: 
            return state;
    }    
}
