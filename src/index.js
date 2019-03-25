import React from 'react';
import ReactDOM from 'react-dom';
import App from './views/App.jsx';

console.log('hello');
ReactDOM.render(
  React.createElement(App),
  document.getElementById('main-container')
);
console.log('world');
