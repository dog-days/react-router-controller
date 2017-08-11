import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { getParams, pathnameAdapter } from './util';
import { ControllerConfig } from './Controller';
import DefaultNotMatchComponent from './DefaultNotMatchComponent';

/**
 * 路由控制器React组件，配合Router使用
 *@prop { string } historyType history类型hash、browser、memory，目前还没使用到，保留
 *@state { object } config 路由的一些配置
 *@this { string } pathname 相当与上个页面的pathname，切换页面会变化。
 */
class RouteController extends React.Component {
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
      }).isRequired,
      staticContext: PropTypes.object,
    }).isRequired,
  };
  state = {};
  /**
   * 根据history的值获取pathname
   */
  getPathNameByHistory() {
    const history = this.context.router.history;
    var pathname = history.location.pathname;
    if (pathname === '') {
      pathname = '/';
    }
    return pathname;
  }
  /**
   * 获取页面配置提供给react-router使用，动态路由。
   *@param {string} pathanme react router中的location.pathname || location.hash，不是浏览器的location
   */
  getViewConfig(pathname) {
    var params = getParams(pathname);
    var controllerId = params.controllerId;
    var viewId = params.viewId;
    var funcName = viewId + 'View';
    return ControllerConfig.readControllerFile(
      controllerId
    ).then(controller => {
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
  setConfig() {
    var pathname = this.getPathNameByHistory();
    this.getViewConfig(pathname).then(config => {
      if (!config && pathname === '/') {
        const history = this.context.router.history;
        history.replace(ControllerConfig.indexPath);
        return false;
      }
      var lastConfig;
      if (config && config.component) {
        //console.error('controller的render方法传入的ViewComponent不是React组件！');
        //lastConfig = {
        //component: props => {
        //return (
        //<div
        //style={{
        //border: '1px solid #fcdbd9',
        //backgroundColor: '#fef0ef',
        //padding: '11px 48px 8px 16px',
        //borderRadius: '4px',
        //fontSize: '13px',
        //lineHeight: '1.5',
        //color: 'rgba(0,0,0,.65)'
        //}}
        //>
        //controler render方法传入的ViewComponent 不是React组件！
        //</div>
        //);
        //}
        //};
        //document.title = 'ViewComponent is not valid react component.';
        lastConfig = config;
      } else {
        //如果config为false，为404页面
        lastConfig = {
          component:
            ControllerConfig.NotMatchComponent || DefaultNotMatchComponent,
        };
        document.title = '404 not found';
      }
      this.setState({
        config: lastConfig,
        index: false,
      });
    });
  }
  /**
   * 这里的判断基本都是相等了才会返回通过
   * this.hot和this.pathname都是这样，
   * 因为切换页面时，会首先运行一次以前的页面，然后才会切换至新的页面，
   * 这里就是为了解决切换时重复渲染的问题。
   */
  shouldComponentUpdate(nextProps, nextState) {
    //begin--热替换开启处理
    const { hot } = nextProps;
    if (hot !== this.hot) {
      //hot不相等时，不渲染上个未变化的页面
      this.hot = hot;
      return false;
    }
    //begin--热替换开启处理
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
  componentWillReceiveProps(nextProps) {
    var pathname = this.getPathNameByHistory();
    const { hot } = nextProps;
    //是否开启热替换，这里做了热替换处理兼容处理
    if (hot) {
      if (this.hot !== hot) {
        this.setConfig();
      } else {
        //点击链接切换页面时，这函数会触发运行
        //this.pathanme !== pathname
        //console.debug(this.pathname,pathname)
        if (this.pathname !== pathname) {
          this.setConfig();
        }
      }
    } else {
      //点击链接切换页面时，这函数会触发运行
      //this.pathanme !== pathname
      //console.debug(this.pathname,pathname)
      if (this.pathname !== pathname) {
        this.setConfig();
      }
    }
  }

  render() {
    const { config } = this.state;
    var pathname = this.getPathNameByHistory();
    var layoutProps = {};
    if (config && config.viewConfig) {
      var viewConfig = config.viewConfig;
      layoutProps = {
        viewConfig,
        params: viewConfig.params,
        breadcrumbs: viewConfig.breadcrumbs,
      };
    }
    return (
      <Switch>
        {pathname !== '/' &&
          config &&
          config.LayoutComponent &&
          <config.LayoutComponent {...layoutProps}>
            <Route path={config.path} component={config.component} />
          </config.LayoutComponent>}
        {pathname !== '/' &&
          config &&
          !config.LayoutComponent &&
          <Route path={config.path} component={config.component} />}
        {false &&
          pathname === '/' &&
          ControllerConfig.indexPath &&
          <Redirect
            from="/"
            to={pathnameAdapter(ControllerConfig.indexPath)}
          />}
      </Switch>
    );
  }
}
export default RouteController;
