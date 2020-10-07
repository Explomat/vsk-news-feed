import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Icon, Input, Button, Tooltip, Modal } from 'antd';
import Rate from '../components/rate';
import IconText from '../components/iconText';
import createBaseUrl from '../../utils/request';
import { Link } from 'react-router-dom';

import { getIdeas, removeIdea, newIdea, rateIdea } from './ideasActions';
import './index.css';


class Ideas extends Component {

	constructor(props){
		super(props);

		this.handleChangeAddTitle = this.handleChangeAddTitle.bind(this);
		this.handleChangeAddDescription = this.handleChangeAddDescription.bind(this);
		this.handleAdd = this.handleAdd.bind(this);
		this.handleToggleNewIdea = this.handleToggleNewIdea.bind(this);
		//this.handleNewSubmit = this.handleNewSubmit.bind(this);

		this.state = {
			isShowNewIdea: false,
			addTextTitle: '',
			addTextDescription: '',
			addFile: null
		}

		this.formRef = React.createRef();
	}

	componentDidMount(){
		const { match, getIdeas } = this.props;
		getIdeas(match.params.id);
	}

	handleToggleNewIdea() {
		this.setState({
			isShowNewIdea: !this.state.isShowNewIdea
		});
	}

	/*handleNewSubmit(e) {
		e.preventDefault();
		const formData = new FormData(this.formRef.current);
		const { match, newIdea} = this.props;

		newIdea(formData, match.params.id);

		this.setState({
			addTextTitle: '',
			addTextDescription: ''
		});
	}*/

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

	handleAdd() {
		const { addTextTitle, addTextDescription } = this.state;
		const { match, newIdea} = this.props;

		newIdea(addTextTitle, addTextDescription, match.params.id);

		this.setState({
			addTextTitle: '',
			addTextDescription: '',
			isShowNewIdea: false
		});
	}

	render() {
		const { meta, ideas, match, removeIdea, rateIdea } = this.props;
		const { isShowNewIdea, addTextTitle, addTextDescription } = this.state;

		return (
			<div className='ideas'>
				<h4 className='ideas__title'>Идеи {ideas.length}</h4>

				<div className='ideas__ideas-list-container'>
					{ideas.map(item => {
						return (
							<div key={item.id} className='ideas__idea-list'>
								<div className='ideas__idea-list_header'>
									<Link to={`/topics/${match.params.id}/ideas/${item.id}`}>
										<Icon type='alert' className='ideas__idea-list_body_icon'/>
										<span>{item.title}</span>
									</Link>
									<span className='ideas__idea-list_body_pubish-date'>{new Date(item.publish_date).toLocaleDateString()}</span>
								</div>
								<div className='ideas__idea-list_footer'>
									<Rate text={parseInt(item.rate, 10)} className='ideas__idea-list_icon-text' disabled={item.meta.isRated} onChange={val => rateIdea(item.id, val)}/>
									<Tooltip title='Комментарии'>
										<span>
											<IconText type='message' text={item.comments_count}/>
										</span>
									</Tooltip>
									{item.meta.canDelete &&
										<Tooltip title='Удалить'>
											<span>
												<IconText type='delete' className='ideas__idea-list_footer_delete' onClick={() => {
													if (window.confirm(`Вы действительно хотите удалить идею "${item.title} ?"`)) {
														removeIdea(item.id);
													}
												}}/>
											</span>
										</Tooltip>
									}
									<span className='ideas__idea-list_footer-descr'>
										<span>{item.author_fullname}</span>
									</span>
								</div>
							</div>
						);
					})}
				</div>
				<Button type='primary' className='ideas__new_button' onClick={this.handleToggleNewIdea}>Подать идею</Button>

				{meta.canAdd && 
					<Modal
						title='Придумайте идею'
						okText='Подать'
						okButtonProps={{
							disabled: !(addTextTitle.trim() && addTextDescription.trim())
						}}
						cancelText='Отмена'
						visible={isShowNewIdea}
						onCancel={this.handleToggleNewIdea}
						onOk={this.handleAdd}
					>
						<div className='ideas__new'>
							<h4>Добавить новую идею</h4>
							<div>
								<Input name='title' className='ideas__new_title' value={addTextTitle} placeholder='Название' onChange={this.handleChangeAddTitle}/>
								<Input.TextArea name='description' className='ideas__new_description' value={addTextDescription} placeholder='Описание' onChange={this.handleChangeAddDescription}/>
								{/*<UploadButton accept='image/x-png,image/gif,image/jpeg'/>*/}
							</div>
						</div>
					</Modal>
				}
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		ideas: state.ideas.list,
		meta: state.ideas.meta
	}
}

export default withRouter(connect(mapStateToProps, { getIdeas, removeIdea, newIdea, rateIdea })(Ideas));