// src/data/timelinesData.js
// Curated Cinematic Timelines & Prerequisite Watch Order Dataset
// 100% verified TMDB posters, backdrops, runtimes, and lore bridges for all 40 MCU movies + iconic film sagas.

export const FRANCHISES = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe',
    shortName: 'MCU Multiverse',
    icon: '⚡',
    badge: 'Multiverse Saga (40 Titles)',
    color: '#e50914',
    bgGradient: 'linear-gradient(135deg, rgba(229, 9, 20, 0.16) 0%, rgba(139, 92, 246, 0.12) 100%)',
    description: 'The complete Marvel saga from 1942 WWII origins through the Infinity Saga, the TVA Multiverse, and the Incursion crisis of Avengers: Doomsday (2026) & Secret Wars (2027).',
    defaultTargetId: 'avengers-doomsday',
    targetMovies: [
      {
        id: 'avengers-doomsday',
        title: 'Avengers: Doomsday',
        year: '2026',
        releaseDate: 'May 1, 2026',
        poster_path: '/jzPwsojjFStf5lR5Nm07w2hH56G.jpg',
        backdrop_path: '/rObL4of4eFA8yWaN9pRFo9aOVNi.jpg',
        headline: 'The Multiversal Incursion War Begins',
        loreSummary: 'Robert Downey Jr. makes his seismic return to the MCU as Victor Von Doom (Doctor Doom). With parallel timelines on the brink of catastrophic Incursions, surviving Earth-616 heroes, the Fantastic Four, and multiversal variants unite against total annihilation.'
      },
      {
        id: 'avengers-secret-wars',
        title: 'Avengers: Secret Wars',
        year: '2027',
        releaseDate: 'May 7, 2027',
        poster_path: '/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg',
        backdrop_path: '/rytc6Lf4447C0CDncwFa4gxe0vY.jpg',
        headline: 'Battleworld & The End of the Multiverse',
        loreSummary: 'The grand finale of Phase 6. Collapsed universes are merged into Battleworld under the iron rule of God Emperor Doom.'
      },
      {
        id: 'deadpool-wolverine',
        title: 'Deadpool & Wolverine',
        year: '2024',
        releaseDate: 'July 26, 2024',
        poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        backdrop_path: '/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg',
        headline: 'The TVA, Void & Anchor Beings',
        loreSummary: 'Wade Wilson and a brooding Wolverine team up to save Wade’s universe from timeline decay caused by the death of its Anchor Being.'
      },
      {
        id: 'avengers-endgame',
        title: 'Avengers: Endgame',
        year: '2019',
        releaseDate: 'April 26, 2019',
        poster_path: '/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg',
        backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        headline: 'The Climax of the Infinity Saga',
        loreSummary: 'The surviving Avengers execute the Quantum Time Heist to undo Thanos’ snap, culminating in Tony Stark’s universe-defining sacrifice.'
      }
    ],
    movies: [
  {
    "id": "cap-first-avenger",
    "tmdbId": 1771,
    "title": "Captain America: The First Avenger",
    "releaseYear": 2011,
    "chronologicalYear": "1942–1945",
    "chronologicalOrder": 1,
    "releaseOrder": 5,
    "phase": "Phase 1: Assemble",
    "runtime": 124,
    "runtimeStr": "2h 04m",
    "rating": 7,
    "poster_path": "/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg",
    "backdrop_path": "/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg",
    "overview": "Steve Rogers volunteers for a top-secret research project that turns him into Captain America, leading the battle against Red Skull and Hydra during WWII.",
    "characters": [
      "Steve Rogers",
      "Bucky Barnes",
      "Peggy Carter",
      "Howard Stark"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Introduces the Tesseract (Space Stone) and establishes Steve Rogers as the moral compass of the Avengers."
      },
      "avengers-endgame": {
        "tier": "recommended",
        "loreBridge": "Gives the emotional weight to Steve Rogers returning the stones and reuniting with Peggy Carter."
      }
    }
  },
  {
    "id": "captain-marvel",
    "tmdbId": 299537,
    "title": "Captain Marvel",
    "releaseYear": 2019,
    "chronologicalYear": "1995",
    "chronologicalOrder": 2,
    "releaseOrder": 21,
    "phase": "Phase 3: Climax",
    "runtime": 124,
    "runtimeStr": "2h 04m",
    "rating": 6.8,
    "poster_path": "/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg",
    "backdrop_path": "/qAzYK4YPSWDc7aa4R43LcwRIAyb.jpg",
    "overview": "Carol Danvers becomes one of the universe’s most powerful heroes when Earth is caught in the middle of a galactic war between two alien races in 1995.",
    "characters": [
      "Carol Danvers",
      "Nick Fury",
      "Talos",
      "Ronan"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "Explains Nick Fury’s pager and the origin of the Avengers initiative name."
      },
      "avengers-endgame": {
        "tier": "recommended",
        "loreBridge": "Introduces Carol Danvers before she rescues Tony Stark and joins the final battle against Thanos."
      }
    }
  },
  {
    "id": "iron-man",
    "tmdbId": 1726,
    "title": "Iron Man",
    "releaseYear": 2008,
    "chronologicalYear": "2008",
    "chronologicalOrder": 3,
    "releaseOrder": 1,
    "phase": "Phase 1: Assemble",
    "runtime": 126,
    "runtimeStr": "2h 06m",
    "rating": 7.9,
    "poster_path": "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
    "backdrop_path": "/cKvDv2LpwVEqbdXWoQl4XgGN6le.jpg",
    "overview": "Billionaire genius Tony Stark builds a high-tech suit of armor to escape captivity and vows to protect the world, igniting the modern superhero era.",
    "characters": [
      "Tony Stark",
      "Pepper Potts",
      "James Rhodes",
      "Nick Fury"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: Establishes the face and heroic legacy of Tony Stark (Robert Downey Jr.). Essential for feeling the psychological horror of RDJ returning as Doctor Doom."
      },
      "avengers-endgame": {
        "tier": "critical",
        "loreBridge": "Where Tony Stark begins his entire character arc ending in his universe-saving sacrifice."
      }
    }
  },
  {
    "id": "the-incredible-hulk",
    "tmdbId": 1724,
    "title": "The Incredible Hulk",
    "releaseYear": 2008,
    "chronologicalYear": "2010",
    "chronologicalOrder": 4,
    "releaseOrder": 2,
    "phase": "Phase 1: Assemble",
    "runtime": 114,
    "runtimeStr": "1h 54m",
    "rating": 6.3,
    "poster_path": "/gKzYx79y0AQTL4UAk1cBQJ3nvrm.jpg",
    "backdrop_path": "/xfBnQ4mgf1jYZsscJGJjr6ce0Ar.jpg",
    "overview": "Scientist Bruce Banner scours the planet for an antidote to the unbridled force of rage within him: the Hulk.",
    "characters": [
      "Bruce Banner",
      "Betty Ross",
      "General Ross",
      "Abomination"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "Introduces General Thaddeus \"Thunderbolt\" Ross who later becomes US President in Brave New World."
      }
    }
  },
  {
    "id": "iron-man-2",
    "tmdbId": 10138,
    "title": "Iron Man 2",
    "releaseYear": 2010,
    "chronologicalYear": "2010",
    "chronologicalOrder": 5,
    "releaseOrder": 3,
    "phase": "Phase 1: Assemble",
    "runtime": 124,
    "runtimeStr": "2h 04m",
    "rating": 6.9,
    "poster_path": "/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg",
    "backdrop_path": "/7lmBufEG7P7Y1HClYK3gCxYrkgS.jpg",
    "overview": "With the world now aware of his dual life as the armored superhero Iron Man, Tony Stark must contend with his declining health and a vengeful madman.",
    "characters": [
      "Tony Stark",
      "Natasha Romanoff (Black Widow)",
      "James Rhodes (War Machine)",
      "Nick Fury"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Introduces Black Widow and War Machine into the Avengers family."
      }
    }
  },
  {
    "id": "thor",
    "tmdbId": 10195,
    "title": "Thor",
    "releaseYear": 2011,
    "chronologicalYear": "2011",
    "chronologicalOrder": 6,
    "releaseOrder": 4,
    "phase": "Phase 1: Assemble",
    "runtime": 115,
    "runtimeStr": "1h 55m",
    "rating": 6.8,
    "poster_path": "/prSfAi1xGrhLQNxVSUFh61xQ4Qy.jpg",
    "backdrop_path": "/cDJ61O1STtbWNBwefuqVrRe3d7l.jpg",
    "overview": "The arrogant warrior Thor is cast out of Asgard to live among humans on Earth, where he soon becomes one of their finest defenders.",
    "characters": [
      "Thor",
      "Loki",
      "Odin",
      "Jane Foster",
      "Hawkeye"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Introduces the cosmic realm of Asgard, the Nine Realms, and Loki’s complex rivalry with Thor."
      }
    }
  },
  {
    "id": "the-avengers",
    "tmdbId": 24428,
    "title": "The Avengers",
    "releaseYear": 2012,
    "chronologicalYear": "2012",
    "chronologicalOrder": 7,
    "releaseOrder": 6,
    "phase": "Phase 1: Assemble",
    "runtime": 143,
    "runtimeStr": "2h 23m",
    "rating": 8.1,
    "poster_path": "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    "backdrop_path": "/gHLs7Fy3DzLmLsD4lmfqL55KGcl.jpg",
    "overview": "Earth’s mightiest heroes must assemble and learn to fight as a team to stop the mischievous Loki and an alien invasion from conquering humanity.",
    "characters": [
      "Tony Stark",
      "Steve Rogers",
      "Thor",
      "Bruce Banner",
      "Natasha Romanoff",
      "Clint Barton",
      "Loki"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: The historic team assembly and the Battle of New York that first alerted cosmic entities to Earth’s defenders."
      },
      "avengers-endgame": {
        "tier": "critical",
        "loreBridge": "Major destination of the 2012 Time Heist."
      }
    }
  },
  {
    "id": "iron-man-3",
    "tmdbId": 68721,
    "title": "Iron Man 3",
    "releaseYear": 2013,
    "chronologicalYear": "2013",
    "chronologicalOrder": 8,
    "releaseOrder": 7,
    "phase": "Phase 2: Heroes Divided",
    "runtime": 130,
    "runtimeStr": "2h 10m",
    "rating": 6.9,
    "poster_path": "/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg",
    "backdrop_path": "/4TSqtluelcWByj8YZdqwzQVjI0O.jpg",
    "overview": "When Tony Stark’s world is torn apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.",
    "characters": [
      "Tony Stark",
      "Pepper Potts",
      "James Rhodes",
      "The Mandarin"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "Explores Tony Stark’s PTSD following the Battle of New York and his obsession with creating automated defenses."
      }
    }
  },
  {
    "id": "thor-the-dark-world",
    "tmdbId": 76338,
    "title": "Thor: The Dark World",
    "releaseYear": 2013,
    "chronologicalYear": "2013",
    "chronologicalOrder": 9,
    "releaseOrder": 8,
    "phase": "Phase 2: Heroes Divided",
    "runtime": 112,
    "runtimeStr": "1h 52m",
    "rating": 6.5,
    "poster_path": "/wp6OxE4poJ4G7c0U2ZIXasTSMR7.jpg",
    "backdrop_path": "/5o88bbqcV5STn56jqOeovaaWbAE.jpg",
    "overview": "Thor fights to restore order across the cosmos while facing the ancient Malekith and the weapon known as the Aether (Reality Stone).",
    "characters": [
      "Thor",
      "Loki",
      "Jane Foster",
      "Malekith",
      "The Collector"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "Introduces the Reality Stone and the cosmic Collector."
      },
      "avengers-endgame": {
        "tier": "recommended",
        "loreBridge": "Destination of the 2013 Asgard Time Heist where Thor speaks with his mother Frigga."
      }
    }
  },
  {
    "id": "captain-america-winter-soldier",
    "tmdbId": 100402,
    "title": "Captain America: The Winter Soldier",
    "releaseYear": 2014,
    "chronologicalYear": "2014",
    "chronologicalOrder": 10,
    "releaseOrder": 9,
    "phase": "Phase 2: Heroes Divided",
    "runtime": 136,
    "runtimeStr": "2h 16m",
    "rating": 7.7,
    "poster_path": "/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg",
    "backdrop_path": "/jJvrPQAHFKmz4pVano4UtWTsRgA.jpg",
    "overview": "Steve Rogers teams with Black Widow and Falcon to expose a deep conspiracy within S.H.I.E.L.D. while facing the cybernetic assassin known as the Winter Soldier.",
    "characters": [
      "Steve Rogers",
      "Natasha Romanoff",
      "Sam Wilson (Falcon)",
      "Bucky Barnes",
      "Nick Fury"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL: Destroys S.H.I.E.L.D. and introduces Sam Wilson, who inherits the mantle of Captain America to lead the Avengers into Doomsday."
      }
    }
  },
  {
    "id": "guardians-of-the-galaxy",
    "tmdbId": 118340,
    "title": "Guardians of the Galaxy",
    "releaseYear": 2014,
    "chronologicalYear": "2014",
    "chronologicalOrder": 11,
    "releaseOrder": 10,
    "phase": "Phase 2: Heroes Divided",
    "runtime": 121,
    "runtimeStr": "2h 01m",
    "rating": 7.9,
    "poster_path": "/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
    "backdrop_path": "/uLtVbjvS1O7gXL8lUOwsFOH4man.jpg",
    "overview": "A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe using the Power Stone.",
    "characters": [
      "Peter Quill (Star-Lord)",
      "Gamora",
      "Drax",
      "Rocket",
      "Groot",
      "Thanos"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Expands the cosmic universe and introduces Thanos’ daughters Gamora and Nebula."
      },
      "avengers-infinity-war": {
        "tier": "critical",
        "loreBridge": "Establishes the Guardians and the Power Stone."
      }
    }
  },
  {
    "id": "guardians-of-the-galaxy-vol-2",
    "tmdbId": 283995,
    "title": "Guardians of the Galaxy Vol. 2",
    "releaseYear": 2017,
    "chronologicalYear": "2014",
    "chronologicalOrder": 12,
    "releaseOrder": 15,
    "phase": "Phase 3: Climax",
    "runtime": 137,
    "runtimeStr": "2h 17m",
    "rating": 7.6,
    "poster_path": "/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg",
    "backdrop_path": "/aJn9XeesqsrSLKcHfHP4u5985hn.jpg",
    "overview": "The Guardians must fight to keep their newfound family together as they unravel the mystery of Peter Quill’s true parentage and the Living Planet Ego.",
    "characters": [
      "Peter Quill",
      "Gamora",
      "Drax",
      "Rocket",
      "Baby Groot",
      "Mantis",
      "Ego"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "Deepens the sisterly bond between Gamora and Nebula and introduces Celestial god mechanics."
      }
    }
  },
  {
    "id": "avengers-age-of-ultron",
    "tmdbId": 99861,
    "title": "Avengers: Age of Ultron",
    "releaseYear": 2015,
    "chronologicalYear": "2015",
    "chronologicalOrder": 13,
    "releaseOrder": 11,
    "phase": "Phase 2: Heroes Divided",
    "runtime": 141,
    "runtimeStr": "2h 21m",
    "rating": 7.3,
    "poster_path": "/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg",
    "backdrop_path": "/kIBK5SKwgqIIuRKhhWrJn3XkbPq.jpg",
    "overview": "When Tony Stark creates an AI peacekeeping system called Ultron, it decides humanity must be eradicated, forcing the Avengers to stop it in Sokovia.",
    "characters": [
      "Tony Stark",
      "Steve Rogers",
      "Wanda Maximoff",
      "Vision",
      "Ultron"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL: Introduces Wanda Maximoff (Scarlet Witch) and Vision. The destruction of Sokovia sets up the Sokovia Accords and Tony Stark’s obsession with a \"suit of armor around the world\" — mirroring Doctor Doom."
      }
    }
  },
  {
    "id": "ant-man",
    "tmdbId": 102899,
    "title": "Ant-Man",
    "releaseYear": 2015,
    "chronologicalYear": "2015",
    "chronologicalOrder": 14,
    "releaseOrder": 12,
    "phase": "Phase 2: Heroes Divided",
    "runtime": 117,
    "runtimeStr": "1h 57m",
    "rating": 7.1,
    "poster_path": "/rQRnQfUl3kfp78nCWq8Ks04vnq1.jpg",
    "backdrop_path": "/1K3JmSNUN8OpjYsCjc0Hy0SYxAb.jpg",
    "overview": "Armed with a super-suit that allows him to shrink in scale, thief Scott Lang must embrace his inner hero to pull off a heist that will save the world.",
    "characters": [
      "Scott Lang (Ant-Man)",
      "Hank Pym",
      "Hope van Dyne",
      "Yellowjacket"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Introduces the Quantum Realm — the dimension outside time and space where multiversal travel takes place."
      }
    }
  },
  {
    "id": "captain-america-civil-war",
    "tmdbId": 271110,
    "title": "Captain America: Civil War",
    "releaseYear": 2016,
    "chronologicalYear": "2016",
    "chronologicalOrder": 15,
    "releaseOrder": 13,
    "phase": "Phase 3: Climax",
    "runtime": 147,
    "runtimeStr": "2h 27m",
    "rating": 7.5,
    "poster_path": "/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg",
    "backdrop_path": "/7FWlcZq3r6525LWOcvO9kNWurN1.jpg",
    "overview": "Political pressure to oversee the Avengers fractures the team into two warring factions led by Captain America and Iron Man.",
    "characters": [
      "Steve Rogers",
      "Tony Stark",
      "Peter Parker (Spider-Man)",
      "T’Challa (Black Panther)",
      "Bucky Barnes"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: Fractures the Avengers and introduces Spider-Man under Tony Stark’s mentorship. When Peter Parker sees Robert Downey Jr.’s face as Doctor Doom, this film is the reason his heart breaks."
      }
    }
  },
  {
    "id": "black-widow",
    "tmdbId": 497698,
    "title": "Black Widow",
    "releaseYear": 2021,
    "chronologicalYear": "2016",
    "chronologicalOrder": 16,
    "releaseOrder": 24,
    "phase": "Phase 4: Multiverse",
    "runtime": 134,
    "runtimeStr": "2h 14m",
    "rating": 7.1,
    "poster_path": "/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
    "backdrop_path": "/keIxh0wPr2Ymj0Btjh4gW7JJ89e.jpg",
    "overview": "Natasha Romanoff confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises during her fugitive period after Civil War.",
    "characters": [
      "Natasha Romanoff",
      "Yelena Belova",
      "Alexei (Red Guardian)",
      "Taskmaster",
      "Valentina"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Introduces Yelena Belova and Red Guardian who lead the Thunderbolts in Phase 5."
      }
    }
  },
  {
    "id": "spider-man-homecoming",
    "tmdbId": 315635,
    "title": "Spider-Man: Homecoming",
    "releaseYear": 2017,
    "chronologicalYear": "2016",
    "chronologicalOrder": 17,
    "releaseOrder": 16,
    "phase": "Phase 3: Climax",
    "runtime": 133,
    "runtimeStr": "2h 13m",
    "rating": 7.3,
    "poster_path": "/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg",
    "backdrop_path": "/lAsr1ytUq0ATWdCbcjf59pupPFy.jpg",
    "overview": "Peter Parker balances his high school life with his superhero duties, taking on the Vulture under the watchful eye of mentor Tony Stark.",
    "characters": [
      "Peter Parker",
      "Tony Stark",
      "Adrian Toomes (Vulture)",
      "Ned Leeds"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Cemented Tony Stark as a father figure to Peter Parker."
      }
    }
  },
  {
    "id": "black-panther",
    "tmdbId": 284054,
    "title": "Black Panther",
    "releaseYear": 2018,
    "chronologicalYear": "2016",
    "chronologicalOrder": 18,
    "releaseOrder": 18,
    "phase": "Phase 3: Climax",
    "runtime": 135,
    "runtimeStr": "2h 15m",
    "rating": 7.4,
    "poster_path": "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
    "backdrop_path": "/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg",
    "overview": "T’Challa returns home as king of Wakanda, but finds his sovereignty challenged by an adversarial outsider from his father’s past.",
    "characters": [
      "T’Challa",
      "Killmonger",
      "Shuri",
      "Okoye",
      "M’Baku"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Reveals Wakanda’s Vibranium supremacy to the world, making it a primary target during multiversal resource wars."
      }
    }
  },
  {
    "id": "doctor-strange",
    "tmdbId": 284052,
    "title": "Doctor Strange",
    "releaseYear": 2016,
    "chronologicalYear": "2016–2017",
    "chronologicalOrder": 19,
    "releaseOrder": 14,
    "phase": "Phase 3: Climax",
    "runtime": 115,
    "runtimeStr": "1h 55m",
    "rating": 7.4,
    "poster_path": "/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg",
    "backdrop_path": "/kkoiH8ZWxJ9WSAjOadGtuHUQxbm.jpg",
    "overview": "After a car crash ends his career, surgeon Stephen Strange embarks on a journey of healing only to be drawn into the mystic arts and alternate dimensions.",
    "characters": [
      "Stephen Strange",
      "Wong",
      "Ancient One",
      "Mordo",
      "Dormammu"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL: Introduces the Mystic Arts, alternate dimensions, and the Eye of Agamotto (Time Stone) which Strange uses to battle cosmic threats."
      }
    }
  },
  {
    "id": "thor-ragnarok",
    "tmdbId": 284053,
    "title": "Thor: Ragnarok",
    "releaseYear": 2017,
    "chronologicalYear": "2017",
    "chronologicalOrder": 20,
    "releaseOrder": 17,
    "phase": "Phase 3: Climax",
    "runtime": 131,
    "runtimeStr": "2h 11m",
    "rating": 7.6,
    "poster_path": "/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg",
    "backdrop_path": "/vLmHH8jAy8Jq8uBsLucd3592WGh.jpg",
    "overview": "Thor must escape the alien planet Sakaar in time to save Asgard from the goddess of death, Hela, and the impending doomsday of Ragnarok.",
    "characters": [
      "Thor",
      "Loki",
      "Hulk",
      "Valkyrie",
      "Hela",
      "Grandmaster"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Destroys Asgard, unites Thor and Loki as true brothers, and leads directly into the opening seconds of Infinity War."
      }
    }
  },
  {
    "id": "ant-man-and-the-wasp",
    "tmdbId": 363088,
    "title": "Ant-Man and the Wasp",
    "releaseYear": 2018,
    "chronologicalYear": "2018",
    "chronologicalOrder": 21,
    "releaseOrder": 20,
    "phase": "Phase 3: Climax",
    "runtime": 119,
    "runtimeStr": "1h 59m",
    "rating": 6.9,
    "poster_path": "/cFQEO687n1K6umXbInzocxcnAQz.jpg",
    "backdrop_path": "/iYdgEUE2W2aJkgqfSjf1x3gFfuV.jpg",
    "overview": "Scott Lang grapples with the consequences of his choices as a superhero and a father, teaming up with Hope van Dyne and Hank Pym on an urgent new mission.",
    "characters": [
      "Scott Lang",
      "Hope van Dyne (The Wasp)",
      "Hank Pym",
      "Janet van Dyne",
      "Ghost"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Traps Scott Lang in the Quantum Realm during the Thanos Snap, unlocking the time travel technology for Endgame."
      }
    }
  },
  {
    "id": "avengers-infinity-war",
    "tmdbId": 299536,
    "title": "Avengers: Infinity War",
    "releaseYear": 2018,
    "chronologicalYear": "2018",
    "chronologicalOrder": 22,
    "releaseOrder": 19,
    "phase": "Phase 3: Climax",
    "runtime": 149,
    "runtimeStr": "2h 29m",
    "rating": 8.2,
    "poster_path": "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    "backdrop_path": "/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
    "overview": "The Avengers and their allies must sacrifice all to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
    "characters": [
      "Thanos",
      "Tony Stark",
      "Thor",
      "Steve Rogers",
      "Doctor Strange",
      "Spider-Man"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: The benchmark event of the MCU. Half of all life is turned to dust, showing what happens when the Avengers fail to unite in time."
      }
    }
  },
  {
    "id": "avengers-endgame",
    "tmdbId": 299534,
    "title": "Avengers: Endgame",
    "releaseYear": 2019,
    "chronologicalYear": "2018–2023",
    "chronologicalOrder": 23,
    "releaseOrder": 22,
    "phase": "Phase 3: Climax",
    "runtime": 181,
    "runtimeStr": "3h 01m",
    "rating": 8.2,
    "poster_path": "/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg",
    "backdrop_path": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    "overview": "After the devastating events of Infinity War, the remaining Avengers assemble once more to reverse Thanos’ actions and restore balance to the universe.",
    "characters": [
      "Tony Stark",
      "Steve Rogers",
      "Thor",
      "Natasha Romanoff",
      "Bruce Banner",
      "Scott Lang"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: The climax of the Infinity Saga. Tony Stark gives his life to save humanity. The Quantum Time Heist shatters temporal laws, causing the timeline branches that lead directly into Doomsday."
      }
    }
  },
  {
    "id": "spider-man-far-from-home",
    "tmdbId": 429617,
    "title": "Spider-Man: Far From Home",
    "releaseYear": 2019,
    "chronologicalYear": "2024",
    "chronologicalOrder": 24,
    "releaseOrder": 23,
    "phase": "Phase 3: Climax",
    "runtime": 129,
    "runtimeStr": "2h 09m",
    "rating": 7.4,
    "poster_path": "/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg",
    "backdrop_path": "/wqBW5ltBJu0gs26yCc8shQQV82d.jpg",
    "overview": "Peter Parker’s relaxing European vacation takes an unexpected turn when Nick Fury shows up to recruit him to fight mysterious elemental creatures alongside Mysterio.",
    "characters": [
      "Peter Parker",
      "Quentin Beck (Mysterio)",
      "Nick Fury",
      "MJ",
      "Ned"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Deals with the world grieving Tony Stark. Mysterio frames Peter Parker, exposing his secret identity and setting up No Way Home."
      }
    }
  },
  {
    "id": "loki-series",
    "tmdbId": 84958,
    "title": "Loki (Seasons 1 & 2)",
    "releaseYear": 2021,
    "chronologicalYear": "Outside Time / Multiverse",
    "chronologicalOrder": 25,
    "releaseOrder": 25,
    "phase": "Phase 4: Multiverse",
    "runtime": 240,
    "runtimeStr": "4h 00m (Key Episodes)",
    "rating": 8.2,
    "poster_path": "/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg",
    "backdrop_path": "/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg",
    "overview": "Loki is captured by the Time Variance Authority (TVA) after escaping in Endgame, uncovering the secrets of the Sacred Timeline and He Who Remains.",
    "characters": [
      "Loki",
      "Mobius",
      "Sylvie",
      "He Who Remains",
      "Ouroboros"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: The structural blueprint of the Multiverse Saga. Explains how the Sacred Timeline was freed, how timelines branch, and how Loki becomes the God of Stories holding the multiverse together."
      }
    }
  },
  {
    "id": "shang-chi",
    "tmdbId": 566525,
    "title": "Shang-Chi and the Legend of the Ten Rings",
    "releaseYear": 2021,
    "chronologicalYear": "2024",
    "chronologicalOrder": 26,
    "releaseOrder": 26,
    "phase": "Phase 4: Multiverse",
    "runtime": 132,
    "runtimeStr": "2h 12m",
    "rating": 7.5,
    "poster_path": "/9f2Q0U3IOsLgrI2HkvldwSABZy5.jpg",
    "backdrop_path": "/r7K6Xt0RX4Mw0cAbZVw5cyb1Tux.jpg",
    "overview": "Shang-Chi must confront the past he thought he left behind when he is drawn into the web of the mysterious Ten Rings organization.",
    "characters": [
      "Shang-Chi",
      "Katy",
      "Wenwu (The Mandarin)",
      "Xialing",
      "Wong",
      "Captain Marvel",
      "Bruce Banner"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "The post-credits scene reveals the Ten Rings are emitting a cosmic beacon to an unknown dimension outside Earth-616."
      }
    }
  },
  {
    "id": "eternals",
    "tmdbId": 524434,
    "title": "Eternals",
    "releaseYear": 2021,
    "chronologicalYear": "2024",
    "chronologicalOrder": 27,
    "releaseOrder": 27,
    "phase": "Phase 4: Multiverse",
    "runtime": 156,
    "runtimeStr": "2h 36m",
    "rating": 6.7,
    "poster_path": "/lFByFSLV5WDJEv3KabbdAF959F2.jpg",
    "backdrop_path": "/c6H7Z4u73ir3cIoCteuhJh7UCAR.jpg",
    "overview": "The Eternals, an ancient race of immortal beings who have secretly lived on Earth for thousands of years, reunite to protect humanity from the Deviants.",
    "characters": [
      "Sersi",
      "Ikaris",
      "Thena",
      "Ajak",
      "Dane Whitman (Black Knight)",
      "Arishem the Judge"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "Leaves the giant frozen Celestial Tiamut emerging from the Indian Ocean, which becomes the Adamantium mining site in Brave New World."
      }
    }
  },
  {
    "id": "spider-man-no-way-home",
    "tmdbId": 634649,
    "title": "Spider-Man: No Way Home",
    "releaseYear": 2021,
    "chronologicalYear": "2024",
    "chronologicalOrder": 28,
    "releaseOrder": 28,
    "phase": "Phase 4: Multiverse",
    "runtime": 148,
    "runtimeStr": "2h 28m",
    "rating": 7.9,
    "poster_path": "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    "backdrop_path": "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
    "overview": "With Spider-Man’s identity revealed, Peter asks Doctor Strange for help. A botched spell breaks reality, pulling villains and alternate Spider-Men across dimensions.",
    "characters": [
      "Peter Parker",
      "Doctor Strange",
      "Tobey Maguire",
      "Andrew Garfield",
      "Green Goblin"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: The first cinematic breakdown of the multiverse on Earth-616. Proves that multiversal incursions can physically tear open reality."
      }
    }
  },
  {
    "id": "doctor-strange-multiverse-madness",
    "tmdbId": 453395,
    "title": "Doctor Strange in the Multiverse of Madness",
    "releaseYear": 2022,
    "chronologicalYear": "2024",
    "chronologicalOrder": 29,
    "releaseOrder": 29,
    "phase": "Phase 4: Multiverse",
    "runtime": 126,
    "runtimeStr": "2h 06m",
    "rating": 7.2,
    "poster_path": "/ddJcSKbcp4rKZTmuyWaMhuwcfMz.jpg",
    "backdrop_path": "/lv3TXqhpaIxkclIHbhN2MRMOemQ.jpg",
    "overview": "Doctor Strange teams with mysterious teen America Chavez to journey through the multiverse while fleeing a corrupted Scarlet Witch.",
    "characters": [
      "Stephen Strange",
      "Wanda Maximoff",
      "America Chavez",
      "Reed Richards",
      "Professor X",
      "Clea"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "THE CENTRAL INCURSION RULEBOOK FOR DOOMSDAY: Defines INCURSIONS — when the boundary between two universes erodes and they collide, destroying one or both. Ends with Clea recruiting Strange to fix an incursion he caused."
      }
    }
  },
  {
    "id": "thor-love-and-thunder",
    "tmdbId": 616037,
    "title": "Thor: Love and Thunder",
    "releaseYear": 2022,
    "chronologicalYear": "2024",
    "chronologicalOrder": 30,
    "releaseOrder": 30,
    "phase": "Phase 4: Multiverse",
    "runtime": 119,
    "runtimeStr": "1h 59m",
    "rating": 6.3,
    "poster_path": "/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
    "backdrop_path": "/jsoz1HlxczSuTx0mDl2h0lxy36l.jpg",
    "overview": "Thor enlists the help of Valkyrie, Korg and ex-girlfriend Jane Foster to fight Gorr the God Butcher, who intends to make the gods extinct.",
    "characters": [
      "Thor",
      "Jane Foster (Mighty Thor)",
      "Gorr the God Butcher",
      "Valkyrie",
      "Zeus"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "Introduces the center of the universe (Eternity) and Zeus’ Pantheon in Omnipotence City."
      }
    }
  },
  {
    "id": "black-panther-wakanda-forever",
    "tmdbId": 505642,
    "title": "Black Panther: Wakanda Forever",
    "releaseYear": 2022,
    "chronologicalYear": "2025",
    "chronologicalOrder": 31,
    "releaseOrder": 31,
    "phase": "Phase 4: Multiverse",
    "runtime": 162,
    "runtimeStr": "2h 42m",
    "rating": 7,
    "poster_path": "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    "backdrop_path": "/83H0C66AcvkwpG2738VCTHMY9uv.jpg",
    "overview": "Queen Ramonda, Shuri, M’Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers and the underwater kingdom of Talokan in the wake of King T’Challa’s death.",
    "characters": [
      "Shuri (Black Panther)",
      "Namor",
      "Riri Williams (Ironheart)",
      "Okoye",
      "Queen Ramonda"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "recommended",
        "loreBridge": "Introduces Namor and the global geopolitical scramble for rare Vibranium, creating tensions that weaken Earth’s defense before Doomsday."
      }
    }
  },
  {
    "id": "ant-man-quantumania",
    "tmdbId": 640146,
    "title": "Ant-Man and the Wasp: Quantumania",
    "releaseYear": 2023,
    "chronologicalYear": "2025",
    "chronologicalOrder": 32,
    "releaseOrder": 32,
    "phase": "Phase 5: Realities",
    "runtime": 125,
    "runtimeStr": "2h 05m",
    "rating": 6.2,
    "poster_path": "/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg",
    "backdrop_path": "/m8JTwHFwX7I7JY5fPe4SjqejWag.jpg",
    "overview": "Scott Lang and Hope van Dyne explore the Quantum Realm, interacting with strange creatures and embarking on an adventure that goes beyond the limits of what they thought was possible.",
    "characters": [
      "Scott Lang",
      "Hope van Dyne",
      "Kang the Conqueror",
      "Cassie Lang"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL: Explores the multiverse mapping room in the Quantum Realm and the Council of Kangs observing the collapsing timelines, leaving the throne vacant for Doctor Doom."
      }
    }
  },
  {
    "id": "guardians-of-the-galaxy-vol-3",
    "tmdbId": 447365,
    "title": "Guardians of the Galaxy Vol. 3",
    "releaseYear": 2023,
    "chronologicalYear": "2025",
    "chronologicalOrder": 33,
    "releaseOrder": 33,
    "phase": "Phase 5: Realities",
    "runtime": 150,
    "runtimeStr": "2h 30m",
    "rating": 7.9,
    "poster_path": "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    "backdrop_path": "/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
    "overview": "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and protect Rocket, on a mission that could lead to the end of the Guardians.",
    "characters": [
      "Peter Quill",
      "Rocket",
      "Drax",
      "Nebula",
      "Groot",
      "Adam Warlock",
      "High Evolutionary"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "optional",
        "loreBridge": "The emotional farewell to the original Guardians team, leaving Peter Quill back on Earth awaiting \"The Legendary Star-Lord\" return."
      }
    }
  },
  {
    "id": "the-marvels",
    "tmdbId": 609681,
    "title": "The Marvels",
    "releaseYear": 2023,
    "chronologicalYear": "2025",
    "chronologicalOrder": 34,
    "releaseOrder": 34,
    "phase": "Phase 5: Realities",
    "runtime": 105,
    "runtimeStr": "1h 45m",
    "rating": 5.9,
    "poster_path": "/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg",
    "backdrop_path": "/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg",
    "overview": "Carol Danvers, Kamala Khan and Monica Rambeau discover their powers become entangled, swapping places whenever they use them.",
    "characters": [
      "Carol Danvers",
      "Kamala Khan (Ms. Marvel)",
      "Monica Rambeau",
      "Dar-Benn",
      "Beast (X-Men)"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL INCURSION PORTAL: Monica Rambeau fixes a tear in space-time and is trapped on the other side — waking up in an alternate universe with the X-Men (Beast & Binary)!"
      }
    }
  },
  {
    "id": "deadpool-and-wolverine",
    "tmdbId": 533535,
    "title": "Deadpool & Wolverine",
    "releaseYear": 2024,
    "chronologicalYear": "2024–2025",
    "chronologicalOrder": 35,
    "releaseOrder": 35,
    "phase": "Phase 5: Realities",
    "runtime": 128,
    "runtimeStr": "2h 08m",
    "rating": 7.6,
    "poster_path": "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    "backdrop_path": "/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
    "overview": "A listless Wade Wilson toils in civilian life. When his home world faces an existential threat, he reluctantly suits up with an even more reluctant Wolverine.",
    "characters": [
      "Deadpool",
      "Wolverine",
      "Cassandra Nova",
      "Mr. Paradox",
      "Johnny Storm",
      "Blade",
      "Gambit"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: Introduces \"Anchor Beings\" whose death causes an entire universe to slowly wither away, and integrates the Fox Marvel universe into the mainline MCU."
      }
    }
  },
  {
    "id": "captain-america-brave-new-world",
    "tmdbId": 822119,
    "title": "Captain America: Brave New World",
    "releaseYear": 2025,
    "chronologicalYear": "2026",
    "chronologicalOrder": 36,
    "releaseOrder": 36,
    "phase": "Phase 5: Realities",
    "runtime": 119,
    "runtimeStr": "1h 59m",
    "rating": 6.8,
    "poster_path": "/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg",
    "backdrop_path": "/ce3prrjh9ZehEl5JinNqr4jIeaB.jpg",
    "overview": "Sam Wilson finds himself in the middle of an international incident after meeting with newly elected U.S. President Thaddeus Ross, who transforms into the Red Hulk.",
    "characters": [
      "Sam Wilson (Captain America)",
      "Thaddeus Ross (Red Hulk)",
      "Joaquin Torres (Falcon)",
      "The Leader",
      "Giancarlo Esposito"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL: Establishes Sam Wilson assembling a brand-new Avengers team under official international scrutiny before the Multiversal Incursions strike."
      }
    }
  },
  {
    "id": "thunderbolts-movie",
    "tmdbId": 986056,
    "title": "Thunderbolts*",
    "releaseYear": 2025,
    "chronologicalYear": "2026",
    "chronologicalOrder": 37,
    "releaseOrder": 37,
    "phase": "Phase 5: Realities",
    "runtime": 127,
    "runtimeStr": "2h 07m",
    "rating": 7.3,
    "poster_path": "/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg",
    "backdrop_path": "/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg",
    "overview": "An irreverent team-up featuring depressed assassin Yelena Belova alongside the MCU’s least anticipated band of misfits on a covert government mission.",
    "characters": [
      "Yelena Belova",
      "Bucky Barnes",
      "Red Guardian",
      "U.S. Agent",
      "Taskmaster",
      "Sentry / Bob"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL: Introduces the Sentry (Robert Reynolds) — the godlike hero with the power of a million exploding suns, essential for fighting Doctor Doom."
      }
    }
  },
  {
    "id": "fantastic-four-first-steps",
    "tmdbId": 617126,
    "title": "The Fantastic Four: First Steps",
    "releaseYear": 2025,
    "chronologicalYear": "1960s (Retro-Futuristic Earth)",
    "chronologicalOrder": 38,
    "releaseOrder": 38,
    "phase": "Phase 6: Incursion War",
    "runtime": 115,
    "runtimeStr": "1h 55m",
    "rating": 6.9,
    "poster_path": "/nf5qaSEvyYSNeFH0YhSs5EsBLX9.jpg",
    "backdrop_path": "/s94NjfKkcSczZ1FembwmQZwsuwY.jpg",
    "overview": "Marvel’s First Family navigates a 1960s retro-futuristic alternate universe while protecting their planet from Galactus, leading straight into the collision of universes.",
    "characters": [
      "Reed Richards (Mister Fantastic)",
      "Sue Storm",
      "Johnny Storm",
      "Ben Grimm",
      "Galactus",
      "Silver Surfer"
    ],
    "prerequisiteFor": {
      "avengers-doomsday": {
        "tier": "critical",
        "loreBridge": "CRITICAL MUST-WATCH: Direct prologue to Avengers: Doomsday. Establishes the Fantastic Four as Doctor Doom’s supreme rivals and shows their home universe colliding with Earth-616."
      }
    }
  },
  {
    "id": "avengers-doomsday-node",
    "tmdbId": 1003596,
    "title": "Avengers: Doomsday",
    "releaseYear": 2026,
    "chronologicalYear": "2026",
    "chronologicalOrder": 39,
    "releaseOrder": 39,
    "phase": "Phase 6: Incursion War",
    "runtime": 165,
    "runtimeStr": "2h 45m (Expected)",
    "rating": 9.2,
    "poster_path": "/jzPwsojjFStf5lR5Nm07w2hH56G.jpg",
    "backdrop_path": "/rObL4of4eFA8yWaN9pRFo9aOVNi.jpg",
    "overview": "The Avengers reunite to face Victor Von Doom (Robert Downey Jr.) as multiple realities suffer devastating Incursions, forcing surviving heroes to take desperate measures to stop the total extinction of the multiverse.",
    "characters": [
      "Doctor Doom (Robert Downey Jr.)",
      "Doctor Strange",
      "Spider-Man",
      "Fantastic Four",
      "Thor",
      "Sam Wilson"
    ],
    "isTarget": true,
    "prerequisiteFor": {}
  },
  {
    "id": "avengers-secret-wars-node",
    "tmdbId": 1003598,
    "title": "Avengers: Secret Wars",
    "releaseYear": 2027,
    "chronologicalYear": "2027 (Battleworld)",
    "chronologicalOrder": 40,
    "releaseOrder": 40,
    "phase": "Phase 6: Incursion War",
    "runtime": 180,
    "runtimeStr": "3h 00m (Expected)",
    "rating": 9.5,
    "poster_path": "/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg",
    "backdrop_path": "/rytc6Lf4447C0CDncwFa4gxe0vY.jpg",
    "overview": "The surviving heroes of all collapsed universes unite on Battleworld to overthrow God Emperor Doom and restore a unified timeline.",
    "characters": [
      "Doctor Doom",
      "Reed Richards",
      "Spider-Man",
      "Wolverine",
      "Deadpool",
      "Thor"
    ],
    "isTarget": true,
    "prerequisiteFor": {}
  }
]
  },
  {
    id: 'batman',
    name: 'Batman & DC Universe',
    shortName: 'Batman / DC',
    icon: '🦇',
    badge: 'Nolanverse & Reevesverse',
    color: '#0a84ff',
    bgGradient: 'linear-gradient(135deg, rgba(10, 132, 255, 0.16) 0%, rgba(2, 6, 23, 0.4) 100%)',
    description: 'The journey through Gotham City: from Christopher Nolan’s Dark Knight Trilogy to Matt Reeves’ grounded detective neo-noir universe.',
    defaultTargetId: 'the-batman-2',
    targetMovies: [
      {
        id: 'the-batman-2',
        title: 'The Batman: Part II',
        year: '2026',
        releaseDate: 'October 2, 2026',
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop_path: '/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg',
        headline: 'Gotham Under Winter Freeze',
        loreSummary: 'Robert Pattinson returns as Bruce Wayne deeper into his role as Gotham’s protector, facing a fractured city after the flood and the rise of Oz Cobb’s criminal empire.'
      },
      {
        id: 'the-dark-knight-rises',
        title: 'The Dark Knight Rises',
        year: '2012',
        releaseDate: 'July 20, 2012',
        poster_path: '/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg',
        backdrop_path: '/c3OHQncTAnKFhdOTX7D3LTW6son.jpg',
        headline: 'The Legend Ends',
        loreSummary: 'Eight years after the Joker’s reign of terror, Bruce Wayne emerges from exile to save Gotham from the ruthless revolutionary Bane.'
      }
    ],
    movies: [
      {
        id: 'batman-begins',
        tmdbId: 272,
        title: 'Batman Begins',
        releaseYear: 2005,
        chronologicalYear: 'Year 1',
        chronologicalOrder: 1,
        releaseOrder: 1,
        phase: 'The Dark Knight Trilogy',
        runtime: 140,
        runtimeStr: '2h 20m',
        rating: 7.7,
        poster_path: '/ogyw5LTmL53dVxsppcy8Dlm30Fu.jpg',
        backdrop_path: '/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg',
        overview: 'Driven by tragedy, billionaire Bruce Wayne travels to the Far East to train with the League of Shadows before returning to rid Gotham of corruption.',
        characters: ['Bruce Wayne', 'Alfred Pennyworth', 'Ra’s al Ghul', 'Rachel Dawes', 'Jim Gordon'],
        prerequisiteFor: {
          'the-dark-knight-rises': {
            tier: 'critical',
            loreBridge: 'Introduces the League of Shadows, Ra’s al Ghul, and the philosophical training that Bane and Talia al Ghul seek to avenge in Rises.'
          }
        }
      },
      {
        id: 'the-dark-knight',
        tmdbId: 155,
        title: 'The Dark Knight',
        releaseYear: 2008,
        chronologicalYear: 'Year 2',
        chronologicalOrder: 2,
        releaseOrder: 2,
        phase: 'The Dark Knight Trilogy',
        runtime: 152,
        runtimeStr: '2h 32m',
        rating: 8.5,
        poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdrop_path: '/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg',
        overview: 'Batman raises the stakes in his war on crime with the help of Jim Gordon and Harvey Dent, until the sadistic Joker unleashes chaos upon Gotham.',
        characters: ['Bruce Wayne', 'The Joker', 'Harvey Dent / Two-Face', 'Jim Gordon'],
        prerequisiteFor: {
          'the-dark-knight-rises': {
            tier: 'critical',
            loreBridge: 'The death of Harvey Dent and Batman taking the blame establishes the entire 8-year peace and subsequent moral collapse in The Dark Knight Rises.'
          }
        }
      },
      {
        id: 'the-dark-knight-rises-node',
        tmdbId: 49026,
        title: 'The Dark Knight Rises',
        releaseYear: 2012,
        chronologicalYear: 'Year 10',
        chronologicalOrder: 3,
        releaseOrder: 3,
        phase: 'The Dark Knight Trilogy',
        runtime: 165,
        runtimeStr: '2h 45m',
        rating: 7.8,
        poster_path: '/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg',
        backdrop_path: '/c3OHQncTAnKFhdOTX7D3LTW6son.jpg',
        overview: 'Eight years following the events of The Dark Knight, Batman returns from exile to defend Gotham from the terrifying masked terrorist Bane.',
        characters: ['Bruce Wayne', 'Bane', 'Selina Kyle (Catwoman)', 'Miranda Tate (Talia)', 'John Blake'],
        isTarget: true,
        prerequisiteFor: {}
      },
      {
        id: 'the-batman-2022',
        tmdbId: 414906,
        title: 'The Batman',
        releaseYear: 2022,
        chronologicalYear: 'Year Two',
        chronologicalOrder: 4,
        releaseOrder: 4,
        phase: 'The Reeves Epic Crime Saga',
        runtime: 176,
        runtimeStr: '2h 56m',
        rating: 7.7,
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop_path: '/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg',
        overview: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
        characters: ['Bruce Wayne', 'Selina Kyle', 'The Riddler', 'The Penguin', 'Jim Gordon'],
        prerequisiteFor: {
          'the-batman-2': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: The direct narrative foundation. Ends with Gotham submerged in a flood and Bruce Wayne realizing he must be a symbol of hope rather than vengeance.'
          }
        }
      },
      {
        id: 'the-penguin-series',
        tmdbId: 194764,
        title: 'The Penguin (HBO Series)',
        releaseYear: 2024,
        chronologicalYear: 'Days after Gotham Flood',
        chronologicalOrder: 5,
        releaseOrder: 5,
        phase: 'The Reeves Epic Crime Saga',
        runtime: 420,
        runtimeStr: '8 Episodes',
        rating: 8.8,
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop_path: '/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg',
        overview: 'Following the death of Carmine Falcone, Oswald Cobb fights to exploit Gotham’s post-flood chaos and seize absolute control of the city’s underworld.',
        characters: ['Oswald Cobb (The Penguin)', 'Sofia Falcone', 'Alberto Falcone', 'Vic Aguilar'],
        prerequisiteFor: {
          'the-batman-2': {
            tier: 'critical',
            loreBridge: 'DIRECT BRIDGE TO THE BATMAN: PART II: Establishes The Penguin as the undisputed kingpin of Gotham City, directly teeing up his collision with Batman in Part II.'
          }
        }
      },
      {
        id: 'the-batman-part-2-node',
        tmdbId: 890825,
        title: 'The Batman: Part II',
        releaseYear: 2026,
        chronologicalYear: 'Year Three',
        chronologicalOrder: 6,
        releaseOrder: 6,
        phase: 'The Reeves Epic Crime Saga',
        runtime: 160,
        runtimeStr: '2h 40m (Expected)',
        rating: 9.0,
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop_path: '/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg',
        overview: 'Bruce Wayne navigates a cold, submerged Gotham City as new psychological threats emerge from Arkham and the Falcone empire’s ashes.',
        characters: ['Bruce Wayne', 'The Penguin', 'Jim Gordon'],
        isTarget: true,
        prerequisiteFor: {}
      }
    ]
  },
  {
    id: 'star-wars',
    name: 'Star Wars Saga',
    shortName: 'Star Wars',
    icon: '🪐',
    badge: 'Skywalker Saga & Mandoverse',
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(15, 23, 42, 0.4) 100%)',
    description: 'The galactic battle between the Jedi and Sith across generations, from the Clone Wars to the Mandalorian and New Republic.',
    defaultTargetId: 'mando-grogu',
    targetMovies: [
      {
        id: 'mando-grogu',
        title: 'The Mandalorian & Grogu',
        year: '2026',
        releaseDate: 'May 22, 2026',
        poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdrop_path: '/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg',
        headline: 'The New Republic Era Begins on the Big Screen',
        loreSummary: 'Din Djarin and his Force-sensitive apprentice Grogu transition to the silver screen to protect the fledgling New Republic from Imperial remnants.'
      }
    ],
    movies: [
      {
        id: 'sw-episode-4',
        tmdbId: 11,
        title: 'Star Wars: A New Hope',
        releaseYear: 1977,
        chronologicalYear: '0 BBY',
        chronologicalOrder: 1,
        releaseOrder: 1,
        phase: 'The Original Trilogy',
        runtime: 121,
        runtimeStr: '2h 01m',
        rating: 8.2,
        poster_path: '/fai0rspsNeJCS69wHNjOdWxcI7P.jpg',
        backdrop_path: '/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg',
        overview: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to rescue Princess Leia and save the galaxy from the Death Star.',
        characters: ['Luke Skywalker', 'Darth Vader', 'Han Solo', 'Princess Leia', 'Obi-Wan Kenobi'],
        prerequisiteFor: {
          'mando-grogu': {
            tier: 'critical',
            loreBridge: 'Establishes the Galactic Empire, the Jedi, and the destruction of the first Death Star that sets up the post-Empire era.'
          }
        }
      },
      {
        id: 'sw-episode-5',
        tmdbId: 1891,
        title: 'Star Wars: The Empire Strikes Back',
        releaseYear: 1980,
        chronologicalYear: '3 ABY',
        chronologicalOrder: 2,
        releaseOrder: 2,
        phase: 'The Original Trilogy',
        runtime: 124,
        runtimeStr: '2h 04m',
        rating: 8.4,
        poster_path: '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg',
        backdrop_path: '/k9pshruhCpJAdH9RaGJO6jaWQ4X.jpg',
        overview: 'After the Rebels are overpowered by the Empire, Luke Skywalker begins Jedi training with Yoda while his friends are pursued across the galaxy.',
        characters: ['Luke Skywalker', 'Darth Vader', 'Yoda', 'Boba Fett'],
        prerequisiteFor: {
          'mando-grogu': {
            tier: 'critical',
            loreBridge: 'Introduces Master Yoda (Grogu’s species) and Boba Fett (the iconic Mandalorian armor inspiration).'
          }
        }
      },
      {
        id: 'sw-episode-6',
        tmdbId: 1892,
        title: 'Star Wars: Return of the Jedi',
        releaseYear: 1983,
        chronologicalYear: '4 ABY',
        chronologicalOrder: 3,
        releaseOrder: 3,
        phase: 'The Original Trilogy',
        runtime: 131,
        runtimeStr: '2h 11m',
        rating: 7.9,
        poster_path: '/jQYlydvHm3kUix1f8prMucrplhm.jpg',
        backdrop_path: '/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg',
        overview: 'Luke Skywalker attempts to bring his father back to the light side of the Force as the Rebel Alliance makes a desperate attack on the second Death Star.',
        characters: ['Luke Skywalker', 'Darth Vader', 'Emperor Palpatine'],
        prerequisiteFor: {
          'mando-grogu': {
            tier: 'critical',
            loreBridge: 'CRITICAL: The Empire falls and Emperor Palpatine is defeated, creating the fragile power vacuum that the Mandalorian navigates 5 years later.'
          }
        }
      },
      {
        id: 'mando-s1-s3',
        tmdbId: 82856,
        title: 'The Mandalorian (Seasons 1–3)',
        releaseYear: 2019,
        chronologicalYear: '9 ABY',
        chronologicalOrder: 4,
        releaseOrder: 4,
        phase: 'The Mandoverse',
        runtime: 480,
        runtimeStr: 'Key Episodes',
        rating: 8.5,
        poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdrop_path: '/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg',
        overview: 'A lone Mandalorian bounty hunter in the outer reaches of the galaxy takes on a mission to retrieve a mysterious child, altering his destiny forever.',
        characters: ['Din Djarin (Mando)', 'Grogu (Baby Yoda)', 'Moff Gideon', 'Bo-Katan Kryze'],
        prerequisiteFor: {
          'mando-grogu': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: The direct origin story of Din Djarin adopting Grogu, reclaiming Mandalore, and agreeing to contract for the New Republic.'
          }
        }
      },
      {
        id: 'mando-grogu-node',
        tmdbId: 1228228,
        title: 'The Mandalorian & Grogu',
        releaseYear: 2026,
        chronologicalYear: '10 ABY',
        chronologicalOrder: 5,
        releaseOrder: 5,
        phase: 'The Mandoverse',
        runtime: 130,
        runtimeStr: '2h 10m (Expected)',
        rating: 8.9,
        poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdrop_path: '/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg',
        overview: 'Din Djarin and Grogu embark on their premier theatrical adventure, battling Imperial remnants threatening the galaxy’s peaceful rebuild.',
        characters: ['Din Djarin', 'Grogu'],
        isTarget: true,
        prerequisiteFor: {}
      }
    ]
  },
  {
    id: 'dune',
    name: 'Dune: The Arrakis Chronicle',
    shortName: 'Dune Saga',
    icon: '🏜️',
    badge: 'Denis Villeneuve Sci-Fi Masterpiece',
    color: '#fbbf24',
    bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.16) 0%, rgba(120, 53, 15, 0.4) 100%)',
    description: 'Denis Villeneuve’s breathtaking adaptation of Frank Herbert’s sci-fi epic across the desert planet Arrakis.',
    defaultTargetId: 'dune-messiah',
    targetMovies: [
      {
        id: 'dune-messiah',
        title: 'Dune: Messiah (Part Three)',
        year: '2026',
        releaseDate: 'December 18, 2026',
        poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
        backdrop_path: '/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
        headline: 'The Tragic Climax of the Holy War',
        loreSummary: 'Twelve years into his tyrannical galactic reign, Emperor Paul Atreides faces conspiracies within the Spacing Guild, Bene Gesserit, and Fremen believers.'
      }
    ],
    movies: [
      {
        id: 'dune-part-1',
        tmdbId: 438631,
        title: 'Dune: Part One',
        releaseYear: 2021,
        chronologicalYear: 'Year 10191 AG',
        chronologicalOrder: 1,
        releaseOrder: 1,
        phase: 'The Arrakis Trilogy',
        runtime: 155,
        runtimeStr: '2h 35m',
        rating: 7.8,
        poster_path: '/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg',
        backdrop_path: '/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
        overview: 'Paul Atreides leads his noble family to the dangerous planet of Arrakis, where malevolent forces conspire to wipe out his bloodline over the universe’s most valuable spice.',
        characters: ['Paul Atreides', 'Lady Jessica', 'Duke Leto', 'Chani', 'Baron Harkonnen'],
        prerequisiteFor: {
          'dune-messiah': {
            tier: 'critical',
            loreBridge: 'CRITICAL: The downfall of House Atreides and Paul’s first visions of the bloody jihad that will engulf billions of lives.'
          }
        }
      },
      {
        id: 'dune-part-2',
        tmdbId: 693134,
        title: 'Dune: Part Two',
        releaseYear: 2024,
        chronologicalYear: 'Year 10192 AG',
        chronologicalOrder: 2,
        releaseOrder: 2,
        phase: 'The Arrakis Trilogy',
        runtime: 166,
        runtimeStr: '2h 46m',
        rating: 8.2,
        poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
        backdrop_path: '/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
        overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
        characters: ['Paul Atreides (Muad’Dib)', 'Chani', 'Feyd-Rautha Harkonnen', 'Princess Irulan', 'Emperor Shaddam IV'],
        prerequisiteFor: {
          'dune-messiah': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: Ends with Paul defeating Feyd-Rautha, forcing the Emperor to surrender the throne, and unleashing the unstoppable Fremen Holy War across the stars.'
          }
        }
      },
      {
        id: 'dune-messiah-node',
        tmdbId: 1083424,
        title: 'Dune: Messiah (Part Three)',
        releaseYear: 2026,
        chronologicalYear: 'Year 10204 AG',
        chronologicalOrder: 3,
        releaseOrder: 3,
        phase: 'The Arrakis Trilogy',
        runtime: 165,
        runtimeStr: '2h 45m (Expected)',
        rating: 9.1,
        poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
        backdrop_path: '/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
        overview: 'Paul Atreides rules as Emperor of the Known Universe, wrestling with the devastating religious crusade carried out in his name and blinded by inescapable prescience.',
        characters: ['Paul Atreides', 'Chani', 'Princess Irulan', 'Alia Atreides'],
        isTarget: true,
        prerequisiteFor: {}
      }
    ]
  },
  {
    id: 'spider-verse',
    name: 'Spider-Verse Saga',
    shortName: 'Spider-Verse',
    icon: '🕸️',
    badge: 'Sony / Marvel Animation',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.16) 0%, rgba(59, 130, 246, 0.12) 100%)',
    description: 'The Oscar-winning animated multiverse odyssey following Miles Morales, Gwen Stacy, and the Spider-Society.',
    defaultTargetId: 'beyond-spider-verse',
    targetMovies: [
      {
        id: 'beyond-spider-verse',
        title: 'Spider-Man: Beyond the Spider-Verse',
        year: '2026',
        releaseDate: 'Expected 2026',
        poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop_path: '/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg',
        headline: 'The Fate of the Canon',
        loreSummary: 'Miles Morales fights to escape Earth-42 and return home to save his father from the Spot, defying Miguel O’Hara and the multiversal rules of Canon Events.'
      }
    ],
    movies: [
      {
        id: 'into-spider-verse',
        tmdbId: 324857,
        title: 'Spider-Man: Into the Spider-Verse',
        releaseYear: 2018,
        chronologicalYear: 'Year 1 (Earth-1610)',
        chronologicalOrder: 1,
        releaseOrder: 1,
        phase: 'The Miles Morales Trilogy',
        runtime: 117,
        runtimeStr: '1h 57m',
        rating: 8.4,
        poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
        backdrop_path: '/1ntePsIqeklfmrQJqZPncCydsqY.jpg',
        overview: 'Teen Miles Morales becomes the new Spider-Man and must team up with alternate-universe Spider-heroes to stop Kingpin’s super-collider from destroying Brooklyn.',
        characters: ['Miles Morales', 'Peter B. Parker', 'Gwen Stacy', 'Kingpin'],
        prerequisiteFor: {
          'beyond-spider-verse': {
            tier: 'critical',
            loreBridge: 'CRITICAL: The origin of Miles Morales and the initial activation of the dimensional collider that created the Spot and altered multiversal canon.'
          }
        }
      },
      {
        id: 'across-spider-verse',
        tmdbId: 569094,
        title: 'Spider-Man: Across the Spider-Verse',
        releaseYear: 2023,
        chronologicalYear: 'Year 2 (Multiverse)',
        chronologicalOrder: 2,
        releaseOrder: 2,
        phase: 'The Miles Morales Trilogy',
        runtime: 140,
        runtimeStr: '2h 20m',
        rating: 8.3,
        poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop_path: '/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg',
        overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        characters: ['Miles Morales', 'Gwen Stacy', 'Miguel O’Hara (Spider-Man 2099)', 'The Spot', 'Hobie Brown'],
        prerequisiteFor: {
          'beyond-spider-verse': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: Ends on a massive cliffhanger with Miles trapped on Earth-42, facing his variant self (The Prowler), while Gwen gathers a team to rescue him.'
          }
        }
      },
      {
        id: 'beyond-spider-verse-node',
        tmdbId: 1040148,
        title: 'Spider-Man: Beyond the Spider-Verse',
        releaseYear: 2026,
        chronologicalYear: 'Year 2 (Earth-42 & 1610)',
        chronologicalOrder: 3,
        releaseOrder: 3,
        phase: 'The Miles Morales Trilogy',
        runtime: 145,
        runtimeStr: '2h 25m (Expected)',
        rating: 9.0,
        poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop_path: '/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg',
        overview: 'Miles Morales battles across dimensions to save his father and stop the Spot from collapsing reality itself, shattering the rigid determinism of the Spider-Society.',
        characters: ['Miles Morales', 'Gwen Stacy', 'The Spot', 'Miles G. Morales (Prowler)'],
        isTarget: true,
        prerequisiteFor: {}
      }
    ]
  }
];
