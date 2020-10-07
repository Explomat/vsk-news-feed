import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Card, Input, Button, Tooltip, Select, Tag, Pagination } from 'antd';
//import Rate from '../components/rate';
import IconText from '../components/iconText';
import UploadFile from  '../components/uploadFile';
import { createBaseUrl } from '../../utils/request';
import { Link } from 'react-router-dom';
import { getTopics, removeTopic, newTopic, likeTopic, onChangeMeta } from './topicsActions';
import toBoolean from '../../utils/toBoolean';
import unnamedImage from '../../images/unnamed_image.png';
import './index.css';

class Topics extends Component {

	constructor(props){
		super(props);

		this.handleChangeAddTitle = this.handleChangeAddTitle.bind(this);
		this.handleChangeAddDescription = this.handleChangeAddDescription.bind(this);
		this.handleNewSubmit = this.handleNewSubmit.bind(this);
		this.handleUploadFile = this.handleUploadFile.bind(this);
		this.handleRemoveFile = this.handleRemoveFile.bind(this);
		this.handleChangeSearchText = this.handleChangeSearchText.bind(this);
		this.handleChangeStatusText = this.handleChangeStatusText.bind(this);
		this.handleChangePagination = this.handleChangePagination.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleChangeSort = this.handleChangeSort.bind(this);
		this.handleLike = this.handleLike.bind(this);

		this.state = {
			addTextTitle: '',
			addTextDescription: '',
			addFile: null,
			isAddFileUploaded: false
		}
		//this.formRef = React.createRef();
	}

	componentDidMount(){
		const { meta } = this.props;
		this.props.getTopics(meta.searchText, meta.statusText, meta.page, meta.sort, meta.sortDirection);
	}

	_createDescription(descr) {
		const span = document.createElement('span');
		span.innerHTML = descr;
		const d = span.textContent || span.innerText;
		return d.length > 188 ? d.substring(0, 185) + '...' : d;
	}

	handleChangeSort(val) {
		const { onChangeMeta, getTopics, meta } = this.props;
		const [ sort, sortDirection ] = val.split(':');

		onChangeMeta({
			sort,
			sortDirection
		});

		getTopics(meta.searchText, meta.statusText, 1, sort, sortDirection);
	}

	handleChangeSearchText(e) {
		const { onChangeMeta, meta } = this.props;
		onChangeMeta({
			searchText: e.target.value,
			page: 1
		});
	}

	handleChangeStatusText(statusText) {
		const { onChangeMeta, getTopics, meta } = this.props;
		onChangeMeta({
			statusText,
			page: 1
		});

		getTopics(meta.searchText, statusText, 1, meta.sort, meta.sortDirection);
	}

	handleChangePagination(page, pageSize) {
		const { onChangeMeta, getTopics, meta } = this.props;
		onChangeMeta({
			page,
			pageSize
		});

		getTopics(meta.searchText, meta.statusText, page, meta.sort, meta.sortDirection);
	}

	handleSearch(val) {
		const { onChangeMeta, getTopics, meta } = this.props;
		onChangeMeta({
			page: 1
		});

		getTopics(meta.searchText, meta.statusText, 1, meta.sort, meta.sortDirection);
	}

	handleUploadFile(f) {
		this.setState({
			addFile: f,
			isAddFileUploaded: true
		});
	}

	handleRemoveFile() {
		if (this.state.addFile) {
			this.setState({
				isAddFileUploaded: false,
				addFile: null
			});
		}
	}

	handleNewSubmit(e) {
		/*e.preventDefault();
		const formData = new FormData(this.formRef.current);
		const { newTopic} = this.props;
		newTopic(formData);

		this.setState({
			addTextTitle: '',
			addTextDescription: ''
		});*/

		const { newTopic} = this.props;
		const { addTextTitle, addTextDescription, addFile } = this.state;
		newTopic(addTextTitle, addTextDescription, addFile);

		this.setState({
			addTextTitle: '',
			addTextDescription: '',
			addFile: null
		});
	}

	handleChangeAddTitle(e) {
		this.setState({
			addTextTitle: e.target.value
		});
	}

	handleChangeAddDescription(e) {
		this.setState({
			addTextDescription: e.target.value
		});
	}

	handleLike(item) {
		if (item.meta.canLike) {
			this.props.likeTopic(item.id);
		}
	}

