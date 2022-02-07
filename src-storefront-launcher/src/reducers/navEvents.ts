import { NAV_EVENTS } from '../actions/types';

export const navEvents = (state = null, action: any) => {
    switch (action.type) {
        case NAV_EVENTS: 
            return action.payload;
        default: 
            return state;
    }    
}
