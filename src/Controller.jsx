import React from 'react';
//基本的配置，会在当前类和./index.jsx中使用。
export var ControllerConfig = {};
//所有view是否是第一次载入状态
const allViewFirstLoad = {};
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
   * 根据传进来的参数，检查url的params是否符合controller指定的格式
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
   * @param {object} config 一些配置
   * @param {object} params 路由配置参数
   * eg. {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu' }
   * @param {object} ViewComponent react view 组件，如果存在，覆盖默认的。
   */
  render(config, params = {}, ViewComponent) {
    if (!ControllerConfig.readControllerFile) {
      console.error('请先配置Controller的controller文件夹和view文件夹的路径读取方法！');
    }
    //begin--页面title设置
    if (this.suffixTitle) {
      config.title += this.suffixTitle;
    }
    document.title = config.title;
    config.params = params;
    //end--页面title设置
    //view的部分props
    var newProps = {
      actions: config.actions,
      viewConfig: config,
      params,
    };
    var returnConfig = {
      //存放所有的view config配置
      viewConfig: config,
      LayoutComponent: this.LayoutComponent,
      path: this.getReactRouterPath(params),
    };
    if (ViewComponent) {
      returnConfig.component = props => {
        return <ViewComponent {...props} {...newProps} />;
      };
      return returnConfig;
    } else {
      var viewId = params.viewId;
      //--begin view组件是否是第一次载入
      var firstLoad = allViewFirstLoad[viewId];
      if (allViewFirstLoad[viewId] === undefined) {
        //为undefined就是第一次载入
        firstLoad = true;
      }
      //--end view组件是否是第一次载入
      return (
        ControllerConfig.readViewFile &&
        ControllerConfig.readViewFile(viewId, firstLoad).then(ViewComponent => {
          //标记view组件第一次已经载入
          allViewFirstLoad[viewId] = false;
          returnConfig.component = props => {
            return <ViewComponent {...props} {...newProps} />;
          };
          return returnConfig;
        })
      );
    }
  }
}
