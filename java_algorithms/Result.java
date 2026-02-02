package java_algorithms;

import java.util.List;

public class Result {
    public List<String> visitedOrder;
    public List<String> path;
    public double distance;

    public Result(List<String> visitedOrder, List<String> path, double distance) {
        this.visitedOrder = visitedOrder;
        this.path = path;
        this.distance = distance;
    }
}
