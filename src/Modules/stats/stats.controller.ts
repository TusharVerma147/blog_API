import { Request, Response } from "express";
import { statsService } from "./stats.service";
import { HTTP_STATUS } from "../../constants/httpStatus";

export class StatsController {
  getStats = async (_req: Request, res: Response): Promise<void> => {
    const { data, cacheStatus } = await statsService.getStats();

    res.setHeader("X-Cache", cacheStatus);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
    });
  };
}

export const statsController = new StatsController();
