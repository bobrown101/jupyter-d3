import random
import inspect, os
from string import Template
import networkx as nx
import json
import pprint
import community
from networkx.readwrite import json_graph

pp = pprint.PrettyPrinter(indent=4)


def this_dir():
    this_file = inspect.getfile(inspect.currentframe())
    return os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))

# This will normalize a dictionary formatted in {a: .03, b: 1.2, c: .5}
def normalize(d, target=1.0):
   raw = sum(d.values())
   factor = target/raw
   return {key:value*factor for key,value in d.items()}


def set_styles(css_file_names):
    if type(css_file_names) == str:
        style = open(this_dir() + '/css/' + css_file_names + '.css','r').read()
    else:
        style = ''
        for css_file_name in css_file_names:
            style += open(this_dir() + '/css/' + css_file_name + '.css','r').read()
    return "<style>" + style + "</style>"


def draw_graph(type, data_dict):

    JS_text = Template('''

                <div id='maindiv${divnum}'></div>

                <script>
                    $main_text
                </script>

                ''')

    divnum = int(random.uniform(0,9999999999))
    data_dict['divnum'] = divnum
    main_text_template = Template( open(this_dir() + '/js/' + type + '.js','r').read() )
    main_text = main_text_template.safe_substitute(data_dict)
    # print(main_text)

    return JS_text.safe_substitute({'divnum': divnum, 'main_text': main_text})

def draw_graph_from_graphml(type, input_filename):

    output_filename = './data_sets/temp_data/' + str(int(random.uniform(0,9999999999))) + ".json"

    graphmltojson(input_filename,  output_filename)

    json_data = open(output_filename, 'r').read()

    return draw_graph(type, {'data': json_data})


# ######################################################
# Will return nodes + links in json from a graphml file
# it can apply an specified algorith, and the value outputted from the algorithm
# will be available in the 'algorithm_filter' property of the nodes/links
# ######################################################
# type                     -> type of graph you would like to display
# input_filename           -> path to graphml file
# algorithm                -> algorithm you want to apply,
#                             see https://networkx.github.io/documentation/networkx-1.9.1/reference/algorithms.html
# normalize_val (optional) -> this will normalize the values the algorithm produces
#                             sometimes the values are too small / too large for comfort
# ######################################################
def draw_graph_from_graphml_with_algorithm(type, input_filename, algorithm, normalize_val=1.0):

    output_filename = './data_sets/temp_data/' + str(int(random.uniform(0,9999999999))) + ".json"

    G = nx.read_graphml(input_filename)

    if(algorithm == "degree_centrality"):
        degree_centrality = nx.degree_centrality(G)

        print("Un-normalized centrality numbers")
        pp.pprint(degree_centrality)

        degree_centrality = normalize(degree_centrality)

        pp.pprint(degree_centrality)

        for n,d in G.nodes_iter(data=True):
            d['algorithm_filter'] = degree_centrality[n]
    elif(algorithm == "load_centrality"):
        load_centrality = nx.load_centrality(G)

        print("Un-normalized centrality numbers")
        pp.pprint(load_centrality)

        load_centrality = normalize(load_centrality)

        pp.pprint(load_centrality)

        for n,d in G.nodes_iter(data=True):
            d['algorithm_filter'] = load_centrality[n]

    elif(algorithm == "closeness_centrality"):
        closeness_centrality = nx.closeness_centrality(G)

        print("Un-normalized centrality numbers")
        pp.pprint(closeness_centrality)

        closeness_centrality = normalize(closeness_centrality, normalize_val)

        for n,d in G.nodes_iter(data=True):
            d['algorithm_filter'] = closeness_centrality[n]


    elif(algorithm == "node_connectivity"):
        node_connectivity = nx.node_connectivity(G)

        print("Un-normalized centrality numbers")
        pp.pprint(node_connectivity)

        # node_connectivity = normalize(node_connectivity, normalize_val)
        #
        # for n,d in G.nodes_iter(data=True):
        #     d['algorithm_filter'] = node_connectivity[n]


    elif(algorithm == "communicability"):
        communicability = nx.communicability(G)
        #
        # print("Un-normalized centrality numbers")
        # pp.pprint(communicability)

        for key in communicability:
            # pp.pprint(communicability[key])
            # communicability[key] = normalize(communicability[key], normalize_val)
            # communicability[key] = communicability[key] * normalize_val
            for key2 in communicability[key]:
                communicability[key][key2] = communicability[key][key2] * normalize_val


        # pp.pprint(communicability)

        # node_connectivity = normalize(node_connectivity, normalize_val)
        #
        for u,v,a in G.edges(data=True):
            a["weight"] = communicability[u][v]
        # for u,v,a in G.edges(data=True):
        #     print (u,v,a)



    node_link = json_graph.node_link_data(G)
    json_data = json.dumps(node_link)

    return draw_graph(type, {'data': json_data})




def graphmltojson(graphfile, outfile):
    """
    Converts GraphML file to json while adding communities/modularity groups
    using python-louvain. JSON output is usable with D3 force layout.
    """

    G = nx.read_graphml(graphfile)

    #finds best community using louvain
    # partition = community.best_partition(G)

    degree_centrality = nx.degree_centrality(G)

    # print(degree_centrality)



    #adds partition/community number as attribute named 'modularitygroup'
    for n,d in G.nodes_iter(data=True):

        d['centrality'] = degree_centrality[n]

    node_link = json_graph.node_link_data(G)

    # Write to file
    fo = open(outfile, "w")
    fo.write(json.dumps(node_link, outfile, indent=4))
    fo.close()
