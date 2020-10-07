function toJSON(data){
	return tools.object_to_text(data, 'json');
}

function log(message){
	EnableLog('news-feeds');
	LogEvent('news-feeds', message);
}

function setMessage(type, message){
	return {
		type: type,
		message: String(message)
	}
}

function setSuccess(data){
	var m = setMessage('success');
	m.data = data;
	return toJSON(m);
}

function setError(message){
	log(message);
	return toJSON(setMessage('error', message));
}

function notificate(templateCode, primaryId, text, secondaryId){
	tools.create_notification(templateCode, primaryId, text, secondaryId);
}

function toJSObject(xmlElem) {
	var returnObj = {};
	for (el in xmlElem){
		try {
			returnObj.SetProperty(el.Name, String(el.Value));
		} catch(e) {}
	}
	return returnObj;
}

function toJSArray(xmlArray) {
	var returnArr = [];

	for (el in xmlArray) {
		returnArr.push(toJSObject(el));
	}

	return returnArr;
}

function listToTree(list, sortFieldName) {

	function sortTree(_tree, fieldName){
		_tree = ArraySort(_tree, fieldName, '+');
		var queue = [];
		for (var i = 0; i < _tree.length; i++) {
			queue.push(_tree[i]);
		}
		var index = queue.length - 1;

		while (index >= 0) {
			u = queue[index];
			index = index - 1;

			if (u.GetOptProperty('children') == undefined) {
				u.SetProperty('children', []);
			}

			u.children = ArraySort(u.children, fieldName, '+');
			for (i = 0; i < u.children.length; i++) {
				index = index + 1;
				queue[index] = u.children[i];
			}
		}
		return _tree;
	}

	var map = {};
	var roots = [];

	for (i = 0; i < list.length; i += 1) {
		map[list[i].id] = i;
	}

	for (i = 0; i < list.length; i += 1) {
		node = list[i];

		parentId = node.GetOptProperty('parent_id');
		if (parentId != '' && parentId != undefined) {
			l = list[map[node.parent_id]];
			if (l.GetOptProperty('children') == undefined) {
				l.SetProperty('children', []);
			}
			l.children.push(node);
		} else {
			roots.push(node);
		}
	}
	return sortTree(roots, sortFieldName);
}

function createResourseWithImage(userId, userFullname, fileName, imageBinary) {
	fileName = String(fileName);
	var fileTypeIndex = fileName.indexOf('.');
	var fileType = fileName.substr(fileTypeIndex, fileName.length);

	var docResource = tools.new_doc_by_name('resource'); 
	docResource.TopElem.code = 'news-feeds';
	docResource.TopElem.person_id = userId; 
	docResource.TopElem.allow_unauthorized_download = true;
	docResource.TopElem.allow_download = true;
	docResource.TopElem.file_name = fileName;
	docResource.TopElem.name = fileName;
	docResource.TopElem.type = fileType;
	docResource.TopElem.person_fullname = userFullname;
	docResource.BindToDb();
	docResource.TopElem.put_str(imageBinary, fileName); 
	docResource.Save();

	return docResource;
}

function computeRate(value, count) {
	return value / count;
}

function getModeratorActions(user_id, object_type) {
	var actions = [];

	var actionsq = XQuery("sql: \n\
		select ccia.action \n\
		from cc_news_feeds_roles ccir \n\
		inner join cc_news_feeds_moderators ccim on ccim.role_id = ccir.id \n\
		inner join cc_news_feeds_actions ccia on ccia.role_id = ccim.role_id \n\
		where \n\
			ccim.user_id = " + user_id + " \n\
			and ccia.object_type = '" + object_type + "'");

	for (el in actionsq) {
		actions.push(String(el.action));
	}

	return actions;
}

function isUserModerator(user_id) {
	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select ccir.id \n\
		from cc_news_feeds_roles ccir \n\
		inner join cc_news_feeds_moderators ccim on ccim.role_id = ccir.id \n\
		where \n\
			ccim.user_id = " + user_id + " \n\
			and ccir.code = 'moderator'"));

	return (q != undefined); 
}