#!/usr/bin/env python

'''
Adds symmetric weights with a threshold from assymetric RF attributes
Uses the attribute linkSuccessRate from Dave Claypool's RF tagging

Hoping networkx Digraph to Undirected Graph routine works with reciprocal=True

Use as python library routine

By: Joe Macker <jpmacker@gmail.com>

'''
import networkx as nx

def add_weights_rf(G, link_weight = 'linkSuccessRate', threshold = 0.8, keep_directed = False):
    """
Input:

networkx graph with weights added from assymetric RF attributes
link_Success_Rate assumed

Output: undirected graph UG with weights attribute

    """
    rate=nx.get_edge_attributes(G,link_weight)
#Return undirected graph and if rate weights exist filter by minimum edge weight
    if not keep_directed:
        if rate:
            for node in G:
                for nbr in G.neighbors(node):
                    if node in G.neighbors(nbr):
                        filter_asym = min(rate[node,nbr],rate[nbr,node])
                        if filter_asym >= threshold:
                            G.add_edge(node,nbr, weight = filter_asym)
                        else:
                            G.remove_edge(node,nbr)
            UG = G.to_undirected(reciprocal=True)
        else:
            UG = G.to_undirected()
#This section will return a directed graph that filters edges in each direction
    else:
        if rate and nx.is_directed(G):
            for node in G:
                for nbr in G.neighbors(node):
                    if rate[node,nbr] <= threshold:
                        G.remove_edge(node,nbr)
                    else:
                        pass
        UG = G
    return UG

def add_weights_etx(G, link_weight = 'linkSuccessRate', threshold = 0.8):
    """
Input:

networkx graph with weights added from assymetric RF attributes
link_Success_Rate assumed

Output: undirected graph UG with weights attribute

    """
    rate=nx.get_edge_attributes(G,link_weight)
    if rate:
        for node in G:
            for nbr in G.neighbors(node):
                if node in G.neighbors(nbr):
                    filter_asym = min(rate[node,nbr],rate[nbr,node])
                    if filter_asym >= threshold:
                        G.add_edge(node,nbr, etx = 1.0/(rate[node,nbr]*rate[nbr,node]),weight=filter_asym)
                    else:
                        G.remove_edge(node,nbr)
        UG = G.to_undirected(reciprocal=True)
    else:
        UG = G.to_undirected()
    return UG
