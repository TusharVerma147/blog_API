import { Request, Response } from "express";
import { statsService } from "./stats.service";
import { HTTP_STATUS } from "../../constants/httpStatus";

export class StatsController {
  getStats = async (_req: Request, res: Response): Promise<void> => {
    const stats = await statsService.getStats();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  };
}

export const statsController = new StatsController();
