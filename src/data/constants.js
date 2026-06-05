export const TMDB_BASE = 'https://api.themoviedb.org/3'
export const IMG_BASE  = 'https://image.tmdb.org/t/p'

export const imgUrl = (path, size = 'w500') =>
  path ? `${IMG_BASE}/${size}${path}` : null

export const GN = {
  28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
  99:'Documentary', 18:'Drama', 10751:'Family', 14:'Fantasy', 36:'History',
  27:'Horror', 10402:'Music', 9648:'Mystery', 10749:'Romance', 878:'Sci-Fi',
  10770:'TV Movie', 53:'Thriller', 10752:'War', 37:'Western',
}
export const GID = Object.keys(GN).map(Number)

export const MOODS = [
  { id:'thrilled',   emoji:'⚡', label:'Thrilled',    desc:'Edge of your seat', genres:[53,27,28,80],         color:'#ff4444' },
  { id:'happy',      emoji:'😄', label:'Happy',       desc:'Feel-good & fun',   genres:[35,10751,16,12],       color:'#fbbf24' },
  { id:'romantic',   emoji:'💕', label:'Romantic',    desc:'Love stories',      genres:[10749,18,35],          color:'#ec4899' },
  { id:'adventure',  emoji:'🚀', label:'Adventurous', desc:'Epic journeys',     genres:[878,12,28,14],         color:'#0ea5e9' },
  { id:'emotional',  emoji:'😢', label:'Emotional',   desc:'Deep & moving',     genres:[18,10749,36,99],       color:'#8b5cf6' },
  { id:'mysterious', emoji:'🔍', label:'Mysterious',  desc:'Mind-bending',      genres:[9648,53,80,27],        color:'#10b981' },
]

