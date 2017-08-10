import React from 'react';
import { render } from 'react-dom';
import Container from './container';

function randomKey() {
  return Math.random().toString(36).substring(7).split('').join('.');
}

function renderApp(hot) {
  render(<Container hot={hot} />, document.getElementById('root'));
}
renderApp();
if (module.hot) {
  module.hot.accept('./container', () => {
    //controller的热替换需要特殊处理
    //通过props.hot开启，要不会不生效
    //而且要用随机数处理
    var hot = randomKey();
    return renderApp(hot);
  });
}
