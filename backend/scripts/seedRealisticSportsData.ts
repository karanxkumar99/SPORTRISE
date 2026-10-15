import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../src/prisma";
import VerifiedRankingService from "../src/services/verifiedRanking.service";

/**
 * Computes a deterministic SHA-256 hash string for mock certificates & scorecards
 */
function makeSha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function seedRealisticSportsData() {
  console.log("🏅 Starting SPORTRISE Realistic Sports Data & Completed Events Seeding...");

  // Default hashed password for demo athletes
  const defaultPassword = await bcrypt.hash("Athlete@2026", 10);

  // 1. Fetch or create available verified institutions
  let haryanaInstitute = await prisma.institution.findFirst({
    where: { OR: [{ city: "Rohtak" }, { name: { contains: "Haryana" } }] },
  });
  if (!haryanaInstitute) {
    haryanaInstitute = await prisma.institution.create({
      data: {
        name: "Haryana Sports Academy",
        type: "Institute",
        email: "contact@haryanasports.org",
        password: defaultPassword,
        contactNumber: "+91 1262 254100",
        website: "https://haryanasports.gov.in",
        address: "Tau Devi Lal Sports Complex, Sector 38",
        city: "Rohtak",
        state: "Haryana",
        pincode: "124001",
        authorizedPersonName: "Col. Baljit Singh",
        authorizedPersonContact: "+91 98120 48591",
        description: "Premier state sports academy producing Olympic and Khelo India champions.",
        coordinatorName: "Coach Rajesh Phogat",
        coordinatorEmail: "athletics@haryanasports.org",
        coordinatorPhone: "+91 98120 48591",
        isVerified: true,
      },
    });
  }

  let loyolaInstitute = await prisma.institution.findFirst({
    where: { OR: [{ city: "Chennai" }, { name: { contains: "Loyola" } }] },
  });
  if (!loyolaInstitute) {
    loyolaInstitute = await prisma.institution.create({
      data: {
        name: "Loyola College Chennai",
        type: "College",
        email: "sports@loyolacollege.edu",
        password: defaultPassword,
        contactNumber: "+91 44 2817 8200",
        website: "https://loyolacollege.edu",
        address: "Sterling Road, Nungambakkam",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600034",
        authorizedPersonName: "Father S. Joseph Raj",
        authorizedPersonContact: "+91 94441 09823",
        description: "Historic collegiate sports powerhouse dominating university football, hockey, and track events.",
        coordinatorName: "Dr. Vijay Anand",
        coordinatorEmail: "sports@loyolacollege.edu",
        coordinatorPhone: "+91 94441 56789",
        isVerified: true,
      },
    });
  }

  let stStephens = await prisma.institution.findFirst({
    where: { OR: [{ city: "New Delhi" }, { name: { contains: "Stephen" } }] },
  });
  if (!stStephens) {
    stStephens = await prisma.institution.create({
      data: {
        name: "St. Stephen's College",
        type: "College",
        email: "sportsboard@ststephens.edu",
        password: defaultPassword,
        contactNumber: "+91 11 2766 7200",
        website: "https://ststephens.edu",
        address: "University Enclave, North Campus",
        city: "New Delhi",
        state: "Delhi (NCT)",
        pincode: "110007",
        authorizedPersonName: "Prof. John Varghese",
        authorizedPersonContact: "+91 98100 54321",
        description: "Premier Delhi University institution pioneering excellence in badminton, archery, and basketball.",
        coordinatorName: "Prof. Sanjeev Kumar",
        coordinatorEmail: "sportsboard@ststephens.edu",
        coordinatorPhone: "+91 98111 65432",
        isVerified: true,
      },
    });
  }

  let dpsRkPuram = await prisma.institution.findFirst({
    where: { OR: [{ name: { contains: "DPS" } }, { name: { contains: "Delhi Public" } }] },
  });
  if (!dpsRkPuram) {
    dpsRkPuram = await prisma.institution.create({
      data: {
        name: "Delhi Public School R.K. Puram",
        type: "School",
        email: "sports@dpsrkp.net",
        password: defaultPassword,
        contactNumber: "+91 11 4911 5500",
        website: "https://dpsrkp.net",
        address: "Sector XII, R.K. Puram",
        city: "New Delhi",
        state: "Delhi (NCT)",
        pincode: "110022",
        authorizedPersonName: "Dr. Padma Srinivasan",
        authorizedPersonContact: "+91 98110 12345",
        description: "Premier Indian institution pioneering athletic excellence and national sports tournaments.",
        coordinatorName: "Coach Rajesh Negi",
        coordinatorEmail: "rajesh.negi@dpsrkp.net",
        coordinatorPhone: "+91 98101 23456",
        isVerified: true,
      },
    });
  }

  // 2. Define 12 Additional Realistic Indian Athletes
  const additionalAthletes = [
    {
      athleteId: "SR-IND-26-ATH-10921",
      fullName: "Aarav Singhania",
      mobile: "9810234561",
      email: "aarav.singhania@sportrise.demo",
      password: defaultPassword,
      state: "Haryana",
      district: "Rohtak",
      sport: "Athletics",
      ageCategory: "U-19",
      gender: "Male",
      position: "100m & 200m Sprinter",
      experienceYears: 4,
      bio: "National junior sprint finalist training at Rohtak Sports Complex. Haryana State record holder in U-19 100m sprint.",
      achievements: JSON.stringify([
        "Gold - National Inter-University Athletics Meet 100m (10.42s)",
        "Silver - Khelo India Youth Games 2025 (10.58s)",
        "State Record Holder 100m Junior Boys",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-ATH-20481",
      fullName: "Priya Nair",
      mobile: "9845123490",
      email: "priya.nair@sportrise.demo",
      password: defaultPassword,
      state: "Kerala",
      district: "Ernakulam",
      sport: "Athletics",
      ageCategory: "U-19",
      gender: "Female",
      position: "400m Quarter-Miler",
      experienceYears: 3,
      bio: "Electrifying 400m quarter-miler known for explosive finish. Kerala State Junior Champion.",
      achievements: JSON.stringify([
        "Gold - National Inter-University 400m (52.84s)",
        "Gold - South Zone Athletics Championship 2025",
        "National Junior Merit Awardee",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-ATH-39102",
      fullName: "Rohan Deshmukh",
      mobile: "9820341122",
      email: "rohan.deshmukh@sportrise.demo",
      password: defaultPassword,
      state: "Maharashtra",
      district: "Pune",
      sport: "Athletics",
      ageCategory: "U-21",
      gender: "Male",
      position: "Long Jumper & Sprinter",
      experienceYears: 5,
      bio: "Collegiate record holder in long jump (7.85m). Balewadi Sports Complex high performance trainee.",
      achievements: JSON.stringify([
        "Gold - Inter-University Long Jump (7.85m)",
        "Bronze - 100m Sprint Finals (10.68s)",
        "Maharashtra State Champion 2025",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-BAD-48201",
      fullName: "Devika Pillai",
      mobile: "9884129933",
      email: "devika.pillai@sportrise.demo",
      password: defaultPassword,
      state: "Tamil Nadu",
      district: "Chennai",
      sport: "Badminton",
      ageCategory: "U-19",
      gender: "Female",
      position: "Singles Shuttler",
      experienceYears: 4,
      bio: "Attacking singles shuttler with deceptive wrist flicks and steep smashes. Tamil Nadu state champion.",
      achievements: JSON.stringify([
        "Gold - North Zone Inter-College Badminton Super League",
        "Quarterfinalist - All India Junior Ranking Tournament",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-BAD-59302",
      fullName: "Aditya Sen",
      mobile: "9830114455",
      email: "aditya.sen@sportrise.demo",
      password: defaultPassword,
      state: "West Bengal",
      district: "Kolkata",
      sport: "Badminton",
      ageCategory: "U-21",
      gender: "Male",
      position: "Singles & Mixed Doubles",
      experienceYears: 5,
      bio: "Methodical baseline shuttler with high court endurance and counter-attacking play.",
      achievements: JSON.stringify([
        "Silver - North Zone Inter-College Super League Finals",
        "Bengal State Senior Finalist 2025",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-FTB-61029",
      fullName: "Vikramaditya Rathore",
      mobile: "9811883322",
      email: "vikram.rathore@sportrise.demo",
      password: defaultPassword,
      state: "Delhi",
      district: "New Delhi",
      sport: "Football",
      ageCategory: "U-21",
      gender: "Male",
      position: "Forward / Striker",
      experienceYears: 5,
      bio: "Dynamic center forward with lethal finishing on both feet. Leading goalscorer in collegiate tournaments.",
      achievements: JSON.stringify([
        "Golden Boot - All-India Collegiate Football Championship (7 Goals)",
        "Player of the Tournament - Grand Finals 2026",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-FTB-72190",
      fullName: "Farhan Akhtar Khan",
      mobile: "9890123344",
      email: "farhan.khan@sportrise.demo",
      password: defaultPassword,
      state: "Goa",
      district: "North Goa",
      sport: "Football",
      ageCategory: "U-19",
      gender: "Male",
      position: "Central Midfielder",
      experienceYears: 4,
      bio: "Visionary playmaker adept at line-breaking passes and controlling match tempo.",
      achievements: JSON.stringify([
        "Champion - All-India Collegiate Football Championship 2026",
        "Best Midfielder Award with 5 Key Assists",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-FTB-83401",
      fullName: "Gurpreet Singh Sandhu Jr.",
      mobile: "9872110099",
      email: "gurpreet.sandhu@sportrise.demo",
      password: defaultPassword,
      state: "Punjab",
      district: "Jalandhar",
      sport: "Football",
      ageCategory: "U-21",
      gender: "Male",
      position: "Goalkeeper",
      experienceYears: 6,
      bio: "Commanding 6ft 3in goalkeeper with acrobatic reflex saves and high penalty-saving percentage.",
      achievements: JSON.stringify([
        "Golden Glove - All-India Collegiate Football Championship (8 Saves in Final)",
        "Silver Medalist - National Inter-College Cup",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-SWM-91283",
      fullName: "Ananya Deshpande",
      mobile: "9845332211",
      email: "ananya.deshpande@sportrise.demo",
      password: defaultPassword,
      state: "Karnataka",
      district: "Bengaluru Urban",
      sport: "Swimming",
      ageCategory: "U-19",
      gender: "Female",
      position: "100m Freestyle & Backstroke",
      experienceYears: 4,
      bio: "Sprint swimmer training at BAC Bengaluru. Karnataka State record holder in 100m Freestyle.",
      achievements: JSON.stringify([
        "Gold - South Zone Aquatic Championship (58.42s)",
        "Gold - State University Trials 2026",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-BOX-10294",
      fullName: "Manish Rawat",
      mobile: "9897123456",
      email: "manish.rawat@sportrise.demo",
      password: defaultPassword,
      state: "Uttarakhand",
      district: "Dehradun",
      sport: "Boxing",
      ageCategory: "U-21",
      gender: "Male",
      position: "Light Welterweight (64kg)",
      experienceYears: 5,
      bio: "Orthodox puncher with sharp counter-hooks and relentless offensive pressure.",
      achievements: JSON.stringify([
        "Gold - North India Inter-College Boxing Trophy",
        "Best Boxer Award - Dehradun Open 2025",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-WRS-21049",
      fullName: "Simranjit Kaur",
      mobile: "9814556677",
      email: "simranjit.kaur@sportrise.demo",
      password: defaultPassword,
      state: "Punjab",
      district: "Ludhiana",
      sport: "Wrestling",
      ageCategory: "U-19",
      gender: "Female",
      position: "Freestyle 53kg",
      experienceYears: 4,
      bio: "Aggressive freestyle wrestler specializing in technical leg locks and high-amplitude throws.",
      achievements: JSON.stringify([
        "Gold - Punjab State Inter-College Trials",
        "Junior National Bronze Medalist 2025",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-CRK-32105",
      fullName: "Rahul Dravid Sharma",
      mobile: "9844221199",
      email: "rahul.sharma@sportrise.demo",
      password: defaultPassword,
      state: "Karnataka",
      district: "Mysuru",
      sport: "Cricket",
      ageCategory: "U-19",
      gender: "Male",
      position: "Top-order Batsman & Wicketkeeper",
      experienceYears: 5,
      bio: "Solid classical top-order batsman with excellent glove work behind the stumps.",
      achievements: JSON.stringify([
        "Centurion - Inter-Collegiate T20 League (104* off 58 balls)",
        "Best Wicketkeeper Trophy 2025",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-ARC-43210",
      fullName: "Tarundeep Das",
      mobile: "9835012345",
      email: "tarundeep.das@sportrise.demo",
      password: defaultPassword,
      state: "Jharkhand",
      district: "East Singhbhum",
      sport: "Archery",
      ageCategory: "U-21",
      gender: "Male",
      position: "Recurve Archer",
      experienceYears: 6,
      bio: "Tata Archery Academy cadet specializing in 70m Olympic Recurve. Consistently shooting 680+ qualification rounds.",
      achievements: JSON.stringify([
        "Gold - All-India Inter-University Archery Championship (688/720)",
        "Junior National Team Trials Top Seed",
        "Khelo India University Games Gold Medalist",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    },
    {
      athleteId: "SR-IND-26-WLF-54321",
      fullName: "Kavita Chanu Devi",
      mobile: "9862145678",
      email: "kavita.chanu@sportrise.demo",
      password: defaultPassword,
      state: "Manipur",
      district: "Imphal West",
      sport: "Weightlifting",
      ageCategory: "U-19",
      gender: "Female",
      position: "49kg Olympic Lifter",
      experienceYears: 4,
      bio: "Explosive lifter trained at SAI Centre of Excellence Imphal. Indian Junior National record holder in 49kg clean and jerk.",
      achievements: JSON.stringify([
        "Gold - National Junior Weightlifting Championship (203kg Total)",
        "Junior National Record 49kg Clean & Jerk (115kg)",
        "Khelo India Youth Games 2025 Gold Medalist",
      ]),
      avatarUrl: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80",
    },
  ];

  // Upsert all athletes safely without wiping existing accounts
  const createdAthletesMap = new Map<string, string>(); // athleteId -> UUID
  for (const a of additionalAthletes) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {
        fullName: a.fullName,
        athleteId: a.athleteId,
        mobile: a.mobile,
        state: a.state,
        district: a.district,
        sport: a.sport,
        ageCategory: a.ageCategory,
        gender: a.gender,
        position: a.position,
        experienceYears: a.experienceYears,
        bio: a.bio,
        achievements: a.achievements,
        avatarUrl: a.avatarUrl,
        isVerified: true,
      },
      create: {
        ...a,
        isVerified: true,
        skillIndex: 750,
      },
    });
    createdAthletesMap.set(a.athleteId, user.id);
  }

  // Also retrieve existing athlete Karan Kumar
  const karanKumar = await prisma.user.findFirst({
    where: { fullName: "Karan Kumar" },
  });

  console.log(`✅ 12 additional athlete profiles ready and verified.`);

  // 3. Create 2 New Completed Events
  // Completed Event 1: National Inter-University Athletics Meet 2026
  const evtAthletics = await prisma.event.upsert({
    where: { id: "evt-nat-inter-uni-athletics-2026" },
    update: {
      status: "Published",
      startDate: new Date("2026-09-18T09:00:00.000Z"),
      endDate: new Date("2026-09-22T18:00:00.000Z"),
      regEndDate: new Date("2026-09-10T23:59:59.000Z"),
    },
    create: {
      id: "evt-nat-inter-uni-athletics-2026",
      institutionId: haryanaInstitute.id,
      name: "National Inter-University Athletics Meet 2026",
      category: "Athletics",
      sportGame: "Track & Field (100m, 400m, Long Jump, Javelin)",
      bannerImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      shortDescription: "Premier university athletics championship featuring India's top collegiate sprinters and jumpers with electronic timing and AFI certification.",
      fullDescription: `The National Inter-University Athletics Meet 2026 brought together over 35 universities across India at Tau Devi Lal Stadium. Sanctioned under AFI guidelines with fully automated timing gates, wind gauges, and certified judges. All records and scorecards authenticated by Haryana Sports Academy and university sports boards.

Results and official electronic scorecards have been ratified by the Chief Integrity Officer. Individual times and positions have contributed directly to the SportRise Khelo India aligned national leaderboards.`,
      organizer: "National University Sports Federation of India",
      hostingInstitution: haryanaInstitute.name,
      contactPerson: "Dr. Virender Phogat",
      contactEmail: "athletics@haryanasports.org",
      contactPhone: "9812048591",
      regStartDate: new Date("2026-08-01T00:00:00.000Z"),
      regEndDate: new Date("2026-09-10T23:59:59.000Z"),
      startDate: new Date("2026-09-18T09:00:00.000Z"),
      endDate: new Date("2026-09-22T18:00:00.000Z"),
      reportingTime: "07:30 AM",
      startTime: "08:30 AM",
      venueName: "Tau Devi Lal Stadium Track & Field Complex",
      venueAddress: "Sector 38, Sports Enclave",
      city: "Gurugram",
      state: "Haryana",
      isPaid: false,
      registrationFee: 0,
      visibility: "Public",
      status: "Published",
      rounds: JSON.stringify([
        { name: "Heats (Round 1)", date: "2026-09-18", status: "Completed" },
        { name: "Semifinals", date: "2026-09-20", status: "Completed" },
        { name: "Grand Finals", date: "2026-09-22", status: "Completed" },
      ]),
    },
  });

  // Completed Event 2: All-India Inter-Collegiate Football Championship 2026
  const evtFootball = await prisma.event.upsert({
    where: { id: "evt-all-india-college-football-2026" },
    update: {
      status: "Published",
      startDate: new Date("2026-09-25T08:00:00.000Z"),
      endDate: new Date("2026-09-30T19:00:00.000Z"),
      regEndDate: new Date("2026-09-18T23:59:59.000Z"),
    },
    create: {
      id: "evt-all-india-college-football-2026",
      institutionId: loyolaInstitute.id,
      name: "All-India Inter-Collegiate Football Championship 2026",
      category: "Football",
      sportGame: "11-a-side Football Knockout",
      bannerImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
      shortDescription: "Prestigious 16-college knockout football cup featuring top collegiate squads from southern, northern, and eastern regional zones.",
      fullDescription: `The All-India Inter-Collegiate Football Championship 2026 culminated in a thrilling final between Loyola College Chennai and St. Xavier's College Kolkata at Jawaharlal Nehru Stadium, Chennai. Official referee committee verified complete player statistics, match events, disciplinary bookings, and certified match reports.

Tournament was officiated by AIFF Category 1 referees. Complete match events, goals, substitutions, and referee scorecards have been certified and archived with institutional tamper-detection seals.`,
      organizer: "Inter-Collegiate Sports Board & Loyola Athletic Association",
      hostingInstitution: loyolaInstitute.name,
      contactPerson: "Father S. Joseph Raj",
      contactEmail: "sports@loyolacollege.edu",
      contactPhone: "9444109823",
      regStartDate: new Date("2026-08-10T00:00:00.000Z"),
      regEndDate: new Date("2026-09-18T23:59:59.000Z"),
      startDate: new Date("2026-09-25T08:00:00.000Z"),
      endDate: new Date("2026-09-30T19:00:00.000Z"),
      reportingTime: "07:00 AM",
      startTime: "08:00 AM",
      venueName: "Jawaharlal Nehru Stadium Football Arena",
      venueAddress: "Sydenhams Road, Periamet",
      city: "Chennai",
      state: "Tamil Nadu",
      isPaid: false,
      registrationFee: 0,
      visibility: "Public",
      status: "Published",
      rounds: JSON.stringify([
        { name: "Group Stage", date: "2026-09-25", status: "Completed" },
        { name: "Quarterfinals", date: "2026-09-27", status: "Completed" },
        { name: "Semifinals", date: "2026-09-28", status: "Completed" },
        { name: "Grand Final", date: "2026-09-30", status: "Completed" },
      ]),
    },
  });

  // Also ensure existing Badminton completed event has completed dates:
  const evtBadminton = await prisma.event.findFirst({
    where: { OR: [{ id: "20732e82-6dd0-4fd8-a570-5864ff2322f0" }, { name: { contains: "Badminton" } }] },
  });

  console.log(`✅ Completed events validated in database.`);

  // 4. Create Official Matches, Scorecards, Evidence, and Participants
  const now = new Date();

  // Match 1: Athletics 100m Sprint Finals
  const matchAthletics100m = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-ATH-101" },
    update: {
      eventId: evtAthletics.id,
      instituteId: haryanaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-ATH-101",
      sport: "Athletics",
      competitionName: "National Inter-University Athletics Meet 2026 - 100m Sprint Finals",
      eventId: evtAthletics.id,
      instituteId: haryanaInstitute.id,
      venue: "Tau Devi Lal Stadium Track & Field Complex, Gurugram",
      matchDate: new Date("2026-09-22T11:00:00.000Z"),
      matchFormat: "100m Dash Finals",
      category: "Senior Men (Inter-University)",
      refereeDetails: JSON.stringify({
        refereeName: "Col. Baljit Singh (AFI Chief Technical Official)",
        license: "AFI-CTO-2024-9102",
        remarks: "Electronic finish line camera certified zero wind assistance (+0.8 m/s legal wind).",
      }),
      finalScore: "1st: 10.42s | 2nd: 10.51s | 3rd: 10.68s",
      winner: "Aarav Singhania (Haryana Sports Academy)",
      resultSummary: "Aarav Singhania set a new collegiate record of 10.42s, claiming Gold by 0.09s.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-09-22T14:30:00.000Z"),
    },
  });

  // Attach Participants for 100m Finals
  const aaravId = createdAthletesMap.get("SR-IND-26-ATH-10921")!;
  const rohanId = createdAthletesMap.get("SR-IND-26-ATH-39102")!;
  const karanId = karanKumar ? karanKumar.id : aaravId;

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchAthletics100m.id } });
  await prisma.matchParticipant.createMany({
    data: [
      {
        matchId: matchAthletics100m.id,
        athleteId: aaravId,
        teamName: "Haryana Sports Academy",
        role: "Sprinter (Lane 4)",
        position: 1,
        placement: "Gold",
        individualStats: JSON.stringify({
          discipline: "100m Dash",
          timing: "10.42s",
          reactionTime: "0.134s",
          wind: "+0.8 m/s",
          lane: 4,
          finalPlace: "1st Place (Gold)",
        }),
        performanceRating: 96.5,
        verifiedStatsSaved: true,
      },
      {
        matchId: matchAthletics100m.id,
        athleteId: karanId,
        teamName: "Delhi University Sports Club",
        role: "Sprinter (Lane 5)",
        position: 2,
        placement: "Silver",
        individualStats: JSON.stringify({
          discipline: "100m Dash",
          timing: "10.51s",
          reactionTime: "0.148s",
          wind: "+0.8 m/s",
          lane: 5,
          finalPlace: "2nd Place (Silver)",
        }),
        performanceRating: 89.0,
        verifiedStatsSaved: true,
      },
      {
        matchId: matchAthletics100m.id,
        athleteId: rohanId,
        teamName: "Pune University Athletics",
        role: "Sprinter (Lane 3)",
        position: 3,
        placement: "Bronze",
        individualStats: JSON.stringify({
          discipline: "100m Dash",
          timing: "10.68s",
          reactionTime: "0.155s",
          wind: "+0.8 m/s",
          lane: 3,
          finalPlace: "3rd Place (Bronze)",
        }),
        performanceRating: 82.5,
        verifiedStatsSaved: true,
      },
    ],
  });

  // Attach Evidence for 100m Sprint Finals
  await prisma.matchEvidence.deleteMany({ where: { matchId: matchAthletics100m.id } });
  await prisma.matchEvidence.createMany({
    data: [
      {
        matchId: matchAthletics100m.id,
        fileUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
        fileName: "official_athletics_electronic_finish_scorecard.jpg",
        fileType: "image/jpeg",
        fileSize: 1845200,
        category: "scorecard",
        sha256Hash: makeSha256("AFI-100M-FINALS-2026-HSA-ROHTAK-CERTIFIED"),
        ocrStatus: "EXTRACTED",
        ocrConfidence: 0.98,
        uploaderId: haryanaInstitute.id,
        uploaderType: "INSTITUTION",
        verificationFlag: "VALID",
        notes: "Official photo-finish electronic timing slip with AFI Chief Judge signature & HSA verification seal [DEMO CERTIFICATION].",
      },
      {
        matchId: matchAthletics100m.id,
        fileUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
        fileName: "athletics_100m_podium_ceremony.jpg",
        fileType: "image/jpeg",
        fileSize: 2410300,
        category: "photo",
        sha256Hash: makeSha256("PODIUM-ATHLETICS-100M-CEREMONY-HSA-2026"),
        uploaderId: haryanaInstitute.id,
        uploaderType: "INSTITUTION",
        verificationFlag: "VALID",
        notes: "Official medal presentation ceremony at Tau Devi Lal Stadium.",
      },
    ],
  });

  // Match 2: Athletics 400m & Long Jump Finals
  const matchAthletics400m = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-ATH-102" },
    update: {
      eventId: evtAthletics.id,
      instituteId: haryanaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-ATH-102",
      sport: "Athletics",
      competitionName: "National Inter-University Athletics Meet - 400m & Field Events",
      eventId: evtAthletics.id,
      instituteId: haryanaInstitute.id,
      venue: "Tau Devi Lal Stadium Track & Field Complex, Gurugram",
      matchDate: new Date("2026-09-22T16:30:00.000Z"),
      matchFormat: "400m Track & Long Jump Finals",
      category: "Senior Track & Field",
      refereeDetails: JSON.stringify({
        refereeName: "Dr. K. Swaminathan (AFI Grade-A Official)",
        license: "AFI-GA-8841",
        remarks: "Wind within legal limit. Optical distance measuring instrument calibrated.",
      }),
      finalScore: "Priya Nair: 52.84s (Gold) | Rohan Deshmukh: 7.85m (Gold)",
      winner: "Priya Nair (400m) & Rohan Deshmukh (Long Jump)",
      resultSummary: "Priya Nair dominated women's 400m while Rohan Deshmukh clinched long jump gold with 7.85m.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-09-22T18:00:00.000Z"),
    },
  });

  const priyaId = createdAthletesMap.get("SR-IND-26-ATH-20481")!;
  await prisma.matchParticipant.deleteMany({ where: { matchId: matchAthletics400m.id } });
  await prisma.matchParticipant.createMany({
    data: [
      {
        matchId: matchAthletics400m.id,
        athleteId: priyaId,
        teamName: "Kerala University Athletics",
        role: "400m Sprinter (Lane 3)",
        position: 1,
        placement: "Gold",
        individualStats: JSON.stringify({
          discipline: "400m Dash",
          timing: "52.84s",
          split200m: "24.90s",
          finalPlace: "1st Place (Gold)",
        }),
        performanceRating: 95.5,
        verifiedStatsSaved: true,
      },
      {
        matchId: matchAthletics400m.id,
        athleteId: rohanId,
        teamName: "Pune University Athletics",
        role: "Long Jumper",
        position: 1,
        placement: "Gold",
        individualStats: JSON.stringify({
          discipline: "Long Jump",
          bestDistance: "7.85m",
          wind: "+1.1 m/s",
          attempts: "7.62m, 7.74m, X, 7.85m, 7.79m",
          finalPlace: "1st Place (Gold)",
        }),
        performanceRating: 94.0,
        verifiedStatsSaved: true,
      },
      {
        matchId: matchAthletics400m.id,
        athleteId: aaravId,
        teamName: "Haryana Sports Academy",
        role: "200m Sprinter",
        position: 2,
        placement: "Silver",
        individualStats: JSON.stringify({
          discipline: "200m Sprint",
          timing: "21.15s",
          finalPlace: "2nd Place (Silver)",
        }),
        performanceRating: 91.0,
        verifiedStatsSaved: true,
      },
    ],
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchAthletics400m.id } });
  await prisma.matchEvidence.createMany({
    data: [
      {
        matchId: matchAthletics400m.id,
        fileUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
        fileName: "field_events_certified_judge_sheet.jpg",
        fileType: "image/jpeg",
        fileSize: 1980000,
        category: "scorecard",
        sha256Hash: makeSha256("FIELD-EVENTS-400M-LONGJUMP-HSA-2026"),
        ocrStatus: "EXTRACTED",
        ocrConfidence: 0.97,
        uploaderId: haryanaInstitute.id,
        uploaderType: "INSTITUTION",
        verificationFlag: "VALID",
        notes: "Official Field Event scorecard signed by AFI Senior Technical Delegate with Institutional Seal [DEMO CERTIFICATION].",
      },
    ],
  });

  // Match 3: All-India Collegiate Football Championship Grand Finals
  const matchFootball = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-FTB-201" },
    update: {
      eventId: evtFootball.id,
      instituteId: loyolaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-FTB-201",
      sport: "Football",
      competitionName: "All-India Inter-Collegiate Football Championship 2026 - Grand Finals",
      eventId: evtFootball.id,
      instituteId: loyolaInstitute.id,
      opponentName: "St. Xavier's College Kolkata",
      venue: "Jawaharlal Nehru Stadium Football Arena, Chennai",
      matchDate: new Date("2026-09-30T17:00:00.000Z"),
      matchFormat: "90 Minutes Regular Time Final",
      category: "Senior Men Collegiate",
      refereeDetails: JSON.stringify({
        refereeName: "Suresh Pillai (AIFF Category-1 National Referee)",
        license: "AIFF-REF-CAT1-4019",
        remarks: "Competitive high-tempo match. No red cards. Fair play awarded to both squads.",
      }),
      finalScore: "Loyola College Chennai 3 - 2 St. Xavier's College Kolkata",
      winner: "Loyola College Chennai",
      resultSummary: "Loyola College lifted the trophy in a 5-goal thriller with Vikramaditya scoring the 88th-minute winner.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-09-30T20:30:00.000Z"),
    },
  });

  const vikramId = createdAthletesMap.get("SR-IND-26-FTB-61029")!;
  const farhanId = createdAthletesMap.get("SR-IND-26-FTB-72190")!;
  const gurpreetId = createdAthletesMap.get("SR-IND-26-FTB-83401")!;

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchFootball.id } });
  await prisma.matchParticipant.createMany({
    data: [
      {
        matchId: matchFootball.id,
        athleteId: vikramId,
        teamName: "Loyola College Chennai",
        role: "Forward / Striker",
        position: 1,
        placement: "Champion (Gold)",
        individualStats: JSON.stringify({
          goals: 2,
          assists: 1,
          shotsOnTarget: 4,
          minutesPlayed: 90,
          manOfTheMatch: true,
          matchRole: "Starting Striker",
        }),
        performanceRating: 95.0,
        verifiedStatsSaved: true,
      },
      {
        matchId: matchFootball.id,
        athleteId: farhanId,
        teamName: "Loyola College Chennai",
        role: "Central Midfielder",
        position: 1,
        placement: "Champion (Gold)",
        individualStats: JSON.stringify({
          goals: 1,
          assists: 1,
          keyPasses: 4,
          passAccuracy: "89%",
          tackles: 5,
          minutesPlayed: 90,
        }),
        performanceRating: 88.5,
        verifiedStatsSaved: true,
      },
      {
        matchId: matchFootball.id,
        athleteId: gurpreetId,
        teamName: "St. Xavier's College Kolkata",
        role: "Goalkeeper",
        position: 2,
        placement: "Runner-Up (Silver)",
        individualStats: JSON.stringify({
          saves: 8,
          penaltySaved: 1,
          punches: 3,
          minutesPlayed: 90,
          goalsConceded: 3,
        }),
        performanceRating: 85.0,
        verifiedStatsSaved: true,
      },
    ],
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchFootball.id } });
  await prisma.matchEvidence.createMany({
    data: [
      {
        matchId: matchFootball.id,
        fileUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        fileName: "official_match_sheet_referee_report.jpg",
        fileType: "image/jpeg",
        fileSize: 2210400,
        category: "scorecard",
        sha256Hash: makeSha256("AIFF-COLLEGIATE-FINALS-LOYOLA-CHENNAI-2026"),
        ocrStatus: "EXTRACTED",
        ocrConfidence: 0.99,
        uploaderId: loyolaInstitute.id,
        uploaderType: "INSTITUTION",
        verificationFlag: "VALID",
        notes: "Official AIFF match report signed by referee Suresh Pillai and stamped with Loyola College verification seal [DEMO CERTIFICATION].",
      },
      {
        matchId: matchFootball.id,
        fileUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
        fileName: "final_match_action_stadium_crowd.jpg",
        fileType: "image/jpeg",
        fileSize: 2890500,
        category: "photo",
        sha256Hash: makeSha256("FINAL-FOOTBALL-MATCH-ACTION-CHENNAI-2026"),
        uploaderId: loyolaInstitute.id,
        uploaderType: "INSTITUTION",
        verificationFlag: "VALID",
        notes: "Match action at Jawaharlal Nehru Stadium Chennai.",
      },
    ],
  });

  // Match 4: North Zone Inter-College Badminton Super League Finals (Event: St. Stephen's)
  if (evtBadminton) {
    const matchBadminton = await prisma.match.upsert({
      where: { matchNumber: "SR-M-2026-BAD-01" },
      update: {
        eventId: evtBadminton.id,
        instituteId: stStephens.id,
        status: "VERIFIED",
        isCompleted: true,
      },
      create: {
        matchNumber: "SR-M-2026-BAD-01",
        sport: "Badminton",
        competitionName: "North Zone Inter-College Badminton Super League - Grand Finals",
        eventId: evtBadminton.id,
        instituteId: stStephens.id,
        venue: "Indira Gandhi Indoor Arena / St. Stephen's Gymnasium",
        matchDate: new Date("2026-10-10T15:00:00.000Z"),
        matchFormat: "Best of 3 Sets Singles Final",
        category: "Senior Inter-College Singles",
        refereeDetails: JSON.stringify({
          refereeName: "Manjusha Kanwar (BAI Certified Umpire)",
          license: "BAI-UMP-2023-5510",
          remarks: "Electronic shuttle speed calibration completed. Both players adhered to BWF standards.",
        }),
        finalScore: "21-18, 21-15 (Straight Sets)",
        winner: "Devika Pillai (St. Stephen's College)",
        resultSummary: "Devika Pillai captured Gold in straight sets with a commanding 21-18, 21-15 victory.",
        status: "VERIFIED",
        isCompleted: true,
        reviewedBy: "Chief Integrity Officer Sharma",
        reviewedAt: new Date("2026-10-10T18:00:00.000Z"),
      },
    });

    const devikaId = createdAthletesMap.get("SR-IND-26-BAD-48201")!;
    const adityaId = createdAthletesMap.get("SR-IND-26-BAD-59302")!;

    await prisma.matchParticipant.deleteMany({ where: { matchId: matchBadminton.id } });
    await prisma.matchParticipant.createMany({
      data: [
        {
          matchId: matchBadminton.id,
          athleteId: devikaId,
          teamName: "St. Stephen's College",
          role: "Singles Player (Seed 1)",
          position: 1,
          placement: "Gold",
          individualStats: JSON.stringify({
            setsWon: 2,
            setsLost: 0,
            pointsScored: 42,
            pointsConceded: 33,
            smashWinners: 14,
            dropWinners: 8,
          }),
          performanceRating: 94.5,
          verifiedStatsSaved: true,
        },
        {
          matchId: matchBadminton.id,
          athleteId: adityaId,
          teamName: "Presidency College",
          role: "Singles Player (Seed 2)",
          position: 2,
          placement: "Silver",
          individualStats: JSON.stringify({
            setsWon: 0,
            setsLost: 2,
            pointsScored: 33,
            pointsConceded: 42,
            smashWinners: 9,
            dropWinners: 5,
          }),
          performanceRating: 86.0,
          verifiedStatsSaved: true,
        },
        {
          matchId: matchBadminton.id,
          athleteId: karanId,
          teamName: "Delhi University Sports Club",
          role: "Semifinalist (Seed 4)",
          position: 3,
          placement: "Bronze",
          individualStats: JSON.stringify({
            setsWon: 1,
            setsLost: 2,
            pointsScored: 49,
            pointsConceded: 58,
          }),
          performanceRating: 79.0,
          verifiedStatsSaved: true,
        },
      ],
    });

    await prisma.matchEvidence.deleteMany({ where: { matchId: matchBadminton.id } });
    await prisma.matchEvidence.createMany({
      data: [
        {
          matchId: matchBadminton.id,
          fileUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
          fileName: "official_badminton_scorecard_bai_certified.jpg",
          fileType: "image/jpeg",
          fileSize: 1720400,
          category: "scorecard",
          sha256Hash: makeSha256("BADMINTON-FINALS-ST-STEPHENS-BAI-2026"),
          ocrStatus: "EXTRACTED",
          ocrConfidence: 0.98,
          uploaderId: stStephens.id,
          uploaderType: "INSTITUTION",
          verificationFlag: "VALID",
          notes: "Official BAI certified match scoresheet with St. Stephen's institutional verification seal [DEMO CERTIFICATION].",
        },
        {
          matchId: matchBadminton.id,
          fileUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80",
          fileName: "badminton_finals_podium_presentation.jpg",
          fileType: "image/jpeg",
          fileSize: 2150000,
          category: "photo",
          sha256Hash: makeSha256("BADMINTON-PODIUM-CEREMONY-DELHI-2026"),
          uploaderId: stStephens.id,
          uploaderType: "INSTITUTION",
          verificationFlag: "VALID",
          notes: "Trophy and medal presentation at St. Stephen's gymnasium.",
        },
      ],
    });
  }

  // Match 5: Swimming & Aquatic Meet
  const ananyaId = createdAthletesMap.get("SR-IND-26-SWM-91283")!;
  const matchSwimming = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-SWM-301" },
    update: {
      instituteId: dpsRkPuram?.id || haryanaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-SWM-301",
      sport: "Swimming",
      competitionName: "All-India Inter-University Aquatic Championship 2026",
      instituteId: dpsRkPuram?.id || haryanaInstitute.id,
      venue: "Dr. SPM Swimming Pool Complex, Talkatora, New Delhi",
      matchDate: new Date("2026-10-02T10:00:00.000Z"),
      matchFormat: "100m Freestyle & Backstroke Finals",
      category: "Senior Women",
      refereeDetails: JSON.stringify({
        refereeName: "Pradeep Kumar (SFI International Referee)",
        license: "SFI-INTL-1120",
        remarks: "Omega touchpads active. Zero false starts recorded.",
      }),
      finalScore: "1st Place: 58.42s (Gold)",
      winner: "Ananya Deshpande (Bengaluru)",
      resultSummary: "Ananya Deshpande clinched gold clocking 58.42s with a personal best performance.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-10-02T13:00:00.000Z"),
    },
  });

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchSwimming.id } });
  await prisma.matchParticipant.create({
    data: {
      matchId: matchSwimming.id,
      athleteId: ananyaId,
      teamName: "Bengaluru Aquatic Centre",
      role: "Swimmer (Lane 4)",
      position: 1,
      placement: "Gold",
      individualStats: JSON.stringify({
        discipline: "100m Freestyle",
        timing: "58.42s",
        reactionTime: "0.68s",
        personalBest: true,
      }),
      performanceRating: 94.0,
      verifiedStatsSaved: true,
    },
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchSwimming.id } });
  await prisma.matchEvidence.create({
    data: {
      matchId: matchSwimming.id,
      fileUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
      fileName: "swimming_omega_timing_sheet.jpg",
      fileType: "image/jpeg",
      fileSize: 1650000,
      category: "scorecard",
      sha256Hash: makeSha256("OMEGA-SWIMMING-5842-SFI-2026"),
      uploaderId: dpsRkPuram?.id || haryanaInstitute.id,
      uploaderType: "INSTITUTION",
      verificationFlag: "VALID",
      notes: "Omega automated touchpad timing log with SFI Chief Referee signature [DEMO CERTIFICATION].",
    },
  });

  // Match 6: Boxing Championship
  const manishId = createdAthletesMap.get("SR-IND-26-BOX-10294")!;
  const matchBoxing = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-BOX-401" },
    update: {
      instituteId: haryanaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-BOX-401",
      sport: "Boxing",
      competitionName: "North India Inter-College Boxing Championship 2026",
      instituteId: haryanaInstitute.id,
      venue: "Sports Authority of India Boxing Ring, Rohtak",
      matchDate: new Date("2026-09-28T18:00:00.000Z"),
      matchFormat: "3 Rounds x 3 Minutes Final",
      category: "Light Welterweight (64kg)",
      refereeDetails: JSON.stringify({
        refereeName: "Dharmendra Yadav (BFI 3-Star Referee)",
        license: "BFI-3STAR-7012",
        remarks: "Unanimous points victory. Clean sportsmanship throughout.",
      }),
      finalScore: "5 - 0 Unanimous Decision",
      winner: "Manish Rawat (Uttarakhand)",
      resultSummary: "Manish Rawat outboxed opponent with precise combinations to win 5-0 unanimous decision.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-09-28T21:00:00.000Z"),
    },
  });

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchBoxing.id } });
  await prisma.matchParticipant.create({
    data: {
      matchId: matchBoxing.id,
      athleteId: manishId,
      teamName: "Dehradun Boxing Academy",
      role: "Red Corner",
      position: 1,
      placement: "Gold",
      individualStats: JSON.stringify({
        decision: "5-0 Unanimous",
        knockdowns: 1,
        roundsWon: 3,
        weightClass: "64kg",
      }),
      performanceRating: 92.0,
      verifiedStatsSaved: true,
    },
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchBoxing.id } });
  await prisma.matchEvidence.create({
    data: {
      matchId: matchBoxing.id,
      fileUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80",
      fileName: "boxing_official_judges_scorecard.jpg",
      fileType: "image/jpeg",
      fileSize: 1540000,
      category: "scorecard",
      sha256Hash: makeSha256("BFI-BOXING-SCORECARD-ROHTAK-2026"),
      uploaderId: haryanaInstitute.id,
      uploaderType: "INSTITUTION",
      verificationFlag: "VALID",
      notes: "5 Judges official round-by-round points score sheet with BFI verification seal [DEMO CERTIFICATION].",
    },
  });

  // Match 7: Wrestling Trials
  const simranjitId = createdAthletesMap.get("SR-IND-26-WRS-21049")!;
  const matchWrestling = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-WRS-501" },
    update: {
      instituteId: haryanaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-WRS-501",
      sport: "Wrestling",
      competitionName: "All-India University Wrestling Trials 2026",
      instituteId: haryanaInstitute.id,
      venue: "Chhatrasal Stadium Wrestling Arena, Delhi",
      matchDate: new Date("2026-09-15T14:00:00.000Z"),
      matchFormat: "Freestyle 2 Periods x 3 Mins",
      category: "Freestyle 53kg Women",
      refereeDetails: JSON.stringify({
        refereeName: "Jagdish Kaliraman (WFI Senior Official)",
        license: "WFI-REF-9921",
        remarks: "Win by Fall in 2nd period at 4:18.",
      }),
      finalScore: "Victory by Fall (Pin)",
      winner: "Simranjit Kaur (Punjab)",
      resultSummary: "Simranjit Kaur executed a takedown and secured a pinfall victory in period 2.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-09-15T17:00:00.000Z"),
    },
  });

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchWrestling.id } });
  await prisma.matchParticipant.create({
    data: {
      matchId: matchWrestling.id,
      athleteId: simranjitId,
      teamName: "Punjab University Wrestling Squad",
      role: "Freestyle 53kg",
      position: 1,
      placement: "Gold",
      individualStats: JSON.stringify({
        victoryByFall: true,
        takedowns: 3,
        technicalPoints: 8,
      }),
      performanceRating: 93.0,
      verifiedStatsSaved: true,
    },
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchWrestling.id } });
  await prisma.matchEvidence.create({
    data: {
      matchId: matchWrestling.id,
      fileUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80",
      fileName: "wrestling_mat_bout_sheet.jpg",
      fileType: "image/jpeg",
      fileSize: 1480000,
      category: "scorecard",
      sha256Hash: makeSha256("WFI-MAT-BOUT-FALL-DELHI-2026"),
      uploaderId: haryanaInstitute.id,
      uploaderType: "INSTITUTION",
      verificationFlag: "VALID",
      notes: "Official WFI mat bout sheet authenticated by Mat Chairman with institutional seal [DEMO CERTIFICATION].",
    },
  });

  // Match 8: Cricket Championship
  const rahulId = createdAthletesMap.get("SR-IND-26-CRK-32105")!;
  const matchCricket = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-CRK-601" },
    update: {
      instituteId: loyolaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-CRK-601",
      sport: "Cricket",
      competitionName: "Inter-Collegiate T20 Cup 2026 - Finals",
      instituteId: loyolaInstitute.id,
      venue: "Chinnaswamy Stadium B-Ground, Bengaluru",
      matchDate: new Date("2026-10-05T14:30:00.000Z"),
      matchFormat: "20 Overs T20 Match",
      category: "Senior Inter-College T20",
      refereeDetails: JSON.stringify({
        refereeName: "K.N. Ananthapadmanabhan (BCCI Umpire)",
        license: "BCCI-UMP-2023-3120",
        remarks: "Complete ball-by-ball scorebook verified. High batting quality.",
      }),
      finalScore: "Mysuru XI 188/3 (20 ov) beat Chennai CC 184/7 (20 ov)",
      winner: "Mysuru University XI",
      resultSummary: "Rahul Dravid Sharma smashed an unbeaten 104* off 58 deliveries to guide Mysuru to victory.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-10-05T19:00:00.000Z"),
    },
  });

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchCricket.id } });
  await prisma.matchParticipant.create({
    data: {
      matchId: matchCricket.id,
      athleteId: rahulId,
      teamName: "Mysuru University XI",
      role: "Wicketkeeper-Batsman",
      position: 1,
      placement: "Gold",
      individualStats: JSON.stringify({
        runs: 104,
        balls: 58,
        fours: 10,
        sixes: 4,
        strikeRate: "179.3",
        catches: 2,
        stumpings: 1,
      }),
      performanceRating: 96.0,
      verifiedStatsSaved: true,
    },
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchCricket.id } });
  await prisma.matchEvidence.create({
    data: {
      matchId: matchCricket.id,
      fileUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
      fileName: "cricket_official_bcci_scorebook.jpg",
      fileType: "image/jpeg",
      fileSize: 2650000,
      category: "scorecard",
      sha256Hash: makeSha256("BCCI-CRICKET-SCOREBOOK-T20-FINALS-2026"),
      uploaderId: loyolaInstitute.id,
      uploaderType: "INSTITUTION",
      verificationFlag: "VALID",
      notes: "Official 20-over scorebook signed by BCCI certified scorers with institutional seal [DEMO CERTIFICATION].",
    },
  });

  // Match 9: Archery National Championship
  const tarunId = createdAthletesMap.get("SR-IND-26-ARC-43210")!;
  const matchArchery = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-ARC-701" },
    update: {
      instituteId: stStephens.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-ARC-701",
      sport: "Archery",
      competitionName: "All-India Inter-University Archery Championship 2026 - 70m Recurve Finals",
      instituteId: stStephens.id,
      venue: "Yamuna Sports Complex Archery Ground, New Delhi",
      matchDate: new Date("2026-09-19T10:00:00.000Z"),
      matchFormat: "70m Olympic Recurve (72 Arrows)",
      category: "Senior Men Recurve",
      refereeDetails: JSON.stringify({
        refereeName: "Sanjeeva Singh (AAI International Judge)",
        license: "AAI-INTL-9042",
        remarks: "World Archery target face certified. 10x target boss verified.",
      }),
      finalScore: "688 / 720 (24 X-Rings, 42 Tens)",
      winner: "Tarundeep Das (Tata Archery / Ranchi University)",
      resultSummary: "Tarundeep Das recorded an exceptional 688/720 to secure Gold by 12 points.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-09-19T14:00:00.000Z"),
    },
  });

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchArchery.id } });
  await prisma.matchParticipant.create({
    data: {
      matchId: matchArchery.id,
      athleteId: tarunId,
      teamName: "Ranchi University Archery Team",
      role: "Recurve Archer (Target 14B)",
      position: 1,
      placement: "Gold",
      individualStats: JSON.stringify({
        discipline: "70m Recurve",
        totalScore: "688/720",
        xRings: 24,
        tensCount: 42,
        half1Score: 345,
        half2Score: 343,
        finalRank: "1st Place (Gold)",
      }),
      performanceRating: 95.5,
      verifiedStatsSaved: true,
    },
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchArchery.id } });
  await prisma.matchEvidence.create({
    data: {
      matchId: matchArchery.id,
      fileUrl: "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80",
      fileName: "archery_official_recurve_scoresheet.jpg",
      fileType: "image/jpeg",
      fileSize: 1890000,
      category: "scorecard",
      sha256Hash: makeSha256("AAI-ARCHERY-RECURVE-70M-FINALS-2026"),
      ocrStatus: "EXTRACTED",
      ocrConfidence: 0.98,
      uploaderId: stStephens.id,
      uploaderType: "INSTITUTION",
      verificationFlag: "VALID",
      notes: "Official World Archery sanctioned 72-arrow scorecard with AAI verification stamp [DEMO CERTIFICATION].",
    },
  });

  // Match 10: Weightlifting Championship
  const kavitaId = createdAthletesMap.get("SR-IND-26-WLF-54321")!;
  const matchWeightlifting = await prisma.match.upsert({
    where: { matchNumber: "SR-M-2026-WLF-801" },
    update: {
      instituteId: haryanaInstitute.id,
      status: "VERIFIED",
      isCompleted: true,
    },
    create: {
      matchNumber: "SR-M-2026-WLF-801",
      sport: "Weightlifting",
      competitionName: "National Junior Weightlifting Championship 2026 - 49kg Finals",
      instituteId: haryanaInstitute.id,
      venue: "Khuman Lampak Sports Complex, Imphal",
      matchDate: new Date("2026-09-24T15:00:00.000Z"),
      matchFormat: "Olympic Snatch & Clean & Jerk",
      category: "Women Junior 49kg",
      refereeDetails: JSON.stringify({
        refereeName: "Hansa Sharma (IWLF Category-1 Referee)",
        license: "IWLF-CAT1-7721",
        remarks: "Eleiko calibrated barbells and plates. 3 White Lights confirmed on all 3 successful lifts.",
      }),
      finalScore: "Snatch: 88kg | Clean & Jerk: 115kg | Total: 203kg (Gold)",
      winner: "Kavita Chanu Devi (Manipur)",
      resultSummary: "Kavita Chanu lifted an Olympic total of 203kg to win Gold and set a new Junior National record.",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date("2026-09-24T18:30:00.000Z"),
    },
  });

  await prisma.matchParticipant.deleteMany({ where: { matchId: matchWeightlifting.id } });
  await prisma.matchParticipant.create({
    data: {
      matchId: matchWeightlifting.id,
      athleteId: kavitaId,
      teamName: "Manipur State Weightlifting Academy",
      role: "Lifter (Platform 1)",
      position: 1,
      placement: "Gold",
      individualStats: JSON.stringify({
        bodyWeightKg: 48.7,
        snatchBestKg: 88,
        cleanJerkBestKg: 115,
        olympicTotalKg: 203,
        sinclairScore: 314.8,
        finalRank: "1st Place (Gold)",
      }),
      performanceRating: 97.0,
      verifiedStatsSaved: true,
    },
  });

  await prisma.matchEvidence.deleteMany({ where: { matchId: matchWeightlifting.id } });
  await prisma.matchEvidence.create({
    data: {
      matchId: matchWeightlifting.id,
      fileUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
      fileName: "iwlf_weightlifting_official_attempt_card.jpg",
      fileType: "image/jpeg",
      fileSize: 1950000,
      category: "scorecard",
      sha256Hash: makeSha256("IWLF-WEIGHTLIFTING-49KG-FINALS-IMPHAL-2026"),
      ocrStatus: "EXTRACTED",
      ocrConfidence: 0.99,
      uploaderId: haryanaInstitute.id,
      uploaderType: "INSTITUTION",
      verificationFlag: "VALID",
      notes: "Official IWLF attempt cards and technical controller sign-off sheet with Manipur Sports seal [DEMO CERTIFICATION].",
    },
  });

  // 5. Trigger Deterministic Rankings Recalculation Across All Sports!
  const sportsToRecalculate = [
    "Athletics",
    "Badminton",
    "Football",
    "Swimming",
    "Boxing",
    "Wrestling",
    "Cricket",
    "Archery",
    "Weightlifting",
  ];

  for (const sport of sportsToRecalculate) {
    console.log(`⚡ Recalculating verified multi-match rankings for: ${sport}...`);
    await VerifiedRankingService.recalculateSportRankings(sport);
  }

  console.log("🎉 All 14 athletes, completed events, scorecards, institutional verification seals, and rankings seeded successfully!");
}

if (require.main === module) {
  seedRealisticSportsData()
    .catch((err) => {
      console.error("❌ Seeding error:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
