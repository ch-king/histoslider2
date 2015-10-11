import React, { Component, PropTypes } from 'react'
import arrays from 'd3-arrays'
import format from 'd3-format'

const sliderStyle = {
  display: 'block',
  marginTop: '-10px',
  paddingBottom: '10px'
}

const handleStyle = {
  cursor: 'move'
}

const f = format.format('0.3P')

export default class Slider extends Component {

  componentDidMount () {
    window.addEventListener('mousemove', this.mouseMove.bind(this), false)
    window.addEventListener('mouseup', this.dragEnd.bind(this), false)
  }

  componentWilUnmount () {
    window.removeEventListener('mousemove', this.mouseMove.bind(this), false)
    window.removeEventListener('mouseup', this.dragEnd.bind(this), false)
  }

  constructor () {
    super()
    this.state = {
      dragging: false
    }
  }

  dragStart (index, e) {
    e.stopPropagation()
    if (!this.state.dragging) {
      this.setState({
        dragging: true,
        dragIndex: index
      })
    }
  }

  dragEnd (e) {
    e.stopPropagation()
    this.setState({
      dragging: false
    })
  }

  dragFromSVG (e) {
    if (!this.state.dragging) {
      let selection = [...this.props.selection]
      let selected = this.props.scale.invert(e.nativeEvent.layerX)
      let dragIndex

      if (Math.abs(selected - selection[0]) > Math.abs(selected - selection[1])) {
        selection[1] = selected
        dragIndex = 0
      } else {
        selection[0] = selected
        dragIndex = 1
      }

      this.props.onChange(selection)
      this.setState({
        dragging: true,
        dragIndex
      })
    }
  }

  mouseMove (e) {
    if (this.state.dragging) {
      let selection = [...this.props.selection]
      selection[this.state.dragIndex] = this.props.scale.invert(e.layerX)
      this.props.onChange(selection)
    }
  }

  reset () {
    this.props.onChange(null)
  }

  render () {
    const selection = this.props.selection
    const innerHeight = this.props.height - this.props.padding
    const selectionWidth = Math.abs(this.props.scale(selection[1]) - this.props.scale(selection[0]))

    return (
      <svg
        style={sliderStyle}
        height={this.props.height - 10}
        width={this.props.width}
        onMouseDown={this.dragFromSVG.bind(this)}
        onDoubleClick={this.reset.bind(this)}
      >
        <rect
          height={8}
          fill='#fafafa'
          x={ this.props.scale(this.props.selectionSorted[0]) }
          y={8}
          width={selectionWidth}
        />
        <rect
          height={2}
          fill='#2ecc71'
          x={ this.props.scale(this.props.selectionSorted[0]) }
          y={11}
          width={selectionWidth}
        />
        {
          this.props.selection.map((m, i) => {
            return (
              <g transform={'translate(' + this.props.scale(m) + ', 0)'} key={i}>
                <circle
                  style={handleStyle}
                  r={10}
                  cx={0}
                  cy={12.5}
                  fill='#ddd'
                  strokeWidth='1'
                />
                <circle
                  style={handleStyle}
                  onMouseDown={this.dragStart.bind(this, i)}
                  r={9}
                  cx={0}
                  cy={12}
                  fill='white'
                  stroke='#ccc'
                  strokeWidth='1'
                />
                <text
                  textAnchor="middle"
                  x={0}
                  y={36}
                  fill='#666'
                  fontSize={12}
                >
                  {f(m)}
                </text>
              </g>
            )
          })
        }
      </svg>
    )
  }
}

Slider.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  start: PropTypes.number,
  end: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
  bucketSize: PropTypes.number,
  selection: PropTypes.arrayOf(PropTypes.number).isRequired,
  histogramPadding: PropTypes.number
}