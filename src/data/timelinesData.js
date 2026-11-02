// src/data/timelinesData.js
// Curated Cinematic Timelines & Prerequisite Watch Order Dataset
// Powers the CineTimeline engine: calculates prerequisites, watch paths, in-universe chronology, and lore bridges.

export const FRANCHISES = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe',
    shortName: 'MCU Multiverse',
    icon: '⚡',
    badge: 'Multiverse Saga (Phase 1–6)',
    color: '#e50914',
    bgGradient: 'linear-gradient(135deg, rgba(229, 9, 20, 0.16) 0%, rgba(139, 92, 246, 0.12) 100%)',
    description: 'The complete Marvel saga from the 1940s Super Soldier origins to the Multiversal Incursion War in Avengers: Doomsday & Secret Wars.',
    defaultTargetId: 'avengers-doomsday',
    targetMovies: [
      {
        id: 'avengers-doomsday',
        title: 'Avengers: Doomsday',
        year: '2026',
        releaseDate: 'May 1, 2026',
        poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
        backdrop_path: '/2ssWTSVklAEc98frZUQhgtGHx7s.jpg',
        headline: 'The Multiversal Incursion Crisis Begins',
        loreSummary: 'Robert Downey Jr. returns to the MCU in a shocking twist as Victor Von Doom (Doctor Doom). With parallel timelines on the brink of catastrophic Incursions, surviving Earth-616 heroes and multiversal allies face their greatest existential threat since Thanos.'
      },
      {
        id: 'avengers-secret-wars',
        title: 'Avengers: Secret Wars',
        year: '2027',
        releaseDate: 'May 7, 2027',
        poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
        headline: 'Battleworld & The End of the Multiverse',
        loreSummary: 'The climactic conclusion of the Multiverse Saga. Collapsing universes collide into Battleworld under the iron rule of God Emperor Doom.'
      },
      {
        id: 'deadpool-wolverine',
        title: 'Deadpool & Wolverine',
        year: '2024',
        releaseDate: 'July 26, 2024',
        poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        backdrop_path: '/yDHYTjA3R0jFYba16jBB1ef8oIt.jpg',
        headline: 'The TVA & Anchor Beings',
        loreSummary: 'Wade Wilson and a battle-weary Wolverine team up to save Wade’s universe from timeline decay caused by the death of its Anchor Being.'
      },
      {
        id: 'avengers-endgame',
        title: 'Avengers: Endgame',
        year: '2019',
        releaseDate: 'April 26, 2019',
        poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        headline: 'The Climax of the Infinity Saga',
        loreSummary: 'The remaining Avengers execute the quantum Time Heist to undo Thanos’ snap, culminating in Tony Stark’s universe-defining sacrifice.'
      }
    ],
    movies: [
      {
        id: 'cap-first-avenger',
        tmdbId: 1771,
        title: 'Captain America: The First Avenger',
        releaseYear: 2011,
        chronologicalYear: '1942–1945',
        chronologicalOrder: 1,
        releaseOrder: 5,
        phase: 'Phase 1: Assemble',
        runtime: 124,
        runtimeStr: '2h 04m',
        rating: 6.9,
        poster_path: '/vSNxAJTlD0r02V9sPYpqjqDzgLJ.jpg',
        backdrop_path: '/yFuKvTGFzkKPDCFO59664VDiTTG.jpg',
        overview: 'Steve Rogers volunteers for a top-secret research project that turns him into Captain America, leading the battle against Red Skull and Hydra during WWII.',
        characters: ['Steve Rogers', 'Bucky Barnes', 'Peggy Carter', 'Howard Stark'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'recommended',
            loreBridge: 'Introduces the Tesseract (Space Stone) and the foundational Super Soldier legacy that defines Steve Rogers and the Avengers lineage.'
          },
          'avengers-endgame': {
            tier: 'recommended',
            loreBridge: 'Gives the emotional weight to Steve Rogers returning the stones and reuniting with Peggy Carter at the end of his journey.'
          }
        }
      },
      {
        id: 'iron-man',
        tmdbId: 1726,
        title: 'Iron Man',
        releaseYear: 2008,
        chronologicalYear: '2008',
        chronologicalOrder: 3,
        releaseOrder: 1,
        phase: 'Phase 1: Assemble',
        runtime: 126,
        runtimeStr: '2h 06m',
        rating: 7.9,
        poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
        backdrop_path: '/cyecBgWWjh7OPkZe5TC09n70eR5.jpg',
        overview: 'Billionaire genius Tony Stark builds a high-tech suit of armor to escape captivity and vows to protect the world, igniting the modern superhero era.',
        characters: ['Tony Stark', 'Pepper Potts', 'James Rhodes', 'Nick Fury'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: Establishes the face and legacy of Tony Stark (Robert Downey Jr.) as Earth’s primary protector. Understanding this icon is essential to feeling the tragic, psychological horror of RDJ returning as the villainous Doctor Doom.'
          },
          'avengers-endgame': {
            tier: 'critical',
            loreBridge: 'Where Tony Stark begins his entire character arc, ending in his sacrifice with the words "I am Iron Man."'
          }
        }
      },
      {
        id: 'the-avengers',
        tmdbId: 24428,
        title: 'The Avengers',
        releaseYear: 2012,
        chronologicalYear: '2012',
        chronologicalOrder: 6,
        releaseOrder: 6,
        phase: 'Phase 1: Assemble',
        runtime: 143,
        runtimeStr: '2h 23m',
        rating: 8.0,
        poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
        backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
        overview: 'Earth’s mightiest heroes must assemble and learn to fight as a team to stop the mischievous Loki and an invading alien army from conquering humanity.',
        characters: ['Tony Stark', 'Steve Rogers', 'Thor', 'Bruce Banner', 'Natasha Romanoff', 'Clint Barton', 'Loki'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'The birth of the Avengers team dynamic and the Battle of New York that first put Earth on the radar of cosmic and interdimensional threats.'
          },
          'avengers-endgame': {
            tier: 'critical',
            loreBridge: 'The primary destination of the 2012 Time Heist where the team retrieves the Space, Mind, and Time Stones.'
          }
        }
      },
      {
        id: 'captain-america-winter-soldier',
        tmdbId: 100402,
        title: 'Captain America: The Winter Soldier',
        releaseYear: 2014,
        chronologicalYear: '2014',
        chronologicalOrder: 9,
        releaseOrder: 9,
        phase: 'Phase 2: Heroes Divided',
        runtime: 136,
        runtimeStr: '2h 16m',
        rating: 7.7,
        poster_path: '/tVFRpFw3xTed5nGukbp2PpPlQbt.jpg',
        backdrop_path: '/4qCqAdHcNUmYK8nb8zbcm2iWwcu.jpg',
        overview: 'Steve Rogers teams with Black Widow and Falcon to expose a deep conspiracy within S.H.I.E.L.D. while facing a deadly Soviet assassin known as the Winter Soldier.',
        characters: ['Steve Rogers', 'Natasha Romanoff', 'Sam Wilson', 'Bucky Barnes', 'Nick Fury'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'recommended',
            loreBridge: 'Destroys traditional authority (S.H.I.E.L.D.) and establishes Sam Wilson (the future Captain America leading the team into Doomsday).'
          }
        }
      },
      {
        id: 'avengers-age-of-ultron',
        tmdbId: 99861,
        title: 'Avengers: Age of Ultron',
        releaseYear: 2015,
        chronologicalYear: '2015',
        chronologicalOrder: 11,
        releaseOrder: 11,
        phase: 'Phase 2: Heroes Divided',
        runtime: 141,
        runtimeStr: '2h 21m',
        rating: 7.3,
        poster_path: '/4ssDuvEDkS9urvtLnj1r62ATko.jpg',
        backdrop_path: '/8i6ZDk97VyRx0f92io9Gdl5mg6L.jpg',
        overview: 'When Tony Stark creates an artificial intelligence peacekeeper called Ultron, it goes rogue and decides humanity must be eradicated to save Earth.',
        characters: ['Tony Stark', 'Steve Rogers', 'Wanda Maximoff', 'Vision', 'Ultron'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'recommended',
            loreBridge: 'Introduces Wanda Maximoff (Scarlet Witch) and shows Tony Stark’s obsessive fear of failing to protect Earth — the exact paranoia that mirrors Doctor Doom’s philosophy.'
          }
        }
      },
      {
        id: 'captain-america-civil-war',
        tmdbId: 271110,
        title: 'Captain America: Civil War',
        releaseYear: 2016,
        chronologicalYear: '2016',
        chronologicalOrder: 12,
        releaseOrder: 13,
        phase: 'Phase 3: Infinity Saga Climax',
        runtime: 147,
        runtimeStr: '2h 27m',
        rating: 7.8,
        poster_path: '/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg',
        backdrop_path: '/kvRT8iqUuv442k28VjZ3hD1S8oR.jpg',
        overview: 'Political pressure to oversee the Avengers fractures the team into two warring factions led by Captain America and Iron Man.',
        characters: ['Steve Rogers', 'Tony Stark', 'Peter Parker', 'T’Challa', 'Bucky Barnes'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL: The ideological rupture of Earth’s heroes and the introduction of Spider-Man into Tony Stark’s mentorship. When Spider-Man encounters Doom in Doomsday, this relationship is the emotional heart.'
          }
        }
      },
      {
        id: 'doctor-strange-1',
        tmdbId: 284052,
        title: 'Doctor Strange',
        releaseYear: 2016,
        chronologicalYear: '2016–2017',
        chronologicalOrder: 14,
        releaseOrder: 14,
        phase: 'Phase 3: Infinity Saga Climax',
        runtime: 115,
        runtimeStr: '1h 55m',
        rating: 7.5,
        poster_path: '/uGBVj3bEbCoZbDjjl9wMgrghcyx.jpg',
        backdrop_path: '/aL53O54h2k8fspZ2o2N3k1F03W.jpg',
        overview: 'After a career-ending car crash, neurosurgeon Stephen Strange discovers the mystic arts, parallel dimensions, and the Eye of Agamotto (Time Stone).',
        characters: ['Stephen Strange', 'Wong', 'Ancient One', 'Mordo', 'Dormammu'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'recommended',
            loreBridge: 'Introduces the Mystic Arts, alternate dimensions, and the magical laws that both Doctor Strange and Doctor Doom command.'
          }
        }
      },
      {
        id: 'avengers-infinity-war',
        tmdbId: 299536,
        title: 'Avengers: Infinity War',
        releaseYear: 2018,
        chronologicalYear: '2018',
        chronologicalOrder: 18,
        releaseOrder: 19,
        phase: 'Phase 3: Infinity Saga Climax',
        runtime: 149,
        runtimeStr: '2h 29m',
        rating: 8.3,
        poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
        backdrop_path: '/bOGkgRGdhrBYJSLpMumFuRtrAnC.jpg',
        overview: 'The Avengers and their allies must sacrifice all to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.',
        characters: ['Thanos', 'Tony Stark', 'Thor', 'Steve Rogers', 'Doctor Strange', 'Spider-Man'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: The benchmark cosmic crisis of the MCU. Sets the stakes for what happens when the universe faces an unstoppable villain who believes he is doing the right thing.'
          },
          'avengers-endgame': {
            tier: 'critical',
            loreBridge: 'Part 1 of the two-part climax. Direct narrative predecessor to Endgame.'
          }
        }
      },
      {
        id: 'avengers-endgame-movie',
        tmdbId: 299534,
        title: 'Avengers: Endgame',
        releaseYear: 2019,
        chronologicalYear: '2018–2023',
        chronologicalOrder: 21,
        releaseOrder: 22,
        phase: 'Phase 3: Infinity Saga Climax',
        runtime: 181,
        runtimeStr: '3h 01m',
        rating: 8.4,
        poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        overview: 'After the devastating events of Infinity War, the universe is in ruins. The remaining Avengers assemble once more to reverse Thanos’ actions and restore balance.',
        characters: ['Tony Stark', 'Steve Rogers', 'Thor', 'Natasha Romanoff', 'Bruce Banner', 'Scott Lang'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: The climax of the Infinity Saga. Tony Stark’s funeral and sacrifice cemented his status as the savior of humanity. Timeline travel creates the branch realities that trigger the entire Multiverse Saga.'
          }
        }
      },
      {
        id: 'loki-series',
        tmdbId: 84958,
        title: 'Loki (Seasons 1 & 2)',
        releaseYear: 2021,
        chronologicalYear: 'Outside Time / Post-2023',
        chronologicalOrder: 22,
        releaseOrder: 24,
        phase: 'Phase 4: Multiverse Unbound',
        runtime: 240,
        runtimeStr: '4h 00m (Key Episodes)',
        rating: 8.2,
        poster_path: '/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg',
        backdrop_path: '/AjpB1tJjF5v5gqV5kK2bWp4M1V.jpg',
        overview: 'Loki is captured by the Time Variance Authority (TVA) after escaping with the Tesseract in Endgame, uncovering the secrets of the Sacred Timeline and He Who Remains.',
        characters: ['Loki', 'Mobius', 'Sylvie', 'He Who Remains', 'Ouroboros'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: The foundational engine of the entire Multiverse. Explains how timelines branch, introduces the TVA, and ends with Loki holding all infinite multiversal branches together at the center of reality.'
          },
          'deadpool-wolverine': {
            tier: 'critical',
            loreBridge: 'Directly introduces the TVA, the Void, and Alioth.'
          }
        }
      },
      {
        id: 'spider-man-no-way-home',
        tmdbId: 634649,
        title: 'Spider-Man: No Way Home',
        releaseYear: 2021,
        chronologicalYear: '2024',
        chronologicalOrder: 25,
        releaseOrder: 27,
        phase: 'Phase 4: Multiverse Unbound',
        runtime: 148,
        runtimeStr: '2h 28m',
        rating: 8.2,
        poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
        backdrop_path: '/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg',
        overview: 'With Spider-Man’s identity revealed, Peter asks Doctor Strange for help. A botched spell breaks reality, pulling villains and alternate Spider-Men across dimensions.',
        characters: ['Peter Parker', 'Doctor Strange', 'Tobey Maguire Spidey', 'Andrew Garfield Spidey', 'Green Goblin'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL: First cinematic demonstration of multiversal travelers invading Earth-616. Proves that tampering with the multiverse tears open cosmic dimensional rifts.'
          }
        }
      },
      {
        id: 'doctor-strange-multiverse-madness',
        tmdbId: 453395,
        title: 'Doctor Strange in the Multiverse of Madness',
        releaseYear: 2022,
        chronologicalYear: '2024',
        chronologicalOrder: 27,
        releaseOrder: 28,
        phase: 'Phase 4: Multiverse Unbound',
        runtime: 126,
        runtimeStr: '2h 06m',
        rating: 6.9,
        poster_path: '/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg',
        backdrop_path: '/wcKFYIiVDvRURrzglV9kgu7fpfY.jpg',
        overview: 'Doctor Strange teams with mysterious teen America Chavez to journey through the mind-bending multiverse while fleeing a corrupted Wanda Maximoff.',
        characters: ['Stephen Strange', 'Wanda Maximoff', 'America Chavez', 'Illuminati (Reed Richards, Prof X)'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'THE SINGLE MOST IMPORTANT RULEBOOK FOR DOOMSDAY: Explicitly introduces and defines INCURSIONS — the catastrophic collision of two parallel universes where one or both are annihilated. Clea recruits Strange to stop an Incursion he caused, which leads directly to Doomsday.'
          }
        }
      },
      {
        id: 'ant-man-quantumania',
        tmdbId: 640146,
        title: 'Ant-Man and the Wasp: Quantumania',
        releaseYear: 2023,
        chronologicalYear: '2025',
        chronologicalOrder: 30,
        releaseOrder: 31,
        phase: 'Phase 5: The Council of Realities',
        runtime: 125,
        runtimeStr: '2h 05m',
        rating: 6.0,
        poster_path: '/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg',
        backdrop_path: '/m8JTwpmqhR8NaQz5irF7o99J4wV.jpg',
        overview: 'Scott Lang and Hope van Dyne find themselves exploring the Quantum Realm, interacting with strange creatures and embarking on an adventure that goes beyond the limits of reality.',
        characters: ['Scott Lang', 'Hope van Dyne', 'Kang the Conqueror', 'Cassie Lang'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'recommended',
            loreBridge: 'Explains the Quantum Realm’s position outside of normal space-time and shows the Council of Kangs mapping the multiverse, leaving a power vacuum for Doctor Doom to seize.'
          }
        }
      },
      {
        id: 'deadpool-and-wolverine',
        tmdbId: 533535,
        title: 'Deadpool & Wolverine',
        releaseYear: 2024,
        chronologicalYear: '2024–2025',
        chronologicalOrder: 33,
        releaseOrder: 34,
        phase: 'Phase 5: The Council of Realities',
        runtime: 128,
        runtimeStr: '2h 08m',
        rating: 7.8,
        poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        backdrop_path: '/yDHYTjA3R0jFYba16jBB1ef8oIt.jpg',
        overview: 'A listless Wade Wilson toils in civilian life. When his home world faces an existential threat, he reluctantly suits up with an even more reluctant Wolverine.',
        characters: ['Deadpool', 'Wolverine', 'Cassandra Nova', 'Mr. Paradox', 'Johnny Storm'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL: Introduces the concept of "Anchor Beings" — pivotal individuals whose demise triggers the slow death of their entire home universe. Connects the Fox X-Men universe directly into the MCU timeline.'
          }
        }
      },
      {
        id: 'fantastic-four-first-steps',
        tmdbId: 617126,
        title: 'The Fantastic Four: First Steps',
        releaseYear: 2025,
        chronologicalYear: '1960s (Retro-Futuristic Earth)',
        chronologicalOrder: 35,
        releaseOrder: 36,
        phase: 'Phase 6: The Incursion War',
        runtime: 130,
        runtimeStr: '2h 10m',
        rating: 7.7,
        poster_path: '/mFVo9rMDwZnrjgE5v6c8sF9iR21.jpg',
        backdrop_path: '/yDHYTjA3R0jFYba16jBB1ef8oIt.jpg',
        overview: 'Marvel’s First Family navigates a 1960s retro-futuristic alternate universe while protecting their planet from Galactus, leading straight into the collision of universes.',
        characters: ['Reed Richards (Mister Fantastic)', 'Sue Storm (Invisible Woman)', 'Johnny Storm (Human Torch)', 'Ben Grimm (The Thing)', 'Galactus'],
        prerequisiteFor: {
          'avengers-doomsday': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: The direct prelude to Avengers: Doomsday. Establishes the Fantastic Four as Doctor Doom’s lifelong arch-nemeses and explains how their alternate 1960s Earth collides with Earth-616.'
          }
        }
      },
      {
        id: 'avengers-doomsday-node',
        tmdbId: 1003596,
        title: 'Avengers: Doomsday',
        releaseYear: 2026,
        chronologicalYear: '2026',
        chronologicalOrder: 36,
        releaseOrder: 37,
        phase: 'Phase 6: The Incursion War',
        runtime: 165,
        runtimeStr: '2h 45m (Expected)',
        rating: 9.2,
        poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
        backdrop_path: '/2ssWTSVklAEc98frZUQhgtGHx7s.jpg',
        overview: 'The Avengers reunite to face Victor Von Doom as multiple realities suffer devastating Incursions, forcing surviving heroes to take desperate measures to stop the total extinction of the multiverse.',
        characters: ['Doctor Doom (Robert Downey Jr.)', 'Doctor Strange', 'Spider-Man', 'Fantastic Four', 'Thor', 'Sam Wilson'],
        isTarget: true,
        prerequisiteFor: {}
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
        backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        headline: 'Gotham Under Winter Freeze',
        loreSummary: 'Robert Pattinson returns as Bruce Wayne deeper into his role as Gotham’s protector, facing a fractured city after the flood and the rise of Oz Cobb’s criminal empire.'
      },
      {
        id: 'the-dark-knight-rises',
        title: 'The Dark Knight Rises',
        year: '2012',
        releaseDate: 'July 20, 2012',
        poster_path: '/hrJUZv78q1g3Z7jB06eGj3a5T.jpg',
        backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        headline: 'The Legend Ends',
        loreSummary: 'Eight years after the Joker’s reign of terror, Bruce Wayne must emerge from exile to save Gotham from the ruthless revolutionary Bane.'
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
        rating: 8.2,
        poster_path: '/4MpN4C2vagWi7SVUEyNKMu199Np.jpg',
        backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
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
        rating: 9.0,
        poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdrop_path: '/hkBaDkMWbLaf8B1rDYRtpwnA0ww.jpg',
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
        rating: 8.4,
        poster_path: '/hrJUZv78q1g3Z7jB06eGj3a5T.jpg',
        backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
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
        rating: 7.9,
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        overview: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
        characters: ['Bruce Wayne', 'Selina Kyle', 'The Riddler', 'The Penguin', 'Jim Gordon'],
        prerequisiteFor: {
          'the-batman-2': {
            tier: 'critical',
            loreBridge: 'CRITICAL MUST-WATCH: The direct narrative foundation. Ends with Gotham submerged in a catastrophic flood and Bruce Wayne realizing he must be a symbol of hope rather than vengeance.'
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
        runtimeStr: '8 Episodes (Mini-series)',
        rating: 8.8,
        poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        overview: 'Following the death of Carmine Falcone, Oswald "Oz" Cobb fights to exploit Gotham’s post-flood chaos and seize absolute control of the city’s underworld.',
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
        backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
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
        backdrop_path: '/2ssWTSVklAEc98frZUQhgtGHx7s.jpg',
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
        chronologicalOrder: 4,
        releaseOrder: 1,
        phase: 'The Original Trilogy',
        runtime: 121,
        runtimeStr: '2h 01m',
        rating: 8.6,
        poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdrop_path: '/zqkmTXzjkAgPnHGVggumdn09R.jpg',
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
        chronologicalOrder: 5,
        releaseOrder: 2,
        phase: 'The Original Trilogy',
        runtime: 124,
        runtimeStr: '2h 04m',
        rating: 8.7,
        poster_path: '/nNAeTmF4A9vd7shTknmE4Vv03Hg.jpg',
        backdrop_path: '/2ssWTSVklAEc98frZUQhgtGHx7s.jpg',
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
        chronologicalOrder: 6,
        releaseOrder: 3,
        phase: 'The Original Trilogy',
        runtime: 131,
        runtimeStr: '2h 11m',
        rating: 8.3,
        poster_path: '/mDCBQNhR6R0PVX44l27kP3qS28.jpg',
        backdrop_path: '/zqkmTXzjkAgPnHGVggumdn09R.jpg',
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
        chronologicalOrder: 7,
        releaseOrder: 5,
        phase: 'The Mandoverse',
        runtime: 480,
        runtimeStr: 'Key Episodes',
        rating: 8.7,
        poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdrop_path: '/zqkmTXzjkAgPnHGVggumdn09R.jpg',
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
        chronologicalOrder: 8,
        releaseOrder: 6,
        phase: 'The Mandoverse',
        runtime: 130,
        runtimeStr: '2h 10m (Expected)',
        rating: 8.9,
        poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdrop_path: '/2ssWTSVklAEc98frZUQhgtGHx7s.jpg',
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
        poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg',
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
        rating: 8.0,
        poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
        backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg',
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
        rating: 8.5,
        poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg',
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
        poster_path: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg',
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
        backdrop_path: '/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg',
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
        backdrop_path: '/uUiId6cG32JSRjT6x1M940422.jpg',
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
        rating: 8.4,
        poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop_path: '/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg',
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
        backdrop_path: '/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg',
        overview: 'Miles Morales battles across dimensions to save his father and stop the Spot from collapsing reality itself, shattering the rigid determinism of the Spider-Society.',
        characters: ['Miles Morales', 'Gwen Stacy', 'The Spot', 'Miles G. Morales (Prowler)'],
        isTarget: true,
        prerequisiteFor: {}
      }
    ]
  }
]
