package java_algorithms;

import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        // Create a simple graph
        // A --1--> B --2--> C
        // A --4--> C
        
        Map<String, Node> graph = new HashMap<>();
        Node nodeA = new Node("A", 0, 0);
        Node nodeB = new Node("B", 0, 1);
        Node nodeC = new Node("C", 1, 1); // Diagonal from A

        // Add neighbors
        nodeA.addNeighbor("B", 1.0);
        nodeA.addNeighbor("C", 4.0);
        
        nodeB.addNeighbor("C", 2.0);
        
        // Add to graph
        graph.put("A", nodeA);
        graph.put("B", nodeB);
        graph.put("C", nodeC);

        System.out.println("Testing BFS:");
        Result bfsResult = BFS.findPath(graph, "A", "C");
        System.out.println("Path: " + bfsResult.path);
        System.out.println("Distance: " + bfsResult.distance);

        System.out.println("\nTesting Dijkstra:");
        Result dijkstraResult = Dijkstra.findPath(graph, "A", "C");
        System.out.println("Path: " + dijkstraResult.path);
        System.out.println("Distance: " + dijkstraResult.distance);
        
        System.out.println("\nTesting A*:");
        Result astarResult = AStar.findPath(graph, "A", "C");
        System.out.println("Path: " + astarResult.path);
        System.out.println("Distance: " + astarResult.distance);
    }
}
