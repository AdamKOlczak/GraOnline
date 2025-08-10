export function blowWind(game) {
  if (!game.debris) return game;

  let delta = { row: 0, col: 0 };
  switch (game.wind) {
    case "N": delta = { row: -1, col: 0 }; break;
    case "NE": delta = { row: -1, col: 1 }; break;
    case "E": delta = { row: 0, col: 1 }; break;
    case "SE": delta = { row: 1, col: 1 }; break;
    case "S": delta = { row: 1, col: 0 }; break;
    case "SW": delta = { row: 1, col: -1 }; break;
    case "W": delta = { row: 0, col: -1 }; break;
    case "NW": delta = { row: -1, col: -1 }; break;
  }

  game.debris = game.debris.map(d => ({
    row: wrap(d.row + delta.row),
    col: wrap(d.col + delta.col)
  }));

  return game;
}

// Dummy wrap function for demonstration
function wrap(val) {
  // Replace with your real grid size
  const size = 10;
  return (val + size) % size;
}
