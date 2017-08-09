import React from 'react';
import { render } from 'react-dom';
import Controller from './../../src/Controller';
import BrowserRouterController from './../../src/BrowserRouterController';
import nopage from './view/nopage';

Controller.set({
  readViewDir(viewId) {
    return import(
      `./view/${viewId}/index.jsx`).then(component => {
      return component.default;
    });
  },
  readControllerDir(controllerId) {
    //webpackMode: eager是使import变为不异步，跟require一样，
    //但是返回的时promise对象
    return import(/* webpackMode: "eager" */
    `./controller/${controllerId}.jsx`)
      .then(controller => {
        return controller.default;
      })
      .catch(e => {
        //必须catch并返回false
        return false;
      });
  },
  //设置404页面，会覆盖默认的404页面
  NotMatchComponent: nopage,
  //设置首页path（跳转路径，即react-router path='/'时，会跳转到indexPath）
  //第一个字符必须是'/'，不能是main/index，要是绝对的路径
  indexPath: '/main/index'
});

function renderApp(config) {
  const target = document.getElementById('root');
  if (target) {
    render(<BrowserRouterController basename="test"/>, target);
  }
}
renderApp();
