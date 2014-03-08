// EXPERIMENTS WITH GRAPH TRAVERSALS
// Abhishek Ghosh

/*

	This Graph Implementation uses a bit of a different approach than the usual
	where a Graph is created with ennumerated vertices and data is stored based on a 
	collection of Edges.

	So usually, we simply represent the Graph as **
		G {
			vertices: 1, 2, 3, 4, 5....
			edges: [1, 2, W1], [4, 5, W2], [3, 5, W3]....
		}		
	
	(** Here, I am not concered with the syntactical correctness of notation but on the 
	contrary trying to explain intuitively.)

	In this design however, the Graph consists of majorly Vertex objects, which within 
	themselves have a collection of connections holding data for the Edges that are 
	associated with them. This makes the design somewhat complex.

	So, this means that here, the Graph becomes
		G {
			vertices: [
				{1, edgesWith: [2, W1] },
				{2, edgesWith: [1, W1]** },
				{3, edgesWith: [5, W3] },
				{4, edgesWith: [5, W2] },
				{5, edgesWith: [3, W3]**, [4, W2]** }
			]
		}
		
	(** Considering the graph to contain bidirectional data. Else it would have been simpler.)

	This approach may have some drawbacks like increased amount (and at times redundant) data
	but mostly this has been an experiment of modelling the data in a different way, so...
	What the hell anyway, just getting on with it, playing with the stuff! :)

	## On a second note, this approach was chosen to begin with to keep the ability to provide 
	for future capabilities of enhancing the Vertex objects, like with increased properties. ##

*/
// THE VERTEX ------------------------------------------------------------------------------------

// THE EDGES, to be used in vertices
function Edge(destination, edgeWeight) {
	this.dest = destination;
	this.weight = edgeWeight;
}
// dest getters and setters
Edge.prototype.getDestination = function () {
	return this.dest;
}
Edge.prototype.setDestination = function (newDest) {
	this.dest = newDest;
}
// weight getters and setters
Edge.prototype.getWeight = function () {
	return this.weight;
}
Edge.prototype.setWeight = function (newWeight) {
	this.weight = newWeight;
}
// edge compare
Edge.prototype.isEqualToEdge = function (refEdge) {
	if (this.dest == refEdge.getDestination() && this.weight == refEdge.getWeight()) {
		return true;
	}
	return false;
}


// create a vertex (or node)
function Vertex(id) {
	this.id = id;
	this.conn = [];
}

// getId() -> simple return the id
Vertex.prototype.getId = function () {
	return this.id;
};

// setId() -> set this vertex with a new id
Vertex.prototype.setId = function (newId) {
	this.id = newId;
};

// create an edge, between this vertex and vertex with provided id
// second parameter [optional] if true, tries to request a biDectional edge, i.e. 
// asks the vertex with provided id to link to this vertex too.
// Note that connections are implemented using the Ids of the vertices
// the reference of the vertex could have been actually stored too but 
// its probably not a good idea, because with large complex graphs, it could 
// become unnecessarily resource intensive and cumbersome to handle... 
// so voting against the idea for now...
Vertex.prototype.attachVertex = function (refVertex, requestBD, edgeWeight) {
	// for requestBD
	if (typeof requestBD == "undefined") {
		requestBD = false;
	}
	// for requestBD
	if (typeof edgeWeight == "undefined") {
		edgeWeight = 0;
	}
	// check if connection already exists on this side
	var i, alreadyExists = false;
	var id = refVertex.getId();	
	var newEdge = new Edge(id, edgeWeight);	
	var connLength = this.conn.length;
	for (i = 0; i < connLength; i++) {
		if (this.conn[i].isEqualToEdge(newEdge) == true) { 				
			// already connected, so dont create duplicate values, 
			alreadyExists = true;
			break;
		}
	}
	if (alreadyExists == false) {
		this.conn.push(newEdge); 										
	}
	if (requestBD == true) {
		// request for other vertex to add this vertex
		// here, note that the requestBD for this call 
		// will obviously be false (pitfall otherwise)
		refVertex.attachVertex(this, false, edgeWeight);
	}
};

// destroy any edges, between this vertex and vertex with provided id
// although duplication prevention code is written in attachVertex() itself,
// still going for a thorough check for duplicate entries and removing al of them
Vertex.prototype.detachVertex = function (refVertex) {
	var i;
	// go through each item of the connections array, 
	// remove all with provided id
	var connLength = this.conn.length;
	for(i = 0; i < connLength; i++) {
		if (this.conn[i].getDestination() == refVertex.getId()) {
			this.conn.splice(i, 1);
		}
	}
}

// stingify all connections and print
Vertex.prototype.stringifyConnections = function () {
	var i;
	var edgeStr = "";
	var connLength = this.conn.length;
	for (i = 0; i < connLength; i++) {
		edgeStr += "{Vertex[" + this.conn[i].getDestination() + "], Weight:" + this.conn[i].getWeight() + "}, ";
	}
	edgeStr = edgeStr.substr(0, edgeStr.length - 2);
	return edgeStr; 													
}


// THE GRAPH --------------------------------------------------------------------------------
// create a graph object
function Graph(graphName) {
	if (typeof graphName == "undefined") {
		graphName = "UNNAMED_GRAPH";
	}
	this.graphName = graphName;
	this.vertices = [];		
}

// graph name getters and setters
Graph.prototype.getGraphName = function () {
	return this.graphName;
}
Graph.prototype.setGraphName = function (newName) {
	this.graphName = newName;
}

// graph vertex getter
Graph.prototype.getVertex = function (vertexId) {
	var i;
	var vertLength = this.vertices.length;
	for (i = 0; i < vertLength; i++) {
		if (this.vertices[i].getId() == vertexId) {
			// found required vertex, return
			return this.vertices[i];
		}
	}
	// not found
	return null;
}

// obtain a json data of a graph representation
// generate the graph
// sample data:
// ways to define connections:
// case #1: multiple connections, use array; for ex, the vertex becomes { "id": 1, "conn" : [2, 3, 4] }
// case #1: single connections, no array, just mention the element; for ex, the vertex becomes { "id": 4, "conn" : 5 }
// case #1: multiple connections, so just omit the "conn" property itself; for ex, the vertex becomes { "id": 5 }
// also, other of json doesn't need to be sequential for the vertices, but keep in mind that the total number 
// of vertices equal to the numbering of the vertices for convenience... 
Graph.prototype.createGraphFromJSON = function (jsonGraph) {
	
	if (jsonGraph.hasOwnProperty("graphName")) {
		this.setGraphName(jsonGraph.graphName);
	}
	var requestBD = false;
	if (jsonGraph.hasOwnProperty("properties")) {
		if (jsonGraph.properties.hasOwnProperty("bidirectionalEdges")) {
			requestBD = jsonGraph.properties.bidirectionalEdges;
		}
	}	

	if (jsonGraph.vertices instanceof Array) {
		// check if multiple vertices are at all present, then loop over
		this.vertices = new Array(jsonGraph.vertices.length);
		var i, v, vi;
		var vertLength = jsonGraph.vertices.length;
		for (i = 0; i < vertLength; i++) {
			v = jsonGraph.vertices[i];
			// want to keep program internal logic of vertices and json naming separate, 
			// so create nodes following data instead of directly using the json objects
			// ** The graph is created from the JSON in such a way that the Vertex Id is always
			// equal to the index of that Vertex's reference in the graph's vertices array
			// This is very important in this design since the DFS, BFS implementations depend on it. **
			vi = new Vertex(v.id);			
			this.vertices[v.id] = vi;
		}
		// now create the connections,
		var vDest, vWeight;
		vertLength = jsonGraph.vertices.length;
		for (i = 0; i < vertLength; i++) {
			v = jsonGraph.vertices[i];
			if (v.hasOwnProperty("conn")) {
				if (v.conn instanceof Array) {
					// loop for creating the connections
					var j;
					var connLength = v.conn.length;
					for (j = 0; j < connLength; j++) {
						vDest = v.conn[j].dest;
						// if edge has weight						
						if (v.conn[j].hasOwnProperty("weight")) {
							vWeight = v.conn[j].weight;							
						} else {
							// default weight to 0
							vWeight = 0;
						}
						this.vertices[v.id].attachVertex(this.vertices[vDest], requestBD, vWeight);
					}
				} else {
					// only one connection, go ahead
					// if has weight mentioned
					if (v.conn.hasOwnProperty("weight")) {
						vWeight = v.conn.weight;
					} else {
						vWeight = 0;
					}
					this.vertices[v.id].attachVertex(this.vertices[v.conn.dest], requestBD, vWeight);
				}
			} else {
				// no edges defined, this.conn remains []
			}
		}
	}
}

// display strings describing the graph
Graph.prototype.displayGraph = function () {
	var i;
	var graphStr = "", vertextStr = "";
	graphStr += "\nDisplaying data for graph: " + this.graphName + "\n";
	var vertLength = this.vertices.length; 
	for (i = 0; i < vertLength; i++) {
		// loop vertices, stringify them and print
		vertexStr = this.vertices[i].stringifyConnections();
		if (vertexStr == "") {
			vertexStr = "None";
		}
		graphStr += " Vertex[" + i + "]: Connected with: " + vertexStr + "\n"; 
	}
	return graphStr;	
}

// GRAPH TRAVERSALS: DEPTH-FIRST-SEARCH
// this implements a sample DFS algorithm in the graph
// the purpose is very simple, just search for a vertex
// with a given vertex id.
// accepts 3 parameters
//	1. searchVertex  - the vertex id of the vertex to search for
//  2. startFromNode - the vertex id to start the search from. 						
//	3. verbose - [optional = false] boolean to determine if detailed DFS traversal data is generated
// the returned object structure is as follows:
/*
	{
		searchResult : 	[boolean] (true or false depending on if path is found),
		verboseData  : 	[string]  (total stack trace data for the algorithm run if verbose mode selected), 
		pathTrace    : 	[string]  (visual representation of path found or "Path not found!), 
		pathLength   : 	[number]  (length of the path found, or null if not found)
	}
*/
// NOTE: IMPLEMENTED DFS ALGORITHM IS EDGE-WEIGHT INDEPENDENT 
Graph.prototype.depthFirstSearch = function (searchVertex, startFromVertex, verbose) {	
	if (typeof startFromVertex == "undefined") {
		startFromVertex = this.vertices[0].getId();
	}
	if (typeof verbose == "undefined") {
		verbose = false;
	}
	// initiate dfs routine 
	// note: algo implementation assumes that vertex id and vertex index in
	// vertices array are equal. No worries there too since the graph is created
	// from the JSON in similar way too. (Redundant data I know, but the for time being
	// to keep things simple...)
	var vStack = [];
	var markedVertex = new Array(this.vertices.length);
	var startVertex = this.vertices[startFromVertex];
	var i, j;
	// path tracing
	var dfsPath = [];
	var prevVertex = new Array(this.vertices.length);
	var prevVertLength = prevVertex.length;
	for (i = 0; i < prevVertLength; i++) { prevVertex[i] = -1; }	
	// verbose feedback
	var verboseStr = "";
	if (verbose) { verboseStr += "Starting Depth-First Search for Vertex [" + searchVertex +"] from Vertex [" + startFromVertex + "].\n" }
	vStack.push(startVertex.id);
	while (vStack.length > 0) {
		// dump present stack condition
		if (verbose) { verboseStr += "DFS Stack Status: [" + vStack.join(",") + "]\n" ;	}
		// fetch a vertex to search from the stack
		i = vStack.pop();		
		if (verbose) { verboseStr += "Popped Vertex[" + i + "]\n"; }		
		// if the vertex has yet not been gone through	
		if (markedVertex[i] != true) {
			if (verbose) { verboseStr += "Reached Vertex[" + i + "]\n"; }
			// check if we found our required vertex
			if (this.vertices[i].getId() == searchVertex) {
				// yay! we dound our vertex
				// trace the path
				var pathTraceItem = searchVertex;
				while(pathTraceItem != startFromVertex) {
					dfsPath.push(pathTraceItem);
					pathTraceItem = prevVertex[pathTraceItem];
				}
				dfsPath.push(startFromVertex);
				if (verbose) { verboseStr += "Yay! We just found Vertex [" + searchVertex +"] !!!\n"; } 
				return { searchResult: true, verboseData: verboseStr, pathTrace: dfsPath.join(" <= "), pathLength: (dfsPath.length - 1) };
			}
			// label this vertex as discovered
			markedVertex[i] = true;		
			var vertConnLength = this.vertices[i].conn.length;
			for (j = 0; j < vertConnLength; j++) {
				// add vertex to stack
				vStack.push(this.vertices[i].conn[j].dest);
				// add to prevVertex for path tracing later
				if (prevVertex[this.vertices[i].conn[j].dest] == -1)  { prevVertex[this.vertices[i].conn[j].dest] = i; }
				if (verbose) { verboseStr += "Pushed Vertex [" + this.vertices[i].conn[j].dest +"] into Stack\n"; }	
			}								
		} else {
			// nothing here too, simply popping the next vertex next 
		}
	}
	// oops, we did not find our search vertex :(
	if (verbose) { verboseStr += "Oops! We couldn't find Vertex [" + searchVertex +"] :(\n"; }
	return { searchResult: false, verboseData: verboseStr, pathTrace: "Path not found!", pathLength: null };
}


// GRAPH TRAVERSALS - BREADTH-FIRST-SEARCH
// this function implements a BFS algo in the graph.
// BFS returns the SHORTEST-PATH from source vertex 
// to destination vertex if such a path exists.
// The purpose is very simple, to generate a BFS searchResult
// for a given vertex with id from a source vertex
// accepts 3 parameters
//	1. searchVertex  - the vertex id of the vertex to search for
//  2. startFromNode - the vertex id to start the search from. 						
//	3. verbose - [optional = false] boolean to determine if detailed DFS traversal data is generated
// the returned object structure is as follows:
/*
	{
		searchResult : 	[boolean] (true or false depending on if path is found),
		verboseData  : 	[string]  (total stack trace data for the algorithm run if verbose mode selected), 
		pathTrace    : 	[string]  (visual representation of path found or "Path not found!), 
		pathLength   : 	[number]  (length of the path found, or null if not found)
	}
*/
// NOTE: IMPLEMENTED BFS ALGORITHM IS EDGE-WEIGHT INDEPENDENT 
// IF YOU ARE LOOKING FOR A LEAST-WEIGHT SHORTEST PATH ALGORITHM, 
// REFER TO DIJKSTRA'S ALGORITHM (PROVIDED EDGE WEIGHTS ARE NON-NEGATIVE)
// EVEN OTHERWISE, FOR EDGES WITH POSSIBLE NEGATIVE WEIGHT, GO FOR BELLMAN-FORD ALGORITHM
Graph.prototype.breadthFirstSearch = function (searchVertex, startFromVertex, verbose) {
	if (typeof startFromVertex == "undefined") {
		startFromVertex = this.vertices[0].getId();
	}
	if (typeof verbose == "undefined") {
		verbose = false;
	}
	// initiate BFS routine
	var vQueue = [];
	var markedVertex = new Array(this.vertices.length);
	var startVertex = this.vertices[startFromVertex];
	var i, j;
	// path tracing
	var bfsPath = [];
	var prevVertex = new Array(this.vertices.length);
	var prevVertLength = prevVertex.length;
	for (i = 0; i < prevVertLength; i++) { prevVertex[i] = -1; }	
	// verbose feedback
	var verboseStr = "";
	if (verbose) { verboseStr += "Starting Breadth-First Search for Vertex [" + searchVertex +"] from Vertex [" + startFromVertex + "].\n" }
	vQueue.push(startVertex.id);
	while (vQueue.length > 0) {
		// dump present stack condition
		if (verbose) { verboseStr += "BFS Queue Status: [" + vQueue.join(",") + "]\n" ;	}
		// fetch a vertex to search from the stack
		i = vQueue.shift();		
		if (verbose) { verboseStr += "Dequeued Vertex[" + i + "]\n"; }		
		// if the vertex has yet not been gone through	
		if (markedVertex[i] != true) {
			if (verbose) { verboseStr += "Reached Vertex[" + i + "]\n"; }
			// check if we found our required vertex
			if (this.vertices[i].id == searchVertex) {
				// yay! we dound our vertex
				// trace the path
				var pathTraceItem = searchVertex;
				while(pathTraceItem != startFromVertex) {
					bfsPath.push(pathTraceItem);
					pathTraceItem = prevVertex[pathTraceItem];
				}
				bfsPath.push(startFromVertex);
				if (verbose) { verboseStr += "Yay! We just found Vertex [" + searchVertex +"] !!!\n"; } 
				return { searchResult: true, verboseData: verboseStr, pathTrace: bfsPath.join(" <= "), pathLength: (bfsPath.length - 1) };
			}
			// label this vertex as discovered
			markedVertex[i] = true;
			var vertConnLength = this.vertices[i].conn.length;
			for (j = 0; j < vertConnLength; j++) {
				// add vertex to stack
				vQueue.push(this.vertices[i].conn[j].dest);
				// add to prevVertex for path tracing later
				if (prevVertex[this.vertices[i].conn[j].dest] == -1)  { prevVertex[this.vertices[i].conn[j].dest] = i; }
				if (verbose) { verboseStr += "Enqueued Vertex [" + this.vertices[i].conn[j].dest +"] into Queue\n"; }						
			}	
		} else {
			// already visited this vertex
			// nothing much to do here
		}
	}
	// oops, we did not find our search vertex :(
	if (verbose) { verboseStr += "Oops! We couldn't find Vertex [" + searchVertex +"] :(\n"; }
	return { searchResult: false, verboseData: verboseStr, pathTrace: "Path not found!", pathLength: null };
}





// implement the DJIKSTRA's algorithm for the graph 
// also assumes that this.vertices[index].id = index (like the DFS, BFS algos do.)
// not to worry since graph generation method takes care of it
// only note that you must take care that the vertices array length and 
// vertices serailization indexes top concurs in the JSON file for the graph 
Graph.prototype.dijkstra = function (searchVertex, startFromVertex, verbose) {
	if (typeof startFromVertex == "undefined") {
		startFromVertex = this.vertices[0].getId();
	}
	if (typeof verbose == "undefined") {
		verbose = false;
	}

	// PRIORITY QUEUE
	function PQueue () {
		this.qV = [];
		this.qP = [];
	}
	PQueue.prototype.isEmpty = function () {
		if (this.qV.length > 0) {
			return false;
		} else {
			return true;
		}
	}
	PQueue.prototype.addWithPriority = function(vertex, priority) {
		this.qV.push(vertex);
		this.qP.push(priority);
	}
	PQueue.prototype.extractMin = function() {
		var i, minP, minPi;
		minP = this.qP[0];
		minPi = 0;
		var qPLength = this.qP.length;
		for (i = 0; i < qPLength; i++) {
			if (minP > this.qP[i]) {
				minP = this.qP[i];
				minPi = i;
			}
		}
		var v = this.qV[minPi];
		this.qV.splice(minPi, 1);
		this.qP.splice(minPi, 1);
		return v;
	}
	PQueue.prototype.decreasePriority = function (vertex, newPriority) {
		var vId = vertex.getId();
		var i;
		var indx = null;
		var qVLength = this.qV.length;
		for(i = 0; i < qVLength; i++) {
			if (this.qV[i].getId() == vId) {
				indx = i;
				break;
			}
		}
		if (indx != null) {
			this.qP[indx] = newPriority;
		}
	}
	PQueue.prototype.stringifyPQ = function () {
		var i; 
		var PQStr = "";
		var qVLength = this.qV.length;
		for (i = 0; i < qVLength; i++) {
			PQStr += this.qV[i].getId() + ", ";
		}

		return "[" + PQStr.substr(0, PQStr.length - 2) + "]";
	}

	var verboseStr = "";
	var distArr = new Array(this.vertices.length);
	var prevArr = new Array(this.vertices.length);
	var PQ = new PQueue();
	var i;
	if (verbose) { verboseStr += "Starting search for Least-cost Shortest Path from Vertex[" + startFromVertex + "] to Vertex[" + searchVertex + "] using Dijkstra's Algorithm..."; }
	
	distArr[startFromVertex] = 0;
	if (verbose) { verboseStr += "\nSet Distances from [Starting Vertex] to [Starting Vertex] to 0."; }

	var vertLength = this.vertices.length;
	for (i = 0; i < vertLength; i++) {
		if (this.vertices[i].getId() != startFromVertex) {distArr[this.vertices[i].getId()] = Infinity; }		
		prevArr[this.vertices[i].getId()] = -1;
		PQ.addWithPriority(this.vertices[i], distArr[this.vertices[i].getId()]);		
	}
	if (verbose) { verboseStr += "\nSet Distances from [Starting Vertex] to all other Vertices to Infinity..."; }
	if (verbose) { verboseStr += "\nAdded all Vertices to PQueue, prioritized on Distances from Starting Vertex."; }

	
	
	if (verbose) { verboseStr += "\nStarting loop till PQueue is empty..."; }
	var currVertex, relDist;
	while (!PQ.isEmpty()) {
		currVertex = PQ.extractMin();
		if (distArr[currVertex.getId()] == Infinity) {
			// if the minPriority distance itself is INFINITY, then short-circuit the algorithm, since test failed, no more nodes reachable
			if (verbose) { verboseStr += "\nAlgorithm stopped since it was found that Vertex[" + searchVertex + "] can never be reached."; }
			break;
		}
		if (verbose) { verboseStr += "\nExtracted MinPriority Vertex[" + currVertex.getId() + "] from PQueue."; }
		if (verbose) { verboseStr += "\n PQueue Status: " + PQ.stringifyPQ() };	
		var connLength = currVertex.conn.length; 	
		for (i = 0; i < connLength; i++) {
			relDist = distArr[currVertex.getId()] + currVertex.conn[i].weight;
			//console.log (relDist + ": for a connected vertex[" + currVertex.conn[i].dest + "] of vertex[" + currVertex.getId() + "]");
			if (relDist < distArr[currVertex.conn[i].dest]) {
				distArr[currVertex.conn[i].dest] = relDist;
				if (verbose) { verboseStr += "\n Update distance for connected Vertex[" + currVertex.conn[i].dest + "] to " + distArr[currVertex.conn[i].dest] + ". "; }
				prevArr[currVertex.conn[i].dest] = currVertex.getId();
				PQ.decreasePriority(this.getVertex(currVertex.conn[i].dest), relDist);
				if (verbose) { verboseStr += "Update priority value in PQueue for the same..."; }
			}			
		}
		if (verbose) { verboseStr += "\n Distances: [" + distArr.join(", ") + "]"; }
	}

	if (prevArr[searchVertex] != -1 && prevArr[searchVertex] != undefined) {
		// node has been reached in shortest path, so output traced path and cost incurred
		if (verbose) { verboseStr += "\nYay! Path found to Vertex[" + searchVertex + "] !!!\n"; }
		var djkPath = [];
		pathVertex = searchVertex;
		while (pathVertex != startFromVertex) {
			djkPath.push(pathVertex);
			pathVertex = prevArr[pathVertex];
		}
		djkPath.push(pathVertex);
		return { searchResult: true, verboseData: verboseStr, pathTrace: djkPath.join(" <= "), pathCost: distArr[searchVertex] };
	} else {
		// could not reach the searched vertex
		if (verbose) { verboseStr += "\nOops! Path not found to Vertex[" + searchVertex + "] :(\n"; }
		return { searchResult: false, verboseData: verboseStr, pathTrace: "Path not found!", pathCost: null };
	}

}

