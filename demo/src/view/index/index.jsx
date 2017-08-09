import React from 'react';

class IndexView extends React.Component {
  componentWillUnmount(){
    console.log('index unmout')
  }
  render() {
    console.debug('index页面');
    return <div>主页页面</div>;
  }
}

export default IndexView;
