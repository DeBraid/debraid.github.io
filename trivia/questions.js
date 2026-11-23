/*
  Kids Trivia question bank.
  HOW TO ADD QUESTIONS:
  - Each question: q (question), c (choices: PUT THE CORRECT ANSWER FIRST - the app shuffles them),
    why (short kid-friendly explanation), hint (a narrower Socratic "clue question" shown after a wrong try),
    skill (one of the topic's skill ids), deeper (2-3 "Think Deeper" follow-ups).
  - Follow-up types:
      {t:"mc",   q, c:[correct, wrong, wrong], why, hint?}   multiple choice, +5 bonus (+3 after a hint)
      {t:"talk", q, peek, clue}                              talk-it-out; a grown-up taps "Good thinking!" (+5)
         peek = what a great answer mentions (for the grown-up), clue = a narrower question if they're stuck
*/
window.TRIVIA = {
  topics: [
  {
    id: "hockey", name: "Hockey", emoji: "🏒", color: "#2f80ed",
    skills: [ {id:"rules", name:"Rules & Gear"}, {id:"nhl", name:"NHL & Teams"}, {id:"legends", name:"Legends & Records"} ],
    questions: [
      { q:"How many players does each hockey team have on the ice at full strength, counting the goalie?",
        c:["6","5","7","11"], skill:"rules",
        why:"5 skaters (3 forwards + 2 defence) plus 1 goalie = 6!",
        hint:"Count them up: 3 forwards, 2 defence... and who guards the net?",
        deeper:[
          {t:"mc", q:"If a player gets a penalty, how many players does their team have on the ice now?", c:["5","6","4","3"],
           why:"One player sits in the penalty box, so 6 − 1 = 5. The other team has a 'power play'!", hint:"Start with 6. One player goes to the box. 6 take away 1 is...?"},
          {t:"talk", q:"Why do you think the team on the power play has a better chance to score?",
           peek:"More players than the other team, so someone is usually open for a pass or shot.", clue:"If it's 5 against 4, who has an extra player who might be open?"}
        ]},
      { q:"What is a hockey puck made of?", c:["Rubber","Wood","Metal","Glass"], skill:"rules",
        why:"Pucks are hard black rubber — tough enough to be shot really fast!",
        hint:"It's the same bouncy stuff car tires are made of. What's that called?",
        deeper:[
          {t:"mc", q:"NHL pucks are kept in a freezer before games. Why?", c:["So they bounce less and slide better","So they are heavier","So they glow in the dark","So they smell nice"],
           why:"Cold rubber is less bouncy, so the puck slides flat on the ice instead of hopping around."},
          {t:"talk", q:"What would happen if you tried to play hockey with a tennis ball instead of a puck? Predict!",
           peek:"It would bounce, roll away, be hard to control or shoot along the ice; a flat puck slides.", clue:"A ball is round and a puck is flat. Which one would roll away and bounce?"}
        ]},
      { q:"Which trophy does the NHL champion win?", c:["The Stanley Cup","The Grey Cup","The World Cup","The Golden Puck"], skill:"nhl",
        why:"The Stanley Cup! It's one of the oldest trophies in pro sports — first given out in 1893.",
        hint:"It's named after a person called Lord Stanley...",
        deeper:[
          {t:"mc", q:"Lord Stanley, who gave the Cup, was the ___ of Canada.", c:["Governor General","Prime Minister","Best goalie","King"],
           why:"Lord Stanley of Preston was Canada's Governor General (the King or Queen's representative) in the 1890s."},
          {t:"talk", q:"Every player on the winning team gets their name engraved on the Stanley Cup. Why might that be so special?",
           peek:"It lasts forever / history / everyone can see it / you're part of the team's story with past champions.", clue:"If your name was carved on it, how long would it stay there?"}
        ]},
      { q:"What is it called when a player scores 3 goals in one game?", c:["A hat trick","A triple dip","A power play","A shutout"], skill:"legends",
        why:"A hat trick! Fans sometimes throw their hats onto the ice to celebrate.",
        hint:"Fans celebrate it by throwing something they wear on their heads...",
        deeper:[
          {t:"mc", q:"If a player gets a hat trick in two games in a row, how many goals did they score?", c:["6","5","3","9"],
           why:"3 + 3 = 6 goals. What a week!", hint:"A hat trick is 3. Two of them is 3 + 3 = ?"},
          {t:"mc", q:"A 'shutout' is when a goalie...", c:["Lets in zero goals all game","Shuts the door to the dressing room","Scores a goal","Gets a penalty"],
           why:"A shutout means the goalie stopped every shot — 0 goals against!"}
        ]},
      { q:"Which NHL team plays in Toronto?", c:["Maple Leafs","Canadiens","Oilers","Canucks"], skill:"nhl",
        why:"The Toronto Maple Leafs! Canada's leaf is on their jersey.",
        hint:"Look at Canada's flag — what's in the middle? The team is named after it!",
        deeper:[
          {t:"mc", q:"Which NHL team plays in Montreal and has won the most Stanley Cups?", c:["Canadiens","Senators","Flames","Jets"],
           why:"The Montreal Canadiens have won 24 Stanley Cups — more than any other team!"},
          {t:"mc", q:"How many NHL teams are in Canada?", c:["7","3","12","1"],
           why:"Toronto, Montreal, Ottawa, Winnipeg, Calgary, Edmonton and Vancouver = 7 teams."},
          {t:"talk", q:"Teams pick names like Maple Leafs, Flames or Canucks. If YOUR town got an NHL team, what would you name it — and WHY?",
           peek:"Any name is fine — the bonus is for giving a reason (connects to the town, an animal there, history, etc.).", clue:"What is your town famous for? An animal, a place, a thing?"}
        ]},
      { q:"What is Wayne Gretzky's famous nickname?", c:["The Great One","The Rocket","Mr. Hockey","Sid the Kid"], skill:"legends",
        why:"\"The Great One\"! Gretzky scored 894 NHL goals and was born in Brantford, Ontario.",
        hint:"Gretzky was SO good people just called him the ___ One.",
        deeper:[
          {t:"mc", q:"Gretzky's number 99 is retired by EVERY NHL team. What does that mean?", c:["No NHL player can ever wear 99 again","He played until he was 99","He scored 99 goals in one game","Every team has 99 players"],
           why:"Retiring a number honours a player — nobody in the NHL can wear 99 again."},
          {t:"talk", q:"Gretzky said he skated \"to where the puck is going to be, not where it has been.\" What do you think he meant?",
           peek:"Predict/think ahead — get to the spot before the puck does instead of chasing it.", clue:"If you chase the puck, you're always behind it. What if you guessed where it would go next?"}
        ]},
      { q:"What is the machine that makes the ice smooth between periods?", c:["Zamboni","Snowplow","Ice-o-matic","Bulldozer"], skill:"rules",
        why:"The Zamboni! It shaves the bumpy ice and lays down a thin layer of water that freezes smooth.",
        hint:"It starts with the letter Z!",
        deeper:[
          {t:"mc", q:"The Zamboni spreads a thin layer of ___ that freezes into new smooth ice.", c:["Warm water","Sand","Salt","Snow"],
           why:"Warm water! It melts into the scratches, fills them in, then freezes nice and smooth."},
          {t:"talk", q:"Why would skates go faster on smooth ice than on scratched-up, bumpy ice?",
           peek:"Bumps and grooves catch the blades / slow you down; smooth = less friction.", clue:"Is it easier to ride a bike on a smooth road or a bumpy gravel road?"}
        ]},
      { q:"How long is one period in an NHL game?", c:["20 minutes","10 minutes","15 minutes","45 minutes"], skill:"rules",
        why:"20 minutes of game clock — and there are 3 periods.",
        hint:"It's longer than 15 minutes but shorter than half an hour.",
        deeper:[
          {t:"mc", q:"3 periods of 20 minutes each. How many minutes of hockey is that?", c:["60","40","23","80"],
           why:"20 + 20 + 20 = 60 minutes, which is exactly 1 hour of game clock!", hint:"What is 20 + 20? Now add one more 20."},
          {t:"mc", q:"If an NHL regular-season game is tied after 3 periods, what happens?", c:["Overtime (then a shootout if still tied)","Both teams lose","They flip a coin","They play again next week"],
           why:"Overtime! If nobody scores in overtime, there's a shootout."}
        ]},
      { q:"Where does a player go when they get a penalty?", c:["The penalty box","The dressing room","The Zamboni","The stands"], skill:"rules",
        why:"The penalty box (or 'sin bin')! A minor penalty is 2 minutes.",
        hint:"It's a little box beside the ice with the word 'penalty' in its name.",
        deeper:[
          {t:"mc", q:"How long is a minor penalty in the NHL?", c:["2 minutes","10 seconds","20 minutes","5 hours"],
           why:"A minor penalty is 2 minutes. (A major penalty is 5.)"},
          {t:"talk", q:"Why do you think hockey has penalties at all? What would happen without them?",
           peek:"Keeps players safe and the game fair; without them people might trip/hit and get hurt.", clue:"What might players do if tripping had no consequence?"}
        ]},
      { q:"Hockey is Canada's official national ___ sport.", c:["Winter","Summer","Water","Indoor"], skill:"legends",
        why:"Hockey is Canada's national WINTER sport (since 1994).",
        hint:"Think about when we skate on frozen ponds!",
        deeper:[
          {t:"mc", q:"So what is Canada's national SUMMER sport?", c:["Lacrosse","Baseball","Soccer","Swimming"],
           why:"Lacrosse! It was first played by Indigenous peoples hundreds of years ago."},
          {t:"talk", q:"Why do you think hockey became so popular in Canada long before indoor rinks were everywhere?",
           peek:"Long cold winters, lots of frozen lakes, ponds and rivers to skate on.", clue:"What happens to lakes and ponds in a Canadian winter?"}
        ]}
    ]
  },
  {
    id: "baseball", name: "Baseball", emoji: "⚾", color: "#eb5757",
    skills: [ {id:"rules", name:"Rules"}, {id:"teams", name:"Teams & Heroes"}, {id:"math", name:"Baseball Math"} ],
    questions: [
      { q:"How many strikes does it take to strike out?", c:["3","2","4","5"], skill:"rules",
        why:"\"Strike one, strike two, strike three — you're OUT!\"",
        hint:"The umpire counts \"strike one, strike two, strike...\" what's next?",
        deeper:[
          {t:"mc", q:"How many 'balls' (bad pitches) does a batter need to get a walk to first base?", c:["4","3","2","6"],
           why:"Four balls = a walk. The batter gets to go to first base for free."},
          {t:"talk", q:"Why might a smart batter NOT swing at a pitch way outside?",
           peek:"Hard to hit well; if they don't swing it's a 'ball', getting closer to a walk.", clue:"If you don't swing and the pitch is outside, is it a ball or a strike?"}
        ]},
      { q:"How many players does the fielding team have on the field?", c:["9","6","11","5"], skill:"rules",
        why:"9 players: pitcher, catcher, 4 infielders and 3 outfielders.",
        hint:"Pitcher + catcher = 2. Four in the infield, three in the outfield. Add them up!",
        deeper:[
          {t:"mc", q:"Which player stands on the mound in the middle of the infield?", c:["The pitcher","The catcher","The shortstop","The umpire"],
           why:"The pitcher throws from the mound — a little hill in the middle of the diamond."},
          {t:"talk", q:"The catcher wears a mask, chest protector and shin guards. Why does the catcher need more gear than other players?",
           peek:"Fast pitches and foul tips come right at them all game long.", clue:"Who is closest to the batter and catching every single pitch?"}
        ]},
      { q:"Which Major League Baseball team plays in Canada?", c:["Toronto Blue Jays","New York Yankees","Boston Red Sox","Chicago Cubs"], skill:"teams",
        why:"The Toronto Blue Jays — Canada's MLB team!",
        hint:"It's named after a blue bird...",
        deeper:[
          {t:"mc", q:"The Blue Jays won back-to-back World Series championships in...", c:["1992 and 1993","2000 and 2001","1950 and 1951","They never won"],
           why:"1992 and 1993! Joe Carter's walk-off home run won it in 1993."},
          {t:"mc", q:"What is the Blue Jays' home stadium called?", c:["Rogers Centre","Fenway Park","Wrigley Field","Scotiabank Arena"],
           why:"Rogers Centre in Toronto — its roof can open and close!"},
          {t:"talk", q:"The Rogers Centre has a roof that opens and closes. Why would that be handy for baseball in Toronto?",
           peek:"Rain/cold/snow in spring and fall — close it; open it on sunny days.", clue:"What's Toronto weather like in April?"}
        ]},
      { q:"What do you call hitting the ball over the outfield fence?", c:["A home run","A strikeout","A bunt","A foul ball"], skill:"rules",
        why:"A home run! The batter gets to jog around all the bases.",
        hint:"The batter gets to run all the way around back to ___ plate.",
        deeper:[
          {t:"mc", q:"A home run when all three bases have runners on them is called a...", c:["Grand slam","Triple play","Hat trick","Touchdown"],
           why:"A grand slam! The biggest hit in baseball."},
          {t:"mc", q:"How many runs score on a grand slam?", c:["4","3","1","5"],
           why:"3 runners on base + the batter = 4 runs!", hint:"There are 3 runners on base. Then the batter scores too. 3 + 1 = ?"}
        ]},
      { q:"How many innings are in a regular Major League game?", c:["9","7","5","12"], skill:"rules",
        why:"9 innings! If it's tied, they play extra innings.",
        hint:"It's one less than 10.",
        deeper:[
          {t:"mc", q:"Each team gets 3 outs in an inning. In 9 innings, how many outs does a team get when batting?", c:["27","12","9","30"],
           why:"3 × 9 = 27 outs!", hint:"3 outs, 9 times. Try counting by 3s: 3, 6, 9, 12..."},
          {t:"mc", q:"What happens if the game is tied after 9 innings?", c:["Extra innings","It's a tie, go home","Penalty shots","Coin flip"],
           why:"They keep playing extra innings until someone is ahead after a full inning."}
        ]},
      { q:"How many bases are there, counting home plate?", c:["4","3","5","9"], skill:"rules",
        why:"First, second, third... and home! That's 4.",
        hint:"First, second, third — plus home. Count them!",
        deeper:[
          {t:"mc", q:"The infield is shaped like a...", c:["Diamond (a square turned on its corner)","Circle","Triangle","Star"],
           why:"It's called the diamond! It's really a square tipped on its corner."},
          {t:"talk", q:"After hitting the ball, why do batters run THROUGH first base instead of stopping on it?",
           peek:"Stopping slows you down; you're allowed to overrun first base, so running through is fastest.", clue:"Is it faster to stop on a spot or run right past it?"}
        ]},
      { q:"Which baseball hero broke the colour barrier in 1947 — after playing a season in Montreal?", c:["Jackie Robinson","Babe Ruth","Derek Jeter","Joe Carter"], skill:"teams",
        why:"Jackie Robinson! He played for the Montreal Royals in 1946, then became the first Black player in modern Major League Baseball.",
        hint:"His number was 42, and every MLB team has retired it.",
        deeper:[
          {t:"mc", q:"On Jackie Robinson Day (April 15), what do ALL MLB players do?", c:["Wear number 42","Play barefoot","Bat left-handed","Skip the game"],
           why:"Everyone wears 42 to honour him!"},
          {t:"talk", q:"Why was it so brave for Jackie Robinson to be the first Black player in the major leagues?",
           peek:"Faced unfair treatment/racism and mean crowds but stayed calm, played great, opened the door for others.", clue:"How do you think some people treated him back then? How did he respond?"}
        ]},
      { q:"In the middle of the 7th inning, what do fans do?", c:["Stand up, stretch and sing","Go home","Run onto the field","Take a nap"], skill:"teams",
        why:"The seventh-inning stretch! Fans sing \"Take Me Out to the Ball Game.\"",
        hint:"It's called the seventh-inning ___. Sounds like what you do when you wake up!",
        deeper:[
          {t:"mc", q:"In \"Take Me Out to the Ball Game,\" the fan asks for peanuts and...", c:["Cracker Jack","Pizza","Hot chocolate","Popcorn"],
           why:"\"Buy me some peanuts and Cracker Jack!\""},
          {t:"talk", q:"Why might it be a good idea to stand up and stretch halfway through a long game — or a long car ride?",
           peek:"Sitting a long time makes you stiff/sleepy; moving gets blood flowing.", clue:"How do your legs feel after sitting for a really long time?"}
        ]},
      { q:"A batter gets 3 hits in 10 tries. What is their batting average?", c:[".300",".030","3.10",".100"], skill:"math",
        why:"3 out of 10 = 0.300 (we say 'three hundred'). That's really good in the big leagues!",
        hint:"3 out of 10 is like 30 out of 100. Which answer has a 3 right after the dot?",
        deeper:[
          {t:"mc", q:"What would 2 hits in 4 tries be?", c:[".500",".200",".240",".024"],
           why:"2 out of 4 is half, and half is .500!", hint:"Is 2 out of 4 more or less than half?"},
          {t:"talk", q:"A .300 hitter is a star — but that means they DON'T get a hit 7 times out of 10! What does that teach us about trying hard things?",
           peek:"Even the best fail a lot; keep trying, mistakes are normal.", clue:"If even the best players miss most of the time, should you give up after a miss?"}
        ]},
      { q:"What is a 'double play'?", c:["Getting 2 outs on one play","Playing two games in one day","Hitting the ball twice","Two pitchers at once"], skill:"rules",
        why:"Two outs on one play — like a ground ball, throw to second, then to first!",
        hint:"'Double' means two. Two of what does the fielding team want?",
        deeper:[
          {t:"mc", q:"So what would a TRIPLE play be?", c:["3 outs on one play","3 home runs","3 strikes","3 games"],
           why:"Three outs on one play — the whole inning ends in one moment!"},
          {t:"talk", q:"Triple plays are super rare. Why? What has to happen for one to be possible?",
           peek:"Need at least 2 runners on base and no outs, plus a perfect hit and super-fast fielding.", clue:"How many runners need to be on base to get 3 outs at once?"}
        ]}
    ]
  },
  {
    id: "science", name: "Science & Nature", emoji: "🔬", color: "#27ae60",
    skills: [ {id:"animals", name:"Animals"}, {id:"space", name:"Space"}, {id:"earth", name:"Earth & Plants"}, {id:"body", name:"Human Body"} ],
    questions: [
      { q:"What is the biggest planet in our solar system?", c:["Jupiter","Earth","Mars","Saturn"], skill:"space",
        why:"Jupiter! More than 1,000 Earths could fit inside it.",
        hint:"It's a gas giant with a big red spot.",
        deeper:[
          {t:"mc", q:"Jupiter's 'Great Red Spot' is actually a...", c:["Giant storm","Volcano","Ocean","Painted dot"],
           why:"A giant storm bigger than Earth that has been swirling for hundreds of years!"},
          {t:"talk", q:"Jupiter is made mostly of gas. Could a spaceship land on it like it lands on the Moon? Why or why not?",
           peek:"No solid ground to land on — it would sink deeper into the gas until crushed.", clue:"Can you stand on a cloud?"}
        ]},
      { q:"What sweet food do honeybees make?", c:["Honey","Maple syrup","Jam","Chocolate"], skill:"animals",
        why:"Honey! Bees make it from flower nectar.",
        hint:"It's right in their name — HONEYbees!",
        deeper:[
          {t:"mc", q:"When bees carry pollen from flower to flower, they help plants make...", c:["Seeds and fruit","Rocks","Rain","Leaves fall off"],
           why:"Pollination helps plants make seeds and fruit — like apples and blueberries!"},
          {t:"talk", q:"What might happen to some of our food if there were no bees?",
           peek:"Fewer fruits/veggies because plants wouldn't get pollinated.", clue:"Bees help plants make fruit. No bees means...?"}
        ]},
      { q:"Plants take in which gas from the air to make their food?", c:["Carbon dioxide","Oxygen","Helium","Steam"], skill:"earth",
        why:"Carbon dioxide — the gas we breathe out! Plants use it plus sunlight and water.",
        hint:"It's the gas WE breathe OUT.",
        deeper:[
          {t:"mc", q:"And what gas do plants give off that we need to breathe?", c:["Oxygen","Carbon dioxide","Helium","Smoke"],
           why:"Oxygen! Plants and people are a great team."},
          {t:"talk", q:"We breathe out what plants need, and plants give off what we need. Why is that a great team?",
           peek:"Each helps the other / a cycle; protects trees/plants.", clue:"What do we give plants, and what do they give us back?"}
        ]},
      { q:"What is the biggest animal that has ever lived?", c:["Blue whale","T. rex","African elephant","Giraffe"], skill:"animals",
        why:"The blue whale — bigger than any dinosaur! It can be about 30 metres long.",
        hint:"It's bigger than any dinosaur, and it lives in the ocean.",
        deeper:[
          {t:"mc", q:"Is a whale a fish or a mammal?", c:["Mammal","Fish","Reptile","Bird"],
           why:"Whales are mammals — they breathe air and feed their babies milk."},
          {t:"talk", q:"Whales live underwater but breathe air. What problem does that cause, and how do they solve it?",
           peek:"Must come up to the surface to breathe through a blowhole, and hold their breath underwater.", clue:"Where is the air? What's on top of a whale's head?"}
        ]},
      { q:"At what temperature does water freeze?", c:["0°C","10°C","100°C","−50°C"], skill:"earth",
        why:"Water freezes at 0 degrees Celsius.",
        hint:"It's a nice round number — the number for nothing!",
        deeper:[
          {t:"mc", q:"At what temperature does water boil?", c:["100°C","50°C","0°C","1000°C"],
           why:"100°C. So water is liquid between 0 and 100."},
          {t:"talk", q:"Why do trucks put salt on icy roads in winter?",
           peek:"Salt water freezes at a colder temperature, so the salt melts ice/keeps it from freezing.", clue:"Does salty ocean water freeze as easily as a puddle?"}
        ]},
      { q:"How many legs does a spider have?", c:["8","6","10","4"], skill:"animals",
        why:"8 legs! Spiders are arachnids, not insects.",
        hint:"Count 4 on each side. 4 + 4 = ?",
        deeper:[
          {t:"mc", q:"How many legs does an insect have?", c:["6","8","4","100"],
           why:"Insects have 6 legs — like ants, bees and ladybugs."},
          {t:"mc", q:"Sam says: \"A spider is a bug, so it's an insect.\" What's wrong?", c:["Spiders have 8 legs, insects have 6","Nothing, Sam is right","Spiders are birds","Spiders have no legs"],
           why:"Spiders have 8 legs and 2 body parts — insects have 6 legs and 3 body parts. Different groups!"}
        ]},
      { q:"What is the closest star to Earth?", c:["The Sun","The North Star","The Moon","Mars"], skill:"space",
        why:"The Sun is a star — our very own star!",
        hint:"It's the brightest thing in the daytime sky.",
        deeper:[
          {t:"mc", q:"Is the Moon a star?", c:["No — it reflects light from the Sun","Yes, the biggest star","Yes, a tiny star","Only at night"],
           why:"The Moon makes no light of its own. It shines because sunlight bounces off it."},
          {t:"talk", q:"Why does the Moon seem to change shape during the month?",
           peek:"We see different amounts of its sunlit side as it travels around Earth (phases).", clue:"Half the Moon is always lit by the Sun. Do we always see that whole lit half?"}
        ]},
      { q:"Which animal is a national symbol of Canada and is famous for building dams?", c:["Beaver","Moose","Polar bear","Raccoon"], skill:"animals",
        why:"The beaver! It's even on the Canadian nickel.",
        hint:"Look at a 5-cent coin (a nickel)!",
        deeper:[
          {t:"mc", q:"Beavers build their dams mostly with...", c:["Sticks, logs and mud","Bricks","Snow","Leaves only"],
           why:"Sticks, logs and mud — they chew down trees with their strong orange teeth!"},
          {t:"talk", q:"Why do beavers build dams? How does a pond help keep them safe?",
           peek:"Makes a deep pond; lodge entrance is underwater so predators can't get in; water doesn't freeze to the bottom.", clue:"Can a wolf swim underwater to sneak into a beaver's home?"}
        ]},
      { q:"What causes day and night?", c:["The Earth spinning","The Sun turning off","The Moon blocking the Sun","Clouds"], skill:"space",
        why:"Earth spins like a top! The side facing the Sun has day; the other side has night.",
        hint:"Earth is always moving like a spinning top. What happens to the side facing away from the Sun?",
        deeper:[
          {t:"mc", q:"About how long does Earth take to spin around once?", c:["24 hours (1 day)","1 hour","1 year","1 week"],
           why:"One spin = one day = about 24 hours."},
          {t:"mc", q:"So what takes one whole YEAR?", c:["Earth going all the way around the Sun","Earth spinning once","The Moon spinning","A sunset"],
           why:"One trip around the Sun takes about 365 days — a year!"},
          {t:"talk", q:"When it's daytime in Canada, is it daytime everywhere on Earth? Why?",
           peek:"No — the other side of Earth faces away from the Sun, so it's night there (e.g., Australia/Asia).", clue:"If you shine a flashlight on a ball, does the whole ball light up?"}
        ]},
      { q:"Which part of your body pumps blood?", c:["Heart","Lungs","Brain","Stomach"], skill:"body",
        why:"Your heart! It's a strong muscle about the size of your fist.",
        hint:"Put your hand on your chest — what's going thump-thump?",
        deeper:[
          {t:"mc", q:"When you run fast, your heart beats...", c:["Faster","Slower","It stops","The same"],
           why:"Faster! Try it at the next rest stop."},
          {t:"talk", q:"WHY does your heart beat faster when you exercise?",
           peek:"Muscles need more oxygen/energy, so the heart pumps more blood to deliver it.", clue:"Your blood carries oxygen. Your running muscles need lots of it. So what should the heart do?"}
        ]}
    ]
  },
  {
    id: "math", name: "Math & Counting", emoji: "🔢", color: "#f2994a",
    skills: [ {id:"add", name:"Adding & Subtracting"}, {id:"times", name:"Times & Sharing"}, {id:"patterns", name:"Patterns & Numbers"}, {id:"shapes", name:"Shapes, Money & Time"} ],
    questions: [
      { q:"What is 7 + 8?", c:["15","14","16","13"], skill:"add",
        why:"7 + 8 = 15. Trick: 7 + 7 = 14, plus 1 more = 15!",
        hint:"What's 7 + 7? Now add just one more.",
        deeper:[
          {t:"mc", q:"So what is 8 + 7?", c:["15","16","14","87"],
           why:"Still 15! Adding in a different order gives the same answer."},
          {t:"talk", q:"Explain YOUR trick for adding 7 + 8 in your head.",
           peek:"Any real strategy: doubles + 1 (7+7+1), make 10 (8+2=10, then +5), counting on, etc.", clue:"Could you use 7 + 7, or make a 10 first?"}
        ]},
      { q:"How many sides does a hexagon have?", c:["6","5","8","4"], skill:"shapes",
        why:"6 sides! 'Hex' means six.",
        hint:"A honeycomb is full of these shapes. Count: it has one more side than a pentagon (5).",
        deeper:[
          {t:"mc", q:"A stop sign is an octagon. How many sides does it have?", c:["8","6","10","4"],
           why:"8 sides — 'octo' means eight, like an octopus's 8 arms!"},
          {t:"mc", q:"Honeybees build their honeycomb cells in which shape?", c:["Hexagon","Circle","Triangle","Star"],
           why:"Hexagons! They fit together with no gaps."},
          {t:"talk", q:"Why might bees use hexagons instead of circles for honeycomb?",
           peek:"Hexagons fit together with no gaps / use less wax / strong; circles leave gaps.", clue:"Draw a bunch of circles touching each other. What do you see between them?"}
        ]},
      { q:"What comes next? 2, 4, 6, 8, ___", c:["10","9","12","16"], skill:"patterns",
        why:"Counting by 2s: 10!",
        hint:"How much bigger is each number than the one before it?",
        deeper:[
          {t:"mc", q:"What comes next? 5, 10, 15, 20, ___", c:["25","30","21","40"],
           why:"Counting by 5s — 25!"},
          {t:"mc", q:"Tricky one! What comes next? 1, 2, 4, 8, 16, ___", c:["32","18","24","20"],
           why:"Each number DOUBLES! 16 + 16 = 32.", hint:"Look: 1→2→4→8. Are we adding the same amount, or doing something else each time?"}
        ]},
      { q:"What is 3 × 4?", c:["12","7","9","34"], skill:"times",
        why:"3 groups of 4 = 4 + 4 + 4 = 12.",
        hint:"Picture 3 groups of 4 hockey pucks. Count by 4s: 4, 8, ...",
        deeper:[
          {t:"mc", q:"What is 4 × 3?", c:["12","43","7","16"],
           why:"Also 12! Swapping the numbers in multiplication gives the same answer."},
          {t:"talk", q:"WHY is 3 × 4 the same as 4 × 3? Try imagining dots in rows.",
           peek:"3 rows of 4 dots turned sideways is 4 rows of 3 — same dots, so same total.", clue:"Picture 3 rows of 4 dots. Now turn your head sideways. How many rows now?"}
        ]},
      { q:"You have a loonie ($1) and buy a freezie for 75¢. How much change do you get?", c:["25¢","50¢","75¢","$1"], skill:"shapes",
        why:"100¢ − 75¢ = 25¢ — that's one quarter!",
        hint:"A loonie is 100 cents. How many more cents does 75 need to get to 100?",
        deeper:[
          {t:"mc", q:"How many quarters make a loonie?", c:["4","2","10","5"],
           why:"25 + 25 + 25 + 25 = 100 cents = $1."},
          {t:"mc", q:"Why is Canada's $1 coin called the 'loonie'?", c:["It has a loon (a bird) on it","It's silly","It's round like the Moon","It was made on a Monday"],
           why:"It has a loon on it! And the $2 coin got the nickname 'toonie'."}
        ]},
      { q:"How many minutes are in one hour?", c:["60","100","30","24"], skill:"shapes",
        why:"60 minutes in an hour.",
        hint:"A hockey game has 3 periods of 20 minutes — that's exactly one hour!",
        deeper:[
          {t:"mc", q:"Our car ride is 2 hours. How many minutes is that?", c:["120","200","60","90"],
           why:"60 + 60 = 120 minutes.", hint:"One hour is 60 minutes. What's 60 + 60?"},
          {t:"mc", q:"We've driven 45 minutes of a 1-hour trip. How many minutes are left?", c:["15","25","5","55"],
           why:"60 − 45 = 15 minutes. Almost there!", hint:"Count up from 45 to 60. 50, 55, 60 — how many minutes is that?"}
        ]},
      { q:"What is half of 18?", c:["9","8","6","36"], skill:"times",
        why:"18 split into 2 equal groups = 9 each. (9 + 9 = 18)",
        hint:"What number plus itself makes 18?",
        deeper:[
          {t:"mc", q:"4 kids share 12 cookies equally. How many does each kid get?", c:["3","4","6","2"],
           why:"12 ÷ 4 = 3 cookies each.", hint:"Deal them out one at a time: each kid gets 1 (4 used), then 2 (8 used)..."},
          {t:"talk", q:"What is half of 9? Can you explain how you figured it out?",
           peek:"4 and a half (4.5). E.g., half of 8 is 4, half of the leftover 1 is a half.", clue:"Half of 8 is 4. What about the 1 that's left over?"}
        ]},
      { q:"How many wheels are on 3 cars?", c:["12","9","4","15"], skill:"times",
        why:"Each car has 4 wheels: 4 + 4 + 4 = 12.",
        hint:"One car has 4 wheels. Count by 4s three times.",
        deeper:[
          {t:"mc", q:"How many wheels on 3 cars AND 2 bikes?", c:["16","14","12","20"],
           why:"12 car wheels + 4 bike wheels = 16.", hint:"You already know 3 cars = 12 wheels. How many wheels do 2 bikes have?"},
          {t:"talk", q:"Car game! Look out the window at the next 3 vehicles. How many wheels in total? Explain how you counted.",
           peek:"Any reasonable count with an explanation (trucks may have more than 4 wheels!).", clue:"Count each vehicle's wheels one at a time, then add."}
        ]},
      { q:"What is 10 × 10?", c:["100","20","1000","110"], skill:"times",
        why:"10 groups of 10 = 100!",
        hint:"Count by 10s, ten times: 10, 20, 30...",
        deeper:[
          {t:"mc", q:"What is 10 × 10 × 10?", c:["1,000","300","100","30"],
           why:"100 × 10 = 1,000. A thousand!"},
          {t:"talk", q:"What's a fast trick for multiplying a number by 10? Does it work for 7 × 10? 25 × 10?",
           peek:"Add a zero on the end (70, 250).", clue:"Look at 3 × 10 = 30 and 5 × 10 = 50. What changed?"}
        ]},
      { q:"Is 17 an odd or even number?", c:["Odd","Even","Both","Neither"], skill:"patterns",
        why:"Odd! You can't split 17 into two equal groups — one is always left over.",
        hint:"Even numbers end in 0, 2, 4, 6 or 8. What does 17 end in?",
        deeper:[
          {t:"mc", q:"What do you get when you add two ODD numbers, like 3 + 5?", c:["Always even","Always odd","Always 8","Sometimes zero"],
           why:"Odd + odd = even every time! The two leftovers pair up.", hint:"Try a few: 1 + 1, 3 + 5, 7 + 9. Are the answers odd or even?"},
          {t:"mc", q:"Mia says: \"Really big numbers are always even.\" Is she right?", c:["No — like 101 is odd","Yes","Only on Tuesdays","Yes, if it's over 100"],
           why:"Nope! Big numbers can be odd too, like 101 or 999. It's the last digit that matters."}
        ]}
    ]
  },
  {
    id: "history", name: "History", emoji: "🏰", color: "#9b51e0",
    skills: [ {id:"canada", name:"Canadian History"}, {id:"ancient", name:"Ancient World"}, {id:"inventors", name:"Inventors & Heroes"} ],
    questions: [
      { q:"In what year did Canada become a country (Confederation)?", c:["1867","1776","1912","1967"], skill:"canada",
        why:"July 1, 1867 — that's why we celebrate Canada Day on July 1st!",
        hint:"Canada turned 150 years old in 2017. What's 2017 minus 150?",
        deeper:[
          {t:"mc", q:"How many provinces joined together to make Canada in 1867?", c:["4","10","13","2"],
           why:"4: Ontario, Quebec, Nova Scotia and New Brunswick. Others joined later!"},
          {t:"mc", q:"Canada turned 150 in 2017. How old will Canada be in 2027?", c:["160","157","170","151"],
           why:"10 years after 150 → 160!", hint:"How many years is it from 2017 to 2027?"}
        ]},
      { q:"Who lived in the land we now call Canada long before European explorers arrived?", c:["Indigenous peoples (like First Nations and Inuit)","The Romans","Nobody","The Egyptians"], skill:"canada",
        why:"Indigenous peoples have lived here for thousands of years!",
        hint:"These people were here FIRST — long, long before ships came from Europe.",
        deeper:[
          {t:"mc", q:"The word 'Canada' probably comes from an Iroquoian word 'kanata'. What does it mean?", c:["Village","Snow","Hockey","Maple"],
           why:"'Kanata' means village or settlement."},
          {t:"talk", q:"If the name 'Canada' comes from an Indigenous word, what does that tell us about who was here first?",
           peek:"Indigenous peoples were here first and their languages/names shaped the country.", clue:"Whose language did the name come from?"}
        ]},
      { q:"Ancient Egyptians built giant triangle-shaped tombs called...", c:["Pyramids","Castles","Igloos","Skyscrapers"], skill:"ancient",
        why:"Pyramids! The Great Pyramid is about 4,500 years old.",
        hint:"Pointy on top, square on the bottom, in the desert of Egypt.",
        deeper:[
          {t:"mc", q:"What were the kings of ancient Egypt called?", c:["Pharaohs","Emperors","Prime Ministers","Mayors"],
           why:"Pharaohs! Some were buried in the pyramids."},
          {t:"talk", q:"They had no cranes or trucks. How do you think they moved giant stone blocks?",
           peek:"Ramps, sledges, rollers/logs, ropes, wetting the sand, LOTS of workers.", clue:"How would you move something super heavy with lots of friends, rope and some logs?"}
        ]},
      { q:"Who is famous for inventing the telephone and did some of his work in Brantford, Ontario?", c:["Alexander Graham Bell","Thomas Edison","Albert Einstein","The Wright brothers"], skill:"inventors",
        why:"Alexander Graham Bell! The first long-distance call was made in Ontario in 1876.",
        hint:"His last name is something that rings!",
        deeper:[
          {t:"mc", q:"Which hockey legend was also born in Brantford, Ontario?", c:["Wayne Gretzky","Sidney Crosby","Connor McDavid","Bobby Orr"],
           why:"Wayne Gretzky! Brantford is called 'The Telephone City'."},
          {t:"talk", q:"Before telephones, how did people send messages to someone far away?",
           peek:"Letters/mail, telegraph, messengers, riders on horses, smoke signals.", clue:"How would you send a message to Grandma if there were no phones or internet?"}
        ]},
      { q:"About 1,000 years ago, Vikings sailed to North America. Where did they land in Canada?", c:["Newfoundland","Toronto","Vancouver","Saskatchewan"], skill:"ancient",
        why:"L'Anse aux Meadows in Newfoundland — the oldest known European site in North America!",
        hint:"It's on the far EAST coast, closest to Europe.",
        deeper:[
          {t:"mc", q:"What kind of boats did Vikings sail in?", c:["Longships","Canoes","Steamships","Submarines"],
           why:"Longships — long, narrow wooden boats with a sail and oars."},
          {t:"talk", q:"Why would a long, narrow boat be good for crossing oceans AND sailing up rivers?",
           peek:"Narrow = fast and cuts through waves; shallow = can go up rivers / land on beaches.", clue:"Is it easier to push a skinny canoe or a wide bathtub through water?"}
        ]},
      { q:"Who was the first person to walk on the Moon (in 1969)?", c:["Neil Armstrong","Chris Hadfield","Christopher Columbus","Amelia Earhart"], skill:"inventors",
        why:"Neil Armstrong — \"That's one small step for a man, one giant leap for mankind.\"",
        hint:"His last name has the word 'arm' in it!",
        deeper:[
          {t:"mc", q:"Chris Hadfield, who played guitar on the space station, is an astronaut from...", c:["Canada","Brazil","France","Japan"],
           why:"Canada! He was the first Canadian to command the International Space Station."},
          {t:"talk", q:"The astronauts' footprints are probably still on the Moon today. Why haven't they blown away?",
           peek:"No wind, no rain, no air/weather on the Moon to wipe them away.", clue:"What wipes away footprints on a beach here on Earth? Does the Moon have that?"}
        ]},
      { q:"A Canadian named James Naismith invented which sport in 1891?", c:["Basketball","Hockey","Soccer","Golf"], skill:"inventors",
        why:"Basketball! James Naismith was from near Almonte, Ontario.",
        hint:"The first game used peach baskets as hoops...",
        deeper:[
          {t:"mc", q:"What did the very first basketball games use as hoops?", c:["Peach baskets","Hula hoops","Buckets of water","Tires"],
           why:"Peach baskets nailed to a balcony!"},
          {t:"talk", q:"The first peach baskets still had bottoms. What problem did that cause, and how would you fix it?",
           peek:"Someone had to climb up and get the ball out after every basket; cut out the bottom / use a net.", clue:"After a basket, where is the ball? How do you get it out?"}
        ]},
      { q:"What did the ancient Romans build to carry water into their cities?", c:["Aqueducts","Water slides","Pipelines of plastic","Ice roads"], skill:"ancient",
        why:"Aqueducts — long stone channels and bridges that carried water for many kilometres!",
        hint:"'Aqua' means water. The answer starts with 'aqua'...",
        deeper:[
          {t:"mc", q:"With no electric pumps, what made the water flow through an aqueduct?", c:["Gravity — a gentle downhill slope","Horses pushing it","Magic","Wind"],
           why:"Gravity! The aqueducts sloped very slightly downhill the whole way."},
          {t:"talk", q:"Why do you think a big city needed so much clean water?",
           peek:"Drinking, cooking, washing, baths, fountains, staying healthy.", clue:"Think of all the ways YOU use water in a day."}
        ]},
      { q:"The Underground Railroad helped enslaved people escape to freedom. Where did many of them go?", c:["Canada","Mexico","England","Australia"], skill:"canada",
        why:"Many travelled north to Canada, where slavery was not allowed.",
        hint:"They travelled NORTH from the United States...",
        deeper:[
          {t:"mc", q:"Was the Underground Railroad a real train under the ground?", c:["No — secret routes and safe houses","Yes, a subway","Yes, a steam train","It was a boat"],
           why:"It was a secret network of helpers, routes and safe houses — 'railroad' was a code word."},
          {t:"talk", q:"Harriet Tubman led many people to freedom and lived for a time in St. Catharines, Ontario. Why did freedom-seekers often travel at night and in secret?",
           peek:"To avoid being caught/seen by slave catchers; darkness hides them.", clue:"If someone was trying to catch you, would it be easier for them to see you in daylight or darkness?"}
        ]},
      { q:"Who was Canada's first Prime Minister?", c:["Sir John A. Macdonald","Terry Fox","Wayne Gretzky","Alexander Graham Bell"], skill:"canada",
        why:"Sir John A. Macdonald became the first Prime Minister in 1867.",
        hint:"He has a 'Sir' in front of his name and became leader in 1867.",
        deeper:[
          {t:"mc", q:"Terry Fox, a Canadian hero, ran across Canada on one leg to raise money for...", c:["Cancer research","A new hockey rink","A trip to the Moon","His school"],
           why:"Cancer research! His 1980 run was called the Marathon of Hope."},
          {t:"talk", q:"Terry Fox didn't finish his run, yet people still do Terry Fox Runs every year. Why do you think his story still matters?",
           peek:"Courage, never giving up, helping others; his run keeps raising money for research.", clue:"What did Terry show people about trying hard for others?"}
        ]}
    ]
  },
  {
    id: "geography", name: "Geography", emoji: "🌎", color: "#00a3a3",
    skills: [ {id:"canada", name:"Canada"}, {id:"world", name:"World"}, {id:"maps", name:"Maps & Directions"} ],
    questions: [
      { q:"What is the capital city of Canada?", c:["Ottawa","Toronto","Vancouver","Montreal"], skill:"canada",
        why:"Ottawa, Ontario — where Parliament is!",
        hint:"It's in Ontario, and it's NOT the biggest city. Its NHL team is the Senators.",
        deeper:[
          {t:"mc", q:"Ottawa is in which province?", c:["Ontario","Quebec","Manitoba","Alberta"],
           why:"Ontario — right across the river from Quebec."},
          {t:"talk", q:"Toronto is bigger, so why might a country pick a capital that ISN'T its biggest city?",
           peek:"Fairness/compromise (Ottawa sits between English and French Canada), safety, location. Any good reason counts.", clue:"Ottawa is right on the border between Ontario and Quebec. Why might that be fair?"}
        ]},
      { q:"How many provinces does Canada have?", c:["10","13","7","50"], skill:"canada",
        why:"10 provinces and 3 territories!",
        hint:"It's the same as the number of fingers you have.",
        deeper:[
          {t:"mc", q:"How many territories does Canada have?", c:["3","10","1","5"],
           why:"3: Yukon, Northwest Territories and Nunavut."},
          {t:"mc", q:"Which is Canada's BIGGEST province or territory by area?", c:["Nunavut","Ontario","Prince Edward Island","Nova Scotia"],
           why:"Nunavut! It's enormous — but only about 40,000 people live there."}
        ]},
      { q:"What is the biggest ocean on Earth?", c:["Pacific","Atlantic","Arctic","Indian"], skill:"world",
        why:"The Pacific — it's bigger than all the land on Earth put together!",
        hint:"It's the ocean beside British Columbia.",
        deeper:[
          {t:"mc", q:"How many oceans touch Canada?", c:["3","1","2","5"],
           why:"3: Pacific (west), Atlantic (east) and Arctic (north)!"},
          {t:"talk", q:"Canada's motto means \"From sea to sea.\" Look at a map in your head — why is that a good motto?",
           peek:"Canada stretches from the Atlantic to the Pacific (and the Arctic too).", clue:"Which ocean is on the west side of Canada, and which is on the east?"}
        ]},
      { q:"How many continents are there?", c:["7","5","10","3"], skill:"world",
        why:"7: North America, South America, Europe, Asia, Africa, Australia/Oceania and Antarctica.",
        hint:"Same as the number of days in a week!",
        deeper:[
          {t:"mc", q:"Which continent is the coldest and covered in ice?", c:["Antarctica","Africa","Europe","Australia"],
           why:"Antarctica, at the South Pole!"},
          {t:"talk", q:"Penguins live in the far south and polar bears live in the far north (the Arctic). Why don't they meet in the wild?",
           peek:"They live at opposite ends of the Earth — too far apart, separated by warm oceans/places.", clue:"How far is the North Pole from the South Pole? What's in between?"}
        ]},
      { q:"Which country is right next door to Canada, to the south?", c:["United States","Mexico","Brazil","Russia"], skill:"canada",
        why:"The United States! The Canada–US border is the longest border between two countries in the world.",
        hint:"Its flag has stars and stripes.",
        deeper:[
          {t:"mc", q:"The border between Canada and the US is the world's ___ border between two countries.", c:["Longest","Shortest","Coldest","Newest"],
           why:"Longest — about 8,900 km!"},
          {t:"mc", q:"Which US state shares a border with Yukon and British Columbia?", c:["Alaska","Florida","Texas","Hawaii"],
           why:"Alaska! It borders the Yukon and British Columbia."}
        ]},
      { q:"How many Great Lakes are there?", c:["5","3","7","10"], skill:"canada",
        why:"5! Remember HOMES: Huron, Ontario, Michigan, Erie, Superior.",
        hint:"Remember the word HOMES — one lake for each letter!",
        deeper:[
          {t:"mc", q:"Which Great Lake is the biggest?", c:["Lake Superior","Lake Erie","Lake Ontario","Lake Huron"],
           why:"Lake Superior — 'superior' even means 'better/bigger'!"},
          {t:"mc", q:"Which Great Lake is the ONLY one completely inside the United States (not touching Canada)?", c:["Lake Michigan","Lake Ontario","Lake Superior","Lake Erie"],
           why:"Lake Michigan is all in the US. The other four are shared with Canada."}
        ]},
      { q:"What is the tallest mountain in the world?", c:["Mount Everest","Mount Logan","Mount Kilimanjaro","Blue Mountain"], skill:"world",
        why:"Mount Everest in Asia — almost 8,850 metres tall!",
        hint:"It's in the Himalaya mountains in Asia, and its name starts with E.",
        deeper:[
          {t:"mc", q:"What is the tallest mountain in Canada?", c:["Mount Logan (Yukon)","Mount Everest","Whistler","CN Tower"],
           why:"Mount Logan in the Yukon — almost 6,000 metres!"},
          {t:"talk", q:"Mountain tops are closer to the Sun, so why is it COLDER up there and often snowy?",
           peek:"The air is thinner up high and holds less heat; the Sun's tiny bit closer doesn't matter.", clue:"Is there more air or less air way up high? Air acts like a blanket..."}
        ]},
      { q:"Which way does a compass needle point?", c:["North","South","Up","To the nearest Tim Hortons"], skill:"maps",
        why:"North! That's how people find their way.",
        hint:"It points toward the North Pole, where Santa lives!",
        deeper:[
          {t:"mc", q:"If you face north, which direction is your RIGHT hand pointing?", c:["East","West","South","Down"],
           why:"East! Remember 'Never Eat Soggy Waffles' — North, East, South, West going clockwise."},
          {t:"mc", q:"The Sun rises in the...", c:["East","West","North","South"],
           why:"East! And it sets in the west."},
          {t:"talk", q:"If it's morning and the Sun is out your car window, which direction might we be driving? How do you know?",
           peek:"Uses that the Sun rises in the east (if sun is ahead we're heading east, etc.). Reasoning is what counts.", clue:"Where does the Sun rise? Is it in front, behind, or to the side of the car?"}
        ]},
      { q:"What is the biggest country in the world by area?", c:["Russia","Canada","China","USA"], skill:"world",
        why:"Russia is the biggest, and Canada is #2!",
        hint:"It's Canada's neighbour across the Arctic Ocean.",
        deeper:[
          {t:"mc", q:"Which country is the 2nd biggest in the world by area?", c:["Canada","Brazil","Australia","India"],
           why:"Canada! It's huge."},
          {t:"talk", q:"Canada is huge but has fewer people than many smaller countries. Why do so few people live in the far north?",
           peek:"Very cold, long dark winters, hard to farm/build, far from cities.", clue:"What's the weather like up north? Could you grow a garden there?"}
        ]},
      { q:"Niagara Falls is on the border between Ontario and which US state?", c:["New York","California","Florida","Texas"], skill:"maps",
        why:"New York! Half the falls are in Canada and half in the US.",
        hint:"It's a state with the same name as a very famous big city.",
        deeper:[
          {t:"mc", q:"The Niagara River flows from Lake Erie into Lake...?", c:["Ontario","Superior","Michigan","Huron"],
           why:"Lake Ontario! The water drops over the falls on the way."},
          {t:"talk", q:"Lots of electricity is made at Niagara Falls. How could falling water make electricity?",
           peek:"Rushing water spins turbines/wheels connected to generators.", clue:"Have you seen a water wheel or a pinwheel spin? What could that spinning power?"}
        ]}
    ]
  }
  ]
};
