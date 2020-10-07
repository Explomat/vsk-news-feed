<%

//curUserID = 6711785032659205612; // me test
//curUserID = 6719948502038810952; // volkov test

var Topics = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/topic.js');
DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/topic.js');

var Comments = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/comment.js');
DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/comment.js');

var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

function get_Topics(queryObjects) {
	var topicId = queryObjects.GetOptProperty('id');
	var search = queryObjects.HasProperty('search') ? queryObjects.search : '';
	var status = queryObjects.HasProperty('status') ? queryObjects.status : 'active';
	var page = queryObjects.HasProperty('page') ? OptInt(queryObjects.page) : 1;
	var sort = queryObjects.HasProperty('sort') ? String(queryObjects.sort) : 'publish_date';
	var sortDirection = queryObjects.HasProperty('sort_direction') ? String(queryObjects.sort_direction) : 'desc';
	var pageSize = queryObjects.HasProperty('page_size') ? OptInt(queryObjects.page_size) : 6;

	var min = (page - 1) * pageSize;
	var max = min + pageSize;
	var topicsObj = {};

	try {
		if(topicId != undefined) {
			Topics.incrementViews(topicId, curUserID);
		}

		topicsObj = Topics.list(topicId, curUserID, search, status, min, max, pageSize, sort, sortDirection);		
	} catch(e) {
		return Utils.setError(e);
	}

	return Utils.setSuccess(topicsObj);
}

function post_TopicsArchive(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var topicId = data.GetOptProperty('id');
	var isArchive = data.GetOptProperty('is_archive');

	if (topicId != undefined) {
		if (isArchive) {
			//alert('test:' + Topics.isAccessToActivate(topicId, curUserID));
			if (!Topics.isAccessToUpdate(topicId, curUserID)) {
				return Utils.setError('У вас нет прав на редактирование_');
			}
		} else {
			if (!Topics.isAccessToActivate(topicId, curUserID)) {
				//alert('post_TopicsArchive: 2');
				return Utils.setError('У вас нет прав на редактирование');
			}
		}

		if (isArchive != undefined) {
			var topic = Topics.archive(topicId, curUserID, isArchive);
			return Utils.setSuccess(topic);
		}
	}

	return Utils.setError('Topic ID not defined');
}

function post_TopicsLike(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var topicId = data.GetOptProperty('id');

	if (topicId != undefined) {
		if (Topics.isAccessToLike(topicId)) {
			var topic = Topics.like(topicId, curUserID);
			return Utils.setSuccess(topic);
		} else {
			return Utils.setError('Нет доступа');
		}
	}

	return Utils.setError('Topic ID not defined');
}

function post_TopicsRate(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var topicId = data.GetOptProperty('id');
	var value = data.GetOptProperty('value');

	if (topicId != undefined && value != undefined) {
		if (Topics.isAccessToRate(topicId)) {
			var topic = Topics.rate(topicId, curUserID, value);
			return Utils.setSuccess(topic);
		} else {
			return Utils.setError('Нет доступа');
		}
	}

	return Utils.setError('Topic ID or value not defined');
}

function post_Topics(queryObjects) {
	var topicId = queryObjects.GetOptProperty('id');

	//var data = queryObjects.Request.Form;
	//alert(tools.object_to_text(data, 'json'));
	var data = tools.read_object(queryObjects.Body);
	var title = data.GetOptProperty('title');
	var description = data.GetOptProperty('description'); //data.GetOptProperty('description');
	var imageId = data.GetOptProperty('image_id');
	var file = data.GetOptProperty('file'); //data.GetOptProperty('file');
	var resId = null;

	if (title == undefined || description == undefined) {
		return Utils.setError('Unknown arguments');
	}

	// create new
	if (topicId == undefined) {
		try {
			if (!Topics.isAccessToAdd(curUserID)) {
				return Utils.setError('У вас нет прав на создание');
			}

			var userDoc = OpenDoc(UrlFromDocID(curUserID));

			/*if (file != undefined) {
				var resDoc = Utils.createResourseWithImage(curUserID, String(userDoc.TopElem.fullname), file.FileName, file);
				resId = resDoc.DocID;
			}*/
			resId = file != undefined ? file.id : null;

			var topicDoc = Topics.create(title, description, resId, curUserID, userDoc.TopElem.fullname);
			return Utils.setSuccess(topicDoc);
		} catch(e) {
			return Utils.setError(e);
		}
	}

	//update
	try {
		if (!Topics.isAccessToUpdate(topicId, curUserID)) {
			return Utils.setError('У вас нет прав на редактирование');
		}

		//if (file != undefined) {
			//удаляем старый файл
			/*var curDoc = OpenDoc(UrlFromDocID(Int(topicId)));
			DeleteDoc(UrlFromDocID(Int(curDoc.TopElem.image_id)));*/
		//	DeleteDoc(UrlFromDocID(Int(file.id)))

			//созлаем новый
			//var userDoc = OpenDoc(UrlFromDocID(curUserID));
		//	resId = file != undefined ? file.id : null;

			/*var resDoc = Utils.createResourseWithImage(curUserID, String(userDoc.TopElem.fullname), file.fileName, file.fileType, file);
			resId = resDoc.DocID;*/
		//}

		//alert('update topic: 1');
		var topicDoc = Topics.update(topicId, data, curUserID);
		//alert('update topic: 2');
		return Utils.setSuccess(topicDoc);
	} catch(e) {
		return Utils.setError(e);
	}
}

