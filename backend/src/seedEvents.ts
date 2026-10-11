import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

async function seedInstitutionsAndEvents() {
  console.log("🏫 Seeding verified institutions and real Olympic/academic events...");

  // Clear existing institutions & events if any
  await prisma.application.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.institution.deleteMany({});

  const defaultPassword = await bcrypt.hash("Institution@2026", 10);

  // Institution 1: Delhi Public School R.K. Puram
  const inst1 = await prisma.institution.create({
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
      authorizedPersonName: "Dr. Padma Srinivasan (Principal)",
      authorizedPersonContact: "+91 98110 12345",
      description: "Premier Indian institution pioneering athletic excellence and CBSE National Sports tournaments.",
      coordinatorName: "Coach Rajesh Negi",
      coordinatorEmail: "rajesh.negi@dpsrkp.net",
      coordinatorPhone: "+91 98101 23456",
      isVerified: true,
    },
  });

  // Institution 2: St. Stephen's College
  const inst2 = await prisma.institution.create({
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
      authorizedPersonName: "Prof. John Varghese (Principal)",
      authorizedPersonContact: "+91 98200 54321",
      description: "Historic university sports council organizing national inter-college championships.",
      coordinatorName: "Dr. Sanjeev Kumar",
      coordinatorEmail: "sanjeev.sports@ststephens.edu",
      coordinatorPhone: "+91 98210 98765",
      isVerified: true,
    },
  });

  // Institution 3: Loyola College
  const inst3 = await prisma.institution.create({
    data: {
      name: "Loyola College Chennai",
      type: "College",
      email: "events@loyolacollege.edu",
      password: defaultPassword,
      contactNumber: "+91 44 2817 8200",
      website: "https://loyolacollege.edu",
      address: "Sterling Road, Nungambakkam",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600034",
      authorizedPersonName: "Rev. Dr. A. Louis Arockiaraj (Principal)",
      authorizedPersonContact: "+91 94440 12345",
      description: "Autonomous college renowned for world-class track and field, basketball, and football excellence.",
      coordinatorName: "Dr. Vijay Anand",
      coordinatorEmail: "vijay.anand@loyolacollege.edu",
      coordinatorPhone: "+91 94441 56789",
      isVerified: true,
    },
  });

  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
  const nextMonthEnd = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);

  // Ongoing Event (Started 2 days ago, ends in 3 days)
  const ongoingStart = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const ongoingEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const regPast = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  // Event 1: All-India Inter-School Athletics Championship (Upcoming)
  await prisma.event.create({
    data: {
      institutionId: inst1.id,
      name: "All-India Inter-School Athletics Championship 2026",
      category: "Athletics",
      sportGame: "100m, 400m, Long Jump & Shot Put",
      shortDescription: "National inter-school track & field tournament for U-17 and U-19 athletes with AFI certified FAT electronic timing.",
      fullDescription: `The All-India Inter-School Athletics Championship is the premier platform for school students to test their sprint velocity, endurance, and field throwing power under standard World Athletics conditions.

Winners will earn qualifying certificates recognized by state associations and invitations to regional Khelo India scouting trials.`,
      organizer: "DPS R.K. Puram Sports Directorate",
      hostingInstitution: "Delhi Public School R.K. Puram",
      contactPerson: "Coach Rajesh Negi",
      contactEmail: "rajesh.negi@dpsrkp.net",
      contactPhone: "+91 98101 23456",
      regStartDate: now,
      regEndDate: nextWeek,
      startDate: nextMonth,
      endDate: nextMonthEnd,
      reportingTime: "07:30 AM",
      startTime: "08:30 AM",
      duration: "3 Full Days",
      venueName: "Jawaharlal Nehru Stadium & DPS Athletic Arena",
      venueAddress: "Pragati Vihar, Bhishma Pitamah Marg",
      city: "New Delhi",
      state: "Delhi (NCT)",
      allowedInstitutionsType: "any",
      minAge: 14,
      maxAge: 19,
      gender: "All",
      classGrade: "9-12",
      participationType: "Individual",
      customEligibility: "Open to bonafide students aged 14 to 19 enrolled in Classes 9 through 12 across any recognized Indian board (CBSE, ICSE, State Boards).",
      rounds: JSON.stringify([
        { roundNumber: 1, name: "Heats & Qualification Rounds", date: "Day 1 (Morning)", desc: "8-lane timed qualification heats" },
        { roundNumber: 2, name: "Semi-Finals", date: "Day 2 (Morning)", desc: "Top 16 sprinters advance" },
        { roundNumber: 3, name: "Medal Finals", date: "Day 3 (Afternoon)", desc: "Top 8 Olympic final shootout" }
      ]),
      gameFormat: JSON.stringify({
        format: "World Athletics FAT (Fully Automatic Timing) to 0.01 seconds.",
        scoring: "Points table based on AFI Senior Youth performance conversion standards.",
        prizes: "Gold, Silver, and Bronze Medals, Cash Scholarship of ₹25,000 for Best Athlete, Trophy for Overall School Champion.",
        certificates: "Digital Merit Certificate for Top 8 finalists, Participation Certificate for all competitors.",
      }),
      rules: JSON.stringify({
        generalRules: [
          "Athletes must report in official school sports uniform and track spikes (max 6mm pyramid spikes).",
          "School Identity Card and Bonafide Certificate signed by Principal are mandatory at bib collection.",
          "Single false-start rule applies across all sprint heats.",
        ],
        codeOfConduct: "Fair play and mutual respect are compulsory. Doping, unsportsmanlike behavior, or age fraud will result in immediate disqualification and debarment.",
      }),
      isPaid: false,
      registrationFee: 0,
      visibility: "Public",
      status: "Published",
    },
  });

  // Event 2: Inter-College Badminton Super League (Ongoing)
  await prisma.event.create({
    data: {
      institutionId: inst2.id,
      name: "North Zone Inter-College Badminton Super League",
      category: "Badminton",
      sportGame: "Badminton (Singles & Doubles)",
      shortDescription: "BWF-sanctioned synthetic court championship for college and university students with live scoreboards.",
      fullDescription: `Annual flagship collegiate badminton tournament held on 4 BWF-certified synthetic courts. Featuring Men's Singles, Women's Singles, and Mixed Doubles.`,
      organizer: "St. Stephen's Sports Board",
      hostingInstitution: "St. Stephen's College",
      contactPerson: "Dr. Sanjeev Kumar",
      contactEmail: "sanjeev.sports@ststephens.edu",
      contactPhone: "+91 98210 98765",
      regStartDate: regPast,
      regEndDate: regPast,
      startDate: ongoingStart,
      endDate: ongoingEnd,
      reportingTime: "08:00 AM",
      startTime: "09:00 AM",
      duration: "4 Days",
      venueName: "Sir Girja Shankar Bajpai Indoor Sports Complex",
      venueAddress: "University Enclave, North Campus",
      city: "New Delhi",
      state: "Delhi (NCT)",
      allowedInstitutionsType: "any",
      minAge: 17,
      maxAge: 25,
      gender: "All",
      collegeYear: "1st, 2nd, 3rd, 4th, PG",
      participationType: "Individual",
      customEligibility: "Undergraduate and Postgraduate students enrolled in any recognized College or University in India. Valid college ID required.",
      rounds: JSON.stringify([
        { roundNumber: 1, name: "Round of 64", date: "Day 1", desc: "Best of 3 games to 21 points" },
        { roundNumber: 2, name: "Quarter-Finals & Semi-Finals", date: "Day 2 & 3", desc: "Knockout matches" },
        { roundNumber: 3, name: "Grand Finals", date: "Day 4", desc: "Podium trophy encounters" }
      ]),
      gameFormat: JSON.stringify({
        format: "BWF Standard 21-point rally scoring. Best of 3 sets.",
        scoring: "Standard BWF rally score system with 30-point sudden death cap at deuce.",
        prizes: "Winner: ₹15,000 + Trophy. Runner-Up: ₹8,000 + Silver Plate.",
        certificates: "Certificates signed by Association Officials for all participants.",
      }),
      rules: JSON.stringify({
        generalRules: [
          "Non-marking indoor badminton court shoes mandatory.",
          "Yonex AS-30 feather shuttles provided for all matches.",
          "Umpires' decision is final on line calls.",
        ],
      }),
      isPaid: true,
      registrationFee: 250,
      visibility: "Public",
      status: "Published",
    },
  });

  // Event 3: South India Inter-Collegiate Football Cup (Upcoming)
  await prisma.event.create({
    data: {
      institutionId: inst3.id,
      name: "South India Inter-Collegiate Football Trophy 2026",
      category: "Football",
      sportGame: "11-a-side Football",
      shortDescription: "16-team knockout football tournament under floodlights on FIFA-standard natural turf.",
      fullDescription: `The prestigious Loyola Football Trophy returns for its 2026 edition! Elite college teams from Tamil Nadu, Kerala, Karnataka, and Andhra Pradesh will compete under lights for the grand rolling trophy.`,
      organizer: "Loyola Physical Education Department",
      hostingInstitution: "Loyola College Chennai",
      contactPerson: "Dr. Vijay Anand",
      contactEmail: "vijay.anand@loyolacollege.edu",
      contactPhone: "+91 94441 56789",
      regStartDate: now,
      regEndDate: nextWeek,
      startDate: nextMonth,
      endDate: nextMonthEnd,
      reportingTime: "03:00 PM",
      startTime: "04:30 PM",
      duration: "5 Days",
      venueName: "Bertram Memorial Football Grounds",
      venueAddress: "Sterling Road, Nungambakkam",
      city: "Chennai",
      state: "Tamil Nadu",
      allowedInstitutionsType: "external_allowed",
      minAge: 18,
      maxAge: 25,
      gender: "Male",
      participationType: "Team",
      teamMinSize: 11,
      teamMaxSize: 18,
      customEligibility: "College teams representing recognized higher education institutions. Each squad consists of 11 starters and up to 7 substitutes.",
      rounds: JSON.stringify([
        { roundNumber: 1, name: "Round of 16 Knockouts", date: "Days 1 & 2", desc: "90-minute regulation matches" },
        { roundNumber: 2, name: "Semi-Finals", date: "Day 4", desc: "Floodlit knockout encounters" },
        { roundNumber: 3, name: "Championship Final", date: "Day 5", desc: "Final match + Trophy ceremony" }
      ]),
      gameFormat: JSON.stringify({
        format: "FIFA 11v11 rules. 2 halves of 45 minutes with 15-minute interval.",
        scoring: "Extra time (15m each) followed by penalty shootout if tied.",
        prizes: "Champions: ₹50,000 + Rolling Trophy. Runners-Up: ₹25,000.",
        certificates: "Individual medals and certified participation diplomas.",
      }),
      rules: JSON.stringify({
        generalRules: [
          "Moulded football boots and shin guards compulsory.",
          "Team jersey numbers must be clearly printed and non-conflicting.",
        ],
      }),
      isPaid: true,
      registrationFee: 1500,
      visibility: "Public",
      status: "Published",
    },
  });

  console.log("✅ Seeded verified institutions and Olympic events successfully!");
}

seedInstitutionsAndEvents()
  .catch((e) => {
    console.error("Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
