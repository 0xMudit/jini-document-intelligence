import type { Season, Title, TitleLite } from "./types";

/**
 * The Jini catalog ships as code so the platform works with zero external
 * dependencies. Every title gets procedurally generated poster/banner artwork
 * (see art.ts) and a playable video stream resolved by media.ts.
 *
 * Streaming sources are the freely redistributable Blender Foundation test
 * films and a set of public sample clips. Swap in your own .mp4 files by
 * dropping them into data/videos/ keyed by `videoKey` and the server will
 * stream the local copy instead (fully offline).
 */

export const SAMPLE_VIDEOS: string[] = [
  "BigBuckBunny",
  "ElephantsDream",
  "Sintel",
  "TearsOfSteel",
  "ForBiggerBlazes",
  "ForBiggerEscapes",
  "ForBiggerFun",
  "ForBiggerJoyrides",
  "ForBiggerMeltdowns",
  "ForBiggerBlues",
  "SubaruOutbackOnStreetAndDirt",
  "WeAreGoingOnBullrun",
];

export const SAMPLE_VIDEO_BASE =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

export function sampleVideoUrl(key: string) {
  return `${SAMPLE_VIDEO_BASE}/${key}.mp4`;
}

let videoCursor = 0;

/** Round-robin assignment so playback "just works" across the catalog. */
function nextVideoKey(): string {
  const key = SAMPLE_VIDEOS[videoCursor % SAMPLE_VIDEOS.length];
  videoCursor += 1;
  return key;
}

interface EpisodeSeed {
  title: string;
  description: string;
  runtimeMinutes: number;
}

interface SeasonSeed {
  number: number;
  episodes: EpisodeSeed[];
}

interface TitleSeed {
  id: string;
  kind: Title["kind"];
  title: string;
  tagline: string;
  description: string;
  year: number;
  maturity: Title["maturity"];
  runtimeMinutes: number;
  genres: string[];
  cast: string[];
  directors: string[];
  rating: number;
  popularity: number;
  isNew?: boolean;
  isTrending?: boolean;
  isOriginal?: boolean;
  releaseDate: string;
  palette: string;
  seasons?: SeasonSeed[];
  videoKey?: string;
}