function delete_Topics(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var topicId = data.GetOptProperty('id');

	if (topicId != undefined) {
		try {
			if (!Topics.isAccessToRemove(topicId, curUserID)) {
				return Utils.setError('У вас нет прав на удаление');
			}

			Topics.remove(topicId);
			return Utils.setSuccess();
		} catch(e) {
			return Utils.setError(e);
		}
	}
	return Utils.setError('Unknown parameters');
}

function get_Comments(queryObjects) {
	var parentId = queryObjects.GetOptProperty('parent_id');
	var topicId = queryObjects.GetOptProperty('topic_id');
	var comments = [];

	try {
		comments = Comments.list(parentId, topicId, curUserID);
	} catch(e) {
		return Utils.setError(e);
	}
	
	return Utils.setSuccess(comments);
}

function post_CommentsLike(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var commentId = data.GetOptProperty('id');

	if (commentId != undefined) {
		if (Comments.isAccessToLike(commentId)) {
			var comment = Comments.like(commentId, curUserID);
			return Utils.setSuccess(comment);
		} else {
			return Utils.setError('Невозможно "лайкнуть" комментарий, т.к. он в архиве');
		}
	}

	return Utils.setError('Comment ID not defined');
}

function post_Comments(queryObjects) {
	var commentId = queryObjects.GetOptProperty('id');

	var data = tools.read_object(queryObjects.Body);
	var text = data.GetOptProperty('text');

	// create new
	if (commentId == undefined) {
		try {
			var parentId = data.GetOptProperty('parent_id');
			var topicId = data.GetOptProperty('topic_id');

			if (topicId == undefined){
				return Utils.setError('Topic Id not found');
			}

			if (!Comments.isAccessToAdd(topicId)) {
				return Utils.setError('У вас нет прав на создание');
			}
			
			var userDoc = OpenDoc(UrlFromDocID(curUserID));
			var commentDoc = Comments.create(text, curUserID, userDoc.TopElem.fullname, parentId, topicId);
			return Utils.setSuccess(commentDoc);
		} catch(e) {
			return Utils.setError(e);
		}
	}

	//update
	try {
		if (!Comments.isAccessToUpdate(commentId, curUserID)) {
			return Utils.setError('У вас нет прав на редактирование');
		}

		var objUpdate = {
			text: text
		}

		var commentDoc = Comments.update(commentId, objUpdate, curUserID);
		return Utils.setSuccess(commentDoc);
	} catch(e) {
		return Utils.setError(e);
	}
}

function delete_Comments(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var commentId = data.GetOptProperty('id');

	if (commentId != undefined) {
		try {
			if (!Comments.isAccessToRemove(commentId, curUserID)) {
				return Utils.setError('У вас нет прав на удаление');
			}

			var deletedIds = Comments.remove(commentId);
			return Utils.setSuccess(deletedIds);
		} catch(e) {
			return Utils.setError(e);
		}
	}

	return Utils.setError('Unknown parameters');
}

function post_File(queryObjects) {
	var data = queryObjects.Request.Form;
	var file = data.GetOptProperty('file');

	if (file == undefined) {
		return Utils.setError('Unknown parameters');
	}

	var userDoc = OpenDoc(UrlFromDocID(curUserID));
	var resDoc = Utils.createResourseWithImage(curUserID, userDoc.TopElem.fullname, file.FileName, file);

	return Utils.setSuccess(Utils.toJSObject(resDoc.TopElem));
}

function delete_File(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var resId = data.GetOptProperty('id');

	if (resId != undefined) {
		try {
			DeleteDoc(UrlFromDocID(Int(resId)));
			return Utils.setSuccess();
		} catch(e) {
			return Utils.setError(e);
		}
	}

	return Utils.setError('Unknown parameters');	
}

%>