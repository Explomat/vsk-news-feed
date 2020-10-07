import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PageHeader, Icon, Card, Input, Button, Tooltip } from 'antd';
import Rate from '../components/rate';
import Comments from '../comments';
import { getIdea, onChange, onResetEdit, saveIdea, rateIdea } from './ideasActions';
import './index.css';


class Idea extends Component {

	constructor(props){
		super(props);

		this.handleToggleEdit = this.handleToggleEdit.bind(this);
		this.handleChangeTitle = this.handleChangeTitle.bind(this);
		this.handleChangeDescription = this.handleChangeDescription.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleCancelEdit = this.handleCancelEdit.bind(this);

		this.state = {
			isEdit: false
		}
	}

	componentDidMount(){
		const { getIdea, match } = this.props;
		getIdea(match.params.id);
	}

	handleCancelEdit() {
		const { onResetEdit } = this.props;
		onResetEdit();

		this.handleToggleEdit();
	}

	handleSave() {
		const { idea, saveIdea } = this.props;
		saveIdea(idea.id);

		this.handleToggleEdit();
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

	handleToggleEdit() {
		this.setState({
			isEdit: !this.state.isEdit
		});
	}

	render() {
		const { history, idea, rateIdea } = this.props;
		const { isEdit } = this.state;

		return (
			<div className='idea'>
				<div className='idea__body'>
					{isEdit ? (
						<div className='idea__body_edit'>
							<h3>Редактирование</h3>
							<Input className='idea__body_edit_title' value={idea.title} onChange={this.handleChangeTitle} />
							<Input.TextArea className='idea__body_edit_description' autoSize={{ minRows: 2, maxRows: 6 }} value={idea.description} onChange={this.handleChangeDescription} />
							
							<div className='idea__header_buttons'>
								<Button size='small' className='idea__header_cancel-button' onClick={this.handleCancelEdit}>Отмена</Button>
								<Button type='primary' size='small' className='idea__header_save-button' disabled={idea.title.trim() === '' || idea.description.trim() === ''} onClick={this.handleSave}>Сохранить</Button>
							</div>
							<div className='clearfix' />
						</div>
					): (
						<div>
							<PageHeader
								className='idea__topic-container'
								onBack={history.goBack}
								title={
									<div className='idea__topic'>
										{idea.topic_image_id && <img className='idea__topic_image' src={`/download_file.html?file_id=${idea.topic_image_id}`} />}
										<h3 className='idea__topic_title'>{idea.topic_title}</h3>
									</div>
								}
							/>
							<PageHeader
								title={<h4 className='idea__body_title'>{idea.title}</h4>}
								subTitle={
									<span>
										<span className='idea__header_author-fullname'>
											{idea.author_fullname}
										</span>
										<span className='idea__header_publish-date'>{new Date(idea.publish_date).toLocaleDateString()}</span>
									</span>
								}
								extra={[
									(!isEdit && (idea.meta && idea.meta.canEdit) &&
										<Tooltip key='edit' title='Редактировать'>
											<Icon type='edit' onClick={this.handleToggleEdit} />
										</Tooltip>),
									<Rate key='rate' text={parseInt(idea.rate, 10)} className='icon-text' disabled={idea.meta && idea.meta.isRated} onChange={val => rateIdea(idea.id, val)}/>
								]}
							/>
							<div className='idea__body_description'>{idea.description}</div>
						</div>
					)}
					
				</div>
				<div className='idea__footer'>
					<Comments/>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		idea: state.ideas.currentIdea
	}
}

export default connect(mapStateToProps, { getIdea, onChange, onResetEdit, saveIdea, rateIdea })(Idea);