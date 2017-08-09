import React from 'react';
import { Link } from 'react-router-dom';

class MainLayout extends React.Component {
  componentWillUnmount(){
    console.log('layout unmout')
  }
  render() {
    //console.debug(this.props)
    return (
      <div>
        <Link to="/main/about/id/1003">关于</Link>
        <Link to="/">主页</Link>
        {this.props.children}
      </div>
    );
  }
}

export default MainLayout;
