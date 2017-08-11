import Controller from 'react-router-controller';
import LayoutComponent from '../view/layout/main';

export default class MainController extends Controller {
  LayoutComponent = LayoutComponent;
  indexView(params) {
    return this.render(
      params.viewId,
      {
        title: '主页',
        breadcrumbs: [],
        actions: true,
      },
      params
    );
  }
  aboutView(params) {
    if (!this.checkParams(params, ['id'])) {
      return false;
    }
    return this.render(
      params.viewId,
      {
        title: '关于',
        breadcrumbs: [],
        actions: true,
      },
      params
    );
  }
}
