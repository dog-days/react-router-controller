import React from 'react';
import { HashRouter } from 'react-router-dom';
import RouterController from './RouterController';

/**
 * HashRouter类型控制器
 */
class HashRouterController extends React.Component {
  render() {
    const { basename } = this.props;
    return (
      <HashRouter {...this.props}>
        <RouterController history="hash" basename={basename} />
      </HashRouter>
    );
  }
}
export default HashRouterController;
