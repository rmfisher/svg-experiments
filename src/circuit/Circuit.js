import React, { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { drawCircuit } from './circuitUtils'
import './Circuit.scss'

class Circuit extends Component {
  componentDidMount() {
    this.initialize()
  }

  componentWillUnmount() {
    if (this.cleanUpRunningCircuit) {
      this.cleanUpRunningCircuit()
    }
  }

  initialize = () => {
    if (this.cleanUpRunningCircuit) {
      this.cleanUpRunningCircuit()
    }
    this.cleanUpRunningCircuit = drawCircuit(this.svg)
  }

  render() {
    return (
      <ReactResizeDetector handleWidth handleHeight onResize={this.initialize}>
        <div className="circuit">
          <svg className="circuit-svg" ref={e => (this.svg = e)} />
        </div>
      </ReactResizeDetector>
    )
  }
}

export default Circuit
