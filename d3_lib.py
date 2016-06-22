import random
import inspect, os
from string import Template
import networkx as nx
import json
import community
from networkx.readwrite import json_graph


def this_dir():
    this_file = inspect.getfile(inspect.currentframe())
    return os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))


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



def graphmltojson(graphfile, outfile):
    """
    Converts GraphML file to json while adding communities/modularity groups
    using python-louvain. JSON output is usable with D3 force layout.
    Usage:
    >>> python convert.py -i mygraph.graphml -o outfile.json
    """

    G = nx.read_graphml(graphfile)

    #finds best community using louvain
    partition = community.best_partition(G)

    #adds partition/community number as attribute named 'modularitygroup'
    for n,d in G.nodes_iter(data=True):
        d['modularitygroup'] = partition[n]

        node_link = json_graph.node_link_data(G)
        # print(str(nx.readwrite.json_graph))
        # json = nx.readwrite.json_graph.dumps(node_link)

        # Write to file
        fo = open(outfile, "w")
        fo.write(json.dumps(node_link, outfile, indent=4))
        fo.close()
