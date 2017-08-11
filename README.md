# React Router Controller

react-router-controller启发于[PHP Yii框架](http://www.yiichina.com/doc/guide/2.0)，实现了根据url动态渲染页面（这得益于react-router@4.x.x实现的动态路由）。

> **建议配合webpack使用**

> 这个路由从始至终都只运行了一个路由配置，因为这个路由是动态的，不存在同时存在其他路由配置。

### 为什么要使用这个

- 无路由配置，使用起来简单多了。
- 后端控制器模式（MVC中的C），思路简单明了，专心于业务逻辑即可。

### 缺点

用这个当然会有点限制，不能自定义路由（页面内部的动态路由不影响，影响了外层的），而且还要遵循，我们定于的controller模式（非常简单的模式）。

### 使用规范

就像PHP Yii一样（90%相似），react-router-controller也有自己的规范。

#### URL规范

跟Yii基本一致，处理没有module这分类。

- controllerId和viewId

  url必须要包括controllerId和viewId（controller名和view名，为了解析成动态路由），例如`http://localhost:8000/main/about`，这个路由会解析成参数传入controller的view函数中（`{conrollerId: main,vieId: about}`）。

- 路由参数

  除开controllerId和viewId外，后面url接的参数也有一定的规则，前面第一个是react-router参数设置名，后面的是参数值（成对出现，理论是可以无限个）。例如url`http://localhost:8000/main/about/id/100/appid/test/page/2`，会解析成params（controller xxxView函数参数、layout组件和view组件的props.params）：

  ```json
  {
    controllerId: 'main',
    viewId: 'about',
    id: '100',
    appid: 'test',
    page: '2'
  }
  ```

### 使用入门

使用create-react-app，创建一个demo app，下面的范例以这个app为基础来处理。例子可以看项目中的demo文件夹（这个demo不是用create-react-app创建的）。

**demo/src/index.js**

为了使用react-hot-loader，这需要一个container，controller的主要代码就在`demo/src/container.js`中。

> 这个入口文件如果使用了热替换，需要在`module.hot.accept`中把hot（需要使用随机数，保证每次热替换hot值都不一样）参数传到`<Container />`的prop.hot中，这样react-router-controller的热替换才会生效。

```js
import React from 'react';
import { render } from 'react-dom';
import Container from './container';

function randomKey() {
  return Math.random().toString(36).substring(7).split('').join('.');
}

function renderApp(hot) {
  render(<Container hot={hot} />, document.getElementById('root'));
}
renderApp();
if (module.hot) {
  module.hot.accept('./container', () => {
    //controller的热替换需要特殊处理
    //通过props.hot开启，要不会不生效
    //而且要用随机数处理
    var hot = randomKey();
    return renderApp(hot);
  });
}
```

**demo/src/container.js**

这里需要主要的就是view文件的读取，和controller文件的读取（建议使用webpack的import方式，当然也可以一个一个配置然后返回view组件或controller，但是这个麻烦，如果不使用webpack就要使用这种麻烦的方式了）。

view和controller的目录在Controller.set中设置。

```js
import React from 'react';
import Controller from './../../src/Controller';
import BrowserRouterController from './../../src/BrowserRouterController';
import nopage from './view/nopage';

Controller.set({
  readViewFile(viewId) {
    //view可以异步载入
    return import(
    `./view/${viewId}/index.jsx`).then(component => {
      return component.default;
    });
    //这里当然可以使用switch一个一个设置匹配，但是不建议。
  },
  readControllerFile(controllerId) {
    //webpackMode: eager是使import变为不异步，跟require一样，
    //但是返回的时promise对象，不能使用require，require会把没必要的文件载入
    //最好不适用异步载入，可能导致一些问题
    return import(/* webpackMode: "eager" */
    `./controller/${controllerId}.jsx`)
      .then(controller => {
        return controller.default;
      })
      .catch(e => {
        //必须catch并返回false
        return false;
      });
  },
  //设置404页面，会覆盖默认的404页面
  NotMatchComponent: nopage,
  //设置首页path（跳转路径，即react-router path='/'时，会跳转到indexPath）
  //第一个字符必须是'/'，不能是main/index，要是绝对的路径
  indexPath: '/main/index'
});

export default function container(props) {
  return <BrowserRouterController hot={props.hot} />;
}
```

然后就可以新建controller文件和view文件了。

**src/controller/main.js**

规范后续会说明，在xxxView按照下面的格式就会渲染出复合规则的view页面。

```js
import Controller from '../../../src/Controller';
import LayoutComponent from '../view/layout/main';

export default class MainController extends Controller {
  //layout组件设置
  LayoutComponent = LayoutComponent;
  //这里渲染了view/index/index.js
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
  //这里渲染了view/about/index.js
  aboutView(params) {
    //只要返回fasle就是404页面
    //这里做了一些路由参数验证
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
```

**view/index/index.js**

view文件很简单，就像平常的react组件一样。

```jsx
import React from 'react';

class IndexView extends React.Component {
  render() {
    console.debug('index页面');
    return <div>主页页面</div>;
  }
}

export default IndexView;
```

### API说明

#### Controller基类

`import Controller from 'react-router-controller'`

每新建一个controller都必须继承这个基类，这个类提供了一些方法：

- render

  ```js
  /**
   * @param {string} viewId view文件夹下的文件夹名，view下需要遵守命名规则
   * @param {object} config 一些配置
   * @param {object} params 路由配置参数
   * eg. {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu' }
   */
  render(viewId, config, params) {}
  ```

- checkParms

  ```js
  /**
   * 根据传进来的参数，检查url的params是否符合要求，controller指定的格式
   * @param { object } params eg. {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu'}
   * @param { array } paramsSetting eg. ['id','appid']
   */
  checkParams(params, paramsSetting) {}
  ```

#### BrowserRouterController

对react-router-dom中的`<BrowserRouter />`进行controller封装，里面会根据url渲染对应的页面。

用法如下：

```jsx
ReactDOM.render(<BrowserRouter />, document.getElementById('root'));
```

| props       | 说明                                       | 默认值  |
| ----------- | ---------------------------------------- | ---- |
| hot         | react-hot-loader热替换开启，每次热替换需要传入不同的值，可用随机数。 | 无    |
| basename    | 用法跟react-router中BrowserRouter的props.basename一样，发布的文件不在网站根目录，而在根目录文件下可以使用basename处理。如果使用webpack这个当然还要进行webpack的处理，要不webpack打包的静态文件访问路径会有问题，这里不说。 | 无    |
| other.props | 继承react-router中BrowserRouter的所用props。    | 无    |

#### HashRouterController

对react-router-dom中的`<HashRouter />`进行controller封装，里面会根据url渲染对应的页面。

用法如下：

```jsx
ReactDOM.render(<HashRouter />, document.getElementById('root'));
```

| props       | 说明                                       | 默认值  |
| ----------- | ---------------------------------------- | ---- |
| hot         | react-hot-loader热替换开启，每次热替换需要传入不同的值，可用随机数。 | 无    |
| basename    | 用法跟react-router中HashRouter的props.basename一样，发布的文件不在网站根目录，而在根目录文件下可以使用basename处理。如果使用webpack这个当然还要进行webpack的处理，要不webpack打包的静态文件访问路径会有问题，这里不说。 | 无    |
| other.props | 继承react-router中HashRouter的所用props。       | 无    |

#### MemoryRouterController

对react-router-dom中的`<MemoryRouter />`进行controller封装，里面会根据内存渲染对应的页面。

用法如下：

```jsx
ReactDOM.render(<MemoryRouter />, document.getElementById('root'));
```

| props       | 说明                                       | 默认值  |
| ----------- | ---------------------------------------- | ---- |
| hot         | react-hot-loader热替换开启，每次热替换需要传入不同的值，可用随机数。 | 无    |
| basename    | 用法跟react-router中MemoryRouter的props.basename一样，只是做了一些处理。，发布的文件不在网站根目录，而在根目录文件下可以使用basename处理。如果使用webpack这个当然还要进行webpack的处理，要不webpack打包的静态文件访问路径会有问题，这里不说。 | 无    |
| other.props | 继承react-router中MemoryRouter的所用props。     | 无    |

#### 

