export const MOCK_MOVIES = [
  {
    id: 157336,
    title: "Interstellar",
    poster_path: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    backdrop_path: "/2ssWTSVklAEc98frZUQhgtGHx7s.jpg",
    vote_average: 8.476,
    release_date: "2014-11-05",
    genre_ids: [12, 18, 878],
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage."
  },
  {
    id: 27205,
    title: "Inception",
    poster_path: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    vote_average: 8.372,
    release_date: "2010-07-15",
    genre_ids: [28, 878, 12],
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious."
  },
  {
    id: 603,
    title: "The Matrix",
    poster_path: "/aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg",
    backdrop_path: "/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
    vote_average: 8.247,
    release_date: "1999-03-31",
    genre_ids: [28, 878],
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth."
  },
  {
    id: 335984,
    title: "Blade Runner 2049",
    poster_path: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdrop_path: "/mVr0UiqyltcfqxbAUcLl9zWL8ah.jpg",
    vote_average: 7.595,
    release_date: "2017-10-04",
    genre_ids: [878, 18],
    overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years."
  },
  {
    id: 329865,
    title: "Arrival",
    poster_path: "/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    backdrop_path: "/uKPbFF08QkRMvIAsgCh1soeyPhZ.jpg",
    vote_average: 7.627,
    release_date: "2016-11-10",
    genre_ids: [18, 878, 9648],
    overview: "Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat."
  },
  {
    id: 299534,
    title: "Avengers: Endgame",
    poster_path: "/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    vote_average: 8.236,
    release_date: "2019-04-24",
    genre_ids: [12, 878, 28],
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store."
  },
  {
    id: 550,
    title: "Fight Club",
    poster_path: "/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg",
    backdrop_path: "/xRyINp9KfMLVjRiO5nCsoRDdvvF.jpg",
    vote_average: 8.4,
    release_date: "1999-10-15",
    genre_ids: [18, 53],
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion."
  },
  {
    id: 238,
    title: "The Godfather",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
    vote_average: 8.687,
    release_date: "1972-03-14",
    genre_ids: [18, 80],
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge."
  },
  {
    id: 680,
    title: "Pulp Fiction",
    poster_path: "/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    vote_average: 8.483,
    release_date: "1994-09-10",
    genre_ids: [53, 80, 35],
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time."
  },
  {
    id: 244786,
    title: "Whiplash",
    poster_path: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    backdrop_path: "/wbQa0EnWUyRzQ5d1pHLNRlmsCUP.jpg",
    vote_average: 8.375,
    release_date: "2014-10-10",
    genre_ids: [18, 10402, 53],
    overview: "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity."
  },
  {
    id: 155,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
    vote_average: 8.531,
    release_date: "2008-07-16",
    genre_ids: [28, 80, 53],
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker."
  },
  {
    id: 49026,
    title: "The Dark Knight Rises",
    poster_path: "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg",
    backdrop_path: "/d354XqicJ7vi48YnPDr1vRk5uhZ.jpg",
    vote_average: 7.796,
    release_date: "2012-07-17",
    genre_ids: [28, 80, 18, 53],
    overview: "Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent's crimes to protect the late attorney's reputation and is subsequently hunted by the Gotham City Police Department. Eight years later, Batman encounters the mysterious Selina Kyle and the villainous Bane, a new terrorist leader who overwhelms Gotham's finest. The Dark Knight resurfaces to protect a city that has branded him an enemy."
  },
  {
    id: 315162,
    title: "Puss in Boots: The Last Wish",
    poster_path: "/kuf6dutpsT0vSVehic3EZIqkOBt.jpg",
    backdrop_path: "/jr8tSoJGj33XLgFBy6lmZhpGQNu.jpg",
    vote_average: 8.206,
    release_date: "2022-12-07",
    genre_ids: [16, 12, 14, 35, 10751],
    overview: "Puss in Boots discovers that his passion for adventure has taken its toll: He has burned through eight of his nine lives, leaving him with only one life left. Puss sets out on an epic journey to find the mythical Last Wish and restore his nine lives."
  },
  {
    id: 129,
    title: "Spirited Away",
    poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop_path: "/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg",
    vote_average: 8.534,
    release_date: "2001-07-20",
    genre_ids: [16, 10751, 14],
    overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family."
  },
  {
    id: 118340,
    title: "Guardians of the Galaxy",
    poster_path: "/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
    backdrop_path: "/uLtVbjvS1O7gXL8lUOwsFOH4man.jpg",
    vote_average: 7.906,
    release_date: "2014-07-30",
    genre_ids: [28, 878, 12],
    overview: "Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser."
  },
  {
    id: 346364,
    title: "It",
    poster_path: "/9E2y5Q7WlCVNEhP5GiVTjhEhx1o.jpg",
    backdrop_path: "/qVGpxnjrGlHaSTCqTQI6viBDSfp.jpg",
    vote_average: 7.241,
    release_date: "2017-09-06",
    genre_ids: [27, 53, 18],
    overview: "In a small town in Maine, seven children known as The Losers Club come face to face with life problems, bullies and a monster that takes the shape of a clown called Pennywise."
  },
  {
    id: 9806,
    title: "The Incredibles",
    poster_path: "/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg",
    backdrop_path: "/lxwzY9vNwjDgxWKt3zZ6zcU6rEJ.jpg",
    vote_average: 7.725,
    release_date: "2004-10-27",
    genre_ids: [28, 12, 16, 10751],
    overview: "Bob Parr has given up his superhero days to log in time as an insurance adjuster and raise his three children with his formerly heroic wife in suburbia. But when he receives a mysterious assignment, it's time to get back into costume."
  },
  {
    id: 637,
    title: "Life Is Beautiful",
    poster_path: "/6tEJnof1DKWPnl5lzkjf0FVv7oB.jpg",
    backdrop_path: "/6aNKD81RHR1DqUUa8kOZ1TBY1Lp.jpg",
    vote_average: 8.438,
    release_date: "1997-12-20",
    genre_ids: [35, 18],
    overview: "A touching story of an Italian book seller of Jewish ancestry who lives in his own little fairy tale. His creative and happy life would come to an abrupt halt when his entire family is deported to a concentration camp during World War II. While locked up he tries to convince his son that the whole thing is just a game."
  },
  {
    id: 38757,
    title: "Tangled",
    poster_path: "/ym7Kst6a4uodryxqbGOxmewF235.jpg",
    backdrop_path: "/cWczNud8Y8i8ab0Z4bxos4myWYO.jpg",
    vote_average: 7.613,
    release_date: "2010-11-24",
    genre_ids: [16, 10751, 12],
    overview: "Feisty teenager Rapunzel, who has long and magical hair, wants to go and see sky lanterns on her eighteenth birthday, but she's bound to a tower by her overprotective mother. She strikes a deal with Flynn Rider, a charming wanted thief, and the duo set off on an action-packed escapade."
  },
  {
    id: 497698,
    title: "Black Widow",
    poster_path: "/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
    backdrop_path: "/keIxh0wPr2Ymj0Btjh4gW7JJ89e.jpg",
    vote_average: 7.169,
    release_date: "2021-07-07",
    genre_ids: [28, 12, 878],
    overview: "Natasha Romanoff, also known as Black Widow, confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises. Pursued by a force that will stop at nothing to bring her down, Natasha must deal with her history as a spy and the broken relationships left in her wake long before she became an Avenger."
  },
  {
    id: 891,
    title: "All the President's Men",
    poster_path: "/cPtSHR7D2WGsDBfnC5DxV927hKn.jpg",
    backdrop_path: "/aAMn59bq6DZQtWoYqsIOUkVWSgc.jpg",
    vote_average: 7.659,
    release_date: "1976-04-09",
    genre_ids: [18, 9648, 53],
    overview: "During the 1972 elections, two reporters' investigation sheds light on the controversial Watergate scandal that compels President Nixon to resign from his post."
  },
  {
    id: 556984,
    title: "The Trial of the Chicago 7",
    poster_path: "/ahf5cVdooMAlDRiJOZQNuLqa1Is.jpg",
    backdrop_path: "/v8Nf6Y1qL1Q3PWTBezXNPPaXqza.jpg",
    vote_average: 7.657,
    release_date: "2020-09-25",
    genre_ids: [18, 36],
    overview: "What was supposed to be a peaceful protest turned into a violent clash with the police. What followed was one of the most notorious trials in history."
  },
  {
    id: 424,
    title: "Schindler's List",
    poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    backdrop_path: "/zb6fM1CX41D9rF9hdgclu0peUmy.jpg",
    vote_average: 8.568,
    release_date: "1993-12-15",
    genre_ids: [18, 36, 10752],
    overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II."
  },
  {
    id: 419430,
    title: "Get Out",
    poster_path: "/mE24wUCfjK8AoBBjaMjho7Rczr7.jpg",
    backdrop_path: "/o8dPH0ZSIyyViP6rjRX1djwCUwI.jpg",
    vote_average: 7.623,
    release_date: "2017-02-24",
    genre_ids: [9648, 53, 27],
    overview: "Chris and his girlfriend Rose go upstate to visit her parents for the weekend. At first, Chris reads the family's overly accommodating behavior as nervous attempts to deal with their daughter's interracial relationship, but as the weekend progresses, a series of increasingly disturbing discoveries lead him to a truth that he never could have imagined."
  },
  {
    id: 496243,
    title: "Parasite",
    poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop_path: "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    vote_average: 8.494,
    release_date: "2019-05-30",
    genre_ids: [35, 53, 18],
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident."
  },
  {
    id: 546554,
    title: "Knives Out",
    poster_path: "/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
    backdrop_path: "/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg",
    vote_average: 7.841,
    release_date: "2019-11-27",
    genre_ids: [35, 80, 9648],
    overview: "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate. From Harlan's dysfunctional family to his devoted staff, Blanc sifts through a web of red herrings and self-serving lies to uncover the truth behind Harlan's untimely death."
  },
  {
    id: 313369,
    title: "La La Land",
    poster_path: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    backdrop_path: "/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg",
    vote_average: 7.898,
    release_date: "2016-12-01",
    genre_ids: [35, 18, 10749],
    overview: "Mia, an aspiring actress, serves lattes to movie stars in between auditions and Sebastian, a jazz musician, scrapes by playing cocktail party gigs in dingy bars, but as success mounts they are faced with decisions that begin to fray the fragile fabric of their love affair, and the dreams they worked so hard to maintain in each other threaten to rip them apart."
  },
  {
    id: 38,
    title: "Eternal Sunshine of the Spotless Mind",
    poster_path: "/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg",
    backdrop_path: "/W1ffLQGHoxfAOq0ZYdPtJlvAdb.jpg",
    vote_average: 8.091,
    release_date: "2004-03-19",
    genre_ids: [878, 18, 10749],
    overview: "Joel Barish, heartbroken that his girlfriend underwent a procedure to erase him from her memory, decides to do the same. However, as he watches his memories of her fade away, he realises that he still loves her, and may be too late to correct his mistake."
  }
]
