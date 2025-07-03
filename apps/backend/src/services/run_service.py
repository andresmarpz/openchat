import json
from typing import AsyncGenerator, cast

from langchain_core.messages import AIMessage, AIMessageChunk

from src.agent.graph import graph
from src.services.thread_service import ThreadService
from src.storage.models.run import Run
from src.storage.models.thread import Thread
from src.storage.repositories.run import RunRepository


class RunService:
    """Service for Run business logic operations (async)."""

    def __init__(self, run_repository: RunRepository, thread_service: ThreadService):
        """Initialize the RunService."""
        self.run_repository = run_repository
        self.thread_service = thread_service

    def _merge_state(self, previous_state: dict, new_state: dict) -> dict:
        """Merge the previous state with the new state."""
        return {
            **previous_state,
            **new_state,
            "messages": [
                *previous_state.get("messages", []),
                *new_state.get("messages", []),
            ],
        }

    async def create(
        self, thread: Thread, input_data: dict
    ) -> tuple[Run, AsyncGenerator[str]]:
        """Create a new run on a thread."""
        new_run = Run(thread_id=thread.thread_id, input_data=input_data)
        run = await self.run_repository.create(new_run)

        input_state = self._merge_state(thread.values, input_data)

        async def _handle_graph_stream():
            aggregated_messages = {}
            async for event, data in graph.astream(
                input=input_state,
                stream_mode=["messages"],
            ):
                if event == "messages":
                    # The data is a [Message, MessageMetadata] tuple.
                    if isinstance(data, tuple):
                        msg_tuple = cast(tuple[AIMessageChunk, dict], data)
                        msg = msg_tuple[0]

                        aggregated_messages[msg.id] = (
                            aggregated_messages.get(msg.id, "") + msg.content
                        )

                        if msg.usage_metadata:
                            # This is the last message piece. Let's update the thread values
                            await self.thread_service.update_thread(
                                thread.thread_id,
                                self._merge_state(
                                    input_state,
                                    {
                                        "messages": [
                                            AIMessage(
                                                content=aggregated_messages[msg.id]
                                            ).model_dump(),
                                        ]
                                    },
                                ),
                            )

                        yield_value = [
                            {"event": event, "data": json.dumps(msg.model_dump())},
                        ]

                        if msg.usage_metadata:
                            yield_value.append(
                                {
                                    "event": "final_message",
                                    "data": json.dumps(
                                        AIMessage(
                                            content=aggregated_messages[msg.id]
                                        ).model_dump()
                                    ),
                                }
                            )

                        # To yield two events at once, yield them as separate Server-Sent Events (SSE) messages.
                        for single_event in yield_value:
                            yield (
                                f"event: {single_event['event']}\n"
                                + f"data: {single_event['data']}\n\n"
                            )

        return run, _handle_graph_stream()
