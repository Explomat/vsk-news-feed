function _toBoolean(val) {
	if (val == 'true') {
		return true;
	}

	if (val == true) {
		return true;
	}

	return false;
}

function _getModeratorActions(user_id) {
	var actions = [];

	var actionsq = XQuery("sql: \n\
		select ccia.action \n\
		from cc_news_feeds_roles ccir \n\
		inner join cc_news_feeds_moderators ccim on ccim.role_id = ccir.id \n\
		inner join cc_news_feeds_actions ccia on ccia.role_id = ccim.role_id \n\
		where \n\
			ccim.user_id = " + user_id + " \n\
			and ccia.object_type = 'cc_news_feeds_topic'");

	for (el in actionsq) {
		actions.push(String(el.action));
	}

	return actions;
}

function _setComputedFields(obj, user_id) {
	var l = ArrayOptFirstElem(XQuery("sql: \n\
		select id \n\
		from cc_news_feeds_likes \n\
		where \n\
			object_type = 'cc_news_feeds_topic' \n\
			and object_id = " + obj.id + " \n\
			and user_id = " + user_id + " \n\
	"));

	var c = ArrayOptFirstElem(XQuery("sql: \n\
		select count(id) comments_count \n\
		from cc_news_feeds_comments \n\
		where topic_id = " + obj.id + " \n\
	"));

	var actions = _getModeratorActions(user_id);

	obj.publish_date = StrXmlDate(DateNewTime(Date(obj.publish_date)));
	obj.is_archive = _toBoolean(obj.is_archive);
	obj.comments_count = Int(c.comments_count);

	obj.meta = {
		//isRated: (l != undefined || obj.is_archive),
		isLiked: l != undefined,
		canLike: !obj.is_archive,
		canActivate: (ArrayOptFind(actions, "This == 'update'") != undefined && obj.is_archive),
		canEdit: (ArrayOptFind(actions, "This == 'update'")),
		canDelete: (ArrayOptFind(actions, "This == 'remove'"))
	}

	return obj;
}

function create(title, description, image_id, author_id, author_fullname) {
	var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

	var topicDoc = tools.new_doc_by_name('cc_news_feeds_topic');
	topicDoc.TopElem.title = title;
	topicDoc.TopElem.description = description;
	topicDoc.TopElem.image_id = image_id;
	topicDoc.TopElem.likes = 0;
	topicDoc.TopElem.views = 0;
	topicDoc.TopElem.publish_date = new Date();
	topicDoc.TopElem.author_id = author_id;
	topicDoc.TopElem.author_fullname = author_fullname;
	topicDoc.TopElem.is_archive = true;
	topicDoc.TopElem.is_anchor = false;

	topicDoc.BindToDb();
	topicDoc.Save();
	return _setComputedFields(Utils.toJSObject(topicDoc.TopElem), author_id);
}

function update(id, data, user_id) {
	var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

	var topicDoc = null;

	try {
		topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	} catch(e) {
		throw 'Невозможно обновить документ. Ошибка: ' + e;
	}

	for (el in data) {
		try {
			field = topicDoc.TopElem.OptChild(el);
			field.Value = data[el];
		} catch(e) {
			alert(e);
		}
	}

	topicDoc.Save();
	return _setComputedFields(Utils.toJSObject(topicDoc.TopElem), user_id);
}

function remove(id) {
	var Comments = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/comment.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/comment.js');

	var qcomments = XQuery("sql: \n\
		select id \n\
		from \n\
			cc_news_feeds_comments \n\
		where topic_id = " + id);

	for (elc in qcomments) {
		try {
			Comments.remove(elc.id);
		} catch(e) {}
	}

	var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	var resId = topicDoc.TopElem.image_id;
	if (resId != null && resId != undefined && resId != '') {
		DeleteDoc(UrlFromDocID(Int(resId)));
	}
	DeleteDoc(UrlFromDocID(Int(id)));
}

function list(id, user_id, search, status, minRow, maxRow, pageSize, sort, sortDirection) {
	var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

	if (id == undefined) {
		var st = 3;
		if (status == 'active') {
			st = 0;
		} else if (status == 'archive') {
			st = 1;
		}

		var l = XQuery("sql: \n\
			declare @s varchar(max) = '" + search + "'; \n\
			declare @status int = " + st + " \n\
			select d.* \n\
			from ( \n\
				select \n\
					c.*, \n\
					row_number() over (order by c." + sort + " " + sortDirection + ") as [row_number] \n\
				from ( \n\
					select \n\
						count(cceit.id) over() total, \n\
						cceit.*, \n\
						(select count(id) from cc_news_feeds_comments where topic_id = cceit.id) comments_count \n\
					from \n\
						cc_news_feeds_topics cceit \n\
					where \n\
						cceit.title like '%'+@s+'%' \n\
						and (cceit.is_archive = @status or @status = 3) \n\
				) c \n\
			) d \n\
			where \n\
				d.[row_number] > " + minRow + " and d.[row_number] <= " + maxRow + " \n\
			order by d." + sort + " " + sortDirection
		);

		var larr = Utils.toJSArray(l);
		for (el in larr) {
			_setComputedFields(el, user_id);
		}

		var total = 0;
		var fobj = ArrayOptFirstElem(l);
		if (fobj != undefined) {
			total = fobj.total;
		}

		var actions = _getModeratorActions(user_id);
		var isModerator = Utils.isUserModerator(user_id);
		var obj = {
			meta: {
				total: Int(total),
				pageSize: pageSize,
				canAdd: (ArrayOptFind(actions, "This == 'add'") != undefined),
				isModerator: isModerator
			},
			topics: larr
		}
		return obj;
	}

	var el = ArrayOptFirstElem(
		XQuery("sql: \n\
		select \n\
			cceit.* \n\
		from \n\
			cc_news_feeds_topics cceit \n\
		where \n\
			cceit.id = " + id)
	);

	var lobj = _setComputedFields(Utils.toJSObject(el), user_id);
	return {
		topics: lobj,
		meta: {}
	}
}

