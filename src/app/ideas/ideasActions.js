import createRemoteActions from '../../utils/createRemoteActions';
import { error } from '../../appActions';
//import { getComments } from '../comments/commentsActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'IDEAS_FETCH',
		'IDEA_FETCH',
		'IDEAS_EDIT',
		'IDEAS_REMOVE',
		'IDEAS_ADD',
		'IDEAS_SAVE'
	]),
	'IDEAS_LOADING': 'IDEAS_LOADING',
	'IDEAS_CHANGE': 'IDEAS_CHANGE',
	'IDEAS_RESET_EDIT': 'IDEAS_RESET_EDIT'
};

export function onChange(data) {
	return {
		type: constants.IDEAS_CHANGE,
		payload: data
	}
}

export function onResetEdit() {
	return {
		type: constants.IDEAS_RESET_EDIT
	}
}

export function removeIdea(id){
	return dispatch => {
		request('Ideas')
			.delete({ id })
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.IDEAS_REMOVE_SUCCESS,
					payload: {
						id
					}
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function newIdea(title, description, topic_id){
	return (dispatch, getState) => {
		request('Ideas')
			.post({
				title,
				description,
				topic_id
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.IDEAS_ADD_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function rateIdea(id, value){
	return dispatch => {
		request('IdeasRate')
			.post({
				id,
				value
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.IDEAS_EDIT_SUCCESS,
					payload: d.data
				});
				dispatch({
					type: constants.IDEAS_CHANGE,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function saveIdea(id){
	return (dispatch, getState) => {
		const st = getState();
		const idea = st.ideas.currentIdea;


		request('Ideas', { id })
			.post(idea)
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.IDEAS_SAVE_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function getIdea(id){
	return (dispatch, getState) => {
		request('Ideas')
			.get({
				id
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.IDEA_FETCH_SUCCESS,
					payload: d.data
				});


			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function getIdeas(topicId){
	return (dispatch, getState) => {
		request('Ideas')
			.get({
				topic_id: topicId
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.IDEAS_FETCH_SUCCESS,
					payload: d.data
				});


			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};