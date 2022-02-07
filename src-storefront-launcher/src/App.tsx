
import React, { Component } from 'react';
import { hot } from "react-hot-loader/root";
import Launcher from './components/launcher/Launcher';


class App extends Component<any> {
  render() {
    const { name } = this.props;
    return (
      <div className="atls-launcher-main">
          <Launcher />
      </div>
    );
  }
}

export default hot(App);

