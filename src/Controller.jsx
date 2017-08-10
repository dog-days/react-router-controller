import React from 'react';
//基本的配置，会在当前类和./index.jsx中使用。
export var ControllerConfig = {};
/**
 * url风格定义如下，跟php框架的Yii一致，例如：
 * pathname=/main/about/id/100/appid/aiermu
 * 上面的pathname会解析为
 * {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu'}
 * 然后根据解析的参数运行对应的控制器和渲染页面
 * 所有控制器必须继承这个基类控制器
 */
export default class Contoller {
  /**
   * 设置默认配置，app初始化设置，必须要先调用这个去配置。
   * @param {config} config 一些配置
   * {controllerDir:'',viewDir: ''}
   */
  static set(config) {
    ControllerConfig = config;
  }
  /**
   * 根据传进来的参数，检查url的params是否符合要求，controller指定的格式
   * @param { object } params eg. {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu'}
   * @param { array } paramsSetting eg. ['id','appid']
   */
  checkParams(params, paramsSetting) {
    var flag = true;
    paramsSetting.forEach(v => {
      if (!~Object.keys(params).indexOf(v)) {
        flag = false;
      }
    });
    if (!flag) {
      console.error('参数跟指定的不一致，将返回404页面。');
    }
    return flag;
  }
  /**
   * 根据param获取router path
   * @param { object } params 格式如下
   * {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu' }
   * @return { string } eg. /main/about/id/100/appid/aiermu
   */
  getReactRouterPath(params) {
    var path = '/';
    for (var k in params) {
      var v = params[k];
      if (k === 'controllerId' || k === 'viewId') {
        path += `${v}/`;
      } else {
        path += `:__${k}__/:${k}/`;
      }
    }
    var pathArr = path.split('/');
    pathArr.pop();
    path = pathArr.join('/');
    return path;
  }
  /**
   * @param {string} viewId view文件夹下的文件夹名，view下需要遵守命名规则
   * @param {object} config 一些配置
   * @param {object} params 路由配置参数
   * eg. {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu' }
   */
  render(viewId, config, params) {
    if (!ControllerConfig.readControllerFile || !ControllerConfig.readViewFile) {
      console.error('请先配置Controller的controller文件夹和view文件夹的路径读取方法！');
    }
    //begin--页面title设置
    if (this.suffixTitle) {
      config.title += this.suffixTtile;
    }
    document.title = config.title;
    config.params = params;
    //end--页面title设置
    return ControllerConfig.readViewFile(viewId).then(ViewComponent => {
      var newProps = {
        actions: config.actions,
        viewConfig: config,
        params
      };
      return Object.assign({}, config, {
        component: props => {
          return <ViewComponent {...props} {...newProps} />;
        },
        //存放所有的view config配置
        viewConfig: config,
        LayoutComponent: this.LayoutComponent,
        path: this.getReactRouterPath(params)
      });
    });
  }
}
