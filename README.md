# GraphML to d3.js visualization utilities


This project is aimed at the following real world use case:
Soliders need to know the weak points in their own network so they can better protect them,
as well as being able to analyze enemies' networks and know where and how to hit them.

Overview of current status as well as goals:
- Data from a graphml file is loaded into networkx - a very popular python network library
- Networkx is then being displayed into a custom d3.js view.
- You are able to apply certain 'masks' to the d3.js view that will adjust the size of the nodes.
- The current implementation is limited, however a goal would be to have color coded nodes and edges that represent certain data and analysis such as stress points in the network, or high value targets
- Something that is not implemented at all, but is also a goal, is to be able to live update the graphml file so real time updates are displayed in the d3.js graph.




## To start the project:
*Must have jupyter, networkx, community, numpy, and scipy installed*

```
jupyter notebook    # this should be run at the root directory of this repo
```



#The main file that I have been working on is force-directed-graph.ipynb

When you open it, you should get an alert saying that d3 was loaded.

 > I have read through the docs tirelessly, and it appears that there is occasionally
a bug that occurs that prevents d3 from being loaded. I have yet to figure out why.
So if you dont get that alert message, do a hard refresh of the page
(in chrome that would be CMD+SHIFT+R)

If you run through the notebook, below the very last cell you should find a
"Create Graph" button. If you click it, it will load a graph below it.

There are also small other files that detail example use cases of libraries and functions

#There is also another type of layout located in arc-layout.ipynb
This is very similar in implementation to force directed, but docuented less

#simulated-realtime-data
This is not exactly real time, but what it does show is dynamic data changes
