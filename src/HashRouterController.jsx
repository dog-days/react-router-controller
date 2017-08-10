import React from 'react';
import { HashRouter } from 'react-router-dom';
import RouteController from './RouteController';

/**
 * HashRouter类型控制器
 */
class HashRouterController extends React.Component {
  render() {
    const { basename } = this.props;
    return (
      <HashRouter {...this.props}>
        <RouteController history="hash" basename={basename} />
      </HashRouter>
    );
  }
}
export default HashRouterController;
