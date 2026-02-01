export const bfs = (graph, startNodeId, endNodeId) => {
  const queue = [startNodeId];
  const visited = new Set([startNodeId]);
  const previous = {};
  const visitedOrder = [];
  const distances = {}; // For consistent return format

  Object.keys(graph).forEach(node => {
    previous[node] = null;
    distances[node] = Infinity;
  });
  distances[startNodeId] = 0;
  let found = false;
  while (queue.length > 0) {
    const current = queue.shift();
    visitedOrder.push(current);
    if (current === endNodeId) {
      found = true;
      break;
    }
    const neighbors = graph[current].neighbors;
    for (const neighborId in neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        previous[neighborId] = current;
        distances[neighborId] = distances[current] + neighbors[neighborId]; // Accumulate distance for accuracy
        queue.push(neighborId);
      }
    }
  }

  // Reconstruct path
  const path = [];
  if (found) {
    let u = endNodeId;
    while (u !== null) {
      path.unshift(u);
      u = previous[u];
    }
  }
  return {
    visitedOrder,
    path,
    distance: distances[endNodeId]
  };
};