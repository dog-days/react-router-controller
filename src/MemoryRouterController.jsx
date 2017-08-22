import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import RouteController from './RouteController';

/**
 * MemoryRouter类型控制器
 */
class MemoryRouterController extends React.Component {
  displayName = 'MemoryRouterController';
  render() {
    const { basename, hot } = this.props;
    return (
      <MemoryRouter {...this.props}>
        <RouteController historyType="memory" basename={basename} hot={hot} />
      </MemoryRouter>
    );
  }
}
export default MemoryRouterController;
