import { Request, Response } from "express";
import { prisma } from "../prisma";

export const NotificationController = {
  /**
   * Get Notifications for Institution or Student
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const { institutionId, userId } = req.query;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (institutionId) where.institutionId = institutionId as string;
      if (userId) where.userId = userId as string;

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const unreadCount = await prisma.notification.count({
        where: { ...where, isRead: false },
      });

      return res.status(200).json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch notifications." });
    }
  },

  /**
   * Mark as Read
   */
  async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false });
    }
  },
};

export default NotificationController;
