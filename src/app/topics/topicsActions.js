import createRemoteActions from '../../utils/createRemoteActions';
import { error } from '../../appActions';
//import { getIdeas } from '../ideas/ideasActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'TOPICS_FETCH',
		'TOPIC_FETCH',
		'TOPICS_EDIT',
		'TOPICS_REMOVE',
		'TOPICS_ADD',
		'TOPICS_SAVE'
	]),
	'TOPICS_LOADING': 'TOPICS_LOADING',
	'TOPICS_CHANGE': 'TOPICS_CHANGE',
	'TOPICS_CHANGE_META': 'TOPICS_CHANGE_META',
	'TOPICS_RESET_EDIT': 'TOPICS_RESET_EDIT'
};

export function loading(isLoading){
	return {
		type: constants.TOPICS_LOADING,
		payload: isLoading
	}
};

export function onChange(data) {
	return {
		type: constants.TOPICS_CHANGE,
		payload: {
			data
		}
	}
}

export function onChangeMeta(data) {
	return {
		type: constants.TOPICS_CHANGE_META,
		payload: {
			data
		}
	}
}

export function onResetEdit() {
	return {
		type: constants.TOPICS_RESET_EDIT
	}
}

export function removeTopic(id){
	return dispatch => {
		request('Topics')
			.delete({ id })
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.TOPICS_REMOVE_SUCCESS,
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

export function newTopic(title, description, file){
	return dispatch => {
		const obj = {
			title,
			description
		}

		if (file) {
			obj.file = file;
		}

		request('Topics')
			.post(obj)
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.TOPICS_ADD_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function likeTopic(id){
	return dispatch => {
		request('TopicsLike')
			.post({
				id
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.TOPICS_EDIT_SUCCESS,
					payload: d.data
				});

				dispatch({
					type: constants.TOPICS_CHANGE,
					payload: {
						data: d.data
					}
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function rateTopic(id, value){
	return dispatch => {
		request('TopicsRate')
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
					type: constants.TOPICS_EDIT_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function archiveTopic(id, is_archive){
	return dispatch => {
		request('TopicsArchive')
			.post({
				id,
				is_archive
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.TOPICS_CHANGE,
					payload: {
						data: d.data
					}
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function saveTopic(id){
	return (dispatch, getState) => {
		const st = getState();
		const topic = st.topics.currentTopic;


		request('Topics', { id })
			.post(topic)
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.TOPICS_SAVE_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};

export function getTopic(id) {
	return (dispatch, getState) => {
		dispatch(loading(true));

		request('Topics')
			.get({ id })
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					dispatch(loading(false));
					throw d;
				}
				dispatch({
					type: constants.TOPIC_FETCH_SUCCESS,
					payload: d.data
				});

				dispatch(loading(false));
			})
			.catch(e => {
				console.error(e);
				dispatch(loading(false));
				dispatch(error(e.message));
			});
	}
}

export function getTopics(){
	return (dispatch, getState) => {

		const meta = getState().topics.meta;

		request('Topics')
			.get({
				search: meta.searchText,
				status: meta.statusText,
				page: meta.page,
				sort: meta.sort,
				sort_direction: meta.sortDirection
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.TOPICS_FETCH_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};