export const dijkstra = (graph, startNodeId, endNodeId) => {
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  const visitedOrder = [];

  // Initialize
  Object.keys(graph).forEach(nodeId => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  });
  distances[startNodeId] = 0;
  while (unvisited.size > 0) {
    // Find node with smallest distance
    let currentNodeId = null;
    let smallestDistance = Infinity;
    for (const nodeId of unvisited) {
      if (distances[nodeId] < smallestDistance) {
        smallestDistance = distances[nodeId];
        currentNodeId = nodeId;
      }
    }
    if (currentNodeId === null || distances[currentNodeId] === Infinity) {
      break; // No reachable nodes left or target unreachable
    }
    if (currentNodeId === endNodeId) {
      visitedOrder.push(currentNodeId);
      break; // Reached target
    }
    unvisited.delete(currentNodeId);
    visitedOrder.push(currentNodeId);

    // Neighbors
    const neighbors = graph[currentNodeId].neighbors;
    for (const neighborId in neighbors) {
      if (unvisited.has(neighborId)) {
        const alt = distances[currentNodeId] + neighbors[neighborId];
        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          previous[neighborId] = currentNodeId;
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let u = endNodeId;
  if (previous[u] !== null || u === startNodeId) {
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