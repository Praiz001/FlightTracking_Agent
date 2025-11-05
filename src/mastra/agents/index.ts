import { promptParserAgent } from './prompt-parser-agent';
import { flightTrackerAgent, flightDataRetrieverAgent } from './flight-tracker-agent';
import { flightSummaryAgent } from './flight-summarizer-agent';


export const agents = {
  promptParserAgent,
  flightTrackerAgent,
  flightDataRetrieverAgent,
  flightSummaryAgent
};