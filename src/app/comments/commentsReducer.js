import { constants } from './commentsActions';

const listReducer = (state = [], action) => {
	switch(action.type) {
		case constants.COMMENTS_ADD_SUCCESS: {
			return state.concat(action.payload);
		}

		case constants.COMMENTS_REMOVE_SUCCESS: {
			const ids = action.payload;
			var newState = state.filter(t => {
				for (let i = ids.length - 1; i >= 0; i--) {
					if (t.id === ids[i]) {
						return false;
					}
				}
				return true;
			});

			return newState;
		}

		case constants.COMMENTS_EDIT_SUCCESS: {
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

const commentsReducer = (state = {
	list: [],
	ui: {
		isLoading: false
	},
	meta: {
		canAdd: true
	}
}, action) => {
	switch(action.type) {
		case constants.COMMENTS_FETCH_SUCCESS: {
			const { comments, meta } = action.payload;
			return {
				...state,
				list: comments,
				meta: {
					...state.meta,
					...meta
				}
			}
		}

		case constants.COMMENTS_ADD_SUCCESS:
		case constants.COMMENTS_REMOVE_SUCCESS:
		case constants.COMMENTS_EDIT_SUCCESS: {
			return {
				...state,
				list: listReducer(state.list, action)
			}
		}

		case constants.COMMENTS_LOADING: {
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

export default commentsReducer;