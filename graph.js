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
Graph.prototype.displayGraph = function (elementToWriteTo) {
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
	if (typeof elementToWriteTo != "undefined") {
		// assuming a textarea element
		document.getElementById(elementToWriteTo).value += graphStr;
	} 
	// good idea to mirror dump into console anyway
	console.log (graphStr);	
}


