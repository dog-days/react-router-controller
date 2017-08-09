import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouterController from './RouterController';

/**
 * BrowserRouter类型控制器 
 */
class BrowserRouterController extends React.Component {
  render() {
    const { basename } = this.props;
    return (
      <BrowserRouter {...this.props}>
        <RouterController history="browser" basename={basename} />
      </BrowserRouter>
    );
  }
}
export default BrowserRouterController;
