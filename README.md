# Flight Tracker

A Mastra-powered AI agent that provides real-time flight tracking information through natural language interactions. The agent uses OpenAI's GPT-4o-mini model and integrates with AeroDataBox API to fetch live flight data.

## Features

- **AI-Powered Flight Tracking**: Natural language query processing for flight information.
- **Real-Time Flight Data**: Integration with AeroDataBox API for live flight status.
- **Conversational Interface**: Human-friendly responses with conversational language.
- **Memory Support**: Agent maintains conversation context.
- **Tool Integration**: Custom tool for fetching flight information.
- **JSON-RPC API**: A2A (Agent-to-Agent) compatible endpoint for integration.

## Tech Stack

- **Framework**: [Mastra](https://mastra.ai) - AI agent framework
- **Language**: TypeScript
- **AI Model**: OpenAI GPT-4o-mini
- **Validation**: Zod

## Prerequisites

- Node.js >= 20.9.0
- npm or yarn
- OpenAI API key
- RapidAPI key (for AeroDataBox API)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stage_3
```

2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
RAPID_API_KEY=your_rapidapi_key
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### API Endpoints

#### A2A Agent Endpoint

**POST** `/a2a/agent/:agentId`

Sends a message to the specified agent and returns a response.

**Available Agents:**
- `flightTrackerAgent` - Flight tracking agent

**Request Format (JSON-RPC 2.0):**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Check the status of flight EZY4310"
        }
      ]
    }
  }
}
```

**Response Format:**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "id": "task-id",
    "contextId": "context-id",
    "status": {
      "state": "completed",
      "timestamp": "2025-11-03T20:00:00.000Z",
      "message": {
        "messageId": "message-id",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "Flight EZY4310 is currently in the air..."
          }
        ],
        "kind": "message"
      }
    },
    "artifacts": [...],
    "history": [...],
    "kind": "task"
  }
}
```

## Development

### Adding New Agents

1. Create agent file in `src/mastra/agents/`
2. Export from `src/mastra/agents/index.ts`
3. Register in `src/mastra/index.ts`

### Adding New Agents

1. Create tool file in `src/mastra/tools/`
2. Define input `/output schemas using Zod`
3. Export from `src/mastra/tools/index.ts`
4. Add tool to agent's tools array
