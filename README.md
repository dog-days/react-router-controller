# React Router Controller

[![npm package](https://badge.fury.io/js/react-router-controller.svg)](https://www.npmjs.org/package/react-router-controller) [![NPM downloads](http://img.shields.io/npm/dm/react-router-controller.svg)](https://npmjs.org/package/react-router-controller)

react-router-controller启发于[PHP Yii框架](http://www.yiichina.com/doc/guide/2.0)，实现了根据url动态渲染页面（这得益于react-router@4.x.x实现的动态路由）。

> **建议配合webpack使用**

> 这个路由从始至终都只运行了一个路由配置，因为这个路由是动态的，不存在同时存在其他路由配置。

## 为什么要使用这个

- 无路由配置

- 后端控制器模式

  react-router-controller是MVC中的VC，React是View，Controller是C，再配合redux或者mobx就是MVC模式了。思路简单明了，专心于业务逻辑即可。

## 缺点

用这个当然会有点限制，不能自定义路由（定义路由需要遵循controller规范，页面内部的多级动态路由不影响，可以随意定，但是不建议使用子路由）。

## 兼容性

一般主流浏览器都兼容。

- chrome浏览器最新版

- 火狐浏览器最新版

- Edge浏览器最新版

- IE浏览器支持IE9版本以上（包括IE9）

  因为IE不支持promise，所以需要引入polyfill.js。

  ```js
  import 'react-router-controller/libs/polyfill'
  //如果已经有相关的promise polyfill，可以不用这个。
  ```

## 使用规范

就像PHP Yii一样（90%相似），react-router-controller也有自己的规范。

### URL规范

跟Yii基本一致，处理没有module这分类。

- controllerId和viewId

  url必须要包括controllerId和viewId（controller名和view名，为了解析成动态路由），例如`http://localhost:8000/main/about`，这个路由会解析成参数传入controller的view函数中（`{conrollerId: main,vieId: about}`）。

- 路由参数

  除开controllerId和viewId外，后面url接的参数也有一定的规则，前面第一个是react-router参数设置名，后面的是参数值（成对出现，理论是可以无限个）。例如url`http://localhost:8000/main/about/id/100/appid/test/page/2`，会解析成params（controller xxxView函数参数、layout组件和view组件的props.params）：

  ```json
  {
    controllerId: "main",
    viewId: "about",
    id: "100",
    appid: "test",
    page: "2"
  }
  ```

  对应的路由path为`/main/about/:id/:appid/:page`，这个跟PHP Yii的参数是一致的。

### Controller规范

- controller文件查找会根据上面的URL规范返回的controllerId，查找到设置的目录文件（会根据controllerId去查找文件，当然不是真实的文件查找，如果用webpack，webpack会帮你把文件关系一一对应起来）。例如建议这样设置controller文件（Controller.set用法请查看下面的Controller基类API）：

  ```js
  Controller.set({
    readControllerFile(controllerId) {
      //webpackMode: eager是使import变为不异步，跟require一样，
      //但是返回的是promise对象，不能使用require，require会把没必要的文件载入
      //最好不使用异步载入，可能导致一些问题
      return import(/* webpackMode: "eager" */
      `./controller/${controllerId}.js`)
        .then(controller => {
          return controller.default;
        })
        .catch(e => {
          //必须catch并返回false
          return false;
        });
    }
  });
  ```

  或者还可以这样，通过switch来处理（没有使用webpack的时候）：

  ```js
  import main from './controller/main'
  import test from './controller/test'
  Controller.set({
    readControllerFile(controllerId) {
      //必须返回promies对象
      return new Promise(function(resolve, reject) {
        switch(controllerId) {
          case 'main':
            resolve(main);
            break;
          case 'test':
            resolve(test);
            break;
        }
      });
    }
  });
  ```

  上面使用webpack 3.x以上的import方式，import会把前面的整个`./controller`文件夹的所有文件做了一个映射，然后通过controllerId就可以import到指定文件。

- controller 渲染view组件规范

  **view函数=viewId+View，即xxxxView(){}。**

  先看下代码：

  ```js
  import Controller from 'react-router-controller';
  import LayoutComponent from '../view/layout/main';

  export default class MainController extends Controller {
    LayoutComponent = LayoutComponent;
    aboutView(params) {
      return this.render(
        {
          title: '关于',
          breadcrumbs: [],
        },
        params
      );
    }
  }
  ```

  像上面的controller中aboutView方法运行的pathname为`/main/about`。首先main先找到`./controller/main.js`文件，如果不存在返回404页面。存在就继续找view函数，然后运行view函数，否则返回404页面。

## 使用入门

使用create-react-app，创建一个demo app，下面的范例以这个app为基础来处理。例子可以看项目中的demo文件夹（这个demo不是用create-react-app创建的）。

**demo/src/index.js**

为了使用react-hot-loader，这需要一个container，controller的主要代码就在`demo/src/container.js`中。

> 这个入口文件如果使用了热替换，需要在`module.hot.accept`中把hot（需要使用随机数，保证每次热替换hot值都不一样）参数传到`<Container />`的prop.hot中，这样react-router-controller的热替换才会生效。

```js
//为了兼容IE的promise请加上polyfill
import 'react-router-controller/polyfill'
import React from 'react';
import { render } from 'react-dom';
//使用react-hot-loader需要一个Container，可以参考react-hot-loader例子。
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
import Controller, { BrowserRouterController } from 'react-router-controller';
import nopage from './view/nopage';

Controller.set({
  readViewFile(viewId) {
    //view可以异步载入
    return import(`./view/${viewId}/index.js`).then(component => {
      return component.default;
    });
  },
  readControllerFile(controllerId) {
    //webpackMode: eager是使import变为不异步，跟require一样，
    //但是返回的时promise对象，不能使用require，require会把没必要的文件载入
    //最好不适用异步载入，可能导致一些问题
    return import(/* webpackMode: "eager" */
    `./controller/${controllerId}.js`)
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
  indexPath: '/main/index',
});

export default function container(props) {
  //basename的设置需要配合webpack使用，要不即使在开发环境没问题，但是成产环境
  //访问根目录的basename文件夹（文件名为basename的值），会有问题的。
  return (
    <BrowserRouterController
      basename={process.env.PREFIX_URL}
      hot={props.hot}
    />
  );
}
```

然后就可以新建controller文件和view文件了。

**src/controller/main.js**

规范后续会说明，在xxxView按照下面的格式就会渲染出复合规则的view页面。

```js
import Controller from 'react-router-controller';
import LayoutComponent from '../view/layout/main';

export default class MainController extends Controller {
  LayoutComponent = LayoutComponent;
  indexView(params) {
    return this.render(
      {
        title: '主页',
        breadcrumbs: [],
      },
      params
    );
  }
  aboutView(params) {
    if (!this.checkParams(params, ['id'])) {
      return false;
    }
    return this.render(
      {
        title: '关于',
        breadcrumbs: [],
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

## API说明

### Controller基类

`import Controller from 'react-router-controller'`

每新建一个controller都必须继承这个基类，**controller中xxView之间可以使用类变量通讯。**

`Controller`这个类提供了一些方法和变量：

- set(config)

  **使用react-router-controller必须先用set配置**，可以参考demo。

  **config.xx**

  | config.xx          | 类型       | 说明                                       | 必填    |
  | ------------------ | -------- | ---------------------------------------- | ----- |
  | readControllerFile | function | 读取controller文件，必须返回promise对象。            | true  |
  | readViewFile       | function | 读取view组件文件，必须返回promise对象。                | false |
  | NotMatchComponent  | object   | react view 组件，404页面。                     | false |
  | indexPath          | string   | 设置主页（因为controller规范原因，不存在'/'这种的pathname，格式都是/controllerId/viewId/paramsId/1），'/'会跳转到这个indexPath。 | true  |

  **config.readControllerFile(controllerId)**

  | 参数（param）    | 类型     | 说明                           | 必填   |
  | ------------ | ------ | ---------------------------- | ---- |
  | controllerId | string | 控制器文件名id，通过解析url得到，怎样使用看使用者。 | true |

  **config.readViewFile(viewId,firstLoad)**

  | 参数（param） | 类型      | 说明                                       | 必填    |
  | --------- | ------- | ---------------------------------------- | ----- |
  | viewId    | string  | view文件名id，通过解析url得到，怎样使用看使用者。            | true  |
  | firstLoad | boolean | 判断当前函数，view文件是否是第一次载入（false未载入，true是载入），使用者或许可能用到。 | false |

- render(config, params,ViewComponent) 

  每个`xxView`函数都要用到，名字虽然叫render，实际是还没渲染，只是返回传递了一个对象到react-router中使用。

  | 参数（param）     | 类型     | 说明                                       | 必填    |
  | ------------- | ------ | ---------------------------------------- | ----- |
  | config        | object | 一些配置{title: '标题',breadcrumbs:['面包屑']}，还可以自定义。 | true  |
  | params        | object | pathname解析后的参数如， {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu' } | true  |
  | ViewComponent | object | react view 组件，如果存在，覆盖默认的。                | false |

- LayoutComponent

  设置layout组件，不设置就没layout。

- suffixTtile

  设置后缀title，可选。

- checkParams(params, paramsSetting)

  根据传进来的参数，检查url的params是否符合controller指定的格式。

  | 参数（param）     | 类型     | 说明                                       | 必填   |
  | ------------- | ------ | ---------------------------------------- | ---- |
  | params        | object | pathname解析后的参数如， {contollerId: 'main',viewId: 'about',id: "100",appid: 'aiermu' } | true |
  | paramsSetting | array  | react-router参数，如['id','appid']（/main/about/:id/:appid） | true |

### BrowserRouterController

对react-router-dom中的`<BrowserRouter />`进行controller封装，里面会根据url渲染对应的页面。

用法如下：

```jsx
ReactDOM.render(<BrowserRouterController />, document.getElementById('root'));
```

| props       | 说明                                       | 默认值  |
| ----------- | ---------------------------------------- | ---- |
| hot         | react-hot-loader热替换开启，每次热替换需要传入不同的值，可用随机数。 | 无    |
| other.props | 继承react-router中BrowserRouter的所用props。    | 无    |

### HashRouterController

对react-router-dom中的`<HashRouter />`进行controller封装，里面会根据url渲染对应的页面。

用法如下：

```jsx
ReactDOM.render(<HashRouterController />, document.getElementById('root'));
```

| props       | 说明                                       | 默认值  |
| ----------- | ---------------------------------------- | ---- |
| hot         | react-hot-loader热替换开启，每次热替换需要传入不同的值，可用随机数。 | 无    |
| other.props | 继承react-router中HashRouter的所用props。       | 无    |

### MemoryRouterController

对react-router-dom中的`<MemoryRouter />`进行controller封装，里面会根据内存渲染对应的页面。

用法如下：

```jsx
ReactDOM.render(<MemoryRouterController />, document.getElementById('root'));
```

| props       | 说明                                       | 默认值  |
| ----------- | ---------------------------------------- | ---- |
| hot         | react-hot-loader热替换开启，每次热替换需要传入不同的值，可用随机数。 | 无    |
| other.props | 继承react-router中MemoryRouter的所用props。     | 无    |

### Layout组件

使用者传进来的layout组件，react-router-controller会为这个组件添加以下props:

- params

  例如`http://localhost/main/about/id/10`的param如下：

  ```js
  {controllerId: 'main',viewId: 'about',id: 10}
  ```

- breadcrumbs

  格式随意定，从Controller的render方法第一个参数传进来。

- viewConfig

  所有的view配置，包括title、breadcrumbs和一些自定义的配置，看情况使用，大多数情况用不到的。

### View组件

使用者传进来的layout组件，react-router-controller会为这个组件添加以下props:

- params

  同Layout组件。

- title

  页面title设置。

- viewConfig

  同Layout组件。


## 插件

**插件其实就是个函数**，插件都需要返回一个json对象，这个json对象可以在view组件和layout组件props，还有controller的`xxView`方法中第二个参数中访问到。

插件都需要在`Controlle.set`配置：

```js
Controller.set({
  plugins: [plugin1,plugin2]
})
```

### i18n插件

#### **参数说明**

| 参数                  | 类型       | 说明                                       | 必填   |
| ------------------- | -------- | ---------------------------------------- | ---- |
| switchLanguageList  | function | 切换语言，参数是语言名称。返回的可以是promise（promise中返回的是语言数组列表），也可以直接语言数组列表。最好使用webpack的异步import。 | true |
| defaultLanguageList | array    | 默认的语言列表                                  | true |

#### **返回值**

| 返回值            | 类型       | 说明                  |
| -------------- | -------- | ------------------- |
| t              | function | 用作翻译转换，默认参数是需要翻译的文案 |
| switchLanguage | function | 默认的语言列表             |
| displayName    | string   | 插件命名，值为i18n。        |

#### 使用

配置文件

```js
Controller.set({
  plugins: [
    i18n(language => {
      return import(`./i18n/${language}.js`).catch(e => {
        console.log(e);
        return false;
      });
    }, require('./i18n/zh_CN').default),
  ]
})
```

经过配置，react-router-controller运行后，layout组件和view组件的props都可以访问`props.i18n`，还有controller的`xxView`方法中第二个参数也可以访问到这个对象。

使用i18n传进来的对象：

```jsx
import React from 'react';

class AboutView extends React.Component {
  render() {
    console.debug('about页面');
    const { i18n: { t } } = this.props;
    return (
      <div>
        {t('关于页面')}
      </div>
    );
  }
}
export default AboutView;
```

controller文件

```js
import Controller from 'react-router-controller';
export default class MainController extends Controller {
  aboutView(params, { i18n: { t } }) {
    return this.render(
      {
        title: t('关于'),
        breadcrumbs: [
          {
            link: `/main/about/id/${params.id}`,
            label: t('关于'),
          },
        ],
      },
      params
    );
  }
}
```






























