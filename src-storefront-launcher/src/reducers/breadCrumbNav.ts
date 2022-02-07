import { BREADCRUMB_NAV } from '../actions/types';

export const breadCrumbNav = (state = null, action: any) => {
    switch (action.type) {
        case BREADCRUMB_NAV: 
            return action.payload;
        default: 
            return state;
    }    
}
