import createRemoteActions from '../../utils/createRemoteActions';
import { error } from '../../appActions';
//import { getComments } from '../comments/commentsActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'COMMENTS_FETCH',
		'COMMENTS_EDIT',
		'COMMENTS_REMOVE',
		'COMMENTS_ADD'
	]),
	'COMMENTS_LOADING': 'COMMENTS_LOADING'
};

export function removeComment(id) {
	return (dispatch) => {
		request('Comments')
			.delete({ id })
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.COMMENTS_REMOVE_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
}

export function likeComment(id) {
	return (dispatch) => {
		request('CommentsLike')
			.post({ id })
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.COMMENTS_EDIT_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
}

export function newComment(text, topicId, parentId) {
	return (dispatch) => {
		var obj = {
			text,
			topic_id: topicId
		};
		if (parentId) {
			obj.parent_id = parentId;
		}


		request('Comments')
			.post(obj)
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.COMMENTS_ADD_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
}

export function saveComment(id, text) {
	return (dispatch) => {
		request('Comments', { id })
			.post({ text })
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.COMMENTS_EDIT_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
}

export function getComments(topicId){
	return (dispatch) => {
		request('Comments')
			.get({
				topic_id: topicId
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.COMMENTS_FETCH_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};