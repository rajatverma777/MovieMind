// src/data/timelinesData.js
// Curated Cinematic Timelines & Prerequisite Watch Order Dataset
// 100% verified TMDB posters, backdrops, runtimes, and lore bridges for MCU (40 titles), DC (18 titles), Star Wars (12 titles), Spider-Man (11 titles), and Dune.

export const FRANCHISES = [
  {
    "id": "mcu",
    "name": "Marvel Cinematic Universe",
    "shortName": "MCU Multiverse",
    "icon": "⚡",
    "badge": "Multiverse Saga (40 Titles)",
    "color": "#e50914",
    "bgGradient": "linear-gradient(135deg, rgba(229, 9, 20, 0.16) 0%, rgba(139, 92, 246, 0.12) 100%)",
    "description": "The complete Marvel saga from 1942 WWII origins through the Infinity Saga, the TVA Multiverse, and the Incursion crisis of Avengers: Doomsday (2026) & Secret Wars (2027).",
    "defaultTargetId": "avengers-doomsday",
    "targetMovies": [
      {
        "id": "avengers-doomsday",
        "title": "Avengers: Doomsday",
        "year": "2026",
        "releaseDate": "2026-12-18",
        "poster_path": "/jzPwsojjFStf5lR5Nm07w2hH56G.jpg",
        "backdrop_path": "/rObL4of4eFA8yWaN9pRFo9aOVNi.jpg",
        "headline": "The Multiversal Incursion War Begins",
        "loreSummary": "Robert Downey Jr. makes his seismic return to the MCU as Victor Von Doom (Doctor Doom). With parallel timelines on the brink of catastrophic Incursions, surviving Earth-616 heroes, the Fantastic Four, and multiversal variants unite against total annihilation."
      },
      {
        "id": "avengers-secret-wars",
        "title": "Avengers: Secret Wars",
        "year": "2027",
        "releaseDate": "2027-05-07",
        "poster_path": "/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg",
        "backdrop_path": "/rytc6Lf4447C0CDncwFa4gxe0vY.jpg",
        "headline": "Battleworld & The End of the Multiverse",
        "loreSummary": "The grand finale of Phase 6. Collapsed universes are merged into Battleworld under the iron rule of God Emperor Doom."
      },
      {
        "id": "deadpool-wolverine",
        "title": "Deadpool & Wolverine",
        "year": "2024",
        "releaseDate": "2024-07-26",
        "poster_path": "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        "backdrop_path": "/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
        "headline": "The TVA, Void & Anchor Beings",
        "loreSummary": "Wade Wilson and a brooding Wolverine team up to save Wade’s universe from timeline decay caused by the death of its Anchor Being."
      },
      {
        "id": "avengers-endgame",
        "title": "Avengers: Endgame",
        "year": "2019",
        "releaseDate": "2019-04-26",
        "poster_path": "/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg",
        "backdrop_path": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        "headline": "The Climax of the Infinity Saga",
        "loreSummary": "The surviving Avengers execute the Quantum Time Heist to undo Thanos’ snap, culminating in Tony Stark’s universe-defining sacrifice."
      }
    ],
    "movies": [
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
          },
          "avengers-secret-wars": {
            "tier": "recommended",
            "loreBridge": "Introduces the Tesseract (Space Stone) and establishes Steve Rogers as the moral compass of the Avengers."
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
          },
          "avengers-secret-wars": {
            "tier": "optional",
            "loreBridge": "Explains Nick Fury’s pager and the origin of the Avengers initiative name."
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
          },
          "avengers-secret-wars": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: Establishes the face and heroic legacy of Tony Stark (Robert Downey Jr.). Essential for feeling the psychological horror of RDJ returning as Doctor Doom."
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: The historic team assembly and the Battle of New York that first alerted cosmic entities to Earth’s defenders."
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
            "tier": "optional",
            "loreBridge": "Introduces the Reality Stone and the cosmic Collector."
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
          },
          "avengers-secret-wars": {
            "tier": "critical",
            "loreBridge": "CRITICAL: Destroys S.H.I.E.L.D. and introduces Sam Wilson, who inherits the mantle of Captain America to lead the Avengers into Doomsday."
          },
          "avengers-endgame": {
            "tier": "critical",
            "loreBridge": "Core Infinity Saga chapter essential to understanding the battle against Thanos and the Infinity Stones."
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
          },
          "avengers-secret-wars": {
            "tier": "recommended",
            "loreBridge": "Expands the cosmic universe and introduces Thanos’ daughters Gamora and Nebula."
          },
          "avengers-endgame": {
            "tier": "critical",
            "loreBridge": "Core Infinity Saga chapter essential to understanding the battle against Thanos and the Infinity Stones."
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: Fractures the Avengers and introduces Spider-Man under Tony Stark’s mentorship. When Peter Parker sees Robert Downey Jr.’s face as Doctor Doom, this film is the reason his heart breaks."
          },
          "deadpool-wolverine": {
            "tier": "recommended",
            "loreBridge": "Wade Wilson attempts to apply for the Avengers following the hero fractures of Civil War."
          },
          "avengers-endgame": {
            "tier": "critical",
            "loreBridge": "Core Infinity Saga chapter essential to understanding the battle against Thanos and the Infinity Stones."
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
            "tier": "recommended",
            "loreBridge": "Destroys Asgard, unites Thor and Loki as true brothers, and leads directly into the opening seconds of Infinity War."
          },
          "deadpool-wolverine": {
            "tier": "recommended",
            "loreBridge": "Shows TVA monitors displaying Thor crying over Deadpool."
          },
          "avengers-endgame": {
            "tier": "critical",
            "loreBridge": "Core Infinity Saga chapter essential to understanding the battle against Thanos and the Infinity Stones."
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
          },
          "avengers-secret-wars": {
            "tier": "recommended",
            "loreBridge": "Traps Scott Lang in the Quantum Realm during the Thanos Snap, unlocking the time travel technology for Endgame."
          },
          "avengers-endgame": {
            "tier": "critical",
            "loreBridge": "Core Infinity Saga chapter essential to understanding the battle against Thanos and the Infinity Stones."
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
          },
          "avengers-secret-wars": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: The benchmark event of the MCU. Half of all life is turned to dust, showing what happens when the Avengers fail to unite in time."
          },
          "avengers-endgame": {
            "tier": "critical",
            "loreBridge": "Core Infinity Saga chapter essential to understanding the battle against Thanos and the Infinity Stones."
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
          },
          "avengers-secret-wars": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: The climax of the Infinity Saga. Tony Stark gives his life to save humanity. The Quantum Time Heist shatters temporal laws, causing the timeline branches that lead directly into Doomsday."
          },
          "deadpool-wolverine": {
            "tier": "critical",
            "loreBridge": "Establishes the Sacred Timeline and multiversal branching following the Avengers time heist."
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
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
          },
          "avengers-secret-wars": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: Direct prologue to Avengers: Secret Wars. Establishes the Fantastic Four as Doctor Doom’s supreme rivals and shows their home universe colliding with Earth-616."
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
    "id": "spiderman",
    "name": "Spider-Man Complete Multiverse",
    "shortName": "Spider-Man Saga",
    "icon": "🕷️",
    "badge": "Tobey, Andrew, Tom & Miles (11 Titles)",
    "color": "#ef4444",
    "bgGradient": "linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(37, 99, 235, 0.14) 100%)",
    "description": "The complete cinematic Spider-Man journey across 3 generations of live-action Peter Parkers and the Oscar-winning animated Spider-Verse.",
    "defaultTargetId": "beyond-spider-verse",
    "targetMovies": [
      {
        "id": "beyond-spider-verse",
        "title": "Spider-Man: Beyond the Spider-Verse",
        "year": "2027",
        "releaseDate": "2027-06-25",
        "poster_path": "/8ChIb3WzYAcza1vrXR56v510MWk.jpg",
        "backdrop_path": "/r2u2MOaOLWSi6onaAo37Vf39xGy.jpg",
        "headline": "The Climax of the Multiversal Spider-Society",
        "loreSummary": "Miles Morales fights to escape Earth-42 and save his father from the Spot, defying Miguel O’Hara and the rigid determinism of Canon Events."
      },
      {
        "id": "spider-man-no-way-home",
        "title": "Spider-Man: No Way Home",
        "year": "2021",
        "releaseDate": "2021-12-17",
        "poster_path": "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        "backdrop_path": "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
        "headline": "The 3-Spidey Reunion",
        "loreSummary": "Doctor Strange’s fractured spell brings Tobey Maguire, Andrew Garfield, and Tom Holland together to heal their greatest villains."
      }
    ],
    "movies": [
      {
        "id": "spiderman-1",
        "tmdbId": 557,
        "title": "Spider-Man",
        "releaseYear": 2002,
        "chronologicalYear": "Earth-96283 (Origin)",
        "chronologicalOrder": 1,
        "releaseOrder": 1,
        "phase": "The Raimi Trilogy (Tobey Maguire)",
        "runtime": 121,
        "runtimeStr": "2h 01m",
        "rating": 7.4,
        "poster_path": "/or6XJBVpcEbIkma0V9zshnbEtx4.jpg",
        "backdrop_path": "/zQ8AxTPiCiS5nnwXpwTBPBHSaa5.jpg",
        "overview": "After being bitten by a genetically-modified spider, shy teen Peter Parker gains superhuman abilities and battles the Green Goblin.",
        "characters": [
          "Peter Parker (Tobey Maguire)",
          "Norman Osborn (Green Goblin)",
          "Mary Jane Watson",
          "Uncle Ben"
        ],
        "prerequisiteFor": {
          "spider-man-no-way-home": {
            "tier": "critical",
            "loreBridge": "Introduces Tobey Maguire’s Peter Parker and Willem Dafoe’s Green Goblin before they cross into the MCU in No Way Home."
          },
          "beyond-spider-verse": {
            "tier": "recommended",
            "loreBridge": "The quintessential canon event of Uncle Ben’s death that Miguel O’Hara enforces across the multiverse."
          }
        }
      },
      {
        "id": "spiderman-2",
        "tmdbId": 24,
        "title": "Spider-Man 2",
        "releaseYear": 2004,
        "chronologicalYear": "Earth-96283 (Doc Ock)",
        "chronologicalOrder": 2,
        "releaseOrder": 2,
        "phase": "The Raimi Trilogy (Tobey Maguire)",
        "runtime": 127,
        "runtimeStr": "2h 07m",
        "rating": 8,
        "poster_path": "/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg",
        "backdrop_path": "/iffzIhuLAO38Po6sh1s6ZEVwlNL.jpg",
        "overview": "Peter Parker is beset with troubles in his failing personal life as he battles a brilliant scientist named Doctor Otto Octavius.",
        "characters": [
          "Peter Parker (Tobey Maguire)",
          "Otto Octavius (Doc Ock)",
          "Mary Jane Watson",
          "Harry Osborn"
        ],
        "prerequisiteFor": {
          "spider-man-no-way-home": {
            "tier": "critical",
            "loreBridge": "Introduces Alfred Molina’s Doctor Octopus and his iconic redemption arc before his return in No Way Home."
          }
        }
      },
      {
        "id": "spiderman-3",
        "tmdbId": 118,
        "title": "Spider-Man 3",
        "releaseYear": 2007,
        "chronologicalYear": "Earth-96283 (Black Suit)",
        "chronologicalOrder": 3,
        "releaseOrder": 3,
        "phase": "The Raimi Trilogy (Tobey Maguire)",
        "runtime": 139,
        "runtimeStr": "2h 19m",
        "rating": 7,
        "poster_path": "/iKP6wg3c6COUe8gYutoGG7qcPnO.jpg",
        "backdrop_path": "/atoIgfAk2Ig2HFJLD0VUnjiPWEz.jpg",
        "overview": "A strange black entity from another world bonds with Peter Parker and causes inner turmoil as he contends with Sandman, Venom, and New Goblin.",
        "characters": [
          "Peter Parker",
          "Flint Marko (Sandman)",
          "Eddie Brock (Venom)",
          "Harry Osborn"
        ],
        "prerequisiteFor": {
          "spider-man-no-way-home": {
            "tier": "recommended",
            "loreBridge": "Introduces Sandman (Thomas Haden Church) before his transport into the MCU."
          }
        }
      },
      {
        "id": "amazing-spiderman-1",
        "tmdbId": 1930,
        "title": "The Amazing Spider-Man",
        "releaseYear": 2012,
        "chronologicalYear": "Earth-120703 (Origin)",
        "chronologicalOrder": 4,
        "releaseOrder": 4,
        "phase": "The Webb Duology (Andrew Garfield)",
        "runtime": 136,
        "runtimeStr": "2h 16m",
        "rating": 6.8,
        "poster_path": "/jexoNYnPd6vVrmygwF6QZmWPFdu.jpg",
        "backdrop_path": "/sxskOU71CO8LaNX2LOtjYFUtKv7.jpg",
        "overview": "Peter Parker finds a clue that might help him understand why his parents disappeared, putting him on a collision course with Dr. Curt Connors (The Lizard).",
        "characters": [
          "Peter Parker (Andrew Garfield)",
          "Gwen Stacy (Emma Stone)",
          "Dr. Curt Connors (The Lizard)",
          "Captain Stacy"
        ],
        "prerequisiteFor": {
          "spider-man-no-way-home": {
            "tier": "critical",
            "loreBridge": "Introduces Andrew Garfield’s Spider-Man and Rhys Ifans’ Lizard before their appearance in No Way Home."
          }
        }
      },
      {
        "id": "amazing-spiderman-2",
        "tmdbId": 102382,
        "title": "The Amazing Spider-Man 2",
        "releaseYear": 2014,
        "chronologicalYear": "Earth-120703 (Electro)",
        "chronologicalOrder": 5,
        "releaseOrder": 5,
        "phase": "The Webb Duology (Andrew Garfield)",
        "runtime": 141,
        "runtimeStr": "2h 21m",
        "rating": 6.6,
        "poster_path": "/bU7nTmvmy0h3VUP01v1T2imgH6N.jpg",
        "backdrop_path": "/k0hlAzTryCYX1O1LyC6P8tAa8s0.jpg",
        "overview": "When New York is put under siege by Oscorp and Electro, it is up to Spider-Man to protect the city he swore to guard and the ones he loves.",
        "characters": [
          "Peter Parker",
          "Gwen Stacy",
          "Max Dillon (Electro)",
          "Harry Osborn (Green Goblin)"
        ],
        "prerequisiteFor": {
          "spider-man-no-way-home": {
            "tier": "critical",
            "loreBridge": "CRITICAL: Jamie Foxx’s Electro origin and Gwen Stacy’s tragic death, setting up Andrew Garfield’s redemption saving MJ."
          }
        }
      },
      {
        "id": "spider-man-homecoming",
        "tmdbId": 315635,
        "title": "Spider-Man: Homecoming",
        "releaseYear": 2017,
        "chronologicalYear": "Earth-616 (Phase 3)",
        "chronologicalOrder": 6,
        "releaseOrder": 6,
        "phase": "The MCU Trilogy (Tom Holland)",
        "runtime": 133,
        "runtimeStr": "2h 13m",
        "rating": 7.3,
        "poster_path": "/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg",
        "backdrop_path": "/lAsr1ytUq0ATWdCbcjf59pupPFy.jpg",
        "overview": "Peter Parker balances his high school life with his superhero duties, taking on the Vulture under the watchful eye of mentor Tony Stark.",
        "characters": [
          "Peter Parker (Tom Holland)",
          "Tony Stark (Iron Man)",
          "Adrian Toomes (Vulture)",
          "Ned Leeds",
          "MJ"
        ],
        "prerequisiteFor": {
          "spider-man-no-way-home": {
            "tier": "critical",
            "loreBridge": "Introduces Tom Holland’s Peter Parker, Ned, and MJ in the MCU."
          }
        }
      },
      {
        "id": "into-spider-verse",
        "tmdbId": 324857,
        "title": "Spider-Man: Into the Spider-Verse",
        "releaseYear": 2018,
        "chronologicalYear": "Earth-1610 (Miles Morales)",
        "chronologicalOrder": 7,
        "releaseOrder": 7,
        "phase": "The Spider-Verse Animation Saga",
        "runtime": 117,
        "runtimeStr": "1h 57m",
        "rating": 8.4,
        "poster_path": "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
        "backdrop_path": "/1ntePsIqeklfmrQJqZPncCydsqY.jpg",
        "overview": "Teen Miles Morales becomes the new Spider-Man and must team up with alternate-universe Spider-heroes to stop Kingpin’s super-collider.",
        "characters": [
          "Miles Morales",
          "Peter B. Parker",
          "Gwen Stacy",
          "Kingpin",
          "Spider-Ham",
          "Peni Parker"
        ],
        "prerequisiteFor": {
          "beyond-spider-verse": {
            "tier": "critical",
            "loreBridge": "CRITICAL: The origin of Miles Morales and the initial activation of the dimensional collider that created the Spot."
          }
        }
      },
      {
        "id": "spider-man-far-from-home",
        "tmdbId": 429617,
        "title": "Spider-Man: Far From Home",
        "releaseYear": 2019,
        "chronologicalYear": "Earth-616 (Post-Endgame)",
        "chronologicalOrder": 8,
        "releaseOrder": 8,
        "phase": "The MCU Trilogy (Tom Holland)",
        "runtime": 129,
        "runtimeStr": "2h 09m",
        "rating": 7.4,
        "poster_path": "/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg",
        "backdrop_path": "/wqBW5ltBJu0gs26yCc8shQQV82d.jpg",
        "overview": "Peter Parker’s relaxing European vacation takes an unexpected turn when Nick Fury shows up to recruit him to fight mysterious elemental creatures.",
        "characters": [
          "Peter Parker",
          "Quentin Beck (Mysterio)",
          "Nick Fury",
          "MJ",
          "Ned Leeds"
        ],
        "prerequisiteFor": {
          "spider-man-no-way-home": {
            "tier": "critical",
            "loreBridge": "Ends with Mysterio exposing Spider-Man’s secret identity to the entire world."
          }
        }
      },
      {
        "id": "spider-man-no-way-home",
        "tmdbId": 634649,
        "title": "Spider-Man: No Way Home",
        "releaseYear": 2021,
        "chronologicalYear": "Earth-616 (Multiverse Collision)",
        "chronologicalOrder": 9,
        "releaseOrder": 9,
        "phase": "The MCU Trilogy (Tom Holland)",
        "runtime": 148,
        "runtimeStr": "2h 28m",
        "rating": 7.9,
        "poster_path": "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        "backdrop_path": "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
        "overview": "With Spider-Man’s identity revealed, Peter asks Doctor Strange for help. A spell goes awry, breaking the multiverse and pulling in all three generations of Spider-Men.",
        "characters": [
          "Tom Holland",
          "Tobey Maguire",
          "Andrew Garfield",
          "Doctor Strange",
          "Willem Dafoe",
          "Alfred Molina",
          "Jamie Foxx"
        ],
        "isTarget": true,
        "prerequisiteFor": {
          "beyond-spider-verse": {
            "tier": "recommended",
            "loreBridge": "Referenced by Miguel O’Hara in Across the Spider-Verse (\"Don’t get me started on Doctor Strange and the little nerd on Earth-199999!\")."
          }
        }
      },
      {
        "id": "across-spider-verse",
        "tmdbId": 569094,
        "title": "Spider-Man: Across the Spider-Verse",
        "releaseYear": 2023,
        "chronologicalYear": "Multiverse (Spider-Society)",
        "chronologicalOrder": 10,
        "releaseOrder": 10,
        "phase": "The Spider-Verse Animation Saga",
        "runtime": 140,
        "runtimeStr": "2h 20m",
        "rating": 8.3,
        "poster_path": "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        "backdrop_path": "/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg",
        "overview": "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence, rebelling against Canon Events.",
        "characters": [
          "Miles Morales",
          "Gwen Stacy",
          "Miguel O’Hara (Spider-Man 2099)",
          "The Spot",
          "Hobie Brown",
          "Pavitr Prabhakar"
        ],
        "prerequisiteFor": {
          "beyond-spider-verse": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: Ends on a cliffhanger with Miles trapped on Earth-42 while Spot prepares to destroy his family."
          }
        }
      },
      {
        "id": "beyond-spider-verse",
        "tmdbId": 1040148,
        "title": "Spider-Man: Beyond the Spider-Verse",
        "releaseYear": 2027,
        "chronologicalYear": "Multiverse Climax",
        "chronologicalOrder": 11,
        "releaseOrder": 11,
        "phase": "The Spider-Verse Animation Saga",
        "runtime": 145,
        "runtimeStr": "2h 25m (Expected)",
        "rating": 9,
        "poster_path": "/8ChIb3WzYAcza1vrXR56v510MWk.jpg",
        "backdrop_path": "/r2u2MOaOLWSi6onaAo37Vf39xGy.jpg",
        "overview": "Miles Morales battles across dimensions to save his father and stop the Spot from collapsing reality itself, shattering the determinism of the Spider-Society.",
        "characters": [
          "Miles Morales",
          "Gwen Stacy",
          "The Spot",
          "Miles G. Morales (Prowler)"
        ],
        "isTarget": true,
        "prerequisiteFor": {}
      }
    ]
  },
  {
    "id": "dc",
    "name": "DC Universe & Batman Saga",
    "shortName": "DC & Batman",
    "icon": "🦇",
    "badge": "Nolan, Snyder, Reeves & Gunn (18 Titles)",
    "color": "#0a84ff",
    "bgGradient": "linear-gradient(135deg, rgba(10, 132, 255, 0.16) 0%, rgba(2, 6, 23, 0.4) 100%)",
    "description": "From Christopher Nolan’s Dark Knight Trilogy and the Zack Snyder Justice League epic to James Gunn’s new DC Universe and Matt Reeves’ The Batman.",
    "defaultTargetId": "the-batman-2",
    "targetMovies": [
      {
        "id": "the-batman-2",
        "title": "The Batman: Part II",
        "year": "2026",
        "releaseDate": "2026-10-02",
        "poster_path": "/8YS9oRn9rcAyBhYELFbGKk1TpFs.jpg",
        "backdrop_path": "/lRCAcwJeh93YHO3ghFBDf0Pj3w3.jpg",
        "headline": "Gotham Under Winter Freeze",
        "loreSummary": "Robert Pattinson returns as Bruce Wayne deeper into his role as Gotham’s protector, facing a fractured city after the flood and the rise of Oz Cobb’s criminal empire."
      },
      {
        "id": "superman-2025",
        "title": "Superman (DCU)",
        "year": "2025",
        "releaseDate": "2025-07-11",
        "poster_path": "/oufXoTwd73co0Eb2BvCKcP8boCT.jpg",
        "backdrop_path": "/osfvtKILPFAJStlTf7kDWGOwsBs.jpg",
        "headline": "Chapter 1: Gods and Monsters",
        "loreSummary": "James Gunn launches the new DC Universe with David Corenswet as Superman, balancing his Kryptonian heritage with small-town Kansas kindness."
      },
      {
        "id": "the-dark-knight-rises",
        "title": "The Dark Knight Rises",
        "year": "2012",
        "releaseDate": "2012-07-20",
        "poster_path": "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg",
        "backdrop_path": "/c3OHQncTAnKFhdOTX7D3LTW6son.jpg",
        "headline": "The Nolan Trilogy Climax",
        "loreSummary": "Eight years after the Joker’s terror, Bruce Wayne returns from exile to defend Gotham from Bane and the League of Shadows."
      }
    ],
    "movies": [
      {
        "id": "batman-begins",
        "tmdbId": 272,
        "title": "Batman Begins",
        "releaseYear": 2005,
        "chronologicalYear": "Year One",
        "chronologicalOrder": 1,
        "releaseOrder": 1,
        "phase": "Nolan Trilogy",
        "runtime": 140,
        "runtimeStr": "2h 20m",
        "rating": 7.7,
        "poster_path": "/sPX89Td70IDDjVr85jdSBb4rWGr.jpg",
        "backdrop_path": "/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
        "overview": "Driven by tragedy, billionaire Bruce Wayne travels to the Far East to train with the League of Shadows before returning to rid Gotham of corruption.",
        "characters": [
          "Bruce Wayne (Batman)",
          "Alfred",
          "Ra’s al Ghul",
          "Rachel Dawes",
          "Jim Gordon"
        ],
        "prerequisiteFor": {
          "the-dark-knight-rises": {
            "tier": "critical",
            "loreBridge": "Introduces the League of Shadows and Ra’s al Ghul whose legacy drives Bane and Talia in Rises."
          },
          "the-batman-2": {
            "tier": "recommended",
            "loreBridge": "Examines the psychology of Gotham corruption and Bruce Wayne adopting the mantle of the Bat."
          }
        }
      },
      {
        "id": "the-dark-knight",
        "tmdbId": 155,
        "title": "The Dark Knight",
        "releaseYear": 2008,
        "chronologicalYear": "Year Two",
        "chronologicalOrder": 2,
        "releaseOrder": 2,
        "phase": "Nolan Trilogy",
        "runtime": 152,
        "runtimeStr": "2h 32m",
        "rating": 8.5,
        "poster_path": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop_path": "/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg",
        "overview": "Batman raises the stakes in his war on crime with the help of Jim Gordon and Harvey Dent, until the sadistic Joker unleashes chaos upon Gotham.",
        "characters": [
          "Bruce Wayne",
          "The Joker (Heath Ledger)",
          "Harvey Dent (Two-Face)",
          "Jim Gordon"
        ],
        "prerequisiteFor": {
          "the-dark-knight-rises": {
            "tier": "critical",
            "loreBridge": "CRITICAL: The tragic death of Harvey Dent causes Batman to take the blame, setting up Bruce Wayne’s 8-year exile."
          },
          "the-batman-2": {
            "tier": "recommended",
            "loreBridge": "Masterclass in Gotham crime syndicates, DA politics, and ideological chaos."
          }
        }
      },
      {
        "id": "the-dark-knight-rises",
        "tmdbId": 49026,
        "title": "The Dark Knight Rises",
        "releaseYear": 2012,
        "chronologicalYear": "Year Ten",
        "chronologicalOrder": 3,
        "releaseOrder": 3,
        "phase": "Nolan Trilogy",
        "runtime": 165,
        "runtimeStr": "2h 45m",
        "rating": 7.8,
        "poster_path": "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg",
        "backdrop_path": "/c3OHQncTAnKFhdOTX7D3LTW6son.jpg",
        "overview": "Eight years following the events of The Dark Knight, Batman returns from exile to defend Gotham from the terrifying masked terrorist Bane.",
        "characters": [
          "Bruce Wayne",
          "Bane",
          "Selina Kyle (Catwoman)",
          "Miranda Tate (Talia)",
          "John Blake"
        ],
        "isTarget": true,
        "prerequisiteFor": {}
      },
      {
        "id": "man-of-steel",
        "tmdbId": 49521,
        "title": "Man of Steel",
        "releaseYear": 2013,
        "chronologicalYear": "2013",
        "chronologicalOrder": 4,
        "releaseOrder": 4,
        "phase": "DCEU / Snyderverse",
        "runtime": 143,
        "runtimeStr": "2h 23m",
        "rating": 6.7,
        "poster_path": "/8GFtkImmK0K1VaUChR0n9O61CFU.jpg",
        "backdrop_path": "/69EFgWWPFWbRNHmQgYdSnyJ94Ge.jpg",
        "overview": "A young boy learns that he has extraordinary powers and is not of this Earth. As a young man, he journeys to discover where he came from and what he was sent here to do.",
        "characters": [
          "Clark Kent (Superman)",
          "Lois Lane",
          "General Zod",
          "Jor-El",
          "Jonathan Kent"
        ],
        "prerequisiteFor": {
          "superman-2025": {
            "tier": "recommended",
            "loreBridge": "The previous modern cinematic baseline for Superman before James Gunn’s new DC Universe reboot."
          },
          "batman-v-superman": {
            "tier": "critical",
            "loreBridge": "The Black Zero destruction of Metropolis directly motivates Bruce Wayne to hunt down Superman."
          }
        }
      },
      {
        "id": "batman-v-superman",
        "tmdbId": 209112,
        "title": "Batman v Superman: Dawn of Justice",
        "releaseYear": 2016,
        "chronologicalYear": "2015",
        "chronologicalOrder": 5,
        "releaseOrder": 5,
        "phase": "DCEU / Snyderverse",
        "runtime": 152,
        "runtimeStr": "2h 32m",
        "rating": 6,
        "poster_path": "/5UsK3grJvtQrtzEgqNlDljJW96w.jpg",
        "backdrop_path": "/5fX1oSGuYdKgwWmUTAN5MNSQGzr.jpg",
        "overview": "Fearing the actions of a god-like superhero left unchecked, Gotham City’s own formidable, forceful vigilante takes on Metropolis’s most revered, modern-day savior.",
        "characters": [
          "Bruce Wayne (Ben Affleck)",
          "Clark Kent (Henry Cavill)",
          "Diana Prince (Wonder Woman)",
          "Lex Luthor",
          "Doomsday"
        ],
        "prerequisiteFor": {
          "zack-snyder-justice-league": {
            "tier": "critical",
            "loreBridge": "Superman’s death scream awakens the Mother Boxes across the globe, bringing Steppenwolf and Darkseid to Earth."
          }
        }
      },
      {
        "id": "suicide-squad-2016",
        "tmdbId": 297761,
        "title": "Suicide Squad",
        "releaseYear": 2016,
        "chronologicalYear": "2016",
        "chronologicalOrder": 6,
        "releaseOrder": 6,
        "phase": "DCEU / Snyderverse",
        "runtime": 122,
        "runtimeStr": "2h 02m",
        "rating": 5.9,
        "poster_path": "/sk3FZgh3sRrmr8vyhaitNobMcfh.jpg",
        "backdrop_path": "/wAk0yKrhAmvsoMvlKs4QImhvK5X.jpg",
        "overview": "A secret government agency recruits some of the most dangerous incarcerated super-villains to form a defensive task force Task Force X.",
        "characters": [
          "Harley Quinn",
          "Deadshot",
          "Amanda Waller",
          "The Joker",
          "El Diablo"
        ],
        "prerequisiteFor": {
          "the-suicide-squad": {
            "tier": "optional",
            "loreBridge": "Introduces Margot Robbie as Harley Quinn and Amanda Waller’s ruthless black-ops control."
          }
        }
      },
      {
        "id": "wonder-woman",
        "tmdbId": 297762,
        "title": "Wonder Woman",
        "releaseYear": 2017,
        "chronologicalYear": "1918 (WWI)",
        "chronologicalOrder": 7,
        "releaseOrder": 7,
        "phase": "DCEU / Snyderverse",
        "runtime": 141,
        "runtimeStr": "2h 21m",
        "rating": 7.2,
        "poster_path": "/v4ncgZjG2Zu8ZW5al1vIZTsSjqX.jpg",
        "backdrop_path": "/AaABt75ZzfMGrscUR2seabz4PEX.jpg",
        "overview": "When a pilot crashes and tells of conflict in the outside world, Diana, an Amazonian warrior in training, leaves home to fight a war, discovering her full powers and true destiny.",
        "characters": [
          "Diana Prince (Wonder Woman)",
          "Steve Trevor",
          "Ares",
          "General Ludendorff"
        ],
        "prerequisiteFor": {
          "zack-snyder-justice-league": {
            "tier": "recommended",
            "loreBridge": "Explains the origin of the Amazons of Themyscira and their defense of the Mother Box."
          }
        }
      },
      {
        "id": "zack-snyder-justice-league",
        "tmdbId": 791373,
        "title": "Zack Snyder’s Justice League",
        "releaseYear": 2021,
        "chronologicalYear": "2017",
        "chronologicalOrder": 8,
        "releaseOrder": 11,
        "phase": "DCEU / Snyderverse",
        "runtime": 242,
        "runtimeStr": "4h 02m",
        "rating": 8.1,
        "poster_path": "/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg",
        "backdrop_path": "/9WoLTsRgrupkvCgs3bhsl2EjLhs.jpg",
        "overview": "Determined to ensure Superman’s ultimate sacrifice was not in vain, Bruce Wayne aligns forces with Diana Prince with plans to recruit a team of metahumans to protect the world.",
        "characters": [
          "Batman",
          "Superman",
          "Wonder Woman",
          "The Flash",
          "Aquaman",
          "Cyborg",
          "Darkseid"
        ],
        "prerequisiteFor": {
          "the-flash": {
            "tier": "critical",
            "loreBridge": "Barry Allen unlocks the Speed Force to reverse time, which leads directly to his time travel obsession in The Flash."
          }
        }
      },
      {
        "id": "aquaman",
        "tmdbId": 297802,
        "title": "Aquaman",
        "releaseYear": 2018,
        "chronologicalYear": "2018",
        "chronologicalOrder": 9,
        "releaseOrder": 8,
        "phase": "DCEU / Snyderverse",
        "runtime": 143,
        "runtimeStr": "2h 23m",
        "rating": 6.9,
        "poster_path": "/ufl63EFcc5XpByEV2Ecdw6WJZAI.jpg",
        "backdrop_path": "/9QusGjxcYvfPD1THg6oW3RLeNn7.jpg",
        "overview": "Arthur Curry, the human-born heir to the underwater kingdom of Atlantis, goes on a quest to prevent a war between the worlds of ocean and land.",
        "characters": [
          "Arthur Curry (Aquaman)",
          "Mera",
          "Orm (Ocean Master)",
          "Black Manta",
          "Queen Atlanna"
        ],
        "prerequisiteFor": {
          "aquaman-2": {
            "tier": "critical",
            "loreBridge": "Arthur Curry claims the Trident of Atlan and becomes King of Atlantis."
          }
        }
      },
      {
        "id": "shazam",
        "tmdbId": 287947,
        "title": "Shazam!",
        "releaseYear": 2019,
        "chronologicalYear": "2019",
        "chronologicalOrder": 10,
        "releaseOrder": 9,
        "phase": "DCEU / Snyderverse",
        "runtime": 132,
        "runtimeStr": "2h 12m",
        "rating": 7,
        "poster_path": "/xnopI5Xtky18MPhK40cZAGAOVeV.jpg",
        "backdrop_path": "/o7JVhqMmrex1TPbmuxl8YXVlcfl.jpg",
        "overview": "A newly fostered young boy in search of his mother instead finds unexpected super powers and soon gains a powerful enemy.",
        "characters": [
          "Billy Batson (Shazam)",
          "Freddy Freeman",
          "Dr. Thaddeus Sivana",
          "The Wizard"
        ],
        "prerequisiteFor": {
          "black-adam": {
            "tier": "recommended",
            "loreBridge": "Introduces the power of the Rock of Eternity and the ancient wizard council that banished Black Adam."
          }
        }
      },
      {
        "id": "the-suicide-squad",
        "tmdbId": 436969,
        "title": "The Suicide Squad",
        "releaseYear": 2021,
        "chronologicalYear": "2021",
        "chronologicalOrder": 11,
        "releaseOrder": 10,
        "phase": "DCU Genesis (James Gunn)",
        "runtime": 132,
        "runtimeStr": "2h 12m",
        "rating": 7.4,
        "poster_path": "/q61qEyssk2ku3okWICKArlAdhBn.jpg",
        "backdrop_path": "/jlGmlFOcfo8n5tURmhC7YVd4Iyy.jpg",
        "overview": "Supervillains Harley Quinn, Bloodsport, Peacemaker and a collection of nutty cons at Belle Reve prison join the super-secret Task Force X as they are dropped off at the remote island of Corto Maltese.",
        "characters": [
          "Bloodsport",
          "Peacemaker",
          "Harley Quinn",
          "King Shark",
          "Ratcatcher 2",
          "Starro"
        ],
        "prerequisiteFor": {
          "superman-2025": {
            "tier": "critical",
            "loreBridge": "Directed by James Gunn, sets the tonal and geopolitical foundation for the new unified DC Universe."
          }
        }
      },
      {
        "id": "the-batman-2022",
        "tmdbId": 414906,
        "title": "The Batman",
        "releaseYear": 2022,
        "chronologicalYear": "Year Two",
        "chronologicalOrder": 12,
        "releaseOrder": 12,
        "phase": "The Reeves Epic Crime Saga",
        "runtime": 177,
        "runtimeStr": "2h 57m",
        "rating": 7.7,
        "poster_path": "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        "backdrop_path": "/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg",
        "overview": "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
        "characters": [
          "Bruce Wayne (Robert Pattinson)",
          "Selina Kyle (Zoë Kravitz)",
          "The Riddler",
          "The Penguin",
          "Jim Gordon"
        ],
        "prerequisiteFor": {
          "the-batman-2": {
            "tier": "critical",
            "loreBridge": "CRITICAL MUST-WATCH: Ends with Gotham submerged in a massive flood, forcing Bruce Wayne to step into the light as a symbol of hope rather than vengeance."
          }
        }
      },
      {
        "id": "black-adam",
        "tmdbId": 436270,
        "title": "Black Adam",
        "releaseYear": 2022,
        "chronologicalYear": "2022",
        "chronologicalOrder": 13,
        "releaseOrder": 13,
        "phase": "DCEU Finale",
        "runtime": 125,
        "runtimeStr": "2h 05m",
        "rating": 6.7,
        "poster_path": "/rCtreCr4xiYEWDQTebybolIh6Xe.jpg",
        "backdrop_path": "/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg",
        "overview": "Nearly 5,000 years after he was bestowed with the almighty powers of the Egyptian gods, Black Adam is freed from his earthly tomb, ready to unleash his unique form of justice.",
        "characters": [
          "Teth-Adam (Black Adam)",
          "Hawkman",
          "Doctor Fate",
          "Cyclone",
          "Atom Smasher"
        ],
        "prerequisiteFor": {
          "superman-2025": {
            "tier": "optional",
            "loreBridge": "Introduces the Justice Society of America (JSA)."
          }
        }
      },
      {
        "id": "the-flash",
        "tmdbId": 298618,
        "title": "The Flash",
        "releaseYear": 2023,
        "chronologicalYear": "2023 (Multiverse)",
        "chronologicalOrder": 14,
        "releaseOrder": 14,
        "phase": "DCEU Finale / Multiverse Reset",
        "runtime": 144,
        "runtimeStr": "2h 24m",
        "rating": 6.6,
        "poster_path": "/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
        "backdrop_path": "/yF1eOkaYvwiORauRCPWznV9xVvi.jpg",
        "overview": "Barry Allen uses his super speed to change the past, but his attempt to save his family creates a world without superheroes, forcing him to recruit an older Batman and an imprisoned Kryptonian.",
        "characters": [
          "Barry Allen",
          "Bruce Wayne (Michael Keaton)",
          "Kara Zor-El (Supergirl)",
          "General Zod"
        ],
        "prerequisiteFor": {
          "superman-2025": {
            "tier": "critical",
            "loreBridge": "CRITICAL MULTIVERSE RESET: Barry’s timeline tampering collides realities and resets the DCEU timeline, creating the opening for James Gunn’s new DC Universe."
          }
        }
      },
      {
        "id": "blue-beetle",
        "tmdbId": 565770,
        "title": "Blue Beetle",
        "releaseYear": 2023,
        "chronologicalYear": "2023",
        "chronologicalOrder": 15,
        "releaseOrder": 15,
        "phase": "DCEU Finale",
        "runtime": 128,
        "runtimeStr": "2h 08m",
        "rating": 6.6,
        "poster_path": "/mXLOHHc1Zeuwsl4xYKjKh2280oL.jpg",
        "backdrop_path": "/bVyFGnX8kt0XtJXdx2F1HyOkIic.jpg",
        "overview": "Recent college grad Jaime Reyes returns home full of aspirations, only to find himself in possession of an ancient relic of alien biotechnology: the Scarab.",
        "characters": [
          "Jaime Reyes (Blue Beetle)",
          "Jenny Kord",
          "Victoria Kord",
          "Carapax"
        ],
        "prerequisiteFor": {
          "superman-2025": {
            "tier": "recommended",
            "loreBridge": "Confirmed by James Gunn as the first official DCU superhero character leading into Chapter 1: Gods & Monsters."
          }
        }
      },
      {
        "id": "aquaman-and-the-lost-kingdom",
        "tmdbId": 572802,
        "title": "Aquaman and the Lost Kingdom",
        "releaseYear": 2023,
        "chronologicalYear": "2023",
        "chronologicalOrder": 16,
        "releaseOrder": 16,
        "phase": "DCEU Finale",
        "runtime": 124,
        "runtimeStr": "2h 04m",
        "rating": 6.5,
        "poster_path": "/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg",
        "backdrop_path": "/bckxSN9ueOgm0gJpVJmPQrecWul.jpg",
        "overview": "Black Manta seeks revenge on Aquaman for his father’s death. Wielding the Black Trident, he unleashes an ancient and malevolent force.",
        "characters": [
          "Arthur Curry",
          "Orm",
          "Black Manta",
          "Mera",
          "King Nereus"
        ],
        "prerequisiteFor": {
          "superman-2025": {
            "tier": "optional",
            "loreBridge": "The final concluding chapter of the original DCEU continuity."
          }
        }
      },
      {
        "id": "superman-2025",
        "tmdbId": 1064010,
        "title": "Superman",
        "releaseYear": 2025,
        "chronologicalYear": "Chapter 1: Gods and Monsters",
        "chronologicalOrder": 17,
        "releaseOrder": 17,
        "phase": "DCU: Gods and Monsters (James Gunn)",
        "runtime": 130,
        "runtimeStr": "2h 10m",
        "rating": 8.8,
        "poster_path": "/oufXoTwd73co0Eb2BvCKcP8boCT.jpg",
        "backdrop_path": "/osfvtKILPFAJStlTf7kDWGOwsBs.jpg",
        "overview": "Superman reconciles his heritage with his human upbringing, symbolizing truth, justice, and the American way in a world that views kindness as old-fashioned.",
        "characters": [
          "Clark Kent (David Corenswet)",
          "Lois Lane (Rachel Brosnahan)",
          "Lex Luthor (Nicholas Hoult)",
          "Hawkgirl",
          "Guy Gardner (Green Lantern)"
        ],
        "isTarget": true,
        "prerequisiteFor": {}
      },
      {
        "id": "the-batman-2",
        "tmdbId": 890825,
        "title": "The Batman: Part II",
        "releaseYear": 2026,
        "chronologicalYear": "Year Three",
        "chronologicalOrder": 18,
        "releaseOrder": 18,
        "phase": "The Reeves Epic Crime Saga",
        "runtime": 165,
        "runtimeStr": "2h 45m (Expected)",
        "rating": 9.1,
        "poster_path": "/8YS9oRn9rcAyBhYELFbGKk1TpFs.jpg",
        "backdrop_path": "/lRCAcwJeh93YHO3ghFBDf0Pj3w3.jpg",
        "overview": "Bruce Wayne navigates a cold, submerged Gotham City as new psychological threats emerge from Arkham and the Falcone empire’s ashes.",
        "characters": [
          "Bruce Wayne (Robert Pattinson)",
          "The Penguin (Colin Farrell)",
          "Jim Gordon",
          "Clayface / Freeze"
        ],
        "isTarget": true,
        "prerequisiteFor": {}
      }
    ]
  },
  {
    "id": "star-wars",
    "name": "Star Wars Complete Saga",
    "shortName": "Star Wars",
    "icon": "🪐",
    "badge": "Skywalker Saga & Mandoverse (12 Titles)",
    "color": "#38bdf8",
    "bgGradient": "linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(15, 23, 42, 0.4) 100%)",
    "description": "The galactic battle between the Jedi and Sith across 3 generations, from the Clone Wars to the Mandalorian & Grogu (2026).",
    "defaultTargetId": "the-mandalorian-and-grogu",
    "targetMovies": [
      {
        "id": "the-mandalorian-and-grogu",
        "title": "The Mandalorian & Grogu",
        "year": "2026",
        "releaseDate": "2026-12-18",
        "poster_path": "/5ds2Ovicb2c1hOArVqiPo2jhjQO.jpg",
        "backdrop_path": "/ywdTjnDoLyWRxUdu2L7bRd9QOYD.jpg",
        "headline": "The New Republic Silver Screen Debut",
        "loreSummary": "Din Djarin and his Force-sensitive apprentice Grogu take to the big screen to protect the New Republic from Imperial remnants."
      },
      {
        "id": "sw-ep-6",
        "title": "Episode VI: Return of the Jedi",
        "year": "1983",
        "releaseDate": "1983-05-25",
        "poster_path": "/jQYlydvHm3kUix1f8prMucrplhm.jpg",
        "backdrop_path": "/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg",
        "headline": "The Defeat of the Emperor",
        "loreSummary": "Luke Skywalker faces Darth Vader and Emperor Palpatine aboard the second Death Star, bringing balance to the Force."
      }
    ],
    "movies": [
      {
        "id": "sw-ep-1",
        "tmdbId": 1893,
        "title": "Star Wars: Episode I - The Phantom Menace",
        "releaseYear": 1999,
        "chronologicalYear": "32 BBY",
        "chronologicalOrder": 1,
        "releaseOrder": 4,
        "phase": "The Prequel Trilogy",
        "runtime": 136,
        "runtimeStr": "2h 16m",
        "rating": 6.6,
        "poster_path": "/6wkfovpn7Eq8dYNKaG5PY3q2oq6.jpg",
        "backdrop_path": "/3TeGmKJfkik1D1rIoqGb1aR4k9c.jpg",
        "overview": "Two Jedi escape a hostile blockade on Naboo and meet a young boy who may bring balance to the Force: Anakin Skywalker.",
        "characters": [
          "Qui-Gon Jinn",
          "Obi-Wan Kenobi",
          "Anakin Skywalker",
          "Darth Maul",
          "Queen Amidala"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "recommended",
            "loreBridge": "Introduces the Jedi Order at the height of its power and the birth of the Chosen One."
          },
          "sw-ep-6": {
            "tier": "recommended",
            "loreBridge": "Adds deep emotional resonance to the tragic fall and final redemption of Darth Vader."
          }
        }
      },
      {
        "id": "sw-ep-2",
        "tmdbId": 1894,
        "title": "Star Wars: Episode II - Attack of the Clones",
        "releaseYear": 2002,
        "chronologicalYear": "22 BBY",
        "chronologicalOrder": 2,
        "releaseOrder": 5,
        "phase": "The Prequel Trilogy",
        "runtime": 142,
        "runtimeStr": "2h 22m",
        "rating": 6.6,
        "poster_path": "/oZNPzxqM2s5DyVWab09NTQScDQt.jpg",
        "backdrop_path": "/cxvr2IOTwHcQa3EqMoQ8RHCkqBG.jpg",
        "overview": "Ten years after the blockade of Naboo, the galaxy stands on the brink of civil war, as Count Dooku leads a separatist movement against the Republic.",
        "characters": [
          "Anakin Skywalker",
          "Obi-Wan Kenobi",
          "Padmé Amidala",
          "Count Dooku",
          "Jango Fett",
          "Boba Fett"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "critical",
            "loreBridge": "Introduces Jango Fett and the Kamino clone army — the genetic origin of Boba Fett and Mandalorian armor heritage."
          },
          "sw-ep-6": {
            "tier": "recommended",
            "loreBridge": "Adds deep emotional resonance to the tragic fall and final redemption of Darth Vader."
          }
        }
      },
      {
        "id": "sw-ep-3",
        "tmdbId": 1895,
        "title": "Star Wars: Episode III - Revenge of the Sith",
        "releaseYear": 2005,
        "chronologicalYear": "19 BBY",
        "chronologicalOrder": 3,
        "releaseOrder": 6,
        "phase": "The Prequel Trilogy",
        "runtime": 140,
        "runtimeStr": "2h 20m",
        "rating": 7.5,
        "poster_path": "/xfSAoBEm9MNBjmlNcDYLvLSMlnq.jpg",
        "backdrop_path": "/5vDuLrjJXFS9PTF7Q1xzobmYKR9.jpg",
        "overview": "Three years into the Clone Wars, the Jedi rescue Palpatine from Count Dooku. As Obi-Wan pursues a new threat, Anakin acts as a double agent, seduced into the Dark Side.",
        "characters": [
          "Anakin Skywalker (Darth Vader)",
          "Obi-Wan Kenobi",
          "Emperor Palpatine",
          "Padmé Amidala",
          "Yoda"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "critical",
            "loreBridge": "CRITICAL: Order 66 wipes out the Jedi. Grogu is smuggled out of the Jedi Temple during this exact massacre."
          },
          "sw-ep-6": {
            "tier": "recommended",
            "loreBridge": "Adds deep emotional resonance to the tragic fall and final redemption of Darth Vader."
          }
        }
      },
      {
        "id": "solo",
        "tmdbId": 348350,
        "title": "Solo: A Star Wars Story",
        "releaseYear": 2018,
        "chronologicalYear": "10 BBY",
        "chronologicalOrder": 4,
        "releaseOrder": 10,
        "phase": "Anthology Stories",
        "runtime": 135,
        "runtimeStr": "2h 15m",
        "rating": 6.6,
        "poster_path": "/4oD6VEccFkorEBTEDXtpLAaz0Rl.jpg",
        "backdrop_path": "/y9jGaGNn1dQDhPkhMumXaLize73.jpg",
        "overview": "Through a series of daring escapades, Han Solo befriends his mighty future copilot Chewbacca and meets notorious gambler Lando Calrissian.",
        "characters": [
          "Han Solo",
          "Chewbacca",
          "Lando Calrissian",
          "Qi’ra",
          "Darth Maul"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "optional",
            "loreBridge": "Explores the galactic underworld and syndicate syndicates that Mando navigates."
          }
        }
      },
      {
        "id": "rogue-one",
        "tmdbId": 330459,
        "title": "Rogue One: A Star Wars Story",
        "releaseYear": 2016,
        "chronologicalYear": "0 BBY",
        "chronologicalOrder": 5,
        "releaseOrder": 8,
        "phase": "Anthology Stories",
        "runtime": 133,
        "runtimeStr": "2h 13m",
        "rating": 7.5,
        "poster_path": "/i0yw1mFbB7sNGHCs7EXZPzFkdA1.jpg",
        "backdrop_path": "/6t8ES1d12OzWyCGxBeDYLHoaDrT.jpg",
        "overview": "A rogue band of resistance fighters unite for a mission to steal the plans to the Death Star, the Empire’s ultimate weapon of destruction.",
        "characters": [
          "Jyn Erso",
          "Cassian Andor",
          "K-2SO",
          "Director Krennic",
          "Darth Vader"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "recommended",
            "loreBridge": "Leads directly into Episode IV and demonstrates the brutal totalitarian rule of the Empire."
          },
          "sw-ep-6": {
            "tier": "recommended",
            "loreBridge": "Shows the sacrifice to obtain the Death Star plans that set off the galactic rebellion."
          }
        }
      },
      {
        "id": "sw-ep-4",
        "tmdbId": 11,
        "title": "Star Wars: Episode IV - A New Hope",
        "releaseYear": 1977,
        "chronologicalYear": "0 BBY / 0 ABY",
        "chronologicalOrder": 6,
        "releaseOrder": 1,
        "phase": "The Original Trilogy",
        "runtime": 121,
        "runtimeStr": "2h 01m",
        "rating": 8.2,
        "poster_path": "/fai0rspsNeJCS69wHNjOdWxcI7P.jpg",
        "backdrop_path": "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
        "overview": "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to rescue Princess Leia and save the galaxy from the Death Star.",
        "characters": [
          "Luke Skywalker",
          "Darth Vader",
          "Han Solo",
          "Princess Leia",
          "Obi-Wan Kenobi"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "critical",
            "loreBridge": "The cornerstone of Star Wars mythology: the destruction of the first Death Star and Luke Skywalker’s emergence."
          },
          "sw-ep-6": {
            "tier": "critical",
            "loreBridge": "The original trilogy narrative directly culminates in the redemption of Anakin Skywalker and destruction of the Death Star II."
          }
        }
      },
      {
        "id": "sw-ep-5",
        "tmdbId": 1891,
        "title": "Star Wars: Episode V - The Empire Strikes Back",
        "releaseYear": 1980,
        "chronologicalYear": "3 ABY",
        "chronologicalOrder": 7,
        "releaseOrder": 2,
        "phase": "The Original Trilogy",
        "runtime": 124,
        "runtimeStr": "2h 04m",
        "rating": 8.4,
        "poster_path": "/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg",
        "backdrop_path": "/k9pshruhCpJAdH9RaGJO6jaWQ4X.jpg",
        "overview": "After the Rebels are overpowered by the Empire, Luke Skywalker begins Jedi training with Yoda while his friends are pursued across the galaxy.",
        "characters": [
          "Luke Skywalker",
          "Darth Vader",
          "Yoda",
          "Boba Fett",
          "Lando Calrissian"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "critical",
            "loreBridge": "Introduces Grand Master Yoda (Grogu’s species) and Boba Fett."
          },
          "sw-ep-6": {
            "tier": "critical",
            "loreBridge": "The original trilogy narrative directly culminates in the redemption of Anakin Skywalker and destruction of the Death Star II."
          }
        }
      },
      {
        "id": "sw-ep-6",
        "tmdbId": 1892,
        "title": "Star Wars: Episode VI - Return of the Jedi",
        "releaseYear": 1983,
        "chronologicalYear": "4 ABY",
        "chronologicalOrder": 8,
        "releaseOrder": 3,
        "phase": "The Original Trilogy",
        "runtime": 132,
        "runtimeStr": "2h 12m",
        "rating": 7.9,
        "poster_path": "/jQYlydvHm3kUix1f8prMucrplhm.jpg",
        "backdrop_path": "/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg",
        "overview": "Luke Skywalker attempts to bring his father back to the light side of the Force as the Rebel Alliance makes a desperate attack on the second Death Star.",
        "characters": [
          "Luke Skywalker",
          "Darth Vader",
          "Emperor Palpatine",
          "Princess Leia",
          "Han Solo"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "critical",
            "loreBridge": "CRITICAL: The Empire collapses and Emperor Palpatine is defeated, creating the fragile frontier where Din Djarin operates 5 years later."
          }
        }
      },
      {
        "id": "the-mandalorian-and-grogu",
        "tmdbId": 1228228,
        "title": "The Mandalorian & Grogu",
        "releaseYear": 2026,
        "chronologicalYear": "10 ABY",
        "chronologicalOrder": 9,
        "releaseOrder": 13,
        "phase": "The Mandoverse",
        "runtime": 135,
        "runtimeStr": "2h 15m (Expected)",
        "rating": 8.8,
        "poster_path": "/5ds2Ovicb2c1hOArVqiPo2jhjQO.jpg",
        "backdrop_path": "/ywdTjnDoLyWRxUdu2L7bRd9QOYD.jpg",
        "overview": "Din Djarin and his Force-sensitive apprentice Grogu transition to the big screen, hunting Imperial warlords and defending the New Republic.",
        "characters": [
          "Din Djarin (The Mandalorian)",
          "Grogu",
          "Carson Teva",
          "Bo-Katan Kryze"
        ],
        "isTarget": true,
        "prerequisiteFor": {}
      },
      {
        "id": "sw-ep-7",
        "tmdbId": 140607,
        "title": "Star Wars: Episode VII - The Force Awakens",
        "releaseYear": 2015,
        "chronologicalYear": "34 ABY",
        "chronologicalOrder": 10,
        "releaseOrder": 7,
        "phase": "The Sequel Trilogy",
        "runtime": 136,
        "runtimeStr": "2h 16m",
        "rating": 7.2,
        "poster_path": "/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg",
        "backdrop_path": "/8BTsTfln4jlQrLXUBquXJ0ASQy9.jpg",
        "overview": "Thirty years after the defeat of the Empire, a new threat rises in the militant First Order. Defector Finn and scavenger Rey search for the missing Luke Skywalker.",
        "characters": [
          "Rey",
          "Finn",
          "Kylo Ren (Ben Solo)",
          "Han Solo",
          "General Leia"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "optional",
            "loreBridge": "Shows the eventual rise of the First Order out of the Imperial remnants that Mando is fighting."
          }
        }
      },
      {
        "id": "sw-ep-8",
        "tmdbId": 181808,
        "title": "Star Wars: Episode VIII - The Last Jedi",
        "releaseYear": 2017,
        "chronologicalYear": "34 ABY",
        "chronologicalOrder": 11,
        "releaseOrder": 9,
        "phase": "The Sequel Trilogy",
        "runtime": 152,
        "runtimeStr": "2h 32m",
        "rating": 6.7,
        "poster_path": "/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg",
        "backdrop_path": "/5Iw7zQTHVRBOYpA0V6z0yypOPZh.jpg",
        "overview": "Rey develops her newly discovered abilities with the guidance of Luke Skywalker, while the Resistance prepares for battle with the First Order.",
        "characters": [
          "Rey",
          "Luke Skywalker",
          "Kylo Ren",
          "Supreme Leader Snoke"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "optional",
            "loreBridge": "Explores Luke Skywalker’s disillusionment with the Jedi Order."
          }
        }
      },
      {
        "id": "sw-ep-9",
        "tmdbId": 181812,
        "title": "Star Wars: Episode IX - The Rise of Skywalker",
        "releaseYear": 2019,
        "chronologicalYear": "35 ABY",
        "chronologicalOrder": 12,
        "releaseOrder": 12,
        "phase": "The Sequel Trilogy",
        "runtime": 142,
        "runtimeStr": "2h 22m",
        "rating": 6.2,
        "poster_path": "/db32LaOibwEliAmSL2jjDF6oDdj.jpg",
        "backdrop_path": "/auJKGst3vXpJozHZh4nMFs0xWIU.jpg",
        "overview": "The surviving Resistance faces the First Order once more as Rey and Kylo Ren engage in a fateful duel, and Emperor Palpatine returns from death.",
        "characters": [
          "Rey Skywalker",
          "Kylo Ren",
          "Emperor Palpatine",
          "Finn",
          "Poe Dameron"
        ],
        "prerequisiteFor": {
          "the-mandalorian-and-grogu": {
            "tier": "optional",
            "loreBridge": "The climax of the 9-movie Skywalker saga."
          }
        }
      }
    ]
  }
];