	render() {
		const { meta, topics, removeTopic } = this.props;
		const { addTextTitle, addTextDescription, addFile, isAddFileUploaded } = this.state;

		return (
			<div className='topics-container'>
				<div className='topics-container__title'>Новостная лента</div>
				<div className='topics'>
					<div className='topics__filters'>
						<Input
							className='topics__filters_search'
							placeholder='Поиск по заголовку новости'
							prefix={<Icon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />}
							onPressEnter={this.handleSearch}
							onChange={this.handleChangeSearchText}
							value={meta.searchText}
						/>
						{meta.isModerator && <Select
							className='topics__filters_status'
							value={meta.statusText}
							onSelect={this.handleChangeStatusText}
						>
							<Select.Option value='all'>Все темы</Select.Option>
							<Select.Option value='active'>Активные</Select.Option>
							<Select.Option value='archive'>Архивные</Select.Option>
						</Select>}
						{/*<Select
							className='topics__filters_sort'
							value={`${meta.sort}:${meta.sortDirection}`}
							onSelect={this.handleChangeSort}
						>
							<Select.Option value='title:asc'>По названию +</Select.Option>
							<Select.Option value='title:desc'>По названию -</Select.Option>
							<Select.Option value='publish_date:asc'>По дате +</Select.Option>
							<Select.Option value='publish_date:desc'>По дате -</Select.Option>
							<Select.Option value='comments_count:asc'>По популярности +</Select.Option>
							<Select.Option value='comments_count:desc'>По популярности -</Select.Option>
						</Select>*/}
					</div>
					{topics.map(item => {
						return (
							<div key={item.id} className='topics__topic-list'>
								<Link to={`/topics/${item.id}`}>
									{item.image_id ?
										<div className='topics__topic-list_image' style={{ backgroundImage: `url(/download_file.html?file_id=${item.image_id})` }} />
										: <div className='topics__topic-list_image' style={{ backgroundImage: `url(${unnamedImage})` }} />
									}
									{toBoolean(item.is_archive) && <Tag className='topics__topic-list_status' color='#f50'>В архиве</Tag>}
									<div className='topics__topic-list_header'>
										<div className='topics__topic-list_body_pubish-date'>{new Date(item.publish_date).toLocaleDateString()}</div>
										<div className='topics__topic-list_body_title'>{item.title}</div>
									</div>
									<div className='topics__topic-list_body'>{this._createDescription(item.description)}</div>
								</Link>
								<div className='topics__topic-list_footer'>
									{/*<Rate text={parseInt(item.rate, 10)} className='icon-text' disabled={item.meta.isRated} onChange={val => rateTopic(item.id, val)}/>*/}
									
									<Tooltip title='Просмотры'>
										<span>
											<IconText type='eye' text={item.views}/>
										</span>
									</Tooltip>
									<Tooltip title='Лайки'>
										<span>
											<IconText
												type='like'
												theme={item.meta.isLiked ? 'filled' : ''}
												onClick={() => this.handleLike(item)}
												text={item.likes}
											/>
										</span>
									</Tooltip>
									<Tooltip title='Комментарии'>
										<span>
											<IconText type='aliwangwang' text={item.comments_count}/>
										</span>
									</Tooltip>
									{item.meta.canDelete &&
										<Tooltip title='Удалить'>
											<span>
												<IconText type='delete' className='topics__topic-list_footer_delete' onClick={() => {
													if (window.confirm(`Вы действительно хотите удалить тему "${item.title} ?"`)) {
														removeTopic(item.id);
													}
												}}/>
											</span>
										</Tooltip>
									}
									{/*<span className='topics__topic-list_footer-descr'>
										<span>{item.author_fullname}</span>
									</span>*/}
								</div>
							</div>
						);
					})}
				</div>
				<Pagination
					defaultCurrent={1}
					current={meta.page}
					pageSize={meta.pageSize}
					total={meta.total}
					onChange={this.handleChangePagination}
				/>
				{meta.canAdd && <div className='topics__new'>
					<h4>Добавить новость</h4>
					<Input name='title' className='topics__new_title' value={addTextTitle} placeholder='Название' onChange={this.handleChangeAddTitle}/>
					<Input.TextArea name='description' className='topics__new_description' value={addTextDescription} placeholder='Описание' onChange={this.handleChangeAddDescription}/>
					<UploadFile
						url={createBaseUrl('File')}
						accept='image/x-png,image/gif,image/jpeg'
						disabled={isAddFileUploaded}
						onSuccess={this.handleUploadFile}
						onRemove={this.handleRemoveFile}
					/>
					<Button disabled={!(addTextTitle.trim() && addTextDescription.trim())} onClick={this.handleNewSubmit}>Добавить</Button>
				</div>}
			</div>	
		);
	}
}

function mapStateToProps(state){
	return {
		topics: state.topics.list,
		meta: state.topics.meta
	}
}

export default connect(mapStateToProps, { getTopics, removeTopic, newTopic, likeTopic, onChangeMeta })(Topics);