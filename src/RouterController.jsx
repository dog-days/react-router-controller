import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { getViewConfig } from './';
import { ContollerConfig } from './Controller';
import DefaultNotMatchComponent from './DefaultNotMatchComponent';

/**
 * basename适配
 * 例如basename=test或者test/或者/test/会适配为/test
 */
export function basenameAdapter(basename) {
  if(Object.prototype.toString.apply(basename) !== '[object String]') {
    console.error('请传入字符串！');
    return ;
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
 */
class RouterController extends React.Component {
  state = {};
  basename = basenameAdapter(this.props.basename);
  /**
   * 根据history的值获取pathname
   * @param { boolean } real 是否是绝对真实的pathname，没经过处理的（除了basename）。
   */
  getPathNameByHistory(real) {
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
    //如果real=true，是要获取真实的pathname，不经过处理
    if (!real && pathname === '/') {
      //如果访问的是当前域名，需要切换到设定的主页链接
      pathname = ContollerConfig.indexPath;
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
            ContollerConfig.NotMatchComponent || DefaultNotMatchComponent
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
    if (this.pathname === undefined || pathname === '/') {
      this.pathname = pathname;
      return true;
    }
    //pathname要相等才渲染，因为this.pathname在下面被重新赋值了
    //有一次没渲染，return false了。
    if (this.pathname === pathname) {
      return true;
    }
    this.pathname = pathname;
    return false;
  }
  componentDidMount() {
    this.setConfig();
  }
  componentWillReceiveProps() {
    var pathname = this.getPathNameByHistory();
    if (this.pathname !== pathname) {
      this.setConfig();
    }
  }

  render() {
    const { config } = this.state;
    var pathname = this.getPathNameByHistory(true);
    console.debug(config);
    return (
      <Switch>
        {config && <Route path={config.path} component={config.component} />}
        {pathname === '/' &&
          ContollerConfig.indexPath &&
          <Redirect from="/" to={ContollerConfig.indexPath} />}
      </Switch>
    );
  }
}
export default RouterController;
