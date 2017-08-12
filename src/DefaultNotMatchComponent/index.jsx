import React from 'react';
import { Link } from 'react-router-dom';

class NoPage extends React.Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          textAlign: 'center',
          top: '50%',
          marginTop: '-300px',
          left: '50%',
          marginLeft: '-175px',
        }}
      >
        <h1
          style={{
            fontSize: '13rem',
            fontWeight: 700,
            height: '58px',
            textShadow: '0px 3px 0px # 7 f8c8d',
          }}
        >
          404
        </h1>
        <div
          style={{
            lineHeight: '60px',
          }}
        >
          ERROR
        </div>
        <div>
          <Link to="/">返回主页</Link>
        </div>
      </div>
    );
  }
}
export default NoPage;
