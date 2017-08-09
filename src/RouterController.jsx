import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { getViewConfig } from './';
import { ControllerConfig } from './Controller';
import DefaultNotMatchComponent from './DefaultNotMatchComponent';

/**
 * basename适配
 * 例如basename=test或者test/或者/test/会适配为/test
 */
export function basenameAdapter(basename) {
  if (Object.prototype.toString.apply(basename) !== '[object String]') {
    console.error('请传入字符串！');
    return;
  }
  //basename第一个字符必须是'/'
  if (basename[0] !== '/') {
    basename = '/' + basename;
  }
  //basename最后一个字符不能是'/'
  if (basename[basename.length - 1] === '/') {
    basename = basename.slice(0, basename.length - 1);
  }
  return basename;
}

/**
 * 路由控制器React组件，配合Router使用
 *@prop { string } history history类型hash、browser
 *@prop { string } basename 同BrowserRouter的props.basename
 *@state { object } config 路由的一些配置
 *@this { string } pathname 相当与上个页面的pathname，切换页面会变化。
 */
class RouterController extends React.Component {
  state = {};
  basename = basenameAdapter(this.props.basename);
  /**
   * 根据history的值获取pathname
   */
  getPathNameByHistory() {
    const { history } = this.props;
    var basename = this.basename;
    var pathname = location.pathname;
    if (history === 'hash') {
      pathname = location.hash.replace('#', '');
    }
    if (basename) {
      pathname = pathname.replace(basename, '');
      if (pathname === '') {
        pathname = '/';
      }
    }
    return pathname;
  }
  setConfig() {
    var pathname = this.getPathNameByHistory();
    getViewConfig(pathname).then(config => {
      var lastConfig;
      if (config) {
        lastConfig = config;
      } else {
        //如果config为false，为404页面
        lastConfig = {
          component:
            ControllerConfig.NotMatchComponent || DefaultNotMatchComponent
        };
        document.title = '404 not found';
      }
      this.setState({
        config: lastConfig,
        index: false
      });
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    var pathname = this.getPathNameByHistory();
    //整个页面重载，this.pathname为undefined
    if (this.pathname === undefined) {
      //这里也必须赋值
      this.pathname = pathname;
      return true;
    }
    //切换页面时，首先会触发一次componentWillReceiveProps，不需要重渲染
    //然后componentWillReceiveProps相应的触发setConfig
    //setConfig里面触发了setState，改变了state中config的值，这个时候才需要渲染
    //pathname要相等才渲染，因为this.pathname在下面被重新赋值了
    if (this.pathname === pathname) {
      return true;
    }
    //页面切换componentWillReceiveProps运行过后，这里也会运行一次，但是不需要重新渲染，
    //然后componentWillReceiveProps里运行的setConfig触发state变化后，
    //这个函数还会运行一遍，然后返回true，render函数就渲染出切换的页面。
    //这里this.pathname赋了新值，跟当前页面的pathname相等了，是否渲染切换后的页面就根据this.pathname来判断了
    this.pathname = pathname;
    return false;
  }
  componentDidMount() {
    this.setConfig();
  }
  componentWillReceiveProps() {
    var pathname = this.getPathNameByHistory();
    //点击链接切换页面时，这函数会触发运行
    //this.pathanme !== pathname
    //console.debug(this.pathname,pathname)
    if (this.pathname !== pathname) {
      this.setConfig();
    }
  }

  render() {
    const { config } = this.state;
    var pathname = this.getPathNameByHistory();
    return (
      <Switch>
        {pathname !== '/' &&
          config &&
          <Route path={config.path} component={config.component} />}
        {pathname === '/' &&
          ControllerConfig.indexPath &&
          <Redirect from="/" to={ControllerConfig.indexPath} />}
      </Switch>
    );
  }
}
export default RouterController;
