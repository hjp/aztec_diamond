console.log("aztec_diamond")
const size = Math.min(innerWidth, innerHeight)
const canvas = document.querySelector("canvas")
canvas.width = size
canvas.height = size
const ctx = canvas.getContext("2d")

function ad_1() {
  console.log("ad_1")
  const n = 1
  let tiles;
  if (Math.random() >= 0.5) {
    // split vertically
    tiles = [[{x:  0.5, y:  0.5}, {x:  0.5, y: -0.5}],
             [{x: -0.5, y: -0.5}, {x: -0.5, y:  0.5}]]
  } else {
    tiles = [[{x: -0.5, y:  0.5}, {x:  0.5, y:  0.5}],
             [{x:  0.5, y: -0.5}, {x: -0.5, y: -0.5}]]
  }
  let board = []
  // i tracks x, j tracks y. row major, so j is the outer loop.
  // That's a bit unusual, but I think more intuitive than the
  // alternative.
  for (let j = 0; j < 2*n; j++) {
    board[j] = []
    for (let i = 0; i < 2*n; i++) {
      board[j][i] = undefined
    }
  }
  for (let ti = 0; ti < tiles.length; ti++) {
    t = tiles[ti]
    for (let part = 0; part < 2; part++) {
      i = t[part].x + n - 0.5
      j = t[part].y + n - 0.5
      board[j][i] = ti
    }
  }
  return {n, tiles, board}
}

function x2sx(x, scale, size) {
  const sx = (x - 0.5) * scale + size/2
  return sx
}

function y2sy(y, scale, size) {
  const sy = size/2 - (y + 0.5) * scale 
  return sy
}

function color(t) {
  if (t[0].x == t[1].x && t[0].y > t[1].y) {
    return "#F008"
  }
  if (t[0].x == t[1].x && t[0].y < t[1].y) {
    return "#FF08"
  }
  if (t[0].y == t[1].y && t[0].x < t[1].x) {
    return "#0F08"
  }
  if (t[0].y == t[1].y && t[0].x > t[1].x) {
    return "#00F8"
  }
  throw("impossible direction")
}

function draw(state) {
  console.log("draw")
  const n = state.n
  const scale = size / (2*n)

  for (y = 0.5 - n; y < n; y += 1) {
    for (x = 0.5 - n; x < n; x += 1) {
      sx = x2sx(x, scale, size)
      sy = y2sy(y, scale, size)
      console.log(x, y, sx, sy)
      ctx.rect(sx, sy, scale, scale)
    }
  }
  ctx.strokeStyle = "#CCCCCC"
  ctx.stroke()

  for (const t of state.tiles) {
    console.log(t)
    const sx0 = Math.min(x2sx(t[0].x, scale, size), x2sx(t[1].x, scale, size))
    const sx1 = Math.max(x2sx(t[0].x, scale, size), x2sx(t[1].x, scale, size))
    const sy0 = Math.min(y2sy(t[0].y, scale, size), y2sy(t[1].y, scale, size))
    const sy1 = Math.max(y2sy(t[0].y, scale, size), y2sy(t[1].y, scale, size))
    console.log(sx0, sx1, sy0, sy1)
    ctx.beginPath()
    ctx.rect(sx0, sy0, sx1 - sx0 + scale, sy1 - sy0 + scale)
    ctx.fillStyle = color(t)
    ctx.strokeStyle = "#000000"
    ctx.fill()
    ctx.stroke()
  }

}

draw(ad_1())
