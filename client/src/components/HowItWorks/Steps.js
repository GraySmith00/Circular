import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spring, animated } from 'react-spring';
import { TimingAnimation, Easing } from 'react-spring/dist/addons.cjs';

class Steps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStep: props.selectedStep,
      pulseOpacity: 1.0,
      pulseColor: 'rgba(249, 199, 100, 1)',
      autoSlide: props.autoSlide
    };
  }

  componentDidMount() {
    if (this.props.pulseNextStep) {
      this.pulseInterval = setInterval(() => {
        if (this.state.pulseOpacity === 1.0) {
          this.setState({ pulseOpacity: 0.8, pulseColor: 'rgba(255,255,255,1)' });
        } else {
          this.setState({ pulseOpacity: 1.0, pulseColor: 'rgba(249,199,100,1)' });
        }
      }, 600);
    }

    if (this.state.autoSlide) {
      this.autoSlideInterval = setInterval(() => {
        if (this.state.autoSlide) {
          const nextStep = (this.state.selectedStep + 1) % this.props.children.length;
          this.autoSlideToStep(nextStep);
        }
      }, this.props.autoSlideDelay);
    }
  }

  componentWillUnmount() {
    if (this.props.pulseNextStep) {
      clearInterval(this.pulseInterval);
    }
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  autoSlideToStep(i) {
    this.setState({ selectedStep: i });
  }

  goToStep(i, stopAutoSliding = true) {
    if (stopAutoSliding) {
      this.setState({ selectedStep: i, autoSlide: false });
    } else {
      this.setState({ selectedStep: i });
    }
  }

  nextStep(stopAutoSliding = true) {
    if (this.state.selectedStep + 1 < this.props.children.length) {
      if (stopAutoSliding) {
        this.setState({ selectedStep: this.state.selectedStep + 1, autoSlide: false });
      } else {
        this.setState({ selectedStep: this.state.selectedStep + 1 });
      }
    }
  }

  prevStep(stopAutoSliding = true) {
    if (this.state.selectedStep - 1 > -1) {
      if (stopAutoSliding) {
        this.setState({ selectedStep: this.state.selectedStep - 1, autoSlide: false });
      } else {
        this.setState({ selectedStep: this.state.selectedStep - 1 });
      }
    }
  }

  _buildHandleEnterKeyPress = onClick => ({ key }) => {
    if (key === 'Enter') {
      onClick();
    }
  };

  _renderStepSelectors() {
    const numSteps = this.props.children.length;
    const selectedStep = this.state.selectedStep;
    const a = [];
    let halfSpacerClasses = 'half-spacer';
    if (this.props.vertical) {
      halfSpacerClasses += ' vertical';
    }
    a.push(<div className={halfSpacerClasses} key={'halfSpacer-start'} />);

    for (let i = 0; i < numSteps; i += 1) {
      let stepSelectorClasses = `step-selector-${i}`;
      let stepSpacerClasses = 'spacer-line';
      if (this.props.vertical) {
        stepSpacerClasses += ' vertical';
        stepSelectorClasses += ' vertical';
      }
      if (selectedStep === i) {
        stepSelectorClasses += ' selected';
      } else {
        stepSelectorClasses += ' not-selected';
      }
      if (i < selectedStep) {
        stepSelectorClasses += ' highlighted';
        stepSpacerClasses += ' highlighted';
      }
      let selector;
      if (i === selectedStep + 1) {
        const duration = this.state.pulseOpacity === 1.0 ? 300 : 600;
        selector = (
          <div
            className={stepSelectorClasses}
            key={`step-selector-${i}`}
            role="button"
            tabIndex="0"
            onKeyPress={this._buildHandleEnterKeyPress(e => {
              this.goToStep(i);
            })}
            onClick={e => {
              this.goToStep(i);
            }}
          >
            <Spring
              native
              to={{
                opacity: this.state.pulseOpacity,
                color: this.state.pulseColor,
                borderColor: this.state.pulseColor
              }}
              impl={TimingAnimation}
              config={{ duration, easing: Easing.linear }}
            >
              {style => (
                <animated.div className="circle" style={{ ...style }}>
                  {i + 1}
                </animated.div>
              )}
            </Spring>
          </div>
        );
      } else {
        selector = (
          <div
            className={stepSelectorClasses}
            key={`step-selector-${i}`}
            role="button"
            tabIndex="0"
            onKeyPress={this._buildHandleEnterKeyPress(e => {
              this.goToStep(i);
            })}
            onClick={e => {
              this.goToStep(i);
            }}
          >
            <div className="circle">{i + 1}</div>
          </div>
        );
      }

      a.push(selector);

      if (i !== numSteps - 1) {
        const stepSpacerLine = <div className={stepSpacerClasses} key={`step-spacer-${i}`} />;
        a.push(stepSpacerLine);
      }
    }
    a.push(<div className={halfSpacerClasses} key={'halfSpacer-end'} />);
    return a;
  }

  _renderChildren(vertical) {
    const wrappedChildren = [];
    const selectedStep = this.state.selectedStep;
    for (let i = 0; i < this.props.children.length; i += 1) {
      let springTo = { opacity: 0.2 };
      let springFrom = { opacity: 1 };
      if (!vertical) {
        springTo.height = 0;
        springFrom.height = 'auto';
      }
      if (selectedStep === i) {
        springTo = { opacity: 1 };
        springFrom = { opacity: 0.2 };
        if (!vertical) {
          springTo.height = 'auto';
          springFrom.height = 200;
        }
      }
      const wrappedChild = (
        <Spring
          native
          from={springFrom}
          to={springTo}
          key={`animated-step-content-${i}`}
          impl={TimingAnimation}
          config={{ duration: 900, easing: Easing.out(Easing.cubic) }}
        >
          {style => (
            <animated.div className="single-step-content" style={{ ...style }}>
              {this.props.children[i]}
            </animated.div>
          )}
        </Spring>
      );
      wrappedChildren.push(wrappedChild);
    }
    return wrappedChildren;
  }

  render() {
    const vertical = this.props.vertical;

    let containerClasses = 'steps-container';
    let selectorsContainerClasses = 'step-selectors-container';
    let springTo;
    if (vertical) {
      containerClasses += ' vertical';
      selectorsContainerClasses += ' vertical';
      springTo = { left: 0, top: `-${this.state.selectedStep * 100}%` };
    } else {
      springTo = { left: `-${this.state.selectedStep * 100}%`, top: 0 };
    }

    return (
      <div className={containerClasses} style={{ height: this.props.height }}>
        <div className={selectorsContainerClasses}>{this._renderStepSelectors()}</div>

        <Spring
          native
          to={springTo}
          impl={TimingAnimation}
          config={{ duration: 625, easing: Easing.out(Easing.cubic) }}
        >
          {style => (
            <animated.div className={'steps-content-container'} style={{ ...style }}>
              {this._renderChildren(vertical)}
            </animated.div>
          )}
        </Spring>

        {vertical ? <div className="centering-space" /> : null}
      </div>
    );
  }
}

Steps.defaultProps = {
  selectedStep: 0,
  vertical: false,
  pulseNextStep: false,
  autoSlide: false,
  autoSlideDelay: 4000,
  height: 'auto'
};

Steps.propTypes = {
  selectedStep: PropTypes.number,
  vertical: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pulseNextStep: PropTypes.bool,
  autoSlide: PropTypes.bool,
  autoSlideDelay: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
};

export default Steps;
