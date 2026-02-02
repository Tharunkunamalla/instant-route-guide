package java_algorithms;

import java.util.*;

public class AStar {

    public static Result findPath(Map<String, Node> graph, String startNodeId, String endNodeId) {
        Map<String, Double> gScore = new HashMap<>();
        Map<String, Double> fScore = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        Set<String> openSet = new HashSet<>();
        Set<String> closedSet = new HashSet<>();
        List<String> visitedOrder = new ArrayList<>();

        // Initialize
        for (String nodeId : graph.keySet()) {
            gScore.put(nodeId, Double.POSITIVE_INFINITY);
            fScore.put(nodeId, Double.POSITIVE_INFINITY);
            previous.put(nodeId, null);
        }

        gScore.put(startNodeId, 0.0);
        fScore.put(startNodeId, heuristic(graph.get(startNodeId), graph.get(endNodeId)));
        openSet.add(startNodeId);

        while (!openSet.isEmpty()) {
            // Node in openSet with lowest fScore
            String current = null;
            double lowestF = Double.POSITIVE_INFINITY;

            for (String nodeId : openSet) {
                double score = fScore.getOrDefault(nodeId, Double.POSITIVE_INFINITY);
                if (score < lowestF) {
                    lowestF = score;
                    current = nodeId;
                }
            }

            if (current == null) break;

            if (current.equals(endNodeId)) {
                visitedOrder.add(current);
                break;
            }

            openSet.remove(current);
            closedSet.add(current);
            visitedOrder.add(current);

            Map<String, Double> neighbors = graph.get(current).neighbors;
            for (Map.Entry<String, Double> entry : neighbors.entrySet()) {
                String neighborId = entry.getKey();
                double weight = entry.getValue();

                if (closedSet.contains(neighborId)) continue;

                double tentativeG = gScore.get(current) + weight;

                if (!openSet.contains(neighborId)) {
                    openSet.add(neighborId);
                } else if (tentativeG >= gScore.get(neighborId)) {
                    continue;
                }

                previous.put(neighborId, current);
                gScore.put(neighborId, tentativeG);
                fScore.put(neighborId, gScore.get(neighborId) + heuristic(graph.get(neighborId), graph.get(endNodeId)));
            }
        }

        // Reconstruct path
        List<String> path = new ArrayList<>();
        String u = endNodeId;
        if (previous.get(u) != null || u.equals(startNodeId)) {
            while (u != null) {
                path.add(0, u);
                u = previous.get(u);
            }
        }

        return new Result(visitedOrder, path, gScore.get(endNodeId));
    }

    // Euclidean distance heuristic
    private static double heuristic(Node nodeA, Node nodeB) {
        double lat1 = nodeA.lat;
        double lon1 = nodeA.lng;
        double lat2 = nodeB.lat;
        double lon2 = nodeB.lng;
        // Approximate conversion to meters or just use raw coordinate distance for comparison
        // Using Euclidean distance on lat/lng for simplicity in this context matching JS implementation
        return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2)) * 111000; 
    }
}