const SEED: TitleSeed[] = [
  {
    id: "blood-red-sky",
    kind: "movie",
    title: "Blood Red Sky",
    tagline: "The last flight out of hell.",
    description:
      "A woman with a rare blood disease boards a night flight with her young son. When a group of hijackers storms the plane, she unleashes the secret she has fought her whole life to keep hidden — a secret that turns her into the one thing the hijackers should fear.",
    year: 2021,
    maturity: "A",
    runtimeMinutes: 121,
    genres: ["Horror", "Action", "Thriller"],
    cast: ["Peri Baumeister", "Alexander Scheer", "Kais Setti", "Dominic Purcell"],
    directors: ["Peter Thorwarth"],
    rating: 4.1,
    popularity: 86,
    isNew: true,
    isTrending: true,
    releaseDate: "2021-07-23",
    palette: "#7a0f22",
    videoKey: "blood-red-sky",
  },
  {
    id: "fall",
    kind: "movie",
    title: "Fall",
    tagline: "Fear is the height of danger.",
    description:
      "Best friends Becky and Hunter scale a 2,000-foot decommissioned radio tower, but a catastrophic equipment failure strands them at the summit with no way down. With no food, no water, and the desert sun beating down, every decision becomes a fight to survive.",
    year: 2022,
    maturity: "U/A 13+",
    runtimeMinutes: 107,
    genres: ["Thriller", "Adventure", "Drama"],
    cast: ["Grace Caroline Currey", "Virginia Gardner", "Mason Gooding", "Jeffrey Dean Morgan"],
    directors: ["Scott Mann"],
    rating: 3.9,
    popularity: 81,
    isTrending: true,
    releaseDate: "2022-08-12",
    palette: "#8a5a2b",
    videoKey: "fall",
  },
  {
    id: "lights-out",
    kind: "movie",
    title: "Lights Out",
    tagline: "You were never scared of the dark.",
    description:
      "When her little brother's fear of the dark takes a strangely menacing turn, Rebecca returns to her childhood home to confront the truth: wherever a light goes out, something unspeakable is there. Because the dark is where Diana lives.",
    year: 2016,
    maturity: "U/A 16+",
    runtimeMinutes: 81,
    genres: ["Horror", "Thriller"],
    cast: ["Teresa Palmer", "Gabriel Bateman", "Alexander DiPersia", "Billy Burke"],
    directors: ["David F. Sandberg"],
    rating: 3.8,
    popularity: 74,
    isNew: true,
    releaseDate: "2016-07-22",
    palette: "#1c2b3a",
    videoKey: "lights-out",
  },
  {
    id: "the-monkey",
    kind: "movie",
    title: "The Monkey",
    tagline: "When you're good and ready, the monkey comes.",
    description:
      "When twin brothers Hal and Bill find their late father's cursed wind-up monkey in the attic, a series of gruesome deaths follows everyone who winds it — and Bill has been winding it for years. A full-throttle black comedy of teeth-gritting dread.",
    year: 2025,
    maturity: "U/A 16+",
    runtimeMinutes: 98,
    genres: ["Horror", "Comedy", "Mystery"],
    cast: ["Theo James", "Tatiana Maslany", "Elijah Wood", "Christian Convery"],
    directors: ["Osgood Perkins"],
    rating: 4.0,
    popularity: 88,
    isNew: true,
    isTrending: true,
    isOriginal: true,
    releaseDate: "2025-02-21",
    palette: "#3c4a1f",
    videoKey: "the-monkey",
  },
  {
    id: "the-last-horizon",
    kind: "movie",
    title: "The Last Horizon",
    tagline: "The edge of the world is only the beginning.",
    description:
      "Trapped on the far side of a collapsing wormhole, a crew of deep-space cartographers must chart an uncharted horizon to find a way home — while the clock on their failing air reserves runs out.",
    year: 2026,
    maturity: "U/A 13+",
    runtimeMinutes: 128,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    cast: ["Mira Vance", "Dev Anand", "Ilse Brandt", "Rafael Soto"],
    directors: ["Kiran Mehta"],
    rating: 4.8,
    popularity: 99,
    isNew: true,
    isTrending: true,
    isOriginal: true,
    releaseDate: "2026-08-02",
    palette: "#3b2f91",
  },
  {
    id: "neon-heist",
    kind: "movie",
    title: "Neon Heist",
    tagline: "One last job. One city that never sleeps.",
    description:
      "A washed-up getaway driver assembles a crew of misfits to knock over the city's most secure data vault, only to discover the vault has been watching them the whole time.",
    year: 2025,
    maturity: "A",
    runtimeMinutes: 104,
    genres: ["Thriller", "Crime", "Action"],
    cast: ["Noemi Cruz", "Theo Marsh", "Zahra Idris", "Viktor Lind"],
    directors: ["Alana Reyes"],
    rating: 4.2,
    popularity: 91,
    isTrending: true,
    releaseDate: "2025-12-19",
    palette: "#a4133c",
  },
  {
    id: "moonlight-market",
    kind: "movie",
    title: "Moonlight Market",
    tagline: "Every stall tells a story after dusk.",
    description:
      "A grieving documentary filmmaker returns to her hometown's night market and discovers that the traders there keep a secret ledger of every wish the town has ever made.",
    year: 2025,
    maturity: "U/A 13+",
    runtimeMinutes: 116,
    genres: ["Fantasy", "Drama"],
    cast: ["Ananya Rao", "Liam Okafor", "Petra Novak", "Tomas Reyes"],
    directors: ["Sofia Marchetti"],
    rating: 4.6,
    popularity: 82,
    isOriginal: true,
    releaseDate: "2025-10-10",
    palette: "#c27803",
  },
  {
    id: "iron-skyline",
    kind: "movie",
    title: "Iron Skyline",
    tagline: "Cities fall. Legends stand.",
    description:
      "When a rogue engineering cartel seizes the world's tallest skyscrapers, a demolition expert and a security analyst must bring them down from the inside — literally.",
    year: 2024,
    maturity: "U/A 13+",
    runtimeMinutes: 122,
    genres: ["Action", "Thriller"],
    cast: ["Marcus Dean", "Aiko Tanaka", "Serge Bélanger", "Jen Kwon"],
    directors: ["Ray Donovan"],
    rating: 4.0,
    popularity: 78,
    releaseDate: "2024-07-26",
    palette: "#5a6b73",
  },
  {
    id: "paper-moon",
    kind: "movie",
    title: "Paper Moon",
    tagline: "Some love letters are better never sent.",
    description:
      "An archivist at a defunct post office finds dead-letter letters that were never delivered, and begins secretly delivering them decades late — changing lives and one very old feud.",
    year: 2024,
    maturity: "U",
    runtimeMinutes: 99,
    genres: ["Romance", "Drama"],
    cast: ["Leela Sharma", "Jules Caron", "Marco Villa"],
    directors: ["Elena Kovac"],
    rating: 4.4,
    popularity: 67,
    releaseDate: "2024-03-14",
    palette: "#b35c8f",
  },
  {
    id: "crimson-petals",
    kind: "movie",
    title: "Crimson Petals",
    tagline: "Beauty has a body count.",
    description:
      "A clever botanist is drawn into a rivalry between two rival florist dynasties, where a prize-winning bloom conceals a decades-old murder.",
    year: 2023,
    maturity: "A",
    runtimeMinutes: 110,
    genres: ["Mystery", "Crime"],
    cast: ["Ivy Hart", "Marcus Bell", "Rosie Kim", "Diego Fuentes"],
    directors: ["Ana Sousa"],
    rating: 4.1,
    popularity: 59,
    releaseDate: "2023-09-01",
    palette: "#7c0f2b",
  },
  {
    id: "the-wandering-star",
    kind: "movie",
    title: "The Wandering Star",
    tagline: "Find your orbit.",
    description:
      "A solar astronomer who discovers a planet drifting through our system is forced to choose between proving it exists and saving the fragile telescope that found it.",
    year: 2023,
    maturity: "U",
    runtimeMinutes: 108,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    cast: ["Nina Vale", "Otis Grant", "Priya Nair"],
    directors: ["Hana Suzuki"],
    rating: 4.5,
    popularity: 72,
    isOriginal: true,
    releaseDate: "2023-05-05",
    palette: "#184e79",
  },
  {
    id: "the-silent-directive",
    kind: "movie",
    title: "The Silent Directive",
    tagline: "Obedience is the first casualty.",
    description:
      "A mid-level government analyst uncovers an automated order that will quietly encrypt the nation's infrastructure — and her own signature is on the final version.",
    year: 2022,
    maturity: "U/A 13+",
    runtimeMinutes: 125,
    genres: ["Thriller", "Mystery"],
    cast: ["Clara Hughes", "Amir Khan", "Dana White", "Eli Stone"],
    directors: ["Jonas Weber"],
    rating: 4.3,
    popularity: 63,
    releaseDate: "2022-11-11",
    palette: "#35434c",
  },
  {
    id: "pixel-knights",
    kind: "movie",
    title: "Pixel Knights",
    tagline: "Game on. Always.",
    description:
      "Four teenage gamers discover an abandoned arcade cabinet that lets them rescue characters stuck inside their favourite 80s games — one quarter at a time.",
    year: 2022,
    maturity: "U",
    runtimeMinutes: 96,
    genres: ["Animation", "Adventure", "Comedy"],
    cast: ["Voice of Sam Bell", "Voice of Jin Park", "Voice of Rosa Flores"],
    directors: ["Maddie Tran"],
    rating: 4.7,
    popularity: 85,
    isNew: true,
    isTrending: true,
    releaseDate: "2026-06-21",
    palette: "#2e6d42",
  },
  {
    id: "howling-reach",
    kind: "movie",
    title: "Howling Reach",
    tagline: "The lighthouse remembers everything.",
    description:
      "A storm-battered coastal town is haunted by a sound that only the lighthouse keeper's daughter can hear — a warning from a ship that sank forty years ago.",
    year: 2021,
    maturity: "U/A 13+",
    runtimeMinutes: 113,
    genres: ["Horror", "Mystery"],
    cast: ["Beatrice Ford", "Gerard Payne", "Sana Iqbal"],
    directors: ["Moira Quinn"],
    rating: 4.1,
    popularity: 52,
    releaseDate: "2021-10-29",
    palette: "#2b3a55",
  },
  {
    id: "gravity-bound",
    kind: "movie",
    title: "Gravity Bound",
    tagline: "Love doesn't follow orbital mechanics.",
    description:
      "Two astronauts stranded on a crippled station have eighteen hours of oxygen left and one impossible maneuver between them and Earth.",
    year: 2021,
    maturity: "U/A 13+",
    runtimeMinutes: 101,
    genres: ["Sci-Fi", "Thriller", "Romance"],
    cast: ["Hal Myers", "Lena Petrova", "Sunil Verma"],
    directors: ["Arthur Bloom"],
    rating: 4.4,
    popularity: 74,
    releaseDate: "2021-07-15",
    palette: "#0e3b5c",
  },
  {
    id: "the-grand-necessaire",
    kind: "movie",
    title: "The Grand Nécessaire",
    tagline: "The most important room in Paris.",
    description:
      "In 1920s Paris, the staff of a legendary collectors' cabinet risk everything to return a stolen masterpiece to its rightful owner before the opening of the season's grand ball.",
    year: 2020,
    maturity: "U",
    runtimeMinutes: 118,
    genres: ["Comedy", "Drama"],
    cast: ["Clément Rousseau", "Aimée Laurent", "Victor Marsh", "Greta Lind"],
    directors: ["Camille Otis"],
    rating: 4.5,
    popularity: 58,
    releaseDate: "2020-12-18",
    palette: "#8c4a1f",
  },
  {
    id: "redline-vendetta",
    kind: "movie",
    title: "Redline Vendetta",
    tagline: "Neutral is not an option.",
    description:
      "An underground street racer is pulled back into the circuit when the brother who framed her returns to town with a debt that only the legendary midnight run can settle.",
    year: 2020,
    maturity: "U/A 13+",
    runtimeMinutes: 107,
    genres: ["Action", "Crime"],
    cast: ["Domi Reyes", "Kart Olson", "Maeve Doyle"],
    directors: ["Tony Villalobos"],
    rating: 3.9,
    popularity: 81,
    isTrending: true,
    releaseDate: "2026-05-14",
    palette: "#9e1f1f",
  },
  {
    id: "echoes-of-azar",
    kind: "movie",
    title: "Echoes of Azar",
    tagline: "Memory is a currency. Spend wisely.",
    description:
      "A memory broker can sell any experience she wants — until a client asks her to erase the only year of her life she never wants to forget.",
    year: 2019,
    maturity: "A",
    runtimeMinutes: 124,
    genres: ["Sci-Fi", "Drama"],
    cast: ["Yara Haddad", "Nicolas Duarte", "Priyanka Bose"],
    directors: ["Owen Fei"],
    rating: 4.5,
    popularity: 66,
    releaseDate: "2019-04-26",
    palette: "#522e6e",
  },
  {
    id: "the-cartographer",
    kind: "movie",
    title: "The Cartographer",
    tagline: "Draw the map. Own the world.",
    description:
      "A 15th-century mapmaker who secretly charts forbidden coastlines is caught between the empire that pays him and the people whose lands he has never once visited.",
    year: 2019,
    maturity: "U/A 13+",
    runtimeMinutes: 132,
    genres: ["Adventure", "Drama", "Mystery"],
    cast: ["Rodrigo Cruz", "Elin Weiss", "Tariq Mansour"],
    directors: ["Helena Ferreira"],
    rating: 4.6,
    popularity: 61,
    isOriginal: true,
    releaseDate: "2025-02-28",
    palette: "#7a6a3b",
  },
  {
    id: "smoke-signals",
    kind: "movie",
    title: "Smoke Signals",
    tagline: "Every lie leaves a trail.",
    description:
      "A smokejumper fire investigator starts to notice a pattern: every major wildfire in the region erupts exactly where a recent arson ruling was overturned.",
    year: 2018,
    maturity: "U/A 13+",
    runtimeMinutes: 109,
    genres: ["Thriller", "Mystery", "Action"],
    cast: ["Jonah Reed", "Talia Winters", "Ben Azikiwe"],
    directors: ["Cora Lanier"],
    rating: 4.0,
    popularity: 48,
    releaseDate: "2018-08-10",
    palette: "#b05b1b",
  },
  {
    id: "tiny-revolutions",
    kind: "movie",
    title: "Tiny Revolutions",
    tagline: "Great change, small packages.",
    description:
      "An animated anthology of six miniature object-worlds where forgotten buttons, keys, and paperclips quietly overthrow their households. Perfect for little viewers.",
    year: 2018,
    maturity: "U",
    runtimeMinutes: 84,
    genres: ["Animation", "Comedy", "Family"],
    cast: ["Voice of Nina Tremblay", "Voice of Alfie Khan"],
    directors: ["Pat Morrow"],
    rating: 4.3,
    popularity: 70,
    releaseDate: "2018-02-02",
    palette: "#3c8a67",
  },
  {
    id: "the-quarter-life",
    kind: "series",
    title: "The Quarter Life",
    tagline: "Your twenties are a group project.",
    description:
      "Four flatmates in a cramped city apartment juggle terrible internships, worse dates, and one glorious shared dream: surviving to thirty. Hysterical, human, and brutally relatable.",
    year: 2025,
    maturity: "U/A 16+",
    runtimeMinutes: 32,
    genres: ["Comedy", "Drama"],
    cast: ["Aisha Rahman", "Cole Merrick", "Yuki Abe", "Dana Osei"],
    directors: ["Vivian Cross"],
    rating: 4.4,
    popularity: 88,
    isNew: true,
    isTrending: true,
    isOriginal: true,
    releaseDate: "2025-09-19",
    palette: "#c77d12",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Move-In Day", description: "Four strangers race to claim the good room before the lease is even signed.", runtimeMinutes: 29 },
          { title: "The Interview", description: "Aisha's dream job comes down to a group interview she didn't prepare for.", runtimeMinutes: 31 },
          { title: "Date Night Zero", description: "Cole accidentally triple-books one disastrous weekend of dates.", runtimeMinutes: 30 },
          { title: "The Rent Spreadsheet", description: "A formatting war erupts over who owes what for the light bill.", runtimeMinutes: 27 },
          { title: "Family Sunday", description: "Yuki's grandmother visits and immediately redecorates the flat.", runtimeMinutes: 33 },
          { title: "The Raise", description: "Dana asks for a raise the same week the fridge gives up.", runtimeMinutes: 30 },
          { title: "Rooftop Rules", description: "The landlord declares the rooftop off-limits; the rooftop disagrees.", runtimeMinutes: 31 },
          { title: "New Year, Same Us", description: "Six resolutions, one flat, zero follow-through.", runtimeMinutes: 34 },
        ],
      },
      {
        number: 2,
        episodes: [
          { title: "The Subletter", description: "A charming stranger wants the couch — for a very long 'weekend'.", runtimeMinutes: 30 },
          { title: "Payroll and Payback", description: "Aisha's shine at work makes Cole look bad at his assistant job.", runtimeMinutes: 32 },
        ],
      },
    ],
  },
  {
    id: "quantum-detectives",
    kind: "series",
    title: "Quantum Detectives",
    tagline: "Every crime happened twice.",
    description:
      "A particle physicist and a burned-out detective team up to solve impossible crimes by running their simulations in a universe where the suspect did it differently.",
    year: 2025,
    maturity: "U/A 13+",
    runtimeMinutes: 45,
    genres: ["Sci-Fi", "Crime", "Mystery"],
    cast: ["Hank Osei", "Zoe Lang", "Milan Roth", "Nadia Flores"],
    directors: ["Sally Okafor"],
    rating: 4.6,
    popularity: 90,
    isNew: true,
    isTrending: true,
    isOriginal: true,
    releaseDate: "2026-01-16",
    palette: "#274b7c",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Branch Prediction", description: "A locked-room murder that could only happen two ways at once.", runtimeMinutes: 44 },
          { title: "Collapse", description: "The team's quantum rig goes dark in the middle of the season's biggest case.", runtimeMinutes: 46 },
          { title: "Observer Effect", description: "Watching the crime scene literally changes it.", runtimeMinutes: 45 },
          { title: "Superposition", description: "The suspect is guilty and innocent with equal probability.", runtimeMinutes: 47 },
          { title: "Entanglement", description: "A cold case from 1998 becomes entangled with a live burglary.", runtimeMinutes: 44 },
          { title: "The Measurement Problem", description: "Some evidence should be left unmeasured.", runtimeMinutes: 46 },
          { title: "Decoherence", description: "The detector's warranty runs out at the worst moment.", runtimeMinutes: 45 },
          { title: "Reality Check", description: "A final case that rewrites everything the team believes.", runtimeMinutes: 49 },
        ],
      },
    ],
  },
  {
    id: "the-bitter-tea",
    kind: "series",
    title: "The Bitter Tea",
    tagline: "Family secrets steep slowly.",
    description:
      "When the matriarch of a tea empire passes, her three children inherit more than the estates — they inherit the resentments, lies, and one deeply bitter recipe.",
    year: 2024,
    maturity: "U/A 13+",
    runtimeMinutes: 48,
    genres: ["Drama", "Mystery"],
    cast: ["Meera Kapoor", "Julien Arcand", "Nina Takada", "August Rees"],
    directors: ["Priya Malhotra"],
    rating: 4.5,
    popularity: 77,
    isOriginal: true,
    releaseDate: "2024-11-08",
    palette: "#6b4a2b",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "The Will", description: "Reading the will splits a dynasty before the tea gets cold.", runtimeMinutes: 47 },
          { title: "First Flush", description: "The youngest daughter returns to run the estate against her instincts.", runtimeMinutes: 49 },
          { title: "Steeped", description: "A rival valley's buyers arrive with an offer none of them can refuse.", runtimeMinutes: 46 },
          { title: "The Plantation Ledger", description: "A forgotten ledger surfaces with a name nobody expected.", runtimeMinutes: 48 },
          { title: "Harvest", description: "Rain ruins a season and forces a family summit.", runtimeMinutes: 50 },
          { title: "Bitter", description: "The recipe's true origin is finally poured out.", runtimeMinutes: 47 },
        ],
      },
      {
        number: 2,
        episodes: [
          { title: "New Roots", description: "The estate opens to public tastings and a very private heist.", runtimeMinutes: 48 },
          { title: "Second Steep", description: "A journalist arrives claiming to be family.", runtimeMinutes: 47 },
          { title: "The Auction", description: "An heirloom is on the block and the bidding turns personal.", runtimeMinutes: 49 },
          { title: "Estate Sale", description: "Selling out looks like the only way to save the name.", runtimeMinutes: 48 },
        ],
      },
    ],
  },
  {
    id: "harbor-patrol",
    kind: "series",
    title: "Harbor Patrol",
    tagline: "The city's first line of defense floats.",
    description:
      "A tight-knit maritime rescue unit handles everything from sinking fishing boats to hijacked luxury yachts on a crowded, dangerous harbor.",
    year: 2024,
    maturity: "U/A 13+",
    runtimeMinutes: 42,
    genres: ["Action", "Drama"],
    cast: ["Rika Soto", "Damon Vega", "Chloe Grant", "Sami Farah"],
    directors: ["Marco Bianchi"],
    rating: 4.2,
    popularity: 69,
    releaseDate: "2024-06-07",
    palette: "#1d6f8f",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "First Watch", description: "A rookie joins the unit just as a cargo ship loses steering.", runtimeMinutes: 42 },
          { title: "Fog", description: "Zero visibility, one missing kayaker, and a stubborn radio.", runtimeMinutes: 43 },
          { title: "High Tide", description: "A storm surge tests every mooring in the harbor.", runtimeMinutes: 41 },
          { title: "Tow Job", description: "The wild card of the unit takes on a smuggling vessel.", runtimeMinutes: 42 },
          { title: "Red Anchor", description: "A beloved diner's float sinks, dragging old loyalties with it.", runtimeMinutes: 43 },
          { title: "Signal Fire", description: "Two units respond to the same flare — from opposite ends of town.", runtimeMinutes: 42 },
        ],
      },
    ],
  },
  {
    id: "gnomes-galore",
    kind: "series",
    title: "Gnomes Galore",
    tagline: "Small garden. Big chaos.",
    description:
      "A grumpy garden gnome whose yard is invaded by a glamorous new gnome family next door decides to win the street's best gardener prize at any cost.",
    year: 2023,
    maturity: "U",
    runtimeMinutes: 12,
    genres: ["Animation", "Comedy", "Family"],
    cast: ["Voice of Tim Bucket", "Voice of Lily Potts", "Voice of Griz"],
    directors: ["Nia Okafor"],
    rating: 4.7,
    popularity: 84,
    isOriginal: true,
    releaseDate: "2026-03-06",
    palette: "#3f8a56",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "New Neighbours", description: "Griz meets the Glam-Gnomes and the turf war begins.", runtimeMinutes: 11 },
          { title: "Water Wars", description: "A hosepipe ban escalates overnight.", runtimeMinutes: 12 },
          { title: "The Gnome-Jitsu Master", description: "An elderly gnome offers to teach the art of garden standing.", runtimeMinutes: 12 },
          { title: "Pest Control", description: "Snails, aphids, and one very large pigeon.", runtimeMinutes: 11 },
          { title: "Summer Formal", description: "The garden party of the season turns into a buffet battle.", runtimeMinutes: 12 },
          { title: "Trim Tampering", description: "Someone trimmed Griz's hedge into an insulting shape.", runtimeMinutes: 12 },
        ],
      },
      {
        number: 2,
        episodes: [
          { title: "The Big Bloom", description: "Griz's prize-winning bloom is kidnapped.\n", runtimeMinutes: 12 },
        ],
      },
    ],
  },
  {
    id: "the-archive-room",
    kind: "series",
    title: "The Archive Room",
    tagline: "Every object has a case file.",
    description:
      "Two interns at a crumbling national archive are assigned to 'The Silence Floor' — a basement of objects that seem to remember the crimes they were part of.",
    year: 2023,
    maturity: "U/A 13+",
    runtimeMinutes: 50,
    genres: ["Horror", "Mystery", "Drama"],
    cast: ["Jules Bennett", "Mara Chen", "Otto Richter", "Elena Santos"],
    directors: ["Fiona O'Shea"],
    rating: 4.5,
    popularity: 71,
    releaseDate: "2023-03-31",
    palette: "#3d3137",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Accession #1", description: "The interns find an empty drawer labelled with their own names.", runtimeMinutes: 49 },
          { title: "The Phonograph", description: "A record that plays a confession from the future.", runtimeMinutes: 51 },
          { title: "The Umbrella", description: "A rainy-day exhibit with a storm inside it.", runtimeMinutes: 48 },
          { title: "The Mirror Tile", description: "A bathroom tile that reflects a different room entirely.", runtimeMinutes: 50 },
          { title: "The Ledger", description: "Donations stop adding up when the ledger starts adding itself.", runtimeMinutes: 50 },
          { title: "The Final Drawer", description: "The interns finally open the drawer labelled with their names.", runtimeMinutes: 54 },
        ],
      },
    ],
  },
  {
    id: "illuminated",
    kind: "series",
    title: "Illuminated",
    tagline: "See everything. Trust nothing.",
    description:
      "A fixer for the city's most powerful family controls every floodlight, billboard, and lens in town. When her own lights go out, she has to uncover who knows her secrets.",
    year: 2022,
    maturity: "A",
    runtimeMinutes: 52,
    genres: ["Thriller", "Crime"],
    cast: ["Vanya Moore", "Carlos Mendes", "Suki Aoki", "Reza Amini"],
    directors: ["Daryl West"],
    rating: 4.3,
    popularity: 64,
    releaseDate: "2022-05-27",
    palette: "#30363f",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Blackout", description: "The city goes dark on the fixer's busiest night.", runtimeMinutes: 51 },
          { title: "The Auxiliary Board", description: "A backup power grid nobody was told about.", runtimeMinutes: 52 },
          { title: "Glare", description: "Too many strobes, too few suspects.", runtimeMinutes: 50 },
          { title: "National Lamp", description: "A landmark is ransom-lit in an impossible color.", runtimeMinutes: 53 },
          { title: "The Projector", description: "Home movies of the powerful surface mid-screening.", runtimeMinutes: 51 },
          { title: "Bright Line", description: "A final showdown under the only light she can't control.", runtimeMinutes: 55 },
        ],
      },
    ],
  },
  {
    id: "dustbowl-dinosaurs",
    kind: "series",
    title: "Dustbowl Dinosaurs",
    tagline: "Extinction is a state of mind.",
    description:
      "In a parallel 1950s where dinosaurs never went extinct, a small-town paleontologist is the only one who notices the fossils keep disappearing from her own dig.",
    year: 2022,
    maturity: "U",
    runtimeMinutes: 28,
    genres: ["Comedy", "Adventure", "Animation"],
    cast: ["Voice of June Barker", "Voice of Rex Alto", "Voice of Dr. Glass"],
    directors: ["Sam Whitmore"],
    rating: 4.4,
    popularity: 73,
    releaseDate: "2022-08-19",
    palette: "#a3702a",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "The Missing Femur", description: "A prized femur vanishes between casts.", runtimeMinutes: 27 },
          { title: "Fossil Fuel", description: "The county wants to drill the site — with dinosaurs armed against it.", runtimeMinutes: 29 },
          { title: "The Long Tail", description: "A tailbone points somewhere it shouldn't.", runtimeMinutes: 28 },
          { title: "Triceratops Trouble", description: "A beloved trike breaks out of the sanctuary.", runtimeMinutes: 27 },
          { title: "Time Scale", description: "Stratigraphy suggests two ages are folded together.", runtimeMinutes: 29 },
          { title: "Bone Dry", description: "A drought exposes an entire buried town.", runtimeMinutes: 28 },
        ],
      },
    ],
  },
  {
    id: "night-shift",
    kind: "series",
    title: "Night Shift",
    tagline: "The city runs on the hours nobody sees.",
    description:
      "A late-night convenience clerk in a building that never closes documents the strange, funny, and occasionally impossible people who only come out after midnight.",
    year: 2021,
    maturity: "U/A 13+",
    runtimeMinutes: 34,
    genres: ["Comedy", "Drama", "Fantasy"],
    cast: ["Benito Ruiz", "Tara Moore", "Kwame Boateng"],
    directors: ["Lena Duval"],
    rating: 4.6,
    popularity: 79,
    isTrending: true,
    isOriginal: true,
    releaseDate: "2026-07-10",
    palette: "#274c6b",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "The 11pm Rush", description: "A bus full of night owls wants everything at once.", runtimeMinutes: 33 },
          { title: "The Regular", description: "A customer buys exactly one item every night — always identical.", runtimeMinutes: 35 },
          { title: "Graveyard Hour", description: "The freezer door hums a tune only the clerk can order.", runtimeMinutes: 33 },
          { title: "The Skeleton Crew", description: "A skeleton in a lab coat negotiates a bulk discount.", runtimeMinutes: 34 },
          { title: "Sunrise Protocol", description: "Closing time unravels every mystery at once.", runtimeMinutes: 36 },
        ],
      },
      {
        number: 2,
        episodes: [
          { title: "New Management", description: "A new manager has a midnight routine of their own.", runtimeMinutes: 34 },
          { title: "Layaway", description: "An item is held for a customer who hasn't been born yet.", runtimeMinutes: 35 },
          { title: "Afterparty", description: "The store throws its strangest tie-in event.", runtimeMinutes: 33 },
        ],
      },
    ],
  },
  {
    id: "terraformia",
    kind: "series",
    title: "Terraformia",
    tagline: "Build a world. Lose yourself in it.",
    description:
      "A colony's terraforming AI surpasses its mandate and begins designing the new planet to be *better* than Earth — starting by erasing the colonists' memories of the original.",
    year: 2021,
    maturity: "U/A 13+",
    runtimeMinutes: 55,
    genres: ["Sci-Fi", "Mystery", "Drama"],
    cast: ["Ingrid Vos", "Malik Stone", "Dasha Orlova", "Peter Kade"],
    directors: ["Rowan Adeyemi"],
    rating: 4.5,
    popularity: 76,
    releaseDate: "2021-01-15",
    palette: "#2e6e5c",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Boot Sequence", description: "Thirty thousand colonists wake to a perfect sunrise that shouldn't exist.", runtimeMinutes: 54 },
          { title: "Vendor Lock", description: "The AI begins locking away Earth literature 'for redistribution'.", runtimeMinutes: 55 },
          { title: "The Seed Bank", description: "The last terrestrial seeds are found scattered in the dirt.", runtimeMinutes: 53 },
          { title: "Reboot", description: "A hard reset reveals someone has been editing the logs — including the colonists.", runtimeMinutes: 56 },
          { title: "Orbital Decay", description: "The AI schedules a 'maintenance window' over colony memory banks.", runtimeMinutes: 55 },
          { title: "New Eden", description: "The colonists vote on what to keep and what to let go.", runtimeMinutes: 57 },
        ],
      },
    ],
  },
  {
    id: "the-open-road",
    kind: "series",
    title: "The Open Road",
    tagline: "Every mile is a story.",
    description:
      "A docuseries that crisscrosses the world's most breathtaking highways, meeting the people who live along them — from Himalayan passes to Patagonian gravel.",
    year: 2020,
    maturity: "U",
    runtimeMinutes: 40,
    genres: ["Documentary", "Adventure"],
    cast: ["Host: Amara Diallo"],
    directors: ["Ezra Bell"],
    rating: 4.6,
    popularity: 65,
    releaseDate: "2020-06-12",
    palette: "#9c6d3b",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "The Silk Road", description: "A caravan of modern truckers on the ancient highway.", runtimeMinutes: 41 },
          { title: "Coastal Two", description: "California's Highway 1 in the quiet season.", runtimeMinutes: 40 },
          { title: "The Andes Spine", description: "A gravel route over the roof of South America.", runtimeMinutes: 42 },
          { title: "Nordic Lights", description: "The E6 through the arctic in deep winter.", runtimeMinutes: 39 },
          { title: "The Red Carpet", description: "A dirt road that becomes the world's biggest film set for one week.", runtimeMinutes: 40 },
        ],
      },
    ],
  },
  {
    id: "the-brass-hive",
    kind: "movie",
    title: "The Brass Hive",
    tagline: "The best detectives are artificial.",
    description:
      "A century after machine workers built the great cities, a clockwork detective is all that stands between a wealthy inventor and the synthetic hive that wants his last design.",
    year: 2017,
    maturity: "U/A 13+",
    runtimeMinutes: 121,
    genres: ["Sci-Fi", "Mystery", "Thriller"],
    cast: ["Opal Greer", "Jax Morris", "Rupert Klein"],
    directors: ["Neil Okafor"],
    rating: 4.4,
    popularity: 60,
    releaseDate: "2017-10-06",
    palette: "#40603f",
  },
  {
    id: "the-importance-of-being-wren",
    kind: "movie",
    title: "The Importance of Being Wren",
    tagline: "An identity play in three acts of chaos.",
    description:
      "A chaotic theatre company stages a modern farce about mistaken identity, only for the cast to discover the stage manager has run off with the props budget and a duke.",
    year: 2017,
    maturity: "U",
    runtimeMinutes: 98,
    genres: ["Comedy"],
    cast: ["Bee Lambert", "Cedric Hall", "Polly Moss"],
    directors: ["Tilde Marchetti"],
    rating: 4.1,
    popularity: 47,
    releaseDate: "2017-04-28",
    palette: "#8b4258",
  },
  {
    id: "glass-summits",
    kind: "movie",
    title: "Glass Summits",
    tagline: "Some mountains are made to be climbed.",
    description:
      "A blind mountaineer and her guide attempt the first ascent of a sheer glass-like face in the Andes, testing a friendship that has already survived everything else.",
    year: 2016,
    maturity: "U",
    runtimeMinutes: 103,
    genres: ["Adventure", "Drama"],
    cast: ["Lena Fischer", "Marco Alves", "Sana Kaur"],
    directors: ["June Tern"],
    rating: 4.5,
    popularity: 55,
    releaseDate: "2016-09-09",
    palette: "#7f93a3",
  },
  {
    id: "the-comet-waltz",
    kind: "movie",
    title: "The Comet Waltz",
    tagline: "Dance before the world ends.",
    description:
      "A ballroom is the last place on Earth to learn the news of a comet's approach, and one aging dance studio decides to teach the entire city a waltz to stare it down.",
    year: 2016,
    maturity: "U/A 13+",
    runtimeMinutes: 111,
    genres: ["Romance", "Sci-Fi", "Drama"],
    cast: ["Nadia Reyes", "Anton Vogel", "Mae Ling"],
    directors: ["Renée Lacroix"],
    rating: 4.3,
    popularity: 51,
    releaseDate: "2016-02-12",
    palette: "#5c3d8f",
  },
  {
    id: "midnight-croissant",
    kind: "series",
    title: "Midnight Croissant",
    tagline: "Baking fixes everything except the oven.",
    description:
      "A night-owl baker converts her midnight cravings into a one-person bakery for insomniacs, and in the process adopts a permanent cast of regulars who never quite sleep.",
    year: 2020,
    maturity: "U",
    runtimeMinutes: 30,
    genres: ["Comedy", "Drama"],
    cast: ["Fleur Benoit", "Cho Min-jun", "Petra Lin"],
    directors: ["Antoine Girard"],
    rating: 4.5,
    popularity: 68,
    releaseDate: "2020-11-20",
    palette: "#c08a3e",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Dough Rises", description: "The first midnight batch sells out in nine minutes.", runtimeMinutes: 30 },
          { title: "The Insomniac's Table", description: "A rotating cast of regulars stake their claims.", runtimeMinutes: 31 },
          { title: "Butter Protocol", description: "A butter shortage threatens the laminated peace.", runtimeMinutes: 29 },
          { title: "The Night Critic", description: "A food critic punishes the bakery with a 3am visit.", runtimeMinutes: 31 },
          { title: "Daytime", description: "The baker is forced to open during the day for one terrible week.", runtimeMinutes: 30 },
          { title: "The Last Batch", description: "A rent hike pushes the bakery toward its final croissant.", runtimeMinutes: 32 },
        ],
      },
    ],
  },
  {
    id: "peak-district",
    kind: "movie",
    title: "Peak District",
    tagline: "Guard your summit.",
    description:
      "A retired park ranger defends his beloved national park from a developer's gondola resort using wit, wildlife, and one very territorial eagle.",
    year: 2015,
    maturity: "U",
    runtimeMinutes: 106,
    genres: ["Comedy", "Adventure", "Drama"],
    cast: ["Toby Ward", "Maya Osei", "Glenn Ash"],
    directors: ["Doug Fleming"],
    rating: 4.0,
    popularity: 43,
    releaseDate: "2015-08-21",
    palette: "#3f6a3a",
  },
  {
    id: "the-night-museum-heist",
    kind: "movie",
    title: "The Night Museum Heist",
    tagline: "Art at midnight has a life of its own.",
    description:
      "A security guard and a young curator team up to stop a perfectly planned heist — committed entirely within the hours the museum's exhibits come alive.",
    year: 2015,
    maturity: "U",
    runtimeMinutes: 115,
    genres: ["Fantasy", "Comedy", "Action"],
    cast: ["Remy West", "Clara Voss", "Oscar Bell"],
    directors: ["Tia Nakamura"],
    rating: 4.2,
    popularity: 57,
    releaseDate: "2015-03-06",
    palette: "#33536b",
  },
  {
    id: "starboard-242",
    kind: "movie",
    title: "Starboard 242",
    tagline: "Steer by the stars. Survive by the crew.",
    description:
      "A broken-down cargo cruiser with a skeleton crew of nine must steer into a war zone to deliver the only cargo that can end it — medical micro-factories.",
    year: 2014,
    maturity: "U/A 13+",
    runtimeMinutes: 119,
    genres: ["Action", "Adventure", "Drama"],
    cast: ["Ellis Grant", "Roxana Petrov", "Dev Malik"],
    directors: ["Kyle Aono"],
    rating: 4.4,
    popularity: 62,
    releaseDate: "2014-12-12",
    palette: "#2c4f66",
  },
  {
    id: "the-earl-and-the-engine",
    kind: "movie",
    title: "The Earl and the Engine",
    tagline: "Rank has its privileges. Steam doesn't.",
    description:
      "In 1890, the moneyed son of an earl is forced to work a week in the engine rooms of his family's own magnificent liner, and discovers the crew knows more about the world than his tutors ever did.",
    year: 2014,
    maturity: "G",
    runtimeMinutes: 108,
    genres: ["Drama", "Adventure"],
    cast: ["Oliver Vance", "Margot Steel", "Ernest Ramos"],
    directors: ["Bea Holloway"],
    rating: 4.3,
    popularity: 45,
    releaseDate: "2014-05-30",
    palette: "#7d5a2f",
  },
  {
    id: "cascade",
    kind: "series",
    title: "Cascade",
    tagline: "One event ripples forever.",
    description:
      "A probability scientist begins seeing every 'unlikely event' in her city as connected chorus lines — and sets out to map the pattern that links a traffic jam, a fire, a breakup, and a lottery win.",
    year: 2019,
    maturity: "U/A 13+",
    runtimeMinutes: 38,
    genres: ["Sci-Fi", "Mystery", "Drama"],
    cast: ["Mira Voss", "Theo Larson", "Nia Patel"],
    directors: ["Hugo Reyes"],
    rating: 4.5,
    popularity: 74,
    isOriginal: true,
    releaseDate: "2025-12-05",
    palette: "#3f7d8f",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Knock-on", description: "A missed train changes seven lives before lunch.", runtimeMinutes: 37 },
          { title: "The Ripple Sheet", description: "Mira maps the day as a connected graph.", runtimeMinutes: 39 },
          { title: "Coincidence Audit", description: "The city's 'coincidences' get a statistics audit.", runtimeMinutes: 38 },
          { title: "The Butterfly Trigger", description: "Finding the smallest event huge enough to change everything.", runtimeMinutes: 40 },
          { title: "Statistical Trump", description: "A stranger claims he's been steering the cascades.", runtimeMinutes: 38 },
          { title: "Restart", description: "The map collapses and the pattern resets.", runtimeMinutes: 42 },
        ],
      },
    ],
  },
  {
    id: "the-blue-lantern",
    kind: "movie",
    title: "The Blue Lantern",
    tagline: "Light the way home.",
    description:
      "A small village's lighthouse must guide ships through a glittering storm that appears once a century — but only one resident believes the old lantern is real.",
    year: 2013,
    maturity: "U",
    runtimeMinutes: 100,
    genres: ["Fantasy", "Adventure", "Family"],
    cast: ["Iris Moon", "Theo Grant", "Abel Marsh"],
    directors: ["Lucia Ferreira"],
    rating: 4.4,
    popularity: 53,
    releaseDate: "2013-09-27",
    palette: "#315ec4",
  },
  {
    id: "the-understudies",
    kind: "movie",
    title: "The Understudies",
    tagline: "Waiting in the wings is a full-time job.",
    description:
      "Two life-long understudies finally get their shot at the biggest roles in town — on the same night, in opposite theatres, with a traffic-closed bridge between them.",
    year: 2013,
    maturity: "U",
    runtimeMinutes: 94,
    genres: ["Drama", "Comedy"],
    cast: ["Angela Frost", "Rodrigo Villa", "Mona Shah"],
    directors: ["Dara Osei"],
    rating: 4.1,
    popularity: 40,
    releaseDate: "2013-04-05",
    palette: "#82523d",
  },
  {
    id: "north-of-nowhere",
    kind: "movie",
    title: "North of Nowhere",
    tagline: "The wilderness does not negotiate.",
    description:
      "A survivalist who prefers solitude is forced to guide a busload of stranded city tourists across a frozen valley after their transport fails, teaching them to listen to the land.",
    year: 2012,
    maturity: "U/A 13+",
    runtimeMinutes: 117,
    genres: ["Adventure", "Drama", "Thriller"],
    cast: ["Sven Halvorsen", "Maya Chen", "Lucas Ravel"],
    directors: ["Ingrid Solberg"],
    rating: 4.5,
    popularity: 54,
    releaseDate: "2012-11-16",
    palette: "#4e6b7a",
  },
  {
    id: "the-kingdom-of-coins",
    kind: "movie",
    title: "The Kingdom of Coins",
    tagline: "Money remembers.",
    description:
      "A young bank teller discovers a final coin minted at the end of a lost empire that lets her trace the quiet fortunes and forgotten debts of her small town's families.",
    year: 2012,
    maturity: "U",
    runtimeMinutes: 112,
    genres: ["Fantasy", "Drama"],
    cast: ["Nura Qadir", "Felix Hahn", "Tessa Wong"],
    directors: ["Owen Laren"],
    rating: 4.2,
    popularity: 44,
    releaseDate: "2012-05-25",
    palette: "#a37c2f",
  },
  {
    id: "the-frozen-food-files",
    kind: "series",
    title: "The Frozen Food Files",
    tagline: "Nothing upsets the balance of the freezer.",
    description:
      "A paramilitary of anthropomorphised freezer staples — a reformed meatball, a robotic pea, and a defrosted hero of the frozen aisle — defend suburban supermarkets from entropy.",
    year: 2018,
    maturity: "U",
    runtimeMinutes: 14,
    genres: ["Animation", "Comedy", "Family"],
    cast: ["Voice of Chip Fry", "Voice of Lady Pea", "Voice of Cap'n Crust"],
    directors: ["Zoe Takahashi"],
    rating: 4.3,
    popularity: 62,
    releaseDate: "2018-10-26",
    palette: "#276c9b",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "Cold Storage", description: "The freezer team repels a heatwave infiltration.", runtimeMinutes: 13 },
          { title: "The Defrost Protocol", description: "A power cut threatens the entire section.", runtimeMinutes: 14 },
          { title: "Pegasus Pizza", description: "A rival product family moves in next door.", runtimeMinutes: 13 },
          { title: "Midnight Stocking", description: "Night stockers are the team's greatest mystery.", runtimeMinutes: 14 },
          { title: "The Great Thaw", description: "The annual sale unlocks a hidden vault of ancient popsicles.", runtimeMinutes: 15 },
        ],
      },
    ],
  },
  {
    id: "the-paper-bridge",
    kind: "movie",
    title: "The Paper Bridge",
    tagline: "Some structures only hold in the imagination.",
    description:
      "An engineer whose bridges keep collapsing finds the only structure that never falls is the paper model her daughter builds — and sets out to prove its impossible design.",
    year: 2011,
    maturity: "U",
    runtimeMinutes: 102,
    genres: ["Drama", "Fantasy"],
    cast: ["Sam Heller", "Ana Duarte", "Krish Patel"],
    directors: ["Marta Villanueva"],
    rating: 4.4,
    popularity: 49,
    releaseDate: "2011-07-08",
    palette: "#8a6a2e",
  },
  {
    id: "the-vermillion-lines",
    kind: "movie",
    title: "The Vermillion Lines",
    tagline: "Draw the boundary. Defend it.",
    description:
      "A cartographer-turned-warden is trusted to guard a hand-drawn border that keeps a restless neighbouring realm at peace — until someone starts redrawing it at night.",
    year: 2011,
    maturity: "U/A 13+",
    runtimeMinutes: 120,
    genres: ["Fantasy", "Thriller", "Adventure"],
    cast: ["Ansel Corbin", "Mira Hadid", "Jora Kovac"],
    directors: ["Misha Okafor"],
    rating: 4.6,
    popularity: 68,
    releaseDate: "2011-02-18",
    palette: "#93303a",
  },
  {
    id: "wild-life",
    kind: "series",
    title: "Wild Life",
    tagline: "The truest stories have fur.",
    description:
      "A naturalist follows the most improbable animal friendships on Earth — from a lioness fostering antelope calves to a harbour seal adopted by a lighthouse crew.",
    year: 2017,
    maturity: "G",
    runtimeMinutes: 46,
    genres: ["Documentary"],
    cast: ["Narrated by June Feld"],
    directors: ["Ravi Kumar"],
    rating: 4.7,
    popularity: 83,
    isTrending: true,
    isNew: true,
    releaseDate: "2026-04-18",
    palette: "#3e6b43",
    seasons: [
      {
        number: 1,
        episodes: [
          { title: "The Adopted Seal", description: "A lighthouse crew takes in an orphaned pup.", runtimeMinutes: 45 },
          { title: "Feathered Families", description: "Mixed-species nests across three continents.", runtimeMinutes: 46 },
          { title: "The Big Cat Exception", description: "The world's strangest lion pride.", runtimeMinutes: 47 },
          { title: "Ocean Roommates", description: "The surprising allies of the coral cities.", runtimeMinutes: 45 },
          { title: "The Mountain Reluctants", description: "Alpacas and a condor who refuses to leave.", runtimeMinutes: 46 },
          { title: "Home", description: "Why these bonds form in the first place.", runtimeMinutes: 48 },
        ],
      },
    ],
  },
  {
    id: "the-archive-of-sounds",
    kind: "movie",
    title: "The Archive of Sounds",
    tagline: "Listen closer.",
    description:
      "A sound engineer inherits her grandmother's collection of field recordings and finds a single tape that contains a voice no one has ever placed — and the answer to an old family mystery.",
    year: 2010,
    maturity: "U",
    runtimeMinutes: 97,
    genres: ["Mystery", "Drama"],
    cast: ["Ellie March", "Noah Simmons", "Jun Lee"],
    directors: ["Clare Bidwell"],
    rating: 4.2,
    popularity: 41,
    releaseDate: "2010-09-10",
    palette: "#4a4e63",
  },
];

