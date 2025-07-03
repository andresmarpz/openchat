"""This file contains the graph for the chatbot."""

from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph

from src.core.settings import get_settings

graph_builder = StateGraph(
    state_schema=MessagesState,
)

settings = get_settings()


async def chat_llm_node(state: MessagesState):
    """Node that uses the specified LLM to generate a response."""
    llm = ChatOpenAI(
        openai_api_key=settings.OPENROUTER_API_KEY,
        openai_api_base=settings.OPENROUTER_BASE_URL,
        model="openai/gpt-4o-mini",
    )

    response = await llm.ainvoke(state.get("messages", []))
    return {"messages": [response]}


graph_builder.add_node("chat_llm_node", chat_llm_node)

graph_builder.add_edge(START, "chat_llm_node")
graph_builder.add_edge("chat_llm_node", END)

graph = graph_builder.compile()
