import { prisma } from "../prisma";

export interface PerformanceInputMetrics {
  [metricKey: string]: number | string;
}

export const PerformanceRecordModel = {
  async createRecord(data: {
    userId: string;
    sport: string;
    metrics: PerformanceInputMetrics;
    skillIndex: number;
    aiStrengths: string[];
    aiImprovements: string[];
    aiRecommendations: string[];
  }) {
    const record = await prisma.performanceRecord.create({
      data: {
        userId: data.userId,
        sport: data.sport,
        metrics: JSON.stringify(data.metrics),
        skillIndex: data.skillIndex,
        aiStrengths: JSON.stringify(data.aiStrengths),
        aiImprovements: JSON.stringify(data.aiImprovements),
        aiRecommendations: JSON.stringify(data.aiRecommendations),
      },
    });

    // Also update athlete's current skillIndex on User table
    await prisma.user.update({
      where: { id: data.userId },
      data: { skillIndex: data.skillIndex },
    });

    return record;
  },

  async findByUserId(userId: string) {
    const records = await prisma.performanceRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: "asc" },
    });

    return records.map((rec) => ({
      ...rec,
      metrics: JSON.parse(rec.metrics),
      aiStrengths: JSON.parse(rec.aiStrengths),
      aiImprovements: JSON.parse(rec.aiImprovements),
      aiRecommendations: JSON.parse(rec.aiRecommendations),
    }));
  },

  async findLatestByUserId(userId: string) {
    const record = await prisma.performanceRecord.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    });

    if (!record) return null;

    return {
      ...record,
      metrics: JSON.parse(record.metrics),
      aiStrengths: JSON.parse(record.aiStrengths),
      aiImprovements: JSON.parse(record.aiImprovements),
      aiRecommendations: JSON.parse(record.aiRecommendations),
    };
  },
};

export default PerformanceRecordModel;
