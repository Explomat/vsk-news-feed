import { constants } from './ideasActions';

const listReducer = (state = [], action) => {
	switch(action.type) {
		case constants.IDEAS_ADD_SUCCESS: {
			return state.concat(action.payload);
		}

		case constants.IDEAS_REMOVE_SUCCESS: {
			const id = action.payload.id;
			return state.filter(t => t.id !== id);
		}

		case constants.IDEAS_EDIT_SUCCESS: {
			const id = action.payload.id;
			return state.map(t => {
				if (t.id === id){
					return action.payload;
				}
				return t;
			});
		}
		default: return state;
	}
}

const ideasReducer = (state = {
	list: [],
	currentIdea: {},
	defaultCurrentIdea: {},
	ui: {
		isLoading: false
	},
	meta: {
		canAdd: true
	}
}, action) => {
	switch(action.type) {
		case constants.IDEAS_FETCH_SUCCESS: {
			return {
				...state,
				list: action.payload.ideas,
				meta: {
					...state.meta,
					...action.payload.meta
				}
			}
		}

		case constants.IDEA_FETCH_SUCCESS: {
			return {
				...state,
				currentIdea: action.payload,
				defaultCurrentIdea: action.payload
			}
		}

		case constants.IDEAS_ADD_SUCCESS:
		case constants.IDEAS_REMOVE_SUCCESS:
		case constants.IDEAS_EDIT_SUCCESS: {
			return {
				...state,
				list: listReducer(state.list, action)
			}
		}

		case constants.IDEAS_CHANGE: {
			return {
				...state,
				currentIdea: {
					...state.currentIdea,
					...action.payload
				}
			}
		}

		case constants.IDEAS_SAVE_SUCCESS: {
			return {
				...state,
				currentIdea: {
					...state.currentIdea,
					...action.payload
				},
				defaultCurrentIdea: {
					...state.currentIdea,
					...action.payload
				}
			}
		}

		case constants.IDEAS_RESET_EDIT: {
			return {
				...state,
				currentIdea: {
					...state.defaultCurrentIdea
				}
			}
		}

		case constants.IDEA_LOADING: {
			return {
				...state,
				ui: {
					...state.ui,
					isLoading: action.payload
				}
			}
		}

		default: return state;
	}
}

export default ideasReducer;