import React, { Component } from "react";
import {number, shape, arrayOf, func, string, object} from "prop-types";
import { format as d3Format } from "d3-format";

const handleStyle = {
  cursor: "move",
  userSekect: "none",
  MozUserSelect: "none",
  KhtmlUserSelect: "none",
  WebkitUserSelect: "none",
  OUserSelect: "none"
};

export const mapToKeyCode = code => {
  const codes = {
    37: -1,
    38: 1,
    39: 1,
    40: -1
  };
  return codes[code] || null;
};

export const sliderPropTypes = {
  cursorRadius: number,
  data: arrayOf(
    shape({
      x0: number,
      x: number,
      y: number
    })
  ).isRequired,
  handleLabelFormat: string,
  height: number,
  sliderStyle: object,
  width: number
};

export default class Slider extends Component {
  static propTypes = {
    ...sliderPropTypes,
    bucketSize: number,
    dragChange: func,
    histogramPadding: number,
    innerWidth: number,
    keyboardStep: number,
    onChange: func,
    padding: number,
    reset: func,
    scale: func,
    selectionColor: string,
    selection: arrayOf(number).isRequired,
  };

  static defaultProps = {
    cursorRadius: 9,
    sliderStyle: {
      display: "block",
      paddingBottom: "8px",
      zIndex: 6,
      overflow: "visible"
    },
    keyboardStep: 1
  };

  constructor(props) {
    super(props);

    this.cursorRefs = [];
    this.node = {};
    this.state = {
      dragging: false,
    };
  }

  componentDidMount() {
    window.addEventListener("mouseup", this.dragEnd, false);
    window.addEventListener("touchend", this.dragEnd, false);
  }

  componentWillUnmount() {
    window.removeEventListener("mouseup", this.dragEnd, false);
    window.removeEventListener("touchend", this.dragEnd, false);
  }

  dragStart = index => event => {
    const {dragChange} = this.props;
    const {dragging} = this.state;

    event.stopPropagation();
    if (!dragging) {
      this.setState(
        {
          dragging: true,
          dragIndex: index
        },
        () => {
          dragChange(true);
        }
      );
    }
  };

  dragEnd = event => {
    const {dragChange, onChange, selection, data} = this.props;
    const {dragIndex} = this.state;

    console.log('data', data);

    event.stopPropagation();
    this.setState(
      {
        dragging: false,
        dragIndex: null
      },
      () => {
        const currentSelection = selection[dragIndex];
        const currentInterval = data.find(({x, x0}) => currentSelection >= x0 && currentSelection < x);

        if (currentInterval) {
          const roundedSelection = currentSelection - currentInterval.x0 < currentInterval.x - currentSelection ?
            currentInterval.x0 : currentInterval.x;
          const newSelection = selection.slice();

          console.log('currentInterval', currentInterval, roundedSelection, selection);

          newSelection[dragIndex] = roundedSelection;
          onChange(newSelection);
        }

        dragChange(false);
      }
    );
  };

  dragFromSVG = event => {
    const {dragChange, onChange, scale, selection} = this.props;
    const {dragging} = this.state;

    if (!dragging && event.nativeEvent.offsetX) {
      let selected = scale.invert(event.nativeEvent.offsetX);
      let dragIndex;

      if (Math.abs(selected - selection[0]) > Math.abs(selected - selection[1])) {
        selection[1] = selected;
        dragIndex = 0;
      } else {
        selection[0] = selected;
        dragIndex = 1;
      }

      onChange(selection);
      this.setState(
        {
          dragging: true,
          dragIndex
        },
        () => {
          dragChange(true);
        }
      );
    }
  };

  mouseMove = event => {
    const {onChange, scale, selection} = this.props;
    const {dragging, dragIndex} = this.state;

    if (dragging) {
      selection[dragIndex] = scale.invert(event.nativeEvent.offsetX);
      onChange(selection);
    }
  };

  touchMove = ({touches}) => {
    const {onChange, scale, selection} = this.props;
    const {dragging, dragIndex} = this.state;

    if (dragging) {
      const left = this.node.getBoundingClientRect().left;
      const offsetX = touches[0].pageX - left;
      const newSelection = selection.slice();

      newSelection[dragIndex] = scale.invert(offsetX);
      onChange(newSelection);
    }
  };

  keyDown = index => event => {
    const { keyboardStep, onChange, selection } = this.props;

    const direction = mapToKeyCode(event.keyCode);
    let selections = [...selection];
    selections[index] = Math.round(selections[index] + direction * keyboardStep);
    onChange(selections);
  };

  renderCursor = (cursorValue, index) => {
    const {cursorRadius, handleLabelFormat, scale} = this.props;
    const formatter = d3Format(handleLabelFormat);

    return (
      <g
        tabIndex={0}
        onKeyDown={this.keyDown(index)}
        transform={`translate(${scale(cursorValue)}, 0)`}
        key={`handle-${index}`}
      >
        <circle
          style={handleStyle}
          r={cursorRadius + 1}
          cx={0}
          cy={12.5}
          fill="#ddd"
          strokeWidth="1"
        />
        <circle
          style={handleStyle}
          onMouseDown={this.dragStart(index)}
          onTouchMove={this.touchMove}
          onTouchStart={this.dragStart(index)}
          ref={node => this.cursorRefs[index] = node}
          r={cursorRadius}
          cx={0}
          cy={12}
          fill="white"
          stroke="#ccc"
          strokeWidth="1"
        />
        <text
          style={handleStyle}
          textAnchor="middle"
          x={0}
          y={36}
          fill="#666"
          fontSize={12}
        >
          {formatter(cursorValue)}
        </text>
      </g>
    );
  };

  render() {
    const {
      selection,
      scale,
      width,
      height,
      reset,
      selectedColor,
      unselectedColor,
      sliderStyle
    } = this.props;

    const selectionWidth = Math.abs(scale(selection[1]) - scale(selection[0]));
    const selectionSorted = Array.from(selection).sort((a, b) => +a - +b);

    return (
      <svg
        style={sliderStyle}
        height={height}
        width={width}
        onMouseDown={this.dragFromSVG}
        onDoubleClick={e => reset(e)}
        onMouseMove={this.mouseMove}
        ref={e => this.node = e}
      >
        <rect height={4} fill={unselectedColor} x={0} y={10} width={width} />
        <rect
          height={4}
          fill={selectedColor}
          x={scale(selectionSorted[0])}
          y={10}
          width={selectionWidth}
        />
        {selection.map(this.renderCursor)}
      </svg>
    );
  }
}
