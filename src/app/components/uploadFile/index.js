import React, { Component } from 'react';
import { Upload, Button, Icon } from 'antd';
import request from '../../../utils/request';
import './index.css';

class UploadFile extends Component {

	constructor(props) {
		super(props);

		const fileList = props.fileList || [];

		this.state = {
			fileList: fileList.map(f => {
				return {
					id: f.id,
					uid: f.id,
					name: f.id
				}
			})
		}
	}

	render() {
		const { fileList } = this.state;
		const { url, accept, disabled } = this.props;

		return (
			<div className='upload-file'>
				<Upload
					accept={accept}
					name='file'
					fileList={fileList}
					action={url}
					showUploadList={{
						showDownloadIcon: false,
						showRemoveIcon: true
					}}

					onSuccess={
						d => {
							if (this.props.onSuccess) {
								this.props.onSuccess(d.data);
							}

							if (d.type === 'error') {
								alert(d.message);
							} else {
								this.setState({
									fileList: [ ...this.state.fileList, { ...d.data, uid: d.data.id } ]
								});
							}
						}
					}
					onRemove = {() => {
						request('File')
							.delete({ id: this.state.fileList[0].id })
							.then(r => r.json())
							.then(d => {
								if (d.type === 'error'){
									throw d;
								}

								this.setState({
									fileList: []
								});

								if (this.props.onRemove) {
									this.props.onRemove();
								}
							})
							.catch(e => {
								alert(e);
							});
					}}
				>
					{!disabled && <Button className='learnings-upload-file'>
						<Icon type='upload' /> Загрузить файл
					</Button>}
				</Upload>
			</div>
		);
	}
}

export default UploadFile;
