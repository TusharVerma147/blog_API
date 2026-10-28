import { statsRepository } from "../../Repository/stats.repository";

export class StatsService {
  async getStats() {
    return statsRepository.getBlogStats();
  }
}

export const statsService = new StatsService();
