import { Request, Response } from "express";
import { OLYMPIC_SPORTS } from "../data/sportsData";

export const SportsController = {
  /**
   * List all Olympic sports with filtering
   */
  async getAllSports(req: Request, res: Response) {
    try {
      const { category, search } = req.query;

      let filtered = [...OLYMPIC_SPORTS];

      if (category && typeof category === "string" && category !== "All") {
        filtered = filtered.filter(
          (s) => s.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (search && typeof search === "string" && search.trim().length > 0) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.hindiName.includes(query) ||
            s.category.toLowerCase().includes(query) ||
            s.code.toLowerCase().includes(query)
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        sports: filtered.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          hindiName: s.hindiName,
          category: s.category,
          code: s.code,
          icon: s.icon,
          overview: s.overview,
          governingBody: s.governingBody,
        })),
      });
    } catch (err) {
      console.error("Get All Sports Error:", err);
      return res.status(500).json({ success: false, message: "Failed to retrieve sports directory." });
    }
  },

  /**
   * Get single sport details by slug
   */
  async getSportBySlug(req: Request, res: Response) {
    try {
      const { sportSlug } = req.params;

      const sport = OLYMPIC_SPORTS.find(
        (s) => s.slug.toLowerCase() === sportSlug.toLowerCase() || s.id.toLowerCase() === sportSlug.toLowerCase()
      );

      if (!sport) {
        return res.status(404).json({
          success: false,
          message: `Sport '${sportSlug}' not found in Olympic sports registry.`,
        });
      }

      return res.status(200).json({
        success: true,
        sport,
      });
    } catch (err) {
      console.error("Get Sport By Slug Error:", err);
      return res.status(500).json({ success: false, message: "Failed to retrieve sport details." });
    }
  },

  /**
   * Get categories list
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = Array.from(new Set(OLYMPIC_SPORTS.map((s) => s.category)));
      return res.status(200).json({
        success: true,
        categories: ["All", ...categories],
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to retrieve categories." });
    }
  },
};

export default SportsController;
