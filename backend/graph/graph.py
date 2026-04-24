from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from graph.state import DocumentState
from graph.nodes import extract_node, analyze_node, summarize_node


def build_graph():
    builder = StateGraph(DocumentState)

    builder.add_node("extract", extract_node)
    builder.add_node("analyze", analyze_node)
    builder.add_node("summarize", summarize_node)

    builder.add_edge(START, "extract")
    builder.add_edge("extract", "analyze")
    builder.add_edge("analyze", "summarize")
    builder.add_edge("summarize", END)

    return builder.compile(checkpointer=MemorySaver())


compiled_graph = build_graph()
