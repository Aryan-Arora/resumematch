// 50 job domains with no overlap with the 6 curated taxonomies
// (tech, service_delivery, sales, marketing, finance_accounting, hr_recruiting).
// Each resume mixes literal restatement of a couple JD phrases with genuine
// paraphrases of others, and deliberately omits some — like a real resume.

export const DOMAINS = [
  {
    title: "Chef / Culinary Lead",
    phrases: ["menu development", "kitchen staff supervision", "food cost control", "health code compliance", "plating technique", "inventory management"],
    resume: "Executive Chef with 10 years running high-volume kitchens. I built seasonal menus from scratch and trained line cooks to hit consistent plating standards. Kept food costs under control by tightening portioning and renegotiating supplier contracts, and passed every health inspection without a single citation.",
  },
  {
    title: "Elementary School Teacher",
    phrases: ["lesson planning", "classroom management", "student assessment", "differentiated instruction", "parent-teacher communication", "IEP compliance"],
    resume: "Third-grade teacher for six years. I design weekly lesson plans aligned to state standards and adapt instruction for students at different reading levels in the same room. Keeping 24 eight-year-olds focused and on-task all day is its own skill, and I run quarterly conferences with every family to keep them in the loop.",
  },
  {
    title: "Veterinarian",
    phrases: ["animal husbandry", "surgical procedures", "diagnostic imaging", "client education", "vaccination protocols", "emergency triage"],
    resume: "Small-animal vet, 8 years in practice. I perform routine and emergency surgeries, read X-rays and ultrasounds to diagnose internal issues, and spend real time walking pet owners through treatment options so they understand what's happening. Comfortable making fast calls when an animal comes in critical.",
  },
  {
    title: "Wedding Photographer",
    phrases: ["candid shooting", "lighting setup", "photo editing", "client consultations", "album design", "venue scouting"],
    resume: "I've shot over 150 weddings. My style leans candid — catching real moments instead of posed shots — and I know how to work a room in bad lighting without a flash ruining the mood. I sit down with every couple beforehand to understand their day, and I put together their final albums myself.",
  },
  {
    title: "Interior Designer",
    phrases: ["space planning", "color theory", "furniture sourcing", "client presentations", "CAD drafting", "budget management"],
    resume: "Residential designer with a decade of experience turning awkward layouts into livable spaces. I draft floor plans in AutoCAD, pick palettes that actually suit how a family lives in a room, and manage vendor relationships to source furniture on time and under budget. I present concept boards to clients before any purchase order goes out.",
  },
  {
    title: "Landscape Architect",
    phrases: ["site grading", "planting design", "irrigation planning", "hardscape layout", "permit drawings", "sustainability practices"],
    resume: "Licensed landscape architect focused on residential and small commercial sites. I handle drainage and grading so water goes where it should, choose plant palettes suited to the local climate, and draw up the permit packages myself. Big believer in native planting to cut down irrigation needs.",
  },
  {
    title: "Massage Therapist",
    phrases: ["deep tissue technique", "client intake assessment", "sports injury recovery", "sanitation protocols", "myofascial release", "session documentation"],
    resume: "Licensed massage therapist, 7 years in a sports medicine clinic. I work with athletes recovering from soft-tissue injuries, doing hands-on work to release tight fascia and speed recovery. Every session starts with a quick intake to check for contraindications, and I keep detailed notes for the referring physical therapist.",
  },
  {
    title: "Personal Trainer",
    phrases: ["program design", "form correction", "nutrition guidance", "client motivation", "injury prevention", "progress tracking"],
    resume: "Certified personal trainer working with clients ranging from post-injury rehab to competitive lifters. I build individualized programs, spend a lot of time on form so people don't hurt themselves, and check in regularly on how nutrition is tracking against their goals. I log every session so we can see real progress over months.",
  },
  {
    title: "Real Estate Agent",
    phrases: ["property valuation", "buyer negotiations", "listing marketing", "closing coordination", "market analysis", "client relationship management"],
    resume: "Residential agent, top 10% in my market for three years running. I run comparative market analyses to price homes correctly from day one, and I've walked dozens of buyers through negotiations without losing a deal over price. I coordinate everything through closing so nothing falls through at the last minute.",
  },
  {
    title: "Flight Attendant",
    phrases: ["safety demonstrations", "emergency procedures", "passenger de-escalation", "cabin service", "FAA compliance", "in-flight first aid"],
    resume: "Flight attendant for a major carrier, five years and counting. Trained and current on emergency evacuation and in-flight medical response. I've talked down more than one agitated passenger before things escalated, and I run a tight, friendly cabin service on every flight regardless of how full it is.",
  },
  {
    title: "Bartender",
    phrases: ["cocktail crafting", "inventory ordering", "customer service", "cash handling", "responsible alcohol service", "bar setup"],
    resume: "Head bartender at a cocktail-focused restaurant for four years. I build the seasonal drink menu, keep pours consistent under pressure on a packed Friday night, and manage liquor ordering so we never run dry mid-shift. Always the one checking IDs carefully and cutting people off before it becomes a problem.",
  },
  {
    title: "Tour Guide",
    phrases: ["itinerary planning", "public speaking to groups", "historical research", "group safety management", "multilingual communication", "customer engagement"],
    resume: "Licensed city tour guide, six seasons. I write and constantly update my own walking routes based on new historical research, and I've led groups of up to 40 people through crowded areas without losing anyone. Comfortable holding a group's attention for two hours straight and fielding questions in Spanish as well as English.",
  },
  {
    title: "Librarian",
    phrases: ["collection development", "reference services", "cataloging systems", "community programming", "digital literacy instruction", "circulation management"],
    resume: "Public librarian for nine years. I manage the branch's acquisitions budget and decide what goes on the shelves, help patrons track down obscure research, and run our monthly programming calendar from toddler story time to adult computer classes. Familiar with MARC cataloging and our ILS from the back end.",
  },
  {
    title: "Paralegal",
    phrases: ["legal research", "document drafting", "case file management", "deposition preparation", "e-filing systems", "client intake"],
    resume: "Litigation paralegal supporting a five-attorney civil practice. I draft first-pass motions and discovery requests, keep case files organized well enough that any attorney on the team can pick one up cold, and prep exhibit binders before depositions. Handle intake calls for new matters too.",
  },
  {
    title: "Dental Hygienist",
    phrases: ["teeth cleaning procedures", "periodontal assessment", "patient education", "x-ray imaging", "infection control", "chart documentation"],
    resume: "Licensed dental hygienist, 6 years in a general practice. I do full cleanings and screen for early gum disease before it becomes something the dentist needs to intervene on. I take and read intraoral X-rays, and I'm the one who actually explains to patients why flossing matters instead of just telling them to do it.",
  },
  {
    title: "Physical Therapist",
    phrases: ["rehabilitation planning", "manual therapy", "gait analysis", "patient progress evaluation", "post-surgical recovery", "exercise prescription"],
    resume: "Outpatient PT specializing in post-surgical recovery, primarily knees and shoulders. I build individualized rehab plans, do hands-on mobilization work, and watch how someone walks to catch compensation patterns before they become a bigger problem. I reassess and adjust the plan every couple weeks based on actual measured progress.",
  },
  {
    title: "Social Worker",
    phrases: ["case management", "crisis intervention", "resource referrals", "client advocacy", "risk assessment", "documentation compliance"],
    resume: "Licensed social worker in a community mental health setting. I carry a caseload of about 30 clients, connect people to housing and benefits they qualify for but don't know about, and I'm often the first call when someone's situation suddenly turns into a crisis. Keep thorough notes to stay compliant with state audit requirements.",
  },
  {
    title: "Journalist",
    phrases: ["investigative reporting", "source verification", "interview techniques", "deadline writing", "fact-checking", "editorial pitching"],
    resume: "Staff reporter covering local government for a regional paper. I've broken stories that required digging through public records and getting people who didn't want to talk to actually talk. Comfortable turning around a clean, verified piece on a same-day deadline, and I pitch my own story ideas rather than waiting to be assigned.",
  },
  {
    title: "Translator / Interpreter",
    phrases: ["simultaneous interpretation", "document translation", "cultural nuance", "terminology research", "confidentiality standards", "certification compliance"],
    resume: "Certified Spanish-English interpreter, courtroom and medical settings. I work live, on the fly, so there's no time to look things up mid-sentence — I keep a running glossary of specialized terms for whatever setting I'm in. I also handle written translation of legal documents where precision really matters, and I take confidentiality seriously given what I hear in both settings.",
  },
  {
    title: "Sommelier",
    phrases: ["wine pairing", "cellar management", "staff training", "tasting notes", "vintage knowledge", "guest recommendations"],
    resume: "Sommelier at a fine dining restaurant for five years. I built our wine list from scratch and manage a cellar of about 400 bottles, tracking what's ready to drink and what needs more time. I train the floor staff so they can make basic recommendations even when I'm not on the floor, and I love walking a hesitant guest into something outside their comfort zone.",
  },
  {
    title: "Yoga Instructor",
    phrases: ["sequence design", "breathwork instruction", "injury modification", "class pacing", "alignment cues", "studio scheduling"],
    resume: "RYT-500 certified instructor teaching 8 classes a week across two studios. I build sequences that build toward a peak pose without rushing people there, and I'm always watching the room for someone who needs a modification before they get hurt. I've had students tell me my cueing is the clearest they've had, which I take seriously.",
  },
  {
    title: "Funeral Director",
    phrases: ["family grief counseling", "service coordination", "embalming procedures", "regulatory compliance", "vendor coordination", "estate documentation"],
    resume: "Licensed funeral director, 12 years. I sit with families at the worst moment of their lives and help them make dozens of decisions they've never had to make before, gently and without rushing them. I coordinate everything from the service itself to flowers and obituary notices, and I make sure every filing is compliant with state requirements.",
  },
  {
    title: "Locksmith",
    phrases: ["lock installation", "key duplication", "safe cracking", "emergency lockout response", "security system consultation", "master key systems"],
    resume: "Mobile locksmith running my own van for 7 years. I handle everything from a routine key cut to a 2am lockout call, and I've cracked a few older safes when the combination was lost. I also consult with small businesses on rekeying and setting up master key systems so managers don't need a dozen separate keys.",
  },
  {
    title: "Electrician",
    phrases: ["wiring installation", "panel upgrades", "code compliance inspection", "circuit troubleshooting", "safety protocols", "blueprint reading"],
    resume: "Licensed journeyman electrician, residential and light commercial. I've done full panel upgrades on older homes that weren't up to current code, and I can usually track down a dead circuit faster than most because I actually read the panel labeling before I start guessing. Comfortable working off blueprints on new builds too.",
  },
  {
    title: "Plumber",
    phrases: ["pipe installation", "leak detection", "drain clearing", "water heater repair", "code compliance", "fixture installation"],
    resume: "Licensed plumber, 9 years, mostly residential service calls. I can usually pinpoint a hidden leak without tearing out a whole wall first, and I've replaced more water heaters than I can count. Every install I do gets checked against current code before I sign off on it.",
  },
  {
    title: "HVAC Technician",
    phrases: ["system diagnostics", "refrigerant handling", "ductwork installation", "preventive maintenance", "EPA certification", "thermostat programming"],
    resume: "EPA-608 certified HVAC tech, residential and light commercial. I run full diagnostics on a system before assuming it's the compressor, and I'm careful with refrigerant handling given how strict the regulations are now. I also run seasonal maintenance contracts for a handful of local businesses to catch problems before they turn into a no-cooling emergency call.",
  },
  {
    title: "Auto Mechanic",
    phrases: ["engine diagnostics", "brake repair", "transmission service", "electrical troubleshooting", "preventive maintenance", "customer communication"],
    resume: "ASE-certified mechanic, 11 years at an independent shop. I can usually narrow down an intermittent electrical issue that dealerships throw parts at without diagnosing properly. I do full brake and transmission work, and I make a point of actually explaining to customers what's wrong instead of just handing them a bill.",
  },
  {
    title: "Truck Driver (CDL)",
    phrases: ["route planning", "load securement", "DOT compliance", "vehicle inspection", "hours-of-service logging", "defensive driving"],
    resume: "CDL-A driver, over a million miles, clean record. I do a full pre-trip inspection every time, not just a walkaround, and I plan routes around weather and weigh station hours rather than just trusting the GPS. Kept meticulous logs for hours of service — never had a compliance issue in nine years.",
  },
  {
    title: "Ship Captain / Marine Officer",
    phrases: ["vessel navigation", "crew management", "cargo operations", "maritime safety regulations", "weather routing", "emergency response planning"],
    resume: "Licensed merchant marine officer, 15 years at sea, most recently as chief mate on a cargo vessel. I plan routes around weather systems well in advance rather than reacting to them, and I run a tight crew — clear roles, clear expectations. I've led emergency drills often enough that the response is second nature if something actually happens.",
  },
  {
    title: "Air Traffic Controller",
    phrases: ["radar monitoring", "flight sequencing", "emergency coordination", "weather assessment", "communication protocols", "airspace management"],
    resume: "Certified controller, approach control, 8 years. I sequence arrivals so spacing stays safe without unnecessarily delaying anyone, and I stay ahead of weather systems that are going to force reroutes before pilots are even asking. When something goes wrong in the airspace, the calm, clear instruction has to come from me immediately.",
  },
  {
    title: "Museum Curator",
    phrases: ["exhibit design", "collection preservation", "provenance research", "grant writing", "educational programming", "artifact cataloging"],
    resume: "Curator at a regional history museum for 7 years. I design exhibits that tell a coherent story rather than just displaying objects, and I dig into provenance records to make sure what we're showing is accurately attributed. I write a fair number of the grant applications that fund our acquisitions and public programs.",
  },
  {
    title: "Choreographer",
    phrases: ["movement composition", "dancer coaching", "rehearsal direction", "music interpretation", "stage blocking", "costume collaboration"],
    resume: "Choreographer for regional theater and dance companies, 10 years. I build movement that actually serves the music and the story rather than just looking impressive, and I run rehearsals efficiently so dancers aren't standing around. I work closely with the costume department early so movement and wardrobe don't fight each other on stage.",
  },
  {
    title: "Film Sound Engineer",
    phrases: ["boom operation", "audio mixing", "dialogue editing", "foley recording", "noise reduction", "equipment calibration"],
    resume: "Production sound mixer, indie film and documentary, 9 years. I run boom on set and manage the mix live so post doesn't inherit a mess, then clean up dialogue and reduce background noise in the edit. I've recorded a fair amount of foley work myself when a scene needs something that wasn't captured on the day.",
  },
  {
    title: "Film Editor",
    phrases: ["narrative pacing", "color grading", "sound syncing", "footage organization", "client revisions", "software proficiency"],
    resume: "Freelance editor, documentary and commercial work, 8 years. I cut for pacing first — footage doesn't matter if the story drags — and I do a full color pass before handing anything to a client. I organize raw footage rigorously on intake because a disorganized bin costs way more time than it saves. I've been through more rounds of client revisions than I can count and know how to keep a project moving through them.",
  },
  {
    title: "Costume Designer",
    phrases: ["period research", "pattern drafting", "fabric sourcing", "fitting sessions", "budget management", "quick-change coordination"],
    resume: "Costume designer for regional theater, 6 years. I research the actual period a piece is set in rather than guessing, and I draft and sew a lot of my own pieces when off-the-rack won't cut it. I run fittings efficiently so actors aren't standing around, and I plan quick changes backstage down to the second when a scene demands it.",
  },
  {
    title: "Pastry Chef",
    phrases: ["dessert menu development", "chocolate tempering", "cake decoration", "recipe scaling", "kitchen sanitation", "ingredient sourcing"],
    resume: "Pastry chef at a hotel restaurant, 7 years. I develop the seasonal dessert menu from scratch, and I've spent enough time tempering chocolate to get consistent snap and shine without a machine. I scale recipes reliably from a dozen servings to two hundred for events, which is its own skill most people underestimate.",
  },
  {
    title: "Dog Trainer",
    phrases: ["positive reinforcement techniques", "behavior assessment", "obedience training", "aggression management", "client coaching", "session planning"],
    resume: "Certified dog trainer, 8 years, mostly reactive and aggressive dogs referred by vets. I assess what's actually driving a behavior before jumping to a training plan, and I use positive reinforcement almost exclusively. A big part of the job is honestly coaching the owner, not just the dog, since most issues don't stick if the humans go back to old habits.",
  },
  {
    title: "Beekeeper",
    phrases: ["hive inspection", "swarm management", "honey extraction", "pest and disease control", "queen rearing", "seasonal colony management"],
    resume: "Commercial beekeeper running about 200 hives. I inspect on a regular rotation to catch mite loads and disease before they wipe out a colony, and I manage splits and requeening to keep genetics strong. Extraction season is intense but I've got the process down to keep honey quality consistent across the whole operation.",
  },
  {
    title: "Farm Manager / Agronomist",
    phrases: ["crop rotation planning", "soil health management", "irrigation scheduling", "pest management", "yield forecasting", "equipment maintenance"],
    resume: "Farm manager on a 600-acre operation, 10 years. I plan rotations to keep soil healthy rather than mining it season after season, and I schedule irrigation based on actual soil moisture readings, not just habit. I keep a close eye on pest pressure and forecast yield well enough that the owner trusts my numbers when planning sales.",
  },
  {
    title: "Park Ranger",
    phrases: ["trail maintenance", "wildlife monitoring", "visitor education", "search and rescue", "wildfire prevention", "law enforcement authority"],
    resume: "Park ranger, state parks system, 9 years. I run trail crews and handle a lot of the physical maintenance myself, and I've been part of search-and-rescue callouts more times than I'd like. Visitor education is a bigger part of the job than people expect — a lot of preventable incidents come down to someone not knowing basic trail safety.",
  },
  {
    title: "Private Investigator",
    phrases: ["surveillance techniques", "background checks", "evidence documentation", "skip tracing", "courtroom testimony", "licensing compliance"],
    resume: "Licensed PI, 12 years, mostly insurance fraud and infidelity cases. I do a lot of quiet observation work that never turns into a confrontation, and I document everything meticulously because it might end up in front of a judge. I've testified in court more than once and know how to keep an evidence trail clean enough to hold up.",
  },
  {
    title: "Court Reporter",
    phrases: ["stenographic transcription", "real-time captioning", "transcript certification", "courtroom procedure knowledge", "confidentiality compliance", "equipment operation"],
    resume: "Certified court reporter, civil and criminal proceedings, 11 years. I take verbatim testimony in real time at well over 200 words a minute, and I certify transcripts that hold up under scrutiny if a case gets appealed. Confidentiality isn't optional in this job and I take it seriously — a lot of what I hear never leaves the room.",
  },
  {
    title: "Notary Public",
    phrases: ["identity verification", "document authentication", "signature witnessing", "notary journal recordkeeping", "state compliance", "fraud prevention"],
    resume: "Commissioned notary, mobile signing agent, 6 years. I verify identity carefully before witnessing any signature — that's the whole point of the job — and I keep a meticulous journal of every notarization in case it's ever questioned later. I stay current on state requirements since the rules do shift.",
  },
  {
    title: "Speech-Language Pathologist",
    phrases: ["articulation therapy", "swallowing assessment", "language development evaluation", "treatment plan design", "family training", "progress documentation"],
    resume: "SLP working with pediatric and adult patients, 8 years. I evaluate and treat everything from early language delays in toddlers to swallowing difficulties after a stroke. I design treatment plans around what's actually functional for the patient's life, not just a checklist, and I spend real time training families to carry exercises over at home.",
  },
  {
    title: "Midwife",
    phrases: ["prenatal care", "labor support", "postpartum assessment", "newborn care education", "emergency delivery response", "informed consent counseling"],
    resume: "Certified nurse-midwife, 9 years, hospital and home birth settings. I manage prenatal care from the first visit through delivery, and I've handled emergency situations during labor calmly when things didn't go according to plan. A lot of the job is really counseling — walking parents through decisions so they understand the tradeoffs, not just following a protocol.",
  },
  {
    title: "Chiropractor",
    phrases: ["spinal adjustment technique", "patient diagnosis", "posture assessment", "treatment plan development", "x-ray interpretation", "patient education"],
    resume: "Licensed chiropractor, private practice, 10 years. I diagnose before I ever adjust — reading X-rays and doing a real postural assessment rather than treating every back pain complaint the same way. I build multi-visit treatment plans based on what I actually find, and I spend time explaining to patients why their pain is happening, not just how to relieve it.",
  },
  {
    title: "Acupuncturist",
    phrases: ["needle technique", "pulse diagnosis", "point selection", "patient intake assessment", "treatment plan customization", "herbal supplement guidance"],
    resume: "Licensed acupuncturist, 7 years, integrative wellness clinic. I run a full intake and pulse reading before deciding on point selection — no two treatment plans look the same because no two patients present the same. I also guide patients on complementary herbal support when it's appropriate, always coordinating with their other care.",
  },
  {
    title: "Registered Dietitian",
    phrases: ["nutritional assessment", "meal plan development", "medical nutrition therapy", "client counseling", "chronic disease management", "food allergy accommodation"],
    resume: "RD working in an outpatient clinic, 6 years, mostly diabetes and cardiac patients. I build meal plans around what someone will actually eat, not a theoretical ideal diet, and I counsel patients through the emotional side of dietary change, which is often harder than the nutrition science itself. I coordinate closely with physicians on medical nutrition therapy for chronic conditions.",
  },
  {
    title: "Makeup Artist",
    phrases: ["bridal makeup application", "special effects makeup", "airbrush technique", "skin tone matching", "client consultation", "product knowledge"],
    resume: "Freelance makeup artist, bridal and editorial, 8 years. I match foundation to skin tone under different lighting conditions, which trips up a lot of less experienced artists, and I've done SFX work for a couple of indie film projects. Every bridal client gets a proper consultation and trial run well before the wedding day so there are no surprises.",
  },
  {
    title: "Tattoo Artist",
    phrases: ["custom design creation", "needle technique", "sterilization protocols", "client consultation", "portfolio development", "skin preparation"],
    resume: "Tattoo artist, 9 years, mostly custom fine-line and black-and-grey work. I sit down with clients to actually design something personal rather than pulling flash off a wall, and sterilization is non-negotiable — I follow protocol on every single client without exception. My portfolio is basically all custom work at this point, which is how I get most of my bookings.",
  },
];
