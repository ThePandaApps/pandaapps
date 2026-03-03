import AIBenchmarksClient from "./components/AIBenchmarksClient";
import { fetchFreshModels } from "./data/liveDataFetcher";

// ISR: re-render every 24 hours to pick up fresh benchmark data
export const revalidate = 86400;

export default async function AIBenchmarksPage() {
  const models = await fetchFreshModels();
  return <AIBenchmarksClient models={models} />;
}