// a random graph generator
function giveMeAGraph (graphName, vertexCount, bidirectional, weighed, minWeight, maxWeight) {
	
	var graph = new Graph(graphName);

	var i, v;
	for(i = 0; i < vertexCount; i++) {
		// create a new vertex, add to graph
		v = new Vertex(i);
		graph.vertices.push(v);
	}

	var j, numberOfEdges, connectedVertex, weight;
	var connectedTo = [];
	// for each of the vertices
	for (i = 0; i < vertexCount; i++) {		
		// generate a random number of connections (edges) (0.1 to reduce number of edges, increase traversal distancess)
		numberOfEdges = Math.floor(Math.random() * vertexCount / 10);
		connectedTo = [];
		// and for each of these edges
		for (j = 0; j < numberOfEdges; j++) {
			// generate a random vertex id to connect to			
			connectedVertex = Math.floor(Math.random() * vertexCount);
			// if randomly generated connected vertex id comes to be this vertex itself or one that is already connected,
			while (connectedVertex == i || connectedTo.indexOf(connectedVertex) > -1) {
				// try again to generate
				connectedVertex = Math.floor(Math.random() * vertexCount);
			}
			// once satisfied with a generated connection
			// keep track of connections
			connectedTo.push(connectedVertex);
			// if weighed, generate an integer weight (between minWeight and maxWeight)
			if (weighed) {
				weight = parseInt(minWeight) + parseInt(Math.floor(Math.random() * (parseInt(maxWeight) - parseInt(minWeight))));
			} else {
				// weight is zero if not weighed graph
				weight = 0;
			}
			// add the edge to the vertex
			graph.vertices[i].attachVertex(graph.vertices[connectedVertex], bidirectional, weight);
		}
		//console.log (i + ": " + connectedTo.join(", "));
	}

	// after graph generation, return graph;
	return graph;
}