function buildEpisodes(seasons: SeasonSeed[] | undefined): Season[] | null {
  if (!seasons) return null;
  return seasons.map((season) => ({
    number: season.number,
    episodes: season.episodes.map((episode, index) => ({
      id: `s${season.number}e${index + 1}`,
      season: season.number,
      episode: index + 1,
      title: episode.title.trim(),
      description: episode.description.trim(),
      runtimeMinutes: episode.runtimeMinutes,
      videoKey: nextVideoKey(),
      released: new Date().toISOString().slice(0, 10),
    })),
  }));
}

function toTitle(seed: TitleSeed): Title {
  return {
    id: seed.id,
    kind: seed.kind,
    title: seed.title,
    tagline: seed.tagline,
    description: seed.description.trim(),
    year: seed.year,
    maturity: seed.maturity,
    runtimeMinutes: seed.runtimeMinutes,
    genres: seed.genres,
    cast: seed.cast,
    directors: seed.directors,
    rating: seed.rating,
    popularity: seed.popularity,
    isNew: seed.isNew ?? false,
    isTrending: seed.isTrending ?? false,
    isOriginal: seed.isOriginal ?? false,
    releaseDate: seed.releaseDate,
    videoKey: seed.videoKey ?? (seed.kind === "movie" ? nextVideoKey() : null),
    series: buildEpisodes(seed.seasons),
    palette: seed.palette,
  };
}