function rate(id, user_id, value) {
	var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

	function getRate() {
		return ArrayOptFirstElem(XQuery("sql: \n\
			select isnull(sum([value]), 0) rate_sum, isnull(count(id), 0) rate_count \n\
			from cc_news_feeds_ratings \n\
			where \n\
				object_type = 'cc_news_feeds_topic' \n\
				and object_id = " + id)
		);
	}

	var l = ArrayOptFirstElem(XQuery("sql: \n\
		select id, value \n\
		from cc_news_feeds_ratings \n\
		where \n\
			object_type = 'cc_news_feeds_topic' \n\
			and object_id = " + id + " \n\
			and user_id = " + user_id + " \n\
	"));

	if (l == undefined) {
		var rateDoc = tools.new_doc_by_name('cc_news_feeds_rating');
		rateDoc.TopElem.object_type = 'cc_news_feeds_topic';
		rateDoc.TopElem.object_id = id;
		rateDoc.TopElem.user_id = user_id;
		rateDoc.TopElem.value = value;
		rateDoc.BindToDb();
		rateDoc.Save();
	} else {
		var rateDoc = OpenDoc(UrlFromDocID(Int(l.id)));
		rateDoc.TopElem.value = value;
		rateDoc.Save();
	}

	var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	var r = getRate();
	topicDoc.TopElem.rate = Utils.computeRate(Int(r.rate_sum), Int(r.rate_count));
	topicDoc.Save();
	return _setComputedFields(Utils.toJSObject(topicDoc.TopElem), user_id);
}

function archive(id, user_id, is_archive) {
	var Comments = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/comment.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/comment.js');

	var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

	var qcomments = XQuery("sql: \n\
		select id \n\
		from \n\
			cc_news_feeds_comments \n\
		where topic_id = " + id);

	for (elc in qcomments) {
		try {
			Comments.archive(elc.id, user_id, is_archive);
		} catch(e) {}
	}

	var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	topicDoc.TopElem.is_archive = is_archive;
	topicDoc.Save();

	return _setComputedFields(Utils.toJSObject(topicDoc.TopElem), user_id);
}

function incrementViews(topic_id, user_id) {
	var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

	var viewDoc = tools.new_doc_by_name('cc_news_feeds_view');
	viewDoc.TopElem.object_type = 'cc_news_feeds_topic';
	viewDoc.TopElem.object_id = topic_id;
	viewDoc.TopElem.user_id = user_id;
	viewDoc.BindToDb();
	viewDoc.Save();

	var topicDoc = OpenDoc(UrlFromDocID(Int(topic_id)));
	topicDoc.TopElem.views = topicDoc.TopElem.views + 1;
	topicDoc.Save();
	return _setComputedFields(Utils.toJSObject(topicDoc.TopElem), user_id);
}


function like(topic_id, user_id) {
	var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/news-feeds/server/utils.js');

	var l = ArrayOptFirstElem(XQuery("sql: \n\
		select id \n\
		from cc_news_feeds_likes \n\
		where \n\
			object_type = 'cc_news_feeds_topic' \n\
			and object_id = " + topic_id + " \n\
			and user_id = " + user_id + " \n\
	"));

	if (l == undefined) {
		var likeDoc = tools.new_doc_by_name('cc_news_feeds_like');
		likeDoc.TopElem.object_type = 'cc_news_feeds_topic';
		likeDoc.TopElem.object_id = topic_id;
		likeDoc.TopElem.user_id = user_id;
		likeDoc.BindToDb();
		likeDoc.Save();

		var topicDoc = OpenDoc(UrlFromDocID(Int(topic_id)));
		topicDoc.TopElem.likes = topicDoc.TopElem.likes + 1;
		topicDoc.Save();
		return _setComputedFields(Utils.toJSObject(topicDoc.TopElem), user_id);
	}

	DeleteDoc(UrlFromDocID(Int(l.id)));

	var topicDoc = OpenDoc(UrlFromDocID(Int(topic_id)));
	topicDoc.TopElem.likes = topicDoc.TopElem.likes - 1;
	topicDoc.Save();

	return _setComputedFields(Utils.toJSObject(topicDoc.TopElem), user_id);
}

function isAccessToRate(id) {
	var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	return !topicDoc.TopElem.is_archive;
}

function isAccessToActivate(id, user_id) {
	var actions = _getModeratorActions(user_id);
	var updateAction = ArrayOptFind(actions, "This == 'update'");
	var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	return (updateAction != undefined && topicDoc.TopElem.is_archive);
}

function isAccessToUpdate(id, user_id) {
	var actions = _getModeratorActions(user_id);
	var updateAction = ArrayOptFind(actions, "This == 'update'");
	//var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	return updateAction != undefined;
	//return (updateAction != undefined && !topicDoc.TopElem.is_archive);
}

function isAccessToRemove(id, user_id) {
	var actions = _getModeratorActions(user_id);
	var removeAction = ArrayOptFind(actions, "This == 'remove'");
	//var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	return removeAction != undefined;
	//return (removeAction != undefined && !topicDoc.TopElem.is_archive);
}

function isAccessToAdd(user_id) {
	var actions = _getModeratorActions(user_id);
	var addAction = ArrayOptFind(actions, "This == 'add'");
	return (addAction != undefined);
}

function isAccessToLike(id) {
	var topicDoc = OpenDoc(UrlFromDocID(Int(id)));
	return !topicDoc.TopElem.is_archive;
}