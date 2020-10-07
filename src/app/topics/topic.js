import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PageHeader, Icon, Card, Input, Button, Tooltip, Tag } from 'antd';
import UploadFile from  '../components/uploadFile';
import { createBaseUrl } from '../../utils/request';
import toBoolean from '../../utils/toBoolean';
import Comments from '../comments';
import IconText from '../components/iconText';
import { getTopic, saveTopic, archiveTopic, likeTopic, onChange, onResetEdit } from './topicsActions';
import './index.css';


class Topic extends Component {

	constructor(props){
		super(props);

		this.handleToggleEdit = this.handleToggleEdit.bind(this);
		this.handleChangeTitle = this.handleChangeTitle.bind(this);
		this.handleChangeDescription = this.handleChangeDescription.bind(this);
		this.handleChangeStatus = this.handleChangeStatus.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleUploadFile = this.handleUploadFile.bind(this);
		this.handleRemoveFile = this.handleRemoveFile.bind(this);
		this.handleCancelEdit = this.handleCancelEdit.bind(this);
		this.handleLike = this.handleLike.bind(this);

		this.state = {
			isEdit: false
		}
	}

	componentDidMount(){
		const { getTopic, match } = this.props;
		getTopic(match.params.id);
	}

	handleCancelEdit() {
		const { onResetEdit } = this.props;
		onResetEdit();

		this.handleToggleEdit();
	}

	handleUploadFile(f) {
		const { onChange } = this.props;

		onChange({
			image_id: f.id
		});
	}

	handleRemoveFile() {
		const { onChange } = this.props;

		onChange({
			image_id: ''
		});
	}

	handleToggleEdit() {
		this.setState({
			isEdit: !this.state.isEdit
		});
	}

	handleChangeTitle(e) {
		const { onChange } = this.props;

		onChange({
			title: e.target.value
		});
	}

	handleChangeDescription(e) {
		const { onChange } = this.props;

		onChange({
			description: e.target.value
		});
	}

	handleChangeStatus(isArchive) {
		const { topic, archiveTopic } = this.props;
		archiveTopic(topic.id, isArchive);
	}

	handleSave() {
		const { topic, saveTopic } = this.props;
		saveTopic(topic.id);

		this.handleToggleEdit();
	}

	handleLike() {
		const { topic, likeTopic } = this.props;

		if (topic.meta.canLike) {
			likeTopic(topic.id);
		}
	}

	render() {
		const { topic, ui, history } = this.props;
		const { isEdit } = this.state;

		if (ui.isLoading) {
			return null;
		}

		return (
			<div className='topic'>
				<div className='topic__header'>
					{/*<span className='topic__header_author-fullname'>
						{topic.author_fullname}
					</span>
					<span className='topic__header_publish-date'>{topic.publish_date}</span>
					{!isEdit && (topic.meta && topic.meta.canEdit) && <Icon type='edit' className='topic__header_edit-icon' onClick={this.handleToggleEdit} />}
					{isEdit && <Button type='primary' size='small' className='topic__header_save-button' onClick={this.handleSave}>Сохранить</Button>}*/}
				</div>
				<div className='topic__body'>
					{isEdit ? (
						<div className='topic__body_edit'>
							<h3>Редактирование</h3>
							<Input className='topic__body_edit_title' value={topic.title} onChange={this.handleChangeTitle} />
							<Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} className='topic__body_edit_description' value={topic.description} onChange={this.handleChangeDescription} />
							<UploadFile
								className='topic__body_edit_file'
								url={createBaseUrl('File')}
								accept='image/x-png,image/gif,image/jpeg'
								disabled={!!topic.image_id}
								fileList={ !!topic.image_id ? [{id: topic.image_id}] : null}
								onSuccess={this.handleUploadFile}
								onRemove={this.handleRemoveFile}
							/>

							<div className='topic__header_buttons'>
								<Button size='small' className='topic__header_cancel-button' onClick={this.handleCancelEdit}>Отмена</Button>
								<Button disabled={topic.title.trim() === '' || topic.description.trim() === ''} type='primary' size='small' className='topic__header_save-button' onClick={this.handleSave}>Сохранить</Button>
							</div>
							<div className='clearfix' />
						</div>
					) : (
						<div>
							<PageHeader
								onBack={history.goBack}
								title={<h3 className='topic__body_title'>{topic.title}</h3>}
								subTitle={
									<span>
										<span className='topic__header_container'>
											{/*<span className='topic__header_author-fullname'>
												{topic.author_fullname}
											</span>*/}
											<span className='topic__header_publish-date'>{new Date(topic.publish_date).toLocaleDateString()}</span>
										</span>
										{toBoolean(topic.is_archive) ?
											(
												<span>
													<Tag className='topic__body_status' color='orange'>В архиве</Tag>
													<Button type='primary' size='small' onClick={() => this.handleChangeStatus(false)}>Активировать</Button>
												</span>
											)
											: (topic.meta && topic.meta.canEdit && <Button type='primary' size='small' onClick={() => this.handleChangeStatus(true)}>Переместить в архив</Button>)
										}
									</span>
								}
								extra={
									(!isEdit && (topic.meta && topic.meta.canEdit) && (
											<Tooltip title='Реактировать'>
												<IconText type='edit' onClick={this.handleToggleEdit} />
											</Tooltip>
										)
									)
								}
							/>
							{topic.image_id && <img className='topic__image' src={`/download_file.html?file_id=${topic.image_id}`} />}
							<div className='topic__body_description' dangerouslySetInnerHTML={{ __html: topic.description}} />
							{(!isEdit && (topic.meta && topic.meta.canEdit) && (
								<div>
									<Tooltip title='Просмотры'>
										<span>
											<IconText type='eye' text={topic.views}/>
										</span>
									</Tooltip>
									<Tooltip title='Лайки'>
										<span>
											<IconText
												type='like'
												theme={topic.meta.isLiked ? 'filled' : ''}
												onClick={() => this.handleLike()}
												text={topic.likes}
											/>
										</span>
									</Tooltip>
								</div>
							))}
						</div>
					)}
				</div>
				<div className='topic__footer'>
					<Comments/>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		topic: state.topics.currentTopic,
		ui: state.topics.ui
	}
}

export default connect(mapStateToProps, { getTopic, saveTopic, archiveTopic, likeTopic, onChange, onResetEdit })(Topic);