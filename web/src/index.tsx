import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import 'reflect-metadata';
import App from './App';

ReactDOM.render(<Router><App /></Router>, document.getElementById('app'));
