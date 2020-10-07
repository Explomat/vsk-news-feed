import React, { Component } from 'react';
import { Popover, Rate, Icon } from 'antd';
import './index.css';

class MyRate extends Component {

	constructor(props) {
		super(props);

		//this.handleToggle = this.handleToggle.bind(this);
		this.handleChange = this.handleChange.bind(this);

		/*this.state = {
			isShowRate: false
		}*/
	}

	handleChange(value) {
		//this.handleToggle();
		this.props.onChange(value);
	}

	/*handleToggle() {
		this.setState({
			isShowRate: !this.state.isShowRate
		});
	}*/

	render() {
		const { text, disabled, className } = this.props;
		//const { isShowRate } = this.state;

		return (
			<span className='rate'>
				{disabled ? (
					<span className={className}>
						<Icon type='star' theme={disabled ? 'twoTone' : ''} twoToneColor={disabled ? '#ffd712' : ''} style={{ marginRight: 4 }} onClick={this.handleToggle}/>
						{text}
					</span>
				): (
					<Popover
						placement='leftTop'
						content={
							<span>
								<div>Оценить</div>
								<Rate value={text} onChange={this.handleChange} />
							</span>
						}
					>
					<span className={className}>
						<Icon type='star' theme='twoTone' twoToneColor='#ffd712' style={{ marginRight: 4 }} onClick={this.handleToggle}/>
						{text}
					</span>
				</Popover>
				)}
				
			</span>
		);
	}
}

export default MyRate;
