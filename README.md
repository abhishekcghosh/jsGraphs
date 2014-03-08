jsGraphs
========

Experiments with graphs, json and xhr in js

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

	On a second note, this approach was chosen to begin with to keep the ability to provide 
	for future capabilities of enhancing the Vertex objects, like with increased properties.
	
	
