export const astar = (graph, startNodeId, endNodeId) => {
  const gScore = {}; // Cost from start
  const fScore = {}; // Estimated total cost
  const previous = {};
  const openSet = new Set([startNodeId]);
  const closedSet = new Set();
  const visitedOrder = [];

  // Initialize
  Object.keys(graph).forEach(nodeId => {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
    previous[nodeId] = null;
  });
  gScore[startNodeId] = 0;
  fScore[startNodeId] = heuristic(graph[startNodeId], graph[endNodeId]);
  while (openSet.size > 0) {
    // Node in openSet with lowest fScore
    let current = null;
    let lowestF = Infinity;
    for (const nodeId of openSet) {
      if (fScore[nodeId] < lowestF) {
        lowestF = fScore[nodeId];
        current = nodeId;
      }
    }
    if (current === endNodeId) {
      visitedOrder.push(current);
      break;
    }
    openSet.delete(current);
    closedSet.add(current);
    visitedOrder.push(current);
    const neighbors = graph[current].neighbors;
    for (const neighborId in neighbors) {
      if (closedSet.has(neighborId)) continue;
      const tentativeG = gScore[current] + neighbors[neighborId];
      if (!openSet.has(neighborId)) {
        openSet.add(neighborId);
      } else if (tentativeG >= gScore[neighborId]) {
        continue;
      }
      previous[neighborId] = current;
      gScore[neighborId] = tentativeG;
      fScore[neighborId] = gScore[neighborId] + heuristic(graph[neighborId], graph[endNodeId]);
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

  // Return distance as gScore of endNode
  return {
    visitedOrder,
    path,
    distance: gScore[endNodeId]
  };
};

// Euclidean distance heuristic
const heuristic = (nodeA, nodeB) => {
  const lat1 = nodeA.lat;
  const lon1 = nodeA.lng;
  const lat2 = nodeB.lat;
  const lon2 = nodeB.lng;
  // Approximate conversion to meters or just use raw coordinate distance for comparison
  // Using Euclidean distance on lat/lng for simplicity in this context
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2)) * 111000; // approx meters
};