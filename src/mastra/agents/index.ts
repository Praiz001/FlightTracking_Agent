import { promptParserAgent } from './prompt-parser-agent';
import { flightTrackerAgent } from './flight-tracker-agent';
import { flightSummaryAgent } from './flight-summarizer-agent';
import { flightDataRetrieverAgent } from './flight-data-retriever-agent';


export const agents = {
  promptParserAgent,
  flightTrackerAgent,
  flightDataRetrieverAgent,
  flightSummaryAgent
};