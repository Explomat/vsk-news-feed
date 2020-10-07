import { constants } from './topicsActions';

const listReducer = (state = [], action) => {
	switch(action.type) {
		case constants.TOPICS_ADD_SUCCESS: {
			return state.concat(action.payload);
		}

		case constants.TOPICS_REMOVE_SUCCESS: {
			const id = action.payload.id;
			return state.filter(t => t.id !== id);
		}

		case constants.TOPICS_EDIT_SUCCESS: {
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

const topicsReducer = (state = {
	list: [],
	currentTopic: {},
	defaultCurrentTopic: {},
	ui: {
		isLoading: false
	},
	meta: {
		canAdd: false,
		sort: 'publish_date',
		sortDirection: 'desc',
		page: 1,
		pageSize: 1,
		total: 1,
		searchText: '',
		statusText: 'active'
	},
}, action) => {
	switch(action.type) {
		case constants.TOPICS_FETCH_SUCCESS: {
			return {
				...state,
				list: action.payload.topics,
				meta: {
					...state.meta,
					...action.payload.meta
				}
			}
		}

		case constants.TOPIC_FETCH_SUCCESS: {
			return {
				...state,
				currentTopic: action.payload.topics,
				defaultCurrentTopic: action.payload.topics
			}
		}

		case constants.TOPICS_CHANGE: {
			const { data } = action.payload;

			return {
				...state,
				currentTopic: {
					...state.currentTopic,
					...data
				}
			}
		}

		case constants.TOPICS_SAVE_SUCCESS: {
			return {
				...state,
				currentTopic: {
					...state.currentTopic,
					...action.payload
				},
				defaultCurrentTopic: {
					...state.defaultCurrentTopic,
					...action.payload
				}
			}
		}

		case constants.TOPICS_RESET_EDIT: {
			return {
				...state,
				currentTopic: {
					...state.defaultCurrentTopic
				}
			}
		}

		case constants.TOPICS_CHANGE_META: {
			const { data } = action.payload;

			return {
				...state,
				meta: {
					...state.meta,
					...data
				}
			}
		}

		case constants.TOPICS_ADD_SUCCESS:
		case constants.TOPICS_REMOVE_SUCCESS:
		case constants.TOPICS_EDIT_SUCCESS: {
			return {
				...state,
				list: listReducer(state.list, action)
			}
		}

		case constants.TOPICS_LOADING: {
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

export default topicsReducer;