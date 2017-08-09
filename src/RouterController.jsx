import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { getViewConfig } from './';
import { ContollerConfig } from './Controller';
import DefaultNotMatchComponent from './DefaultNotMatchComponent';

/**
 * 路由控制器React组件，配合Router使用
 *@prop { string } history history类型hash、browser
 *@prop { string } basename 同BrowserRouter的props.basename
 */
class RouterController extends React.Component {
  state = {};
  /**
   * 根据history的值获取pathname
   */
  getPathNameByHistory() {
    const { history } = this.props;
    var pathname = location.pathname;
    if (history === 'hash') {
      //这将使用
      pathname = location.hash.replace('#', '');
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
        config: lastConfig
      });
    });
    this.pathname = pathname;
  }
  componentDidMount() {
    this.setConfig();
  }
  componentDidUpdate() {
    var pathname = this.getPathNameByHistory();
    if (this.pathname !== pathname) {
      this.setConfig();
    }
  }

  render() {
    const { config } = this.state;
    var pathname = this.getPathNameByHistory();
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
