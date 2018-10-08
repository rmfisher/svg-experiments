import React from 'react'
import './Foreground.scss'

const Foreground = () => (
  <div className="foreground-container">
    <svg className="foreground-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path className="lower-path" d="M 50 0 L 100 0 L 100 200 Z" />
      <path className="upper-path" d="M 90 0 L 100 0 L 100 35 Z" />
    </svg>
    <div className="foreground-text">
      <div className="title">The sky above the port</div>
      <div className="subtitle">was the color of television, tuned to a dead channel.</div>
    </div>
  </div>
)

export default Foreground
