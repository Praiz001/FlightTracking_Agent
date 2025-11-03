import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
    method: "POST",
    handler: async (c) => {
        try {
            const mastra = c.get("mastra");
            const agentId = c.req.param("agentId");


            // Handle empty body gracefully
            let body;
            try {
                const text = await c.req.text();
                if (!text || text.trim() === "") {
                    // Return 200 with empty result for empty body
                    return c.json(
                        {
                            jsonrpc: "2.0",
                            id: null,
                            result: {
                                id: randomUUID(),
                                contextId: randomUUID(),
                                status: {
                                    state: "completed",
                                    timestamp: new Date().toISOString(),
                                },
                                artifacts: [],
                                history: [],
                                kind: "task",
                            },
                        },
                        200
                    );
                }
                body = JSON.parse(text);
            } catch (parseError: any) {
                if (parseError?.message?.includes('body') || parseError?.message?.includes('stream')) {
                    return c.json(
                        {
                            jsonrpc: "2.0",
                            id: null,
                            result: {
                                id: randomUUID(),
                                contextId: randomUUID(),
                                status: {
                                    state: "completed",
                                    timestamp: new Date().toISOString(),
                                },
                                artifacts: [],
                                history: [],
                                kind: "task",
                            },
                        },
                        200
                    );
                }
                return c.json(
                    {
                        jsonrpc: "2.0",
                        id: null,
                        error: {
                            code: -32700,
                            message: "Parse error: Invalid JSON",
                        },
                    },
                    400
                );
            }



            // const body = await c.req.json();
            const { jsonrpc, id: requestId, method, params } = body;

            if (jsonrpc !== "2.0" || !requestId) {
                return c.json(
                    {
                        jsonrpc: "2.0",
                        id: requestId || null,
                        error: {
                            code: -32600,
                            message:
                                'Invalid Request: jsonrpc must be "2.0" and id is required',
                        },
                    },
                    400
                );
            }

            const agent = mastra.getAgent(agentId);
            if (!agent) {
                return c.json(
                    {
                        jsonrpc: "2.0",
                        id: requestId,
                        error: {
                            code: -32602,
                            message: `Agent '${agentId}' not found`,
                        },
                    },
                    404
                );
            }

            const { message, messages, contextId, taskId, metadata } = params || {};

            let messagesList: any[] = [];
            if (message) {
                messagesList = [message];
            } else if (messages && Array.isArray(messages)) {
                messagesList = messages;
            }


            const mastraMessages = messagesList.map((msg) => ({
                role: msg.role,
                content:
                    msg.parts
                        ?.map((part: any) => {
                            if (part.kind === "text") return part.text;
                            if (part.kind === "data") return JSON.stringify(part.data);
                            return "";
                        })
                        .join("\n") || "",
            }));


            const response = await agent.generate(mastraMessages);
            const agentText = response.text || "";


            const artifacts: any[] = [
                {
                    artifactId: randomUUID(),
                    name: `${agentId}Response`,
                    parts: [{ kind: "text", text: agentText }],
                },
            ];


            if (response.toolResults && response.toolResults.length > 0) {
                artifacts.push({
                    artifactId: randomUUID(),
                    name: "ToolResults",
                    parts: response.toolResults.map((result: any) => ({
                        kind: "data",
                        data: result,
                    })),
                });
            }


            const history = [
                ...messagesList.map((msg) => ({
                    kind: "message",
                    role: msg.role,
                    parts: msg.parts,
                    messageId: msg.messageId || randomUUID(),
                    taskId: msg.taskId || taskId || randomUUID(),
                })),
                {
                    kind: "message",
                    role: "agent",
                    parts: [{ kind: "text", text: agentText }],
                    messageId: randomUUID(),
                    taskId: taskId || randomUUID(),
                },
            ];


            return c.json({
                jsonrpc: "2.0",
                id: requestId,
                result: {
                    id: taskId || randomUUID(),
                    contextId: contextId || randomUUID(),
                    status: {
                        state: "completed",
                        timestamp: new Date().toISOString(),
                        message: {
                            messageId: randomUUID(),
                            role: "agent",
                            parts: [{ kind: "text", text: agentText }],
                            kind: "message",
                        },
                    },
                    artifacts,
                    history,
                    kind: "task",
                },
            });
        } catch (error: any) {
            return c.json(
                {
                    jsonrpc: "2.0",
                    id: null,
                    error: {
                        code: -32603,
                        message: "Internal error",
                        data: { details: error.message },
                    },
                },
                500
            );
        }
    },
});