// EXPERIMENTAL GRAPH TRAVERSALS
// Abhishek Ghosh


// ------------------------------------------------------------------------------------
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
Vertex.prototype.attachVertex = function (refVertex, requestBD) {
	// for requestBD
	if (typeof requestBD == "undefined") {
		requestBD = false;
	}
	// check if connection already exists on this side
	var i, alreadyExists = false;
	var id = refVertex.getId();
	for (i = 0; i < this.conn.length; i++) {
		if (this.conn[i] == id) {
			// already connected, so dont create duplicate values, 
			alreadyExists = true;
			break;
		}
	}
	if (alreadyExists == false) {
		this.conn.push(id);	
	}
	if (requestBD == true) {
		// request for other vertex to add this vertex
		// here, note that the requestBD for this call 
		// will obviously be false (pitfall otherwise)
		refVertex.attachVertex(this, false);
	}
};

// destroy any edges, between this vertex and vertex with provided id
// although duplication prevention code is written in attachVertex() itself,
// still going for a thorough check for duplicate entries and removing al of them
Vertex.prototype.detachVertex = function (id) {
	var i;
	// go through each item of the connections array, 
	// remove all with provided id
	for(i = 0; i < this.conn.length; i++) {
		if (this.conn[i] == id) {
			this.conn.splice(i, 1);
		}
	}
}

// stingify all connections and print
Vertex.prototype.stringifyConnections = function () {
	return this.conn.join(", ");
}


// --------------------------------------------------------------------------------
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

// obtain a json data of a graph representation
// generate the graph
// sample data:
// ways to define connections:
// case #1: multiple connections, use array; for ex, the vertex becomes { "id": 1, "conn" : [2, 3, 4] }
// case #1: single connections, no array, just mention the element; for ex, the vertex becomes { "id": 4, "conn" : 5 }
// case #1: multiple connections, so just omit the "conn" property itself; for ex, the vertex becomes { "id": 5 }
// also, other of json doesn't need to be sequential for the vertices, but keep in mind that the total number 
// of vertices equal to the numbering of the vertices for convenience... 
/*
	{		
		"vertices" : [
			{
				"id" : 0,
				"conn" : [1, 2]
			},
			{
				"id" : 1,
				"conn" : [2, 3, 4]
			},
			{
				"id" : 2,
				"conn" : [3, 4]
			},
			{
				"id" : 3,
				"conn" : [4, 5]
			},
			{
				"id" : 5
			},
			{
				"id" : 4,
				"conn" : 5
			}			
		],
		"properties" : 
			{
				"bidirectionalEdges" : true
			}
	}
*/
Graph.prototype.createGraphFromJSON = function (jsonGraph) {
	var requestBD = jsonGraph.properties.bidirectionalEdges;
	if (jsonGraph.vertices instanceof Array) {
		// check if multiple vertices are at all present, then loop over
		this.vertices = new Array(jsonGraph.vertices.length);
		var i, v, vi;
		for (i = 0; i < jsonGraph.vertices.length; i++) {
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
		for (i = 0; i < jsonGraph.vertices.length; i++) {
			v = jsonGraph.vertices[i];
			if (v.hasOwnProperty("conn")) {
				if (v.conn instanceof Array) {
					// loop for creating the connections
					var j;
					for (j = 0; j < v.conn.length; j++) {
						this.vertices[v.id].attachVertex(this.vertices[v.conn[j]], requestBD);
					}
				} else {
					// only one connection, go ahead
					this.vertices[v.id].attachVertex(this.vertices[v.conn], requestBD);
				}
			}
		}
	}
}

// display strings describing the graph
Graph.prototype.displayGraph = function () {
	var i;
	var graphStr = "", vertextStr = "";
	graphStr += "\nDisplaying data for graph: " + this.graphName + "\n";
	for (i = 0; i < this.vertices.length; i++) {
		// loop vertices, stringify them and print
		vertexStr = this.vertices[i].stringifyConnections();
		if (vertexStr == "") {
			vertexStr = "None";
		}
		graphStr += " Vertex[" + i + "]. Connected with: " + vertexStr + "\n"; 
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
//						[optional, takes the first node found the 
//						the graph is not given]
//	3. verbose - boolean to determine if detailed DFS traversal data is generated
Graph.prototype.depthFirstSearch = function (searchVertex, startFromVertex, verbose) {
	// default startFromNode to zeroth vertex id if not supplied
	if (typeof startFromVertex == "undefined") {
		startFromVertex = this.vertices[0].id;
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
			if (this.vertices[i].id == searchVertex) {
				// yay! we dound our vertex
				if (verbose) { verboseStr += "Yay! We just found the searched Vertex [" + searchVertex +"] !!!\n"; } 
				return { searchResult: true, verboseData: verboseStr };
			}
			// label this vertex as discovered
			markedVertex[i] = true;
			//console.log (markedVertex.join(","));
			if (this.vertices[i].hasOwnProperty("conn")) {
				// some edges linked to this vertex exists
				// if multiple edges exist
				if (this.vertices[i].conn instanceof Array) {
					// loop, add vertices to the stack
					for (j = 0; j < this.vertices[i].conn.length; j++) {
						// add vertex to stack
						vStack.push(this.vertices[i].conn[j]);
						if (verbose) { verboseStr += "Pushed Vertex [" + this.vertices[i].conn[j] +"] into Stack\n"; }						
					}
				} else {
					// only one edge exists, add to stack
					vStack.push(this.vertices[i].conn);
					if (verbose) { verboseStr += "Pushed Vertex [" + this.vertices[i].conn +"] into Stack\n"; }					
				}
			} else {
				// no edges linked to this vertex exists
				// nothing to do here actually
				// this condition will not even be reached if 
				// requestBD was true during graph generation from JSON
			}
		} else {
			// nothing here too, simply popping the next vertex next 
		}
	}
	// oops, we did not find our search vertex :(
	if (verbose) { verboseStr += "Oops! We couldn't find the searched Vertex [" + searchVertex +"] :(\n"; }
	return { searchResult: false, verboseData: verboseStr };
}
