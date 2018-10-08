import { select } from 'd3-selection'

const dotSpacing = 44
const dotOffset = 22
const dotRadius = 3
const minPoints = 3
const maxPoints = 5
const minSegmentLength = 4
const maxSegmentLength = 10
const wormSpeed = 20 // Dots covered per second.
const wormLength = 15
const wormInterval = 100 // In ms.
const wormStartDelay = 50 // In ms.
const startPoints = []

export const drawCircuit = svgElement => {
  const width = svgElement.clientWidth || svgElement.parentNode.clientWidth
  const height = svgElement.clientHeight || svgElement.parentNode.clientHeight
  const svg = select(svgElement)

  const dotCountX = Math.floor((width - dotOffset) / dotSpacing) + 1
  const dotCountY = Math.floor((height - dotOffset) / dotSpacing) + 1
  const timeouts = []

  drawBackground(svg, dotCountX, dotCountY)

  const wormGroup = svg.append('g').attr('class', 'worm-group')
  drawWorm(wormGroup, dotCountX, dotCountY, timeouts)

  return () => cleanUp(svg, timeouts)
}

function drawBackground(svg, dotCountX, dotCountY) {
  const g = svg.append('g').attr('class', 'circuit-background')
  for (let i = 0; i < dotCountX; i++) {
    for (let j = 0; j < dotCountY; j++) {
      g.append('circle')
        .attr('cx', dotOffset + dotSpacing * i)
        .attr('cy', dotOffset + dotSpacing * j)
        .attr('r', dotRadius)
        .attr('class', 'circuit-dot')
    }
  }
}

function drawWorm(wormGroup, dotCountX, dotCountY, timeouts) {
  const points = generatePoints(dotCountX, dotCountY)
  const length = getLength(points)
  const duration = (2 * length) / dotSpacing / wormSpeed
  const clampedWormLength = Math.min(length, wormLength * dotSpacing)
  const dasharray = clampedWormLength + ' ' + 2 * length
  const path = wormGroup.append('path')

  path
    .attr('d', getPath(points))
    .attr('class', 'circuit-worm')
    .attr('style', getStyle(dasharray, length, duration))

  setTimeoutAndTrack(() => path.attr('style', getStyle(dasharray, -length, duration)), wormStartDelay, timeouts)
  setTimeoutAndTrack(() => path.remove(), duration * 1000 + wormStartDelay, timeouts)
  setTimeoutAndTrack(() => drawWorm(wormGroup, dotCountX, dotCountY, timeouts), wormInterval, timeouts)
}

function generatePoints(dotCountX, dotCountY) {
  const start = getStart(dotCountX, dotCountY)
  const pointCount = randomInt(minPoints, maxPoints)
  const h0 = Math.random() > 0.5
  const s0 = getSignFromBounds(start[0], start[1], h0, dotCountX, dotCountY)

  let h = h0
  let s = s0
  let x = start[0]
  let y = start[1]

  const points = [[x, y]]
  for (let i = 0; i < pointCount; i++) {
    if (h) {
      x = clamp(x + s * randomInt(minSegmentLength, maxSegmentLength), 0, dotCountX - 1)
    } else {
      y = clamp(y + s * randomInt(minSegmentLength, maxSegmentLength), 0, dotCountY - 1)
    }
    points[i + 1] = [x, y]

    h = !h
    s = getSignFromBounds(x, y, h, dotCountX, dotCountY)
  }
  return points
}

function getStart(dotCountX, dotCountY) {
  if (startPoints.length === 0) {
    addStartPoints(dotCountX, dotCountY)
  }
  return startPoints.splice(startPoints.length - 1, 1)[0]
}

function addStartPoints(dotCountX, dotCountY) {
  const sectionWidth = dotCountX / 3
  const sectionHeight = dotCountY / 2

  for (let i = 2; i >= 0; i--) {
    for (let j = 1; j >= 0; j--) {
      const minX = Math.floor(i * sectionWidth)
      const minY = Math.floor(j * sectionHeight)
      const maxX = Math.floor((i + 1) * sectionWidth)
      const maxY = Math.floor((j + 1) * sectionHeight)
      startPoints.push([randomInt(minX, maxX), randomInt(minY, maxY)])
    }
  }
}

function getSignFromBounds(x, y, h, dotCountX, dotCountY) {
  if ((h && x - minSegmentLength < 0) || (!h && y - minSegmentLength < 0)) {
    return 1
  } else if ((h && x + minSegmentLength > dotCountX - 1) || (!h && y + minSegmentLength > dotCountY - 1)) {
    return -1
  } else {
    return Math.random() > 0.5 ? 1 : -1
  }
}

function getLength(points) {
  let length = 0
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0]
    const dy = points[i + 1][1] - points[i][1]
    length += Math.abs(dx + dy)
  }
  return length * dotSpacing
}

function getPath(points) {
  const startX = dotOffset + dotSpacing * points[0][0]
  const startY = dotOffset + dotSpacing * points[0][1]
  let path = `M${startX},${startY}`
  for (let i = 1; i < points.length; i++) {
    const x = dotOffset + dotSpacing * points[i][0]
    const y = dotOffset + dotSpacing * points[i][1]
    path += ` L${x},${y}`
  }
  return path
}

function getStyle(dasharray, dashoffset, duration) {
  return `stroke-dasharray: ${dasharray}; stroke-dashoffset: ${dashoffset}; transition: stroke-dashoffset ${duration}s linear;`
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function setTimeoutAndTrack(f, duration, timeouts) {
  const id = setTimeout(() => {
    f()
    removeTimeout(timeouts, id)
  }, duration)

  timeouts.push(id)
}

function removeTimeout(timeouts, id) {
  const index = timeouts.indexOf(id)
  if (index > -1) {
    timeouts.splice(index, 1)
  }
}

function cleanUp(svg, timeouts) {
  svg.selectAll('*').remove()
  timeouts.forEach(t => clearTimeout(t))
}
