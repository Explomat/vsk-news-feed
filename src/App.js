import React, { Component } from 'react';
//import { withRouter } from 'react-router';
import { connect } from 'react-redux';
//import { error, info } from './appActions';
import { Route, Redirect } from 'react-router-dom';
import Topics from './app/topics';
import Topic from './app/topics/topic';
import './App.css';

class App extends Component {
	render() {
		const { ui } = this.props;

		return (
			<div className='news'>
				{ui.isLoading && <div>Загрузка данных</div>}
				{!!ui.error && <div>{ui.error}</div>}
				{!!ui.info && <div>{ui.info}</div>}
				<Route exact path='/' render={() => <Redirect to='/topics' />} />
				<Route exact path='/topics' component={Topics}/>
				<Route exact path='/topics/:id' component={Topic}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		ui: state.app.ui
	}
}

export default connect(mapStateToProps)(App);