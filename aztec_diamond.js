console.log("aztec_diamond")
const size = Math.min(innerWidth, innerHeight)
const canvas = document.querySelector("canvas")
canvas.width = size
canvas.height = size
const ctx = canvas.getContext("2d")

function tile_board(n, tiles) {
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
  return board
}

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
  const board = tile_board(n, tiles)
  return {n, tiles, board, shrink: 0, phase: "shrink"}
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
  console.log("draw", state)
  const n = state.n
  const scale = size / (2 * (n + state.shrink/8))

  ctx.fillStyle = "#FFF8"
  ctx.fillRect(0, 0, size, size)

  ctx.beginPath()
  for (y = 0.5 - n; y < n; y += 1) {
    for (x = 0.5 - n; x < n; x += 1) {
      if (Math.abs(x) + Math.abs(y) <= n) {
        sx = x2sx(x, scale, size)
        sy = y2sy(y, scale, size)
        console.log(x, y, sx, sy)
        ctx.rect(sx, sy, scale, scale)
      }
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

function expand(state) {
  const n = state.n + 1
  const board = tile_board(n, state.tiles)
  state = {...state, n, board, shrink: 0}
  return state
}

function sanitize(state) {
  console.log("sanitize", state)
  let tiles = []
  const n = state.n
  for (let ti = 0; ti < state.tiles.length; ti++) {
    const t = state.tiles[ti];
    console.log(ti, t)
    const direction = {x: t[0].y - t[1].y, y: t[1].x - t[0].x}
    const i = t[0].x + n - 0.5
    const j = t[0].y + n - 0.5
    const oi = i + direction.x
    const oj = j + direction.y
    const oti = state.board[oj][oi]
    if (oti === undefined) {
      // no neighbour
      tiles.push(t)
    } else {
      const ot = state.tiles[oti]
      const odirection = {x: ot[0].y - ot[1].y, y: ot[1].x - ot[0].x}
      if (odirection.x == -direction.x && odirection.y == - direction.y) {
        // Omit this tile. ot will also be omitted
      } else {
        tiles.push(t)
      }
    }
  }
  state = {...state, tiles, phase: "move", move: 0}
  return state
}

function move_tiles(state) {
  console.log("move_tiles", state)
  let tiles = []
  for (t of state.tiles) {
    const direction = {x: t[0].y - t[1].y, y: t[1].x - t[0].x}
    tiles.push([{x: t[0].x + direction.x / 8, y: t[0].y + direction.y / 8},
                {x: t[1].x + direction.x / 8, y: t[1].y + direction.y / 8}, ])
  }
  state = {...state, tiles, move: state.move + 1}
  return state
}

function assert(b) {
  if (!b) {
    throw("assertion failed")
  }
}

function fill_gaps(state) {
  n = state.n
  // state.board is inconsistent after move, so we recompute it
  board = tile_board(n, state.tiles)
  tiles = [...state.tiles]
  for (y = 0.5 - n; y < n; y += 1) {
    for (x = 0.5 - n; x < n; x += 1) {
      if (Math.abs(x) + Math.abs(y) <= n) {
        const i = x + n - 0.5
        const j = y + n - 0.5
        if (board[j][i] === undefined) {
          assert(board[j][i+1] == undefined)
          assert(board[j+1][i] == undefined)
          assert(board[j+1][i+1] == undefined)
          if (Math.random() >= 0.5) {
            // split vertically
            tiles.push([{x: x+1, y: y+1}, {x: x+1, y: y}])
            tiles.push([{x: x,   y: y},   {x: x,   y: y+1}])

          } else {
            tiles.push([{x: x,   y: y+1}, {x: x+1, y: y+1}])
            tiles.push([{x: x+1, y: y},   {x: x,   y: y  }])
          }
          // mark cells as in use. Don't care about tile numbers,
          // we'll recompute anyway
          board[j][i] = -1
          board[j][i+1] = -1
          board[j+1][i] = -1
          board[j+1][i+1] = -1
        }
      }
    }
  }
  board = tile_board(n, tiles)
  state = {...state, tiles, board, phase: "shrink", shrink: 0}
  return state
}

function step(state) {
  draw(state)
  if (state.phase == "shrink") {
    if (state.shrink < 8) {
      state = {...state, shrink: state.shrink + 1}
    } else {
      state = {...state, phase: "sanitize"}
    }
  } else if (state.phase == "sanitize") {
    state = expand(state)
    state = sanitize(state)
  } else if (state.phase == "move") {
    if (state.move < 8) {
      state = move_tiles(state)
    } else {
      state = {...state, phase: "fill"}
    }
  } else if (state.phase = "fill") {
    state = fill_gaps(state)
  } else {
    throw("impossible state " + state.phase)
  }
  window.setTimeout(step, 100, state)
}


initial_state = ad_1()
window.setTimeout(step, 100, initial_state)