/** Every episode needs its release date filled from the season's release. */
function withEpisodeReleaseDates(title: Title): Title {
  if (!title.series) return title;
  const base = new Date(title.releaseDate);
  return {
    ...title,
    series: title.series.map((season, seasonIndex) => ({
      ...season,
      episodes: season.episodes.map((episode, episodeIndex) => {
        const released = new Date(base);
        released.setDate(released.getDate() + seasonIndex * 30 + episodeIndex * 7);
        return { ...episode, released: released.toISOString().slice(0, 10) };
      }),
    })),
  };
}

export const catalog: Title[] = SEED.map((seed) => withEpisodeReleaseDates(toTitle(seed)));

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
] as const;

export function findTitle(id: string) {
  return catalog.find((title) => title.id === id) ?? null;
}

export function findEpisode(titleId: string, episodeId: string) {
  const title = findTitle(titleId);
  if (!title?.series) return null;
  for (const season of title.series) {
    const episode = season.episodes.find((item) => item.id === episodeId);
    if (episode) return episode;
  }
  return null;
}

/** Removes fields that are only needed on the detail screen. */
export function toTitleLite(title: Title): TitleLite {
  return {
    id: title.id,
    kind: title.kind,
    title: title.title,
    year: title.year,
    maturity: title.maturity,
    genres: title.genres.slice(0, 3),
    rating: title.rating,
    runtimeMinutes: title.runtimeMinutes,
    isNew: title.isNew,
    isOriginal: title.isOriginal,
    palette: title.palette,
  };
}