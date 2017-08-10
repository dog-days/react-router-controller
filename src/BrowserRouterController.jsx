import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouteController from './RouteController';

/**
 * BrowserRouter类型控制器
 */
class BrowserRouterController extends React.Component {
  render() {
    const { basename } = this.props;
    return (
      <BrowserRouter {...this.props}>
        <RouteController history="browser" basename={basename} />
      </BrowserRouter>
    );
  }
}
export default BrowserRouterController;
