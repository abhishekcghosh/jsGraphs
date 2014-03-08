## jsGraphs ##

### Experiments with Graphs, JSON and XHR in JS ###

This Graph Implementation uses a bit of a different approach than the usual
where a Graph is created with ennumerated vertices and data is stored based on a 
collection of Edges.

So usually, we simply represent the Graph as:
<pre>
G {
     vertices: 1, 2, 3, 4, 5....
     edges: [1, 2, W1], [4, 5, W2], [3, 5, W3]....
}	
</pre>	

In this design however, the Graph consists of majorly **Vertex objects**, which within themselves have a **collection of connections** holding data for the **Edges** that are associated with them. This makes the design somewhat complex.

So, this means that here, the Graph becomes something like:
<pre>
G {
     vertices: [
          {1, edgesWith: [2, W1] },
          {2, edgesWith: [1, W1] },
          {3, edgesWith: [5, W3] },
          {4, edgesWith: [5, W2] },
          {5, edgesWith: [3, W3], [4, W2] }
     ]
}
</pre>
	
The above example considers the graph to contain **bi-directional** edges. 

This approach may have some drawbacks like increased amount (and at times redundant) data but mostly this has been an experiment of modelling the data in a different way, so... 

*What the hell anyway, just getting on with it, playing with the stuff! :)*

On a second note, this approach was *chosen to begin with* to keep the ability to provide for future capabilities of **enhancing the Vertex objects**, like with increased properties.

### Features till now ###

* **Vertex** and **Edges** modeled as objects and used inside the **Graph** object, which is pretty obvious.
* **Edge** objects are not directly used by the **Graph** object, but belong as a collection of a **Vertex** object. Also, edges can be **weighed**, which means that you can construct a weighted-graph and run traversals to find shortest or least-cost paths based on the weighed edges.
*  **Graph** object has the capability to run regular search or traversal algorithms, mainly:
	* **Depth-First Search (DFS)** - `depthFirstSearch(searchVertex, StartFromVertex, verboseMode)` 
	* **Bread-First Seach (BFS)** - `breadthFirstSearch(searchVertex, StartFromVertex, verboseMode)`
	* **Dijkstra's Algorithm** (Least-Cost / Shortest-Path) - `dijkstra(searchVertex, StartFromVertex, verboseMode)` (This implementation of Dijkstra's Algorithm uses a **Priority Queue**)
* **Random Graph Generation** feature to generate graphs with huge number of vertices, random edges, random edge weights and the ability to **download** and save the generated random graph in **JSON** format.
* Ready-to-run **100 randomly generated test cases** for each of the graph traversal algorithms on two sample graphs each with **200 vertices**, both uni-directional and bi-directional edged graphs available for easy testing.


Graphs can be easily created from compatible **JSON** data. A sample is shown here:

<pre>
{      
   "graphName": "GRAPH1",
   "vertices" : [
      {
         "id" : 0,
         "conn" : [
                  { 
                     "dest": 1, 
                     "weight": 2
                  },
                  { 
                     "dest": 2, 
                     "weight": 4
                  }
         ]
      },
      {
         "id" : 1,
         "conn" : [
                  { 
                     "dest": 2, 
                     "weight": 8
                  },
                  { 
                     "dest": 3, 
                     "weight": 16
                  },
                  { 
                     "dest": 4, 
                     "weight": 32
                  }
         ]
      },
      {
         "id" : 2,
         "conn" : [
                  { 
                     "dest": 3, 
                     "weight": 64
                  },
                  { 
                     "dest": 4, 
                     "weight": 128
                  }
         ]
      },
      {
         "id" : 3,
         "conn" : [
                  { 
                     "dest": 4, 
                     "weight": 256
                  },
                  { 
                     "dest": 5, 
                     "weight": 512
                  }
         ]
      },
      {
         "id" : 5,
         "conn": {
                  "dest" : 6
               }
      },
      {
         "id" : 4,
         "conn" : {
                  "dest" : 5,
                  "weight" : 1024
               }
      },
      {
         "id" : 6
      },
      {
         "id" : 7
      },
      {
         "id" : 8
      },
      {
         "id" : 9
      },
      {
         "id" : 10
      }
      
   ],
   "properties" : 
      {
         "bidirectionalEdges" : true
      }
}
</pre>


The traversal algorithms all return objects of a similar kind:
<pre>
{
    searchResult: boolean, true or false depending on if path is found,
    verboseData: string, total stack trace data for the algorithm run if verbose mode selected, 
    pathTrace: string, visual representation of path found or "Path not found!", 
    pathLength/pathCost: cost/length of the path found, or null if not found
}
</pre>

The **verbose** mode for the traversal algorithms generate detailed stack / flow data which is helpful for debugging or understanding the traversal logic.
