import React from "react";
import PropTypes from "prop-types";

import "./Display.css";

class Display extends React.Component {
  constructor(props) {
    super(props);

    this.state = { display: props.display, width: window.width };

    this.divRef = React.createRef();
    this.spanRef = React.createRef();

    this.previousWidth = window.width;
  }

  updateDimensions() {
    this.setState({ ...this.state, width: window.innerWidth });
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  render() {
    return (
      <div ref={this.divRef} className="Display">
        <span ref={this.spanRef} className="DisplaySpan">
          {this.props.display}
        </span>
      </div>
    );
  }

  componentDidUpdate() {
    let divWidth = this.divRef.current.clientWidth;
    this.previousWidth = divWidth;
  }
}

Display.propTypes = {
  display: PropTypes.string,
};

export default Display;
