import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouteController from './RouteController';

/**
 * BrowserRouter类型控制器
 */
class BrowserRouterController extends React.Component {
  displayName = 'BrowserRouterController';
  render() {
    const { basename, hot } = this.props;
    return (
      <BrowserRouter {...this.props}>
        <RouteController historyType="browser" basename={basename} hot={hot} />
      </BrowserRouter>
    );
  }
}
export default BrowserRouterController;
