import { prisma } from "../prisma";
import type { User as PrismaUser } from "@prisma/client";

export type IUser = PrismaUser;

export const SPORT_CODES: Record<string, string> = {
  Athletics: "ATH",
  Boxing: "BOX",
  Badminton: "BAD",
  Wrestling: "WRE",
  Shooting: "SHT",
  Archery: "ARC",
  Weightlifting: "WLT",
  Hockey: "HOC",
  Swimming: "SWM",
  "Table Tennis": "TTN",
  Gymnastics: "GYM",
  Judo: "JUD",
  Cycling: "CYC",
  Rowing: "ROW",
  Fencing: "FNC",
  Sailing: "SAL",
  Equestrian: "EQS",
  Taekwondo: "TKW",
};

/**
 * Generates an official SportRise Athlete ID
 * Format: SR-IND-[YEAR]-[SPORT_CODE]-[RANDOM_5_DIGITS]
 * Example: SR-IND-26-ATH-84920
 */
export function generateUniqueAthleteId(sport: string): string {
  const yearTwoDigits = new Date().getFullYear().toString().slice(-2);
  const sportCode = (SPORT_CODES[sport] || sport.slice(0, 3).toUpperCase()).padEnd(3, "X");
  const random5Digits = Math.floor(10000 + Math.random() * 90000).toString();
  return `SR-IND-${yearTwoDigits}-${sportCode}-${random5Digits}`;
}

export const UserModel = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  async findByAthleteId(athleteId: string) {
    return prisma.user.findUnique({
      where: { athleteId: athleteId.toUpperCase() },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        performanceRecords: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
      },
    });
  },

  async create(data: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
    state: string;
    district: string;
    sport: string;
    ageCategory?: string;
    gender?: string;
  }) {
    let athleteId = generateUniqueAthleteId(data.sport);
    // Guarantee uniqueness
    let existing = await prisma.user.findUnique({ where: { athleteId } });
    while (existing) {
      athleteId = generateUniqueAthleteId(data.sport);
      existing = await prisma.user.findUnique({ where: { athleteId } });
    }

    return prisma.user.create({
      data: {
        athleteId,
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email.toLowerCase(),
        password: data.password,
        state: data.state,
        district: data.district,
        sport: data.sport,
        ageCategory: data.ageCategory || "U-19",
        gender: data.gender || "Male",
        isVerified: false,
        skillIndex: 500,
      },
    });
  },

  async markVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  },

  async updateSkillIndex(userId: string, skillIndex: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { skillIndex },
    });
  },

  async updateRankings(userId: string, nationalRank: number, stateRank: number, districtRank: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        nationalRank,
        stateRank,
        districtRank,
      },
    });
  },
};

export default UserModel;
