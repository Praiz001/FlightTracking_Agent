
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
// import { flightTrackerWorkflow } from './workflows/flight-tracker-workflow';
import { agents } from './agents';
import { a2aAgentRoute } from './routes/a2a-agent-route';





const { flightTrackerAgent } = agents;

export const mastra = new Mastra({
  // workflows: { flightTrackerWorkflow },
  agents: { flightTrackerAgent },
  // scorers: { },
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    enabled: false,
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute]
  }
});
