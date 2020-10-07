import React, { Component } from 'react';
import { Icon } from 'antd';
import './index.css';

class UploadButton extends Component {

	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
		this.state = {
			filename: ''
		}
	}

	handleChange(e) {
		if (e.target.files.length) {
			this.setState({
				filename: e.target.files[0].name
			});

			const { onChange } = this.props;
			if (onChange) {
				onChange(e.target.files[0]);
			}
		}
	}

	render() {
		const { accept } = this.props;
		const { filename } = this.state;

		return (
			<div className='upload-file'>
				<span className=''>
					<div className='ant-upload ant-upload-select ant-upload-select-text'>
						<span tabIndex='0' className='ant-upload' role='button'>
							<input
								id='upload_file_button'
								type='file'
								name='file'
								accept={accept}
								style={{display: 'none'}}
								onChange={this.handleChange}
							/>
							<label htmlFor='upload_file_button' className='ant-btn learnings-upload-file'>
								<Icon type='upload' />
								<span> Загрузить файл</span>
							</label>
							<span className='upload-file__filename'>{filename}</span>
						</span>
					</div>
					<div className='ant-upload-list ant-upload-list-text'></div>
				</span>
			</div>
		);
	}
}

export default UploadButton;
