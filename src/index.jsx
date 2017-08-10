import { ControllerConfig } from './Controller';
/**
 * 根据viewId和contollerId获取url的配置参数
 * url风格定义如下，跟php框架的Yii一致，例如：
 * pathname=/main/about/id/100/appid/aiermu
 * 上面的pathname会解析为
 * {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu'}
 * 会当参数传给 MainControlle的aboutView方法
 *@param {string} pathname location.pathname
 */
export function getParams(pathname) {
  //替换字符之替换第一个，后面的属于参数，不替换，还要替换成特殊的字符
  var pathnameSplit = pathname.split('/');
  var controllerId = pathnameSplit[1];
  var viewId = pathnameSplit[2];
  if (!controllerId || !viewId) {
    //如果这两个id都没有直接返回空对象
    return {};
  }
  //begin--替换viewId，防止后面参数跟viewId的值相同情况。
  var replaceStr = '_$_';
  var replacePathname = pathname.replace(viewId, replaceStr);
  //end--替换viewId，防止后面参数跟viewId的值相同情况。
  var splitPathWithReplaceStr = replacePathname.split(replaceStr);
  var splitParams = splitPathWithReplaceStr[1].split('/');
  splitParams.shift();
  var params = {
    controllerId,
    viewId
  };
  //整合params
  splitParams.forEach((v, k) => {
    if (k % 2 === 0) {
      if (splitParams[k + 1]) {
        params[v] = splitParams[k + 1];
      }
    }
  });
  return params;
}
/**
 * 获取页面配置提供给react-router使用，动态路由。
 *@param {string} pathanme location.pathname || location.hash
 */
export function getViewConfig(pathname) {
  var params = getParams(pathname);
  var controllerId = params.controllerId;
  var viewId = params.viewId;
  var funcName = viewId + 'View';
  return ControllerConfig.readControllerFile(controllerId).then(controller => {
    if (!controller) {
      return false;
    }
    var contollerObj = new controller();
    if (!contollerObj[funcName]) {
      return false;
    }
    var config = contollerObj[funcName](params);
    return config;
  });
}
