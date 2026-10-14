import { prisma } from "./prisma";

async function main() {
  console.log("Seeding realistic Lucknow sample events for SportRise...");

  // 1. Ensure a verified Lucknow Institution exists
  let institution = await prisma.institution.findFirst({
    where: { city: "Lucknow" },
  });

  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        name: "Babu Banarasi Das Sports Academy",
        type: "University",
        email: "sports.office@bbdu.ac.in",
        password: "hashed_dummy_password",
        contactNumber: "+91 94150 12345",
        website: "https://bbdu.ac.in/sports",
        address: "BBD City, Faizabad Road",
        city: "Lucknow",
        state: "Uttar Pradesh",
        country: "India",
        pincode: "226028",
        authorizedPersonName: "Prof. Arvind Sharma",
        authorizedPersonContact: "+91 94150 12345",
        description: "Premier university sports complex hosting state and national inter-collegiate championships.",
        coordinatorName: "Coach Rajesh Verma",
        coordinatorEmail: "r.verma@bbdu.ac.in",
        coordinatorPhone: "+91 98390 54321",
        latitude: 26.8912,
        longitude: 81.0594,
        isVerified: true,
        emailVerifiedAt: new Date(),
        supportedSports: JSON.stringify(["Badminton", "Athletics", "Cricket", "Football", "Basketball"]),
        facilities: JSON.stringify({
          indoorCourts: "8 BWF-grade wooden badminton courts with LED stadium lights",
          athleticsTrack: "400m synthetic all-weather running track",
          amenities: "Air-conditioned dressing rooms, physiotherapy & first aid room, player lounge, 500-vehicle parking",
        }),
      },
    });
    console.log("Created verified institution in Lucknow:", institution.name);
  } else {
    console.log("Using existing Lucknow institution:", institution.name);
  }

  const now = new Date(); // Oct 14, 2026
  const threeDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  const upcomingStart = new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000);
  const upcomingEnd = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
  const upcomingRegDeadline = new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000);

  // 2. Ongoing Event: SportRise Inter-College Badminton Championship 2026
  const ongoingEvent = await prisma.event.upsert({
    where: {
      id: "demo-ongoing-badminton-lucknow",
    },
    update: {
      name: "SportRise Inter-College Badminton Championship 2026 [DEMO EVENT]",
      category: "Sports Tournament",
      sportGame: "Badminton (Singles & Doubles)",
      shortDescription: "Official UP State Inter-Collegiate Badminton Championship featuring top college shuttlers across North India. [SAMPLE DATA]",
      fullDescription: `### SportRise Inter-College Badminton Championship 2026\n\n*Hosted by Babu Banarasi Das Sports Academy, Lucknow. (Demonstration / Sample Event)*\n\nWelcome to Lucknow's premier collegiate badminton showdown. Over 48 colleges compete on world-class BWF standard synthetic courts with electronic line calling, BAI accredited umpires, and live scoring.\n\n#### Key Event Highlights:\n- **Venue:** Babu Banarasi Das Indoor Stadium, Lucknow, UP\n- **Participation:** Men's & Women's Singles and Doubles\n- **Registration Status:** Closed (Matches currently underway)\n- **Fee:** ₹300 per athlete (Payable directly at the venue registration desk)\n- **Tournament Format:** Direct Knockout rounds with 21-point best-of-3 sets.`,
      organizer: "Babu Banarasi Das Sports Academy",
      hostingInstitution: institution.name,
      contactPerson: "Coach Rajesh Verma",
      contactEmail: "badminton.lucknow@bbdu.ac.in",
      contactPhone: "+91 98390 54321",
      regStartDate: sixDaysAgo,
      regEndDate: threeDaysAgo, // Registration closed
      startDate: threeDaysAgo,  // Ongoing right now
      endDate: threeDaysLater,  // Ends in 3 days
      reportingTime: "08:00 AM",
      startTime: "09:00 AM",
      duration: "5 Days",
      venueName: "Babu Banarasi Das Indoor Stadium",
      venueAddress: "BBD City, Faizabad Road, Chinhat",
      city: "Lucknow",
      state: "Uttar Pradesh",
      latitude: 26.8912,
      longitude: 81.0594,
      allowedInstitutionsType: "any",
      minAge: 17,
      maxAge: 25,
      gender: "All",
      participationType: "Both (Individual & Team)",
      teamMinSize: 1,
      teamMaxSize: 2,
      isPaid: true,
      registrationFee: 300,
      gstPercent: 0,
      paymentDeadline: threeDaysAgo,
      refundPolicy: "Non-refundable once tournament draw is published. Pay at Venue participants complete payments on reporting day.",
      visibility: "Public",
      status: "Published",
      rules: JSON.stringify({
        scoring: "BWF 21-point rally point system; best of 3 sets. Sudden death at 29-all until 30.",
        shuttlecock: "Yonex AS-20 feather shuttlecocks provided by the organizing committee.",
        attire: "Non-marking gum-sole badminton shoes compulsory inside the arena. White or collegiate team jersey mandatory.",
        paymentNotice: "Payment can be made directly at the event venue. Please complete your payment at the registration desk before participating.",
        payAtVenue: true,
      }),
      gameFormat: JSON.stringify({
        format: "Knockout elimination draw",
        rounds: [
          { name: "Round of 64 (Singles)", date: "Day 1", time: "09:00 AM", venue: "Courts 1-4" },
          { name: "Round of 32 & Doubles Prelims", date: "Day 2", time: "09:30 AM", venue: "Courts 1-6" },
          { name: "Quarter-Finals & Semi-Finals", date: "Day 3 (Today)", time: "10:00 AM", venue: "Centre Court" },
          { name: "Grand Finals & Medal Ceremony", date: "Day 4", time: "02:00 PM", venue: "Centre Court" },
        ],
      }),
    },
    create: {
      id: "demo-ongoing-badminton-lucknow",
      institutionId: institution.id,
      name: "SportRise Inter-College Badminton Championship 2026 [DEMO EVENT]",
      category: "Sports Tournament",
      sportGame: "Badminton (Singles & Doubles)",
      shortDescription: "Official UP State Inter-Collegiate Badminton Championship featuring top college shuttlers across North India. [SAMPLE DATA]",
      fullDescription: `### SportRise Inter-College Badminton Championship 2026\n\n*Hosted by Babu Banarasi Das Sports Academy, Lucknow. (Demonstration / Sample Event)*\n\nWelcome to Lucknow's premier collegiate badminton showdown. Over 48 colleges compete on world-class BWF standard synthetic courts with electronic line calling, BAI accredited umpires, and live scoring.\n\n#### Key Event Highlights:\n- **Venue:** Babu Banarasi Das Indoor Stadium, Lucknow, UP\n- **Participation:** Men's & Women's Singles and Doubles\n- **Registration Status:** Closed (Matches currently underway)\n- **Fee:** ₹300 per athlete (Payable directly at the venue registration desk)\n- **Tournament Format:** Direct Knockout rounds with 21-point best-of-3 sets.`,
      organizer: "Babu Banarasi Das Sports Academy",
      hostingInstitution: institution.name,
      contactPerson: "Coach Rajesh Verma",
      contactEmail: "badminton.lucknow@bbdu.ac.in",
      contactPhone: "+91 98390 54321",
      regStartDate: sixDaysAgo,
      regEndDate: threeDaysAgo,
      startDate: threeDaysAgo,
      endDate: threeDaysLater,
      reportingTime: "08:00 AM",
      startTime: "09:00 AM",
      duration: "5 Days",
      venueName: "Babu Banarasi Das Indoor Stadium",
      venueAddress: "BBD City, Faizabad Road, Chinhat",
      city: "Lucknow",
      state: "Uttar Pradesh",
      latitude: 26.8912,
      longitude: 81.0594,
      allowedInstitutionsType: "any",
      minAge: 17,
      maxAge: 25,
      gender: "All",
      participationType: "Both (Individual & Team)",
      teamMinSize: 1,
      teamMaxSize: 2,
      isPaid: true,
      registrationFee: 300,
      gstPercent: 0,
      paymentDeadline: threeDaysAgo,
      refundPolicy: "Non-refundable once tournament draw is published. Pay at Venue participants complete payments on reporting day.",
      visibility: "Public",
      status: "Published",
      rules: JSON.stringify({
        scoring: "BWF 21-point rally point system; best of 3 sets. Sudden death at 29-all until 30.",
        shuttlecock: "Yonex AS-20 feather shuttlecocks provided by the organizing committee.",
        attire: "Non-marking gum-sole badminton shoes compulsory inside the arena. White or collegiate team jersey mandatory.",
        paymentNotice: "Payment can be made directly at the event venue. Please complete your payment at the registration desk before participating.",
        payAtVenue: true,
      }),
      gameFormat: JSON.stringify({
        format: "Knockout elimination draw",
        rounds: [
          { name: "Round of 64 (Singles)", date: "Day 1", time: "09:00 AM", venue: "Courts 1-4" },
          { name: "Round of 32 & Doubles Prelims", date: "Day 2", time: "09:30 AM", venue: "Courts 1-6" },
          { name: "Quarter-Finals & Semi-Finals", date: "Day 3 (Today)", time: "10:00 AM", venue: "Centre Court" },
          { name: "Grand Finals & Medal Ceremony", date: "Day 4", time: "02:00 PM", venue: "Centre Court" },
        ],
      }),
    },
  });
  console.log("Seeded Ongoing Event:", ongoingEvent.name);

  // 3. Upcoming Event: SportRise National Athletics Trial Meet 2026
  const upcomingEvent = await prisma.event.upsert({
    where: {
      id: "demo-upcoming-athletics-lucknow",
    },
    update: {
      name: "SportRise National Athletics Trial Meet 2026 [DEMO EVENT]",
      category: "Athletics",
      sportGame: "Athletics (100m, 400m, 1500m, Long Jump, Javelin)",
      shortDescription: "Official open selection trials for North Zone junior & senior athletes for Khelo India national pathways. Free Registration. [SAMPLE DATA]",
      fullDescription: `### SportRise National Athletics Trial Meet 2026\n\n*Organized at KD Singh Babu Stadium, Lucknow. (Demonstration / Sample Event)*\n\nSanctioned athletics trials providing electronic laser timing (FinishLynx) and AFI certified track officials. Top 3 finishers in each event earn direct qualification recommendations for National Youth Trials.\n\n#### Key Event Details:\n- **Venue:** KD Singh Babu Stadium, Hazratganj, Lucknow\n- **Participation:** Individual (Boys & Girls, Men & Women)\n- **Cost:** 100% Free Registration for all Indian youth athletes\n- **Track Specification:** 8-lane synthetic track, IAAF certified.\n- **Eligibility:** Valid school/college photo ID or SportRise Athlete ID required.`,
      organizer: "Uttar Pradesh Youth Sports Directorate & SportRise",
      hostingInstitution: institution.name,
      contactPerson: "Dr. Vikram Singh",
      contactEmail: "trials.lucknow@sportrise.in",
      contactPhone: "+91 94150 99887",
      regStartDate: now,
      regEndDate: upcomingRegDeadline, // Open for 16 more days
      startDate: upcomingStart,        // Starts Nov 5, 2026
      endDate: upcomingEnd,
      reportingTime: "06:30 AM",
      startTime: "07:30 AM",
      duration: "3 Days",
      venueName: "KD Singh Babu Stadium",
      venueAddress: "Hazratganj, Near KD Singh Babu Metro Station",
      city: "Lucknow",
      state: "Uttar Pradesh",
      latitude: 26.8535,
      longitude: 80.9388,
      allowedInstitutionsType: "any",
      minAge: 14,
      maxAge: 23,
      gender: "All",
      participationType: "Individual",
      teamMinSize: 1,
      teamMaxSize: 1,
      isPaid: false, // 100% Free
      registrationFee: 0,
      gstPercent: 0,
      paymentDeadline: null,
      refundPolicy: "Free registration. No charges apply.",
      visibility: "Public",
      status: "Published",
      rules: JSON.stringify({
        regulations: "Governed strictly by World Athletics / Athletics Federation of India technical rules.",
        spikes: "Maximum 6mm pyramid spikes permitted on synthetic track.",
        timing: "Photo-finish electronic timing accurate to 1/1000th of a second.",
        paymentNotice: "Free Registration. No fee required.",
        payAtVenue: false,
      }),
      gameFormat: JSON.stringify({
        format: "Heats, Semi-finals and Medal Finals",
        events: ["100m Sprint", "400m Run", "1500m Middle Distance", "Long Jump", "Javelin Throw"],
      }),
    },
    create: {
      id: "demo-upcoming-athletics-lucknow",
      institutionId: institution.id,
      name: "SportRise National Athletics Trial Meet 2026 [DEMO EVENT]",
      category: "Athletics",
      sportGame: "Athletics (100m, 400m, 1500m, Long Jump, Javelin)",
      shortDescription: "Official open selection trials for North Zone junior & senior athletes for Khelo India national pathways. Free Registration. [SAMPLE DATA]",
      fullDescription: `### SportRise National Athletics Trial Meet 2026\n\n*Organized at KD Singh Babu Stadium, Lucknow. (Demonstration / Sample Event)*\n\nSanctioned athletics trials providing electronic laser timing (FinishLynx) and AFI certified track officials. Top 3 finishers in each event earn direct qualification recommendations for National Youth Trials.\n\n#### Key Event Details:\n- **Venue:** KD Singh Babu Stadium, Hazratganj, Lucknow\n- **Participation:** Individual (Boys & Girls, Men & Women)\n- **Cost:** 100% Free Registration for all Indian youth athletes\n- **Track Specification:** 8-lane synthetic track, IAAF certified.\n- **Eligibility:** Valid school/college photo ID or SportRise Athlete ID required.`,
      organizer: "Uttar Pradesh Youth Sports Directorate & SportRise",
      hostingInstitution: institution.name,
      contactPerson: "Dr. Vikram Singh",
      contactEmail: "trials.lucknow@sportrise.in",
      contactPhone: "+91 94150 99887",
      regStartDate: now,
      regEndDate: upcomingRegDeadline,
      startDate: upcomingStart,
      endDate: upcomingEnd,
      reportingTime: "06:30 AM",
      startTime: "07:30 AM",
      duration: "3 Days",
      venueName: "KD Singh Babu Stadium",
      venueAddress: "Hazratganj, Near KD Singh Babu Metro Station",
      city: "Lucknow",
      state: "Uttar Pradesh",
      latitude: 26.8535,
      longitude: 80.9388,
      allowedInstitutionsType: "any",
      minAge: 14,
      maxAge: 23,
      gender: "All",
      participationType: "Individual",
      teamMinSize: 1,
      teamMaxSize: 1,
      isPaid: false,
      registrationFee: 0,
      gstPercent: 0,
      paymentDeadline: null,
      refundPolicy: "Free registration. No charges apply.",
      visibility: "Public",
      status: "Published",
      rules: JSON.stringify({
        regulations: "Governed strictly by World Athletics / Athletics Federation of India technical rules.",
        spikes: "Maximum 6mm pyramid spikes permitted on synthetic track.",
        timing: "Photo-finish electronic timing accurate to 1/1000th of a second.",
        paymentNotice: "Free Registration. No fee required.",
        payAtVenue: false,
      }),
      gameFormat: JSON.stringify({
        format: "Heats, Semi-finals and Medal Finals",
        events: ["100m Sprint", "400m Run", "1500m Middle Distance", "Long Jump", "Javelin Throw"],
      }),
    },
  });
  console.log("Seeded Upcoming Event:", upcomingEvent.name);

  console.log("Successfully seeded both Lucknow sample events!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
