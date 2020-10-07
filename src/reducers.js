import { combineReducers } from 'redux';
import appReducer from './appReducer';
import topicsReducer from './app/topics/topicsReducer';
import ideasReducer from './app/ideas/ideasReducer';
import commentsReducer from './app/comments/commentsReducer';

//import appReducer from './assessment/reducer';

const reducer = combineReducers({
	app: appReducer,
	topics: topicsReducer,
	ideas: ideasReducer,
	comments: commentsReducer,
	wt: (state = {}) => state
});

export default reducer;
