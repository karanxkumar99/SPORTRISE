export interface MetricFieldDefinition {
  id: string;
  label: string;
  unit: string;
  type: "number" | "select";
  placeholder: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  helperText: string;
}

export interface OlympicSportDetail {
  id: string;
  slug: string;
  name: string;
  hindiName: string;
  category: "Track & Field" | "Combat" | "Racquet" | "Strength" | "Team Sports" | "Water Sports" | "Precision";
  code: string;
  icon: string;
  overview: string;
  olympicHistory: string;
  governingBody: string;
  rules: {
    summary: string;
    keyRegulations: string[];
    foulsAndPenalties: string[];
    matchStructure: string;
  };
  dimensions: {
    courtPitchDimensions: string;
    equipmentStandards: string;
    surfaceType: string;
    technicalSpecifications: string[];
  };
  scoring: {
    format: string;
    pointsSystem: string;
    tieBreaker: string;
    tournamentProgression: string;
  };
  benchmarks: {
    grassrootsDistrict: string;
    kheloIndiaYouth: string;
    seniorNational: string;
    olympicStandard: string;
  };
  metricFields: MetricFieldDefinition[];
}

export const OLYMPIC_SPORTS: OlympicSportDetail[] = [
  {
    id: "athletics",
    slug: "athletics",
    name: "Athletics (Track & Field)",
    hindiName: "एथलेटिक्स",
    category: "Track & Field",
    code: "ATH",
    icon: "Footprints",
    overview: "The core foundation of Olympic sports comprising sprint, middle distance, long distance, hurdles, relays, jumps, and throws governed by World Athletics and AFI.",
    olympicHistory: "Present at every modern Olympic Games since Athens 1896. India's greatest modern triumph: Neeraj Chopra's historic Gold at Tokyo 2020.",
    governingBody: "Athletics Federation of India (AFI) / World Athletics",
    rules: {
      summary: "Athletes compete in lane-based sprints or field pits according to strict false start and sector foul regulations.",
      keyRegulations: [
        "Single False Start Rule: Any athlete responsible for a false start in sprint events is immediately disqualified.",
        "Lane Discipline: Runners in 100m, 200m, 400m must remain entirely within their assigned 1.22m lane throughout.",
        "Takeoff Board: In Long Jump & Triple Jump, stepping beyond the plasticine indicator line constitutes a foul jump.",
        "Baton Passing: In relays, batons must be exchanged within the designated 20-meter changeover zone."
      ],
      foulsAndPenalties: [
        "Lane stepping causing obstruction: Immediate DQ",
        "Discus/Javelin landing outside the 34.92° throwing sector: No mark recorded",
        "Pacing assistance from outside track: Disqualification"
      ],
      matchStructure: "Heats -> Semi-Finals -> Final (8 lanes)"
    },
    dimensions: {
      courtPitchDimensions: "Standard 400m 8-lane synthetic oval track with two 100m straightaways and curves (radius 36.5m).",
      equipmentStandards: "Starting blocks with electronic pressure sensors (reaction time threshold 0.100s). Javelin: Men 800g (2.6-2.7m), Women 600g (2.2-2.3m). Shot Put: Men 7.26kg, Women 4kg.",
      surfaceType: "Class 1 WA Certified Polyurethane / Sandwich Synthetic Tartan surface",
      technicalSpecifications: [
        "Track lane width: 1.22 meters (± 0.01m)",
        "Long Jump runway length: 40-45 meters, Sand pit: 2.75-3.0m width",
        "High jump landing mat: Minimum 6m x 4m x 0.7m"
      ]
    },
    scoring: {
      format: "Fully Automatic Timing (FAT) to 1/1000th of a second; laser distance measurement for field jumps/throws.",
      pointsSystem: "Fastest time or greatest legal distance determines medal podium.",
      tieBreaker: "Countback on next-best legal jump/throw; in high jump, fewest failures at height.",
      tournamentProgression: "Top 2-3 per heat + fastest non-automatic qualifiers advance to round."
    },
    benchmarks: {
      grassrootsDistrict: "100m: 11.90s - 12.50s | Long Jump: 5.80m - 6.20m",
      kheloIndiaYouth: "100m: 10.85s - 11.10s | Long Jump: 7.10m - 7.35m | Javelin: 68.0m+",
      seniorNational: "100m: 10.35s - 10.50s | Long Jump: 7.80m - 8.00m | Javelin: 82.0m+",
      olympicStandard: "100m: 10.00s automatic entry | Long Jump: 8.27m | Javelin: 85.50m"
    },
    metricFields: [
      { id: "sprint100m", label: "100m Sprint Time", unit: "seconds", type: "number", step: 0.01, min: 9.5, max: 20.0, placeholder: "e.g. 11.25", helperText: "Official FAT or hand-timed 100m sprint record" },
      { id: "longJumpMeters", label: "Long Jump Distance", unit: "meters", type: "number", step: 0.01, min: 3.0, max: 9.0, placeholder: "e.g. 6.85", helperText: "Best legal jump from takeoff board to nearest sand mark" },
      { id: "vo2Max", label: "VO2 Max / Bleep Test", unit: "ml/kg/min", type: "number", step: 0.5, min: 30, max: 85, placeholder: "e.g. 56.5", helperText: "Aerobic cardiovascular capacity level" }
    ]
  },
  {
    id: "badminton",
    slug: "badminton",
    name: "Badminton",
    hindiName: "बैडमिंटन",
    category: "Racquet",
    code: "BAD",
    icon: "Activity",
    overview: "Fast-paced racquet sport demanding explosive agility, precision shuttlecock control, and tactical court mastery. Governed by BAI & BWF.",
    olympicHistory: "Official Olympic sport since Barcelona 1992. India holds 3 Olympic medals (Saina Nehwal Bronze 2012, PV Sindhu Silver 2016 & Bronze 2020).",
    governingBody: "Badminton Association of India (BAI) / Badminton World Federation (BWF)",
    rules: {
      summary: "Players score rally points by grounding the shuttlecock on the opponent's court. Best of 3 games to 21 points.",
      keyRegulations: [
        "Rally Point System: A point is won on every rally regardless of who served.",
        "Service Height Rule: The entire shuttlecock must be below 1.15 meters from the court surface at the instant of being hit by server's racket.",
        "Continuous Play: Play is continuous; 60-second break when either side reaches 11 points; 120-second break between games.",
        "Double Touch / Net Foul: Hitting the net with racket or body, or contacting shuttlecock twice consecutively is an immediate fault."
      ],
      foulsAndPenalties: [
        "Serving over 1.15m height: Service fault",
        "Invading opponent's court under net: Fault",
        "Yellow Card for delay / Red Card for persistent misconduct (awards point to opponent)"
      ],
      matchStructure: "Best of 3 games of 21 points each (must win by 2 points up to 30 max)."
    },
    dimensions: {
      courtPitchDimensions: "13.40m length x 6.10m width for doubles (5.18m width for singles). Net height: 1.55m at posts, 1.524m at center.",
      equipmentStandards: "Feathered shuttlecocks: 16 goose feathers (weights 4.74g to 5.50g). Rackets: carbon fiber composite under 100g.",
      surfaceType: "BWF Approved Synthetic PVC Mat / Hardwood sprung sports floor",
      technicalSpecifications: [
        "Singles service court: 4.72m long x 2.59m wide",
        "Clear ceiling height: Minimum 9.0m for national tournaments, 12m for Olympic standard",
        "Lighting: Minimum 1000 Lux glare-free"
      ]
    },
    scoring: {
      format: "BWF 3x21 Rally Points Scoring.",
      pointsSystem: "At 20-all, side which gains a 2-point lead wins the game. At 29-all, the side scoring the 30th point wins.",
      tieBreaker: "Sudden death point at 29-all.",
      tournamentProgression: "Single elimination knockout / Round robin group stages in Olympics."
    },
    benchmarks: {
      grassrootsDistrict: "District Quarter-Finalist | Agility Drill: 16.0s | Win Rate: 50-60%",
      kheloIndiaYouth: "State Champion / Top 8 Youth Ranking | Agility Drill: 13.5s | Win Rate: 75%+",
      seniorNational: "National Top 32 Ranked | International BWF 100/300 circuit contender",
      olympicStandard: "BWF Top 16 World Ranking qualification quota"
    },
    metricFields: [
      { id: "winLossRatio", label: "Competitive Win Rate (%)", unit: "%", type: "number", step: 1, min: 0, max: 100, placeholder: "e.g. 74", helperText: "Win percentage in official sanctioned tournaments" },
      { id: "tournamentLevel", label: "Highest Tournament Level", unit: "tier (1-5)", type: "number", step: 1, min: 1, max: 5, placeholder: "1=District, 2=State, 3=Zonal, 4=National, 5=International", helperText: "Tier 1: District, 2: State, 3: Zonal, 4: National, 5: International" },
      { id: "agilitySeconds", label: "6-Corner Agility Drill Time", unit: "seconds", type: "number", step: 0.1, min: 9.0, max: 25.0, placeholder: "e.g. 13.2", helperText: "Time to complete 6-corner shadow court shuttle tap test" }
    ]
  },
  {
    id: "boxing",
    slug: "boxing",
    name: "Boxing",
    hindiName: "मुक्केबाजी",
    category: "Combat",
    code: "BOX",
    icon: "Shield",
    overview: "Olympic pugilistic combat emphasizing punching power, tactical evasion, defensive guards, and aerobic conditioning governed by BFI & World Boxing.",
    olympicHistory: "Olympic staple since 1904. India's Olympic medalists: Vijender Singh (2008), Mary Kom (2012), Lovlina Borgohain (2020).",
    governingBody: "Boxing Federation of India (BFI) / IOC Boxing Task Force",
    rules: {
      summary: "Three rounds of 3 minutes (men/women). Points awarded by 5 ringside judges using 10-point must system.",
      keyRegulations: [
        "Target Area: Legal punches must land with the knuckle part of the closed glove on front/sides of opponent's head or torso above belt.",
        "10-Point Must System: Winner of each round gets 10 points; loser gets 9, 8, or 7 depending on dominance.",
        "Knockdown Count: Mandatory 8-count administered upon knockdown; referee stops contest if boxer unable to defend.",
        "Clinching & Holding: Wresting or holding the opponent results in cautions and point deductions."
      ],
      foulsAndPenalties: [
        "Head-butting, low blows below belt, punching behind the head (rabbit punch)",
        "Holding and hitting simultaneously: Immediate warning, point deduction on repetition",
        "Disqualification upon receiving 3 warnings in a single bout"
      ],
      matchStructure: "3 rounds of 3 minutes each with 1-minute interval between rounds."
    },
    dimensions: {
      courtPitchDimensions: "Square ring: 6.10m x 6.10m inside the ropes (7.80m outer platform). Platform height: 1.0m.",
      equipmentStandards: "Gloves: 10 oz for categories up to 67kg, 12 oz for heavier categories. Hand wraps: 4.5m cotton bandage.",
      surfaceType: "Canvas stretched over high-density felt/rubber foam shock absorbing padding",
      technicalSpecifications: [
        "4 ropes padded with smooth covering (diameters 4cm each)",
        "Corner pads: Red (Home), Blue (Away), Two Neutral White corners",
        "Mouthguard (gumshield) mandatory, groin protector mandatory"
      ]
    },
    scoring: {
      format: "10-Point Must System evaluated by 5 ringside judges.",
      pointsSystem: "Judged on: Number of quality blows landed on target area, tactical dominance & competitiveness, technical infringement deductions.",
      tieBreaker: "No draw permitted; in 5-judge bout, computerized tally determines split or unanimous decision.",
      tournamentProgression: "Direct single-elimination tournament bracket."
    },
    benchmarks: {
      grassrootsDistrict: "District Golden Gloves Winner | Reaction Time: <280ms",
      kheloIndiaYouth: "State Champion / Khelo India Medalist | Reaction Time: <220ms | Win Rate: 70%+",
      seniorNational: "National Senior Championship Finalist | ASI/Services or Railway contingent",
      olympicStandard: "Continental Olympic Qualifying Tournament Top 2-4 Quota"
    },
    metricFields: [
      { id: "winLossRatio", label: "Bout Win Percentage", unit: "%", type: "number", step: 1, min: 0, max: 100, placeholder: "e.g. 80", helperText: "Percentage of official bouts won" },
      { id: "punchFrequency", label: "Punches / Combinations Per Min", unit: "punches/min", type: "number", step: 1, min: 10, max: 120, placeholder: "e.g. 52", helperText: "Work rate output in heavy bag endurance drill" },
      { id: "reactionTimeMs", label: "Reaction / Evade Latency", unit: "milliseconds", type: "number", step: 1, min: 100, max: 450, placeholder: "e.g. 210", helperText: "Visual reaction-time test score" }
    ]
  },
  {
    id: "wrestling",
    slug: "wrestling",
    name: "Wrestling (Freestyle & Greco-Roman)",
    hindiName: "कुश्ती",
    category: "Combat",
    code: "WRE",
    icon: "Flame",
    overview: "Ancient Indian cultural sport and Olympic combat pillar focusing on takedowns, throws, pins, and leverage. Governed by WFI & United World Wrestling.",
    olympicHistory: "KD Jadhav won independent India's first individual Olympic medal (Bronze 1952). Sushil Kumar (2x), Yogeshwar Dutt, Sakshi Malik, Bajrang Punia, Ravi Dahiya, Aman Sehrawat have continued this legacy.",
    governingBody: "Wrestling Federation of India (WFI) / United World Wrestling (UWW)",
    rules: {
      summary: "Competitors aim to pin opponent's shoulders to the mat (Fall) or amass technical superiority points over two 3-minute periods.",
      keyRegulations: [
        "Pin (Fall): Holding both of opponent's shoulders flat against mat for 1 second terminates bout instantly.",
        "Technical Superiority: In Freestyle, a 10-point lead ends the match. In Greco-Roman, an 8-point lead ends it.",
        "Passivity Rule: Passive wrestler receives 30-second shot clock to score; failure awards 1 point to opponent.",
        "Greco-Roman holds strictly prohibited below the waist; Freestyle permits full leg attacks."
      ],
      foulsAndPenalties: [
        "Biting, eye gouging, twisting fingers, attacking joints against natural motion",
        "Fleeing the mat or holding opponent's singlet: Caution + 1 or 2 points to opponent",
        "Illegal suplex or head landing throw: Disqualification"
      ],
      matchStructure: "Two periods of 3 minutes with 30-second interval."
    },
    dimensions: {
      courtPitchDimensions: "12m x 12m square mat with a circular combat zone of 9m diameter. Center wrestling area 7m diameter, passivity zone 1m wide.",
      equipmentStandards: "Singlets in Red and Blue; wrestling boots with soft soles and no metal eyelets; ear guards permitted.",
      surfaceType: "UWW certified high-absorption wrestling mat (5-6cm thickness)",
      technicalSpecifications: [
        "Center combat circle: 1m diameter orange center circle",
        "Passivity red band: 100cm wide perimeter band",
        "Safety protection area: 1.5m perimeter surround"
      ]
    },
    scoring: {
      format: "Technical points awarded by referee team (Referee, Judge, Mat Chairman).",
      pointsSystem: "Takedown: 2 pts | High amplitude grand-amplitude throw: 4 or 5 pts | Exposure/Turn (gut wrench): 2 pts | Reversal: 1 pt | Out of bounds: 1 pt.",
      tieBreaker: "Highest value scoring move -> Fewest cautions -> Last point scored.",
      tournamentProgression: "Direct elimination bracket with repechage for finalists' vanquished opponents."
    },
    benchmarks: {
      grassrootsDistrict: "District Dangal / School Games Medalist | Takedowns/bout: 2-3",
      kheloIndiaYouth: "Khelo India Podium | State Freestyle Champion | Takedowns: 5+",
      seniorNational: "National Senior Freestyle / Greco Champion (Chhatrasal / SAI Rohtak / Railways)",
      olympicStandard: "World Championships Top 5 or UWW World Olympic Qualifiers"
    },
    metricFields: [
      { id: "winLossRatio", label: "Bout Win Percentage (%)", unit: "%", type: "number", step: 1, min: 0, max: 100, placeholder: "e.g. 82", helperText: "Percentage of bouts won in state/national trials" },
      { id: "takedownsAvg", label: "Avg Takedowns Per Match", unit: "takedowns", type: "number", step: 0.5, min: 0, max: 15, placeholder: "e.g. 4.5", helperText: "Average successful offensive takedown count" },
      { id: "reactionTimeMs", label: "Sprawl / Counter Reaction Time", unit: "ms", type: "number", step: 1, min: 100, max: 400, placeholder: "e.g. 215", helperText: "Reaction test in defending leg attack" }
    ]
  },
  {
    id: "shooting",
    slug: "shooting",
    name: "Shooting (Rifle & Pistol)",
    hindiName: "निशानेबाजी",
    category: "Precision",
    code: "SHT",
    icon: "Target",
    overview: "Precision sport testing breath control, stillness, mental focus, and millimetric trigger mechanics governed by NRAI & ISSF.",
    olympicHistory: "India's greatest Olympic medal source: Abhinav Bindra (Gold 2008), Rajyavardhan Rathore (Silver 2004), Vijay Kumar (Silver 2012), Gagan Narang (Bronze 2012), Manu Bhaker (2x Bronze 2024), Sarabjot Singh & Swapnil Kusale (Bronze 2024).",
    governingBody: "National Rifle Association of India (NRAI) / International Shooting Sport Federation (ISSF)",
    rules: {
      summary: "Shooters fire 60 shots within 75 minutes at 10m/50m electronic targets. Top 8 advance to progressive elimination final.",
      keyRegulations: [
        "Single Load Rule: Only one pellet/bullet loaded at a time; breech open until ready on firing line.",
        "Trigger Weight Check: 10m Air Pistol trigger pull weight must be minimum 500 grams.",
        "Shooting Jacket Stiffness: 10m Air Rifle jackets inspected with electronic gauge for thickness (max 2.5mm) and flexibility.",
        "Shooter Stance: Unsupported standing position; both feet fully on firing point without touching walls or equipment."
      ],
      foulsAndPenalties: [
        "Discharge before official 'Start' command: Disqualification or 2-point penalty",
        "Failing post-match trigger weight check: Disqualification of results",
        "Loading more than one pellet: 2-point penalty"
      ],
      matchStructure: "60-shot qualification series -> 24-shot progressive elimination final."
    },
    dimensions: {
      courtPitchDimensions: "10m Air range: Distance from firing line to target surface is 10.00m (± 0.05m). Target height 1.40m (± 0.05m).",
      equipmentStandards: "10m Air target: 10-ring diameter is 0.5mm (Air Rifle) and 11.5mm (Air Pistol). Electronic targets (SIUS Ascor) measure to 0.1 of a ring.",
      surfaceType: "Indoor climate-controlled 18-22°C shooting range with specialized rubber anti-vibration firing mats",
      technicalSpecifications: [
        "Ammunition: 4.5mm (.177 cal) diabolo match pellets",
        "Air Rifle max weight: 5.5kg including sights and counterweights",
        "Target illumination: Minimum 1500 Lux, firing line 500 Lux"
      ]
    },
    scoring: {
      format: "ISSF Decimal Scoring for Air Rifle (max 654.0), Integer for Air Pistol (max 600).",
      pointsSystem: "Bullseye center earns 10.9 in decimal scoring; 10 in integer scoring.",
      tieBreaker: "Inner-10 count (X-ring) -> Highest score in last 10-shot series.",
      tournamentProgression: "Top 8 shooters qualify for the live countdown elimination medal match."
    },
    benchmarks: {
      grassrootsDistrict: "10m Air Pistol: 540-555 / 600 | 10m Air Rifle: 595.0 - 612.0",
      kheloIndiaYouth: "10m Air Pistol: 572 - 580 / 600 | 10m Air Rifle: 624.0 - 628.5",
      seniorNational: "10m Air Pistol: 582 - 588 / 600 | 10m Air Rifle: 630.0 - 633.0",
      olympicStandard: "Olympic Qualification MQS: 585+ (Pistol), 631.5+ (Rifle)"
    },
    metricFields: [
      { id: "tenMeterScore", label: "60-Shot Qualification Score", unit: "points", type: "number", step: 0.1, min: 400, max: 635, placeholder: "e.g. 581 or 626.4", helperText: "Score achieved out of 600 (Pistol) or 654 (Rifle)" },
      { id: "innerTenCount", label: "Inner-10 (X) Count", unit: "bullseyes", type: "number", step: 1, min: 0, max: 60, placeholder: "e.g. 24", helperText: "Number of perfect center X bullseyes" },
      { id: "consistencyScore", label: "Series Variance / Consistency", unit: "%", type: "number", step: 1, min: 50, max: 99, placeholder: "e.g. 94", helperText: "Consistency percentage between 10-shot series" }
    ]
  },
  {
    id: "weightlifting",
    slug: "weightlifting",
    name: "Weightlifting",
    hindiName: "भारोत्तोलन",
    category: "Strength",
    code: "WLT",
    icon: "Trophy",
    overview: "Supreme test of explosive power and technique composed of two lifts: the Snatch and the Clean & Jerk governed by IWLF & IWF.",
    olympicHistory: "Olympic staple since 1896. India's Olympic heroines: Karnam Malleswari (Bronze Sydney 2000), Mirabai Chanu (Silver Tokyo 2020).",
    governingBody: "Indian Weightlifting Federation (IWLF) / International Weightlifting Federation (IWF)",
    rules: {
      summary: "Lifters have 3 attempts each in Snatch and Clean & Jerk. The sum of the highest successful lift in each determines the total.",
      keyRegulations: [
        "Snatch: Lifting the barbell from platform to full arms extension overhead in one single continuous motion.",
        "Clean & Jerk: Clean to the shoulders in one motion, followed by jerk from shoulders to overhead lockout.",
        "Lockout Rule: Elbows and knees must be fully extended and locked; feet aligned in parallel line to receive down signal.",
        "Clock: Lifter has 1 minute (2 minutes if following oneself) from call to begin attempt."
      ],
      foulsAndPenalties: [
        "Press-out: Any incomplete extension of arms finished by subsequent pressing out with triceps: No lift",
        "Touching platform with knees or buttocks during lift: Immediate no-lift",
        "Dropping barbell before referee down signal: Red lights"
      ],
      matchStructure: "Snatch phase (3 attempts) -> 10-minute break -> Clean & Jerk phase (3 attempts)."
    },
    dimensions: {
      courtPitchDimensions: "Square wooden platform: 4.0m x 4.0m, height 100mm. Barbell length: 2.20m (Men 20kg), 2.01m (Women 15kg).",
      equipmentStandards: "IWF approved rubber bumper plates (450mm diameter for 10kg, 15kg, 20kg, 25kg). Collar weight: 2.5kg each.",
      surfaceType: "Hardwood tongue-and-groove non-slip competition platform",
      technicalSpecifications: [
        "Bar grip diameter: Men 28mm, Women 25mm",
        "Referee lights system: 3 referees (White = Good lift, Red = No lift, minimum 2 white lights required)"
      ]
    },
    scoring: {
      format: "Olympic Total = Best Snatch (kg) + Best Clean & Jerk (kg).",
      pointsSystem: "Highest total weight lifted wins medal in weight category; Sinclair coefficient used for pound-for-pound rating.",
      tieBreaker: "If totals equal, athlete who lifted the total first in the competition order ranks higher.",
      tournamentProgression: "Categories contested from 49kg to +102kg."
    },
    benchmarks: {
      grassrootsDistrict: "Snatch: 60-80kg | Clean & Jerk: 75-105kg (Sinclair ~240)",
      kheloIndiaYouth: "Snatch: 95-125kg | Clean & Jerk: 120-155kg (Sinclair ~330)",
      seniorNational: "Snatch: 130-160kg | Clean & Jerk: 165-195kg (Total 300kg+ in 73kg/81kg classes)",
      olympicStandard: "Olympic Podium standard: 3.2x to 3.5x bodyweight total"
    },
    metricFields: [
      { id: "snatchKg", label: "Best Snatch (kg)", unit: "kg", type: "number", step: 1, min: 20, max: 230, placeholder: "e.g. 102", helperText: "Heaviest verified snatch attempt completed" },
      { id: "cleanJerkKg", label: "Best Clean & Jerk (kg)", unit: "kg", type: "number", step: 1, min: 30, max: 280, placeholder: "e.g. 132", helperText: "Heaviest clean and jerk attempt completed" },
      { id: "bodyWeightKg", label: "Athlete Body Weight (kg)", unit: "kg", type: "number", step: 0.1, min: 40, max: 180, placeholder: "e.g. 66.8", helperText: "Official weigh-in bodyweight" }
    ]
  },
  {
    id: "hockey",
    slug: "hockey",
    name: "Field Hockey",
    hindiName: "हॉकी",
    category: "Team Sports",
    code: "HOC",
    icon: "Users",
    overview: "India's national pride with 8 historic Olympic Gold Medals, characterized by 3D stick skills, penalty corner drag-flicks, and high tactical endurance.",
    olympicHistory: "8 Olympic Golds (1928, 1932, 1936, 1948, 1952, 1956, 1964, 1980), Bronze Tokyo 2020 & Paris 2024. Hockey India powers our golden tradition.",
    governingBody: "Hockey India (HI) / International Hockey Federation (FIH)",
    rules: {
      summary: "Two teams of 11 players battle across four 15-minute quarters. Ball propelled exclusively with flat side of the stick.",
      keyRegulations: [
        "Flat Side Only: Players may only strike or propel the ball using the flat face of the stick.",
        "Shooting Circle (D): A goal can only be scored if the ball is hit by an attacker inside the 14.63m shooting circle.",
        "Feet and Body Foul: Field players must not stop or propel the ball with foot, leg, or body.",
        "Penalty Corner (PC): Awarded for unintentional defensive breach inside circle or intentional breach inside 23m area."
      ],
      foulsAndPenalties: [
        "Green Card: 2-minute temporary suspension",
        "Yellow Card: 5 or 10-minute temporary suspension",
        "Red Card: Permanent ejection for violent conduct"
      ],
      matchStructure: "Four 15-minute quarters (60 minutes total) with 2-minute breaks and 10-minute halftime."
    },
    dimensions: {
      courtPitchDimensions: "91.40m length x 55.00m width. Goalposts: 3.66m wide x 2.14m high. Circle radius: 14.63m.",
      equipmentStandards: "FIH certified water-based synthetic turf. Ball: Dimpled hard plastic 156-163g. Stick: Carbon-composite max 737g.",
      surfaceType: "FIH Global Elite Water-based AstroTurf (Poligras)",
      technicalSpecifications: [
        "Penalty spot: 6.475m centered in front of goal",
        "Shooting circle markings: 14.63m radius from each goalpost",
        "Corner flag height: 1.20-1.50m"
      ]
    },
    scoring: {
      format: "Most goals scored at full-time wins.",
      pointsSystem: "Field goal = 1, Penalty Corner goal = 1, Penalty Stroke = 1.",
      tieBreaker: "FIH 8-second Shootout competition (5 shooters per team attacking goalkeeper from 23m line).",
      tournamentProgression: "Pool matches -> Quarter-Finals -> Semi-Finals -> Medal Matches."
    },
    benchmarks: {
      grassrootsDistrict: "District Team Captain | Yo-Yo Test: Level 18.2 | Sprint 30m: 4.2s",
      kheloIndiaYouth: "State Youth Team | Yo-Yo Test: Level 20.4 | Sprint 30m: 3.95s",
      seniorNational: "National Senior Team / Junior India Camp | Yo-Yo Test: Level 21.5+",
      olympicStandard: "Olympic Senior Men's / Women's National Squad (FIH Top 5 Ranking)"
    },
    metricFields: [
      { id: "bleepTest", label: "Yo-Yo Intermittent / Bleep Test", unit: "level", type: "number", step: 0.1, min: 14, max: 24, placeholder: "e.g. 19.5", helperText: "Aerobic recovery level for hockey endurance" },
      { id: "matchesPlayed", label: "Sanctioned Matches Played", unit: "matches", type: "number", step: 1, min: 0, max: 150, placeholder: "e.g. 32", helperText: "Total district, state, and school tournament appearances" },
      { id: "dragFlickSpeedKmph", label: "Drag-Flick / Strike Velocity", unit: "km/h", type: "number", step: 1, min: 50, max: 140, placeholder: "e.g. 108", helperText: "Radar-measured ball exit velocity" }
    ]
  },
  {
    id: "archery",
    slug: "archery",
    name: "Archery (Recurve & Compound)",
    hindiName: "तीरंदाजी",
    category: "Precision",
    code: "ARC",
    icon: "Crosshair",
    overview: "Disciplined Olympic art of shooting arrows from 70m with extreme biomechanical precision governed by AAI & World Archery.",
    olympicHistory: "Historic Olympic discipline. Deepika Kumari, Tarundeep Rai, Dhiraj Bommadevara, Ankita Bhakat have led India to World Cup golds and Olympic top-4 finishes.",
    governingBody: "Archery Association of India (AAI) / World Archery (WA)",
    rules: {
      summary: "Archers shoot at 122cm target faces at 70m distance using recurve bows in individual set system matches.",
      keyRegulations: [
        "Set System: 3 arrows per set. Archer with highest set score wins 2 points; tie awards 1 point each. First to 6 set points wins.",
        "Timing: 20 seconds per arrow in individual matches (alternate shooting).",
        "Equipment: Stabilizers, clicker, sight pin permitted; optical magnification prohibited in Olympic Recurve.",
        "Line Cutters: If arrow shaft touches the dividing line, the higher value is awarded."
      ],
      foulsAndPenalties: [
        "Shooting outside time window: Arrow scored as 0 (miss)",
        "Arrow shot before 'Shoot' whistle: Disqualification of highest scoring arrow",
        "Touching dropped arrow beyond 1-meter mark: Arrow considered shot"
      ],
      matchStructure: "72-arrow qualification round -> Set-system elimination head-to-head matches."
    },
    dimensions: {
      courtPitchDimensions: "70-meter outdoor range. Target face diameter: 122cm with 10 concentric scoring rings.",
      equipmentStandards: "10-ring diameter: 12.2cm. Center X-ring: 6.1cm. Recurve bow draw weight: 40-52 lbs for men, 34-44 lbs for women.",
      surfaceType: "Level manicured grass or synthetic turf archery range",
      technicalSpecifications: [
        "Target center height: 130cm (± 5cm) above ground",
        "Target incline angle: 10-15 degrees backward",
        "Safety backstop: 50-meter clear overshoot zone or Kevlar arrow netting"
      ]
    },
    scoring: {
      format: "Set System for match play (first to 6 points); Total cumulative score for 72-arrow qualification (max 720).",
      pointsSystem: "Target rings 1 to 10 points. Gold center = 9 and 10.",
      tieBreaker: "Single-arrow shoot-off: Arrow closest to center (dead center measurement) wins.",
      tournamentProgression: "Qualification seeds 1 to 64 for single-elimination bracket."
    },
    benchmarks: {
      grassrootsDistrict: "72-Arrow 70m Score: 580 - 620 / 720",
      kheloIndiaYouth: "72-Arrow 70m Score: 645 - 665 / 720",
      seniorNational: "72-Arrow 70m Score: 670 - 685 / 720",
      olympicStandard: "World Archery top seed standard: 685 - 700+ / 720"
    },
    metricFields: [
      { id: "qualificationScore", label: "72-Arrow 70m Round Score", unit: "points", type: "number", step: 1, min: 400, max: 720, placeholder: "e.g. 662", helperText: "Score achieved out of 720 in official 70m round" },
      { id: "innerTenCount", label: "10s + X Count", unit: "arrows", type: "number", step: 1, min: 0, max: 72, placeholder: "e.g. 28", helperText: "Total number of 10s and Xs shot in 72 arrows" },
      { id: "arrowGroupingMm", label: "Avg Grouping Radius (mm)", unit: "mm", type: "number", step: 1, min: 20, max: 300, placeholder: "e.g. 65", helperText: "Tightness of arrow cluster on target face" }
    ]
  },
  {
    id: "swimming",
    slug: "swimming",
    name: "Swimming",
    hindiName: "तैराकी",
    category: "Water Sports",
    code: "SWM",
    icon: "Waves",
    overview: "Aquatic speed and hydrodynamics in four strokes: Freestyle, Backstroke, Breaststroke, and Butterfly governed by SFI & World Aquatics.",
    olympicHistory: "Core Olympic sport since 1896. Indian pioneers: Srihari Nataraj, Sajan Prakash, Maana Patel have achieved Olympic 'A'/'B' standard qualifications.",
    governingBody: "Swimming Federation of India (SFI) / World Aquatics (AQUA)",
    rules: {
      summary: "Swimmers race against time in 50m Olympic pools with electronic touchpads measuring finishes to 0.01 seconds.",
      keyRegulations: [
        "Single False Start: Any swimmer leaving blocks prior to start horn is immediately disqualified.",
        "15-Meter Underwater Limit: Head must break surface of water at or before 15m mark after start and each turn.",
        "Two-Hand Touch: In Breaststroke and Butterfly, touch at each turn and finish must be made with both hands simultaneously.",
        "Stroke Cycle: In Breaststroke, head must break water surface during every full arm stroke and leg kick cycle."
      ],
      foulsAndPenalties: [
        "False start on start beep: Instant DQ",
        "Submerged past 15m mark: DQ",
        "Alternating kick during Butterfly: DQ"
      ],
      matchStructure: "Heats -> Semi-Finals -> 8-Lane Olympic Final."
    },
    dimensions: {
      courtPitchDimensions: "50.0m length x 25.0m width x 2.0-3.0m depth. 8 or 10 lanes of 2.50m width each.",
      equipmentStandards: "Electronic touchpads (OMEGA Quantum Aquatic Timer). Lane ropes with anti-wave disc floats. Water temp: 25-28°C.",
      surfaceType: "Tiled Olympic standard competition pool with continuous gutter overflows",
      technicalSpecifications: [
        "Starting block platform: 0.5m x 0.7m inclined, anti-slip top, backstroke ledge",
        "Turn flags: Suspended 5.0m from each end wall for backstroke turn alert",
        "15m lane rope markers: Distinctive contrasting float color"
      ]
    },
    scoring: {
      format: "Fully Automatic Timing (FAT) via touchpads.",
      pointsSystem: "Lowest elapsed time wins; World Aquatics points table rates performance against world record.",
      tieBreaker: "Swimmers sharing identical hundredth of a second receive joint ranking / swim-off for finals.",
      tournamentProgression: "Top 16 from heats advance to semi-finals; top 8 to final."
    },
    benchmarks: {
      grassrootsDistrict: "50m Freestyle: 28.5s - 31.0s | 100m: 1:04.0 - 1:10.0",
      kheloIndiaYouth: "50m Freestyle: 24.5s - 25.5s | 100m: 53.5s - 55.5s",
      seniorNational: "50m Freestyle: 23.2s - 23.8s | 100m: 50.8s - 52.0s",
      olympicStandard: "Olympic 'A' Qualifying Standard: 50m Free: 21.96s | 100m Free: 48.34s"
    },
    metricFields: [
      { id: "swim50mSec", label: "50m Freestyle Time", unit: "seconds", type: "number", step: 0.01, min: 20.0, max: 55.0, placeholder: "e.g. 25.10", helperText: "Official timed 50m freestyle sprint" },
      { id: "strokeRate", label: "Stroke Rate (cycles/min)", unit: "cycles/min", type: "number", step: 1, min: 25, max: 65, placeholder: "e.g. 48", helperText: "Strokes per minute cadence" },
      { id: "turnTimeSec", label: "Flip-Turn Transition Time", unit: "seconds", type: "number", step: 0.05, min: 1.0, max: 4.5, placeholder: "e.g. 2.15", helperText: "5m in to 5m out flip-turn breakout time" }
    ]
  },
  {
    id: "table-tennis",
    slug: "table-tennis",
    name: "Table Tennis",
    hindiName: "टेबल टेनिस",
    category: "Racquet",
    code: "TTN",
    icon: "Activity",
    overview: "Hyper-speed racquet sport emphasizing extreme ball spin, fast reaction loops, and close-table counter attacks governed by TTFI & ITTF.",
    olympicHistory: "Olympic sport since 1988. Indian stars: Sharath Kamal, Manika Batra, Sreeja Akula, Sathiyan Gnanasekaran have won Commonwealth Golds and reached Olympic Top 16.",
    governingBody: "Table Tennis Federation of India (TTFI) / International Table Tennis Federation (ITTF)",
    rules: {
      summary: "Best of 7 games of 11 points each. Ball must be tossed at least 16cm high from an open palm when serving.",
      keyRegulations: [
        "Legal Service: Ball rests freely on open stationary palm, tossed vertically upwards at least 16cm without spin, struck as it falls.",
        "Service Rotation: Service alternates every 2 points (every 1 point during deuce).",
        "Edge Ball: Ball touching upper surface edge of table is good; hitting side of table is out.",
        "Free Hand Rule: Touching playing table surface with non-racket hand during a rally awards point to opponent."
      ],
      foulsAndPenalties: [
        "Hiding ball from receiver's vision during serve: Service fault warning or fault point",
        "Touching net with racket or body: Point awarded to opponent",
        "Kicking table or damaging ball: Yellow/Red disciplinary card"
      ],
      matchStructure: "Best of 5 or 7 games of 11 points each (win by 2 points)."
    },
    dimensions: {
      courtPitchDimensions: "Table length: 2.74m, width: 1.525m, height: 76cm. Net height: 15.25cm extending 15.25cm outside table.",
      equipmentStandards: "Ball: Celluloid/plastic 40+mm, weight 2.7g. Racket: 85% natural wood blade, ITTF approved rubber pimple/smooth sheets.",
      surfaceType: "ITTF approved anti-slip Taraflex sports flooring (playing area min 14m x 7m)",
      technicalSpecifications: [
        "Light intensity: Minimum 1000 Lux directly over table",
        "Table bounce: Standard ball dropped from 30cm must rebound 23cm"
      ]
    },
    scoring: {
      format: "First player to 11 points wins a game. If 10-all, must lead by 2 points.",
      pointsSystem: "Point scored on every rally won.",
      tieBreaker: "Sudden two-point differential at deuce (10-10, 11-11, etc.).",
      tournamentProgression: "Single elimination bracket / Olympic team & mixed doubles events."
    },
    benchmarks: {
      grassrootsDistrict: "District Under-19 Semi-Finalist | Agility drills: 15.0s",
      kheloIndiaYouth: "State Youth Champion / National Top 16 Rank",
      seniorNational: "Senior National Top 8 Ranked | ITTF WTT Contender participant",
      olympicStandard: "ITTF World Top 32 Ranked Olympic Quota"
    },
    metricFields: [
      { id: "winLossRatio", label: "Match Win Rate (%)", unit: "%", type: "number", step: 1, min: 0, max: 100, placeholder: "e.g. 76", helperText: "Sanctioned tournament match win percentage" },
      { id: "tournamentLevel", label: "Competitive Tier", unit: "tier (1-5)", type: "number", step: 1, min: 1, max: 5, placeholder: "3", helperText: "1: District, 2: State, 3: Zonal, 4: National, 5: International" },
      { id: "reactionTimeMs", label: "Close-Table Counter Reaction", unit: "ms", type: "number", step: 1, min: 100, max: 350, placeholder: "e.g. 195", helperText: "Reaction speed in rapid counter-topspin drills" }
    ]
  }
];
