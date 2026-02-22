import type { EscapeStory } from '@/types/escape';

/** Blue Moon Mansion Murder — floor plan (living room, study, guest rooms) + chapters 1–2 */
export const blueMoonStoryEn: EscapeStory = {
  id: 'blue-moon',
  title: 'The Blue Moon Mansion Case',
  summary:
    'On the night of February 22, 2026, a storm rages. The master of Blue Moon Mansion, Chairman Choi Byung-chul, dies in his half-bath. Five suspects remain. Explore the floor plan, gather clues, and hear their statements in the living room to find the culprit.',

  roomBackground: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
  floorPlanImage: '/escape/blue-moon/floor-plan.png',
  startScreenImage: '/escape/blue-moon/home.png',
  startScreenBgm: '/escape/blue-moon/title-track.mp3',

  rooms: [
    { id: 'living', name: 'Living Room', isGathering: true, image: '/escape/blue-moon/room-living.png', background: 'linear-gradient(180deg, #2c1810 0%, #1a0f0a 100%)', floorPlanPosition: { left: 15, top: 30 } },
    { id: 'secretary', name: "Secretary Kim's Room", image: '/escape/blue-moon/room-secretary.png', background: 'linear-gradient(180deg, #1a2520 0%, #0d1512 100%)', floorPlanPosition: { left: 37, top: 30 } },
    { id: 'maid', name: "Maid's Room", image: '/escape/blue-moon/room-maid.png', background: 'linear-gradient(180deg, #1e1a25 0%, #100d15 100%)', floorPlanPosition: { left: 62, top: 30 } },
    { id: 'chairman_bedroom', name: "Chairman's Bedroom", image: '/escape/blue-moon/room-chairman-bedroom.png', background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', floorPlanPosition: { left: 85, top: 24 } },
    { id: 'chairman_bath', name: "Chairman's Bathroom", image: '/escape/blue-moon/room-chairman-bath.png', background: 'linear-gradient(180deg, #1a2525 0%, #0d1515 100%)', floorPlanPosition: { left: 85, top: 33 } },
    { id: 'study', name: "Chairman's Study", image: '/escape/blue-moon/room-study.png', background: 'linear-gradient(180deg, #1e2a1e 0%, #0f150f 100%)', floorPlanPosition: { left: 85, top: 50 } },
    { id: 'son', name: "Son's Room", image: '/escape/blue-moon/room-son.png', background: 'linear-gradient(180deg, #2a1e1a 0%, #150f0d 100%)', floorPlanPosition: { left: 15, top: 69 } },
    { id: 'guest', name: 'Guest Room (Journalist)', image: '/escape/blue-moon/room-guest.png', background: 'linear-gradient(180deg, #25201a 0%, #15100d 100%)', floorPlanPosition: { left: 37, top: 69 } },
    { id: 'lawyer_office', name: "Kim Lawyer's Office", image: '/escape/blue-moon/room-lawyer-office.png', background: 'linear-gradient(180deg, #1a1e2e 0%, #0d101a 100%)', floorPlanPosition: { left: 85, top: 69 } },
  ],

  characters: [
    { id: 'junho', name: 'Junho Choi', description: 'Eldest son of the chairman (35). Massive gambling debt. About to be disinherited; he set the mansion clocks 30 minutes ahead and stabbed his already-dead father with a paper knife.', livingRoomTitle: 'Alibi That Night', image: '/escape/blue-moon/characters/junho.png' },
    { id: 'kim_lawyer', name: 'Kim Lawyer', description: 'Chairman\'s legal advisor (45). Gained trust from the Blue Moon Hotel Room 1205 incident five years ago, but designed the perfect crime using the maid to inherit the foundation via the will.', livingRoomTitle: 'Movements That Night', image: '/escape/blue-moon/characters/kim_lawyer.png' },
    { id: 'maid', name: 'An Maid', description: 'Maid at the mansion for 30 years (60). Promised inheritance for her daughter (Lee Journalist) but was cut out; attempted cyanide and failed. Gave the 12 o\'clock injection and believes she killed the chairman.', livingRoomTitle: 'What I Did by the Schedule', image: '/escape/blue-moon/characters/maid.png' },
    { id: 'journalist', name: 'Lee Journalist', description: 'Chairman\'s hidden daughter (28). Infiltrated as a memoir writer to confirm paternity and find her father; the camera captured what looked like her mother killing him.', livingRoomTitle: 'What I Saw That Night', image: '/escape/blue-moon/characters/journalist.png' },
    { id: 'kim_secretary', name: 'Kim Secretary', description: 'Chairman\'s right-hand (42). Noticed Kim Lawyer\'s ambition and installed a bug. Secured the real will from behind the safe and bided his time.', livingRoomTitle: 'What I Know About the Mansion', image: '/escape/blue-moon/characters/kim_secretary.png' },
  ],

  livingRoomStatements: [
    { characterId: 'kim_lawyer', text: 'I left at 11 p.m. and spent the night reviewing documents at my office in the city. I just arrived at the mansion by car at 6 in the morning.' },
    { characterId: 'kim_secretary', text: 'From 11 p.m. I was in my room organizing the chairman’s slush fund ledgers. I dozed off from exhaustion, but I never left the room.' },
    { characterId: 'journalist', text: 'By that time I’d have finished the memoir draft and been asleep. I didn’t hear anything because of the rain.' },
    { characterId: 'maid', text: 'At 11:30 p.m. I always prepare the chairman’s half-bath. He usually has his half-bath from 11:50 for about ten minutes, then goes to sleep. I prepared the tub as usual, went down to tidy the kitchen, then went back at 12:30 to clear the tub—and found the chairman stabbed. Oh no…' },
    { characterId: 'junho', text: 'I was in my room drinking and gaming, then passed out. I woke up for a moment when I heard the maid scream…' },
  ],

  livingRoomFollowUps: [
    {
      characterId: 'junho',
      questions: [
        { question: 'What kind of game was it?', answer: 'Does it matter? Just a bit of baccarat.' },
        { question: 'Your father passed away—you don’t seem very sad.', answer: 'What good would being sad do? If he’d been a better father, this wouldn’t have happened.' },
        { question: 'What was your relationship with your father like?', answer: 'Well… we weren’t exactly a happy father and son. He’s the one who made me like this!' },
      ],
    },
  ],

  clues: [
    { id: 'law_book', name: 'Old Law Code', description: 'Pages 1200–1206 are repeatedly opened. 1205 is highlighted. Laptop password hint.', roomId: 'lawyer_office', chapter: 2, hotspotPosition: { left: 12, top: 28, width: 20, height: 24 }, dialogue: [{ characterId: 'kim_secretary', text: 'Five years ago, Blue Moon Hotel Room 1205. That incident is how Kim Lawyer gained the chairman’s trust.' }, { characterId: 'kim_lawyer', text: '1205 is no mere number. It’s the key to victory.' }] },
    { id: 'laptop', name: 'Locked Laptop', description: 'Opens with password 1205. Search history shows pentobarbital and acute cardiac arrest.', roomId: 'lawyer_office', chapter: 2, hotspotPosition: { left: 52, top: 48, width: 30, height: 22 }, dialogue: [{ characterId: 'kim_lawyer', text: 'A hypertensive patient in a half-bath given pentobarbital goes into acute cardiac arrest. Law and medicine—both are my specialty.' }, { characterId: 'kim_secretary', text: 'Pentobarbital disguised as insulin. You used the maid’s hand to kill the chairman.' }] },
    { id: 'paper_knife', name: 'Paper Knife', description: 'Blade removed. Tool used for corpse mutilation and label removal. Can be used on vitamin bottle.', roomId: 'son', chapter: 1, hotspotPosition: { left: 41, top: 54, width: 14, height: 12 }, dialogue: [{ characterId: 'junho', text: 'That was… in my room. But I didn’t use it!' }, { characterId: 'kim_lawyer', text: 'Mr. Junho, the convenience store CCTV already confirmed you entered the study that night.' }, { characterId: 'junho', text: '…Father was already dead. I only… moved the clock…' }] },
    { id: 'vitamin_bottle', name: 'Vitamin Bottle', description: 'Double label underneath. Removing with paper knife reveals the murder weapon: pentobarbital.', roomId: 'maid', chapter: 2, hotspotPosition: { left: 22, top: 42, width: 18, height: 18 }, dialogue: [{ characterId: 'maid', text: 'That’s the chairman’s injection. Every day at 12 he gets that instead of insulin. I gave it that day too.' }, { characterId: 'kim_lawyer', text: 'The chairman was in a half-bath with hypertension. In that state, a certain drug can cause acute cardiac arrest.' }] },
    { id: 'blue_crystal', name: 'Blue Crystal Vial', description: 'Evidence of a failed poisoning. The blue crystals at the bottom can be examined.', roomId: 'maid', chapter: 2, hotspotPosition: { left: 68, top: 72, width: 18, height: 14 }, dialogue: [{ characterId: 'maid', text: 'I… put it in his drink at 9. But the chairman didn’t drink it and threw it away. I failed.' }, { characterId: 'journalist', text: 'Mom… so the chairman didn’t die because of you?' }] },
    { id: 'wristwatch', name: 'Wristwatch', description: 'Chairman’s watch recovered from the tub. Stopped at 12:05, showing the falsified time of death.', roomId: 'chairman_bath', chapter: 1, hotspotPosition: { left: 60, top: 72, width: 18, height: 14 }, dialogue: [{ characterId: 'kim_lawyer', text: 'The chairman passed at 12:05 by the mansion clock. I am a witness. Past midnight, the will is in effect.' }, { characterId: 'journalist', text: 'That watch… if the mansion clock is 30 minutes fast, the real time is 11:35.' }] },
    { id: 'letter_knife', name: 'Letter Opener', description: 'Looks like the letter opener used as the murder weapon. Need to find who it belongs to.', roomId: 'chairman_bath', chapter: 1, hotspotPosition: { left: 62, top: 11, width: 14, height: 18 }, dialogue: [] },
    { id: 'memory_card', name: 'Memory Card', description: 'Lee Journalist’s room camera. Photo metadata records the actual shooting time as 23:35.', roomId: 'guest', chapter: 2, hotspotPosition: { left: 42, top: 44, width: 24, height: 20 }, dialogue: [{ characterId: 'journalist', text: 'This photo… I took it that night. The metadata says 23:35. The mansion clock said 12:05.' }, { characterId: 'kim_lawyer', text: '…Then the chairman’s time of death was 25 minutes before midnight. Before the will took effect.' }] },
    { id: 'hall_clock', name: 'Hall Clock', description: 'Main wall clock in the living room. Confirms overall clock tampering. Triggers when compared with wristwatch.', roomId: 'living', chapter: 1, hotspotPosition: { left: 72, top: 12, width: 24, height: 22 }, dialogue: [{ characterId: 'maid', text: 'The schedule said 00:00 for half-bath start. I gave the injection at 12 as usual.' }, { characterId: 'kim_secretary', text: 'If the mansion clock was 30 minutes fast, the real time the maid gave the injection was 23:25.' }] },
    { id: 'driver', name: 'Screwdriver', description: 'Junho’s room drawer. Matches the screws on the back of the clock; confirms it was used to tamper with the clock.', roomId: 'son', chapter: 1, hotspotPosition: { left: 48, top: 83, width: 14, height: 16 }, dialogue: [{ characterId: 'kim_secretary', text: 'All the mansion clocks had been set 30 minutes ahead that day. The repairman never came.' }, { characterId: 'junho', text: 'After midnight I’d be cut from the will… So I thought if I just set the clock 30 minutes ahead…' }] },
    { id: 'son_sleeping_pills', name: 'Sleeping Pills', description: 'Overdose can be fatal. A prescription-only sleep medication.', roomId: 'son', chapter: 1, hotspotPosition: { left: 6, top: 52, width: 5, height: 12 }, dialogue: [] },
    { id: 'son_loan_docs', name: 'Loan Documents', description: 'Debt 1.8 billion KRW, 40% annual interest. Loan from third-tier lender Sanameoni. On default, all of Junho Choi person is forfeit to Sanameoni.', roomId: 'son', chapter: 1, hotspotPosition: { left: 21, top: 48, width: 18, height: 18 }, dialogue: [] },
    { id: 'son_diary', name: 'Diary', description: 'Feb 10. Father might have found out about the gambling debt. Overheard him saying he would change the will, talking with Kim Lawyer. If the will changes and I do not inherit, I am as good as dead. I have to end this before the will changes.', roomId: 'son', chapter: 1, hotspotPosition: { left: 60, top: 47, width: 24, height: 22 }, dialogue: [] },
    { id: 'son_laptop', name: 'Laptop', description: 'An online baccarat site is open.', roomId: 'son', chapter: 1, hotspotPosition: { left: 8, top: 16, width: 18, height: 18 }, dialogue: [] },
  ],

  questions: [
    { id: 'q1', clueId: 'paper_knife', type: 'multiple', text: 'What do the paper knife in the neck and the autopsy (postmortem injury) indicate?', options: [{ id: 'o1', text: 'Junho stabbed him right after the murder.', correct: false }, { id: 'o2', text: 'Junho stabbed him after he was already dead, so he is not the real culprit.', correct: true }], revealCharacterId: 'junho' },
    { id: 'q2', clueId: 'driver', type: 'multiple', text: 'How are the screwdriver and the clock tampering related?', options: [{ id: 'o3', text: 'Junho set the clock 30 minutes ahead to create an alibi.', correct: true }, { id: 'o4', text: 'The maid used it to tamper with the schedule.', correct: false }], revealCharacterId: 'junho' },
    { id: 'q3', clueId: 'wristwatch', type: 'multiple', text: 'What do the watch at 12:05 and the 30-minute mansion clock tampering imply?', options: [{ id: 'o5', text: 'The actual time of death was around 11:35.', correct: true }, { id: 'o6', text: 'The actual time of death was 12:35.', correct: false }], revealCharacterId: 'journalist' },
    { id: 'q4', clueId: 'hall_clock', type: 'multiple', text: 'What was the actual time when the maid gave the 12 o’clock (mansion time) injection?', options: [{ id: 'o7', text: 'Actually 23:30. Before the will took effect.', correct: true }, { id: 'o8', text: 'Actually 00:00. Past midnight.', correct: false }], revealCharacterId: 'maid' },
    { id: 'q5', clueId: 'vitamin_bottle', type: 'multiple', text: 'What does the pentobarbital hidden under the vitamin label mean?', options: [{ id: 'o9', text: 'The maid swapped it on purpose.', correct: false }, { id: 'o10', text: 'Someone swapped insulin for pentobarbital so the maid would inject it.', correct: true }], revealCharacterId: 'kim_lawyer' },
    { id: 'q6', clueId: 'blue_crystal', type: 'multiple', text: 'How do the cyanide attempt and the actual cause of death relate?', options: [{ id: 'o11', text: 'The maid’s cyanide killed the chairman.', correct: false }, { id: 'o12', text: 'The chairman didn’t drink it; the real cause is something else.', correct: true }], revealCharacterId: 'maid' },
    { id: 'q8', clueId: 'law_book', type: 'short', text: 'Why does Kim Lawyer value 1205? (Answer in 4 digits)', correctAnswer: '1205', revealCharacterId: 'kim_secretary' },
    { id: 'q9', clueId: 'laptop', type: 'multiple', text: 'What does the laptop search history (pentobarbital, acute cardiac arrest) prove?', options: [{ id: 'o15', text: 'Kim Lawyer designed the chairman’s death using hypertension and pentobarbital.', correct: true }, { id: 'o16', text: 'Kim Lawyer was only doing legal research.', correct: false }], revealCharacterId: 'kim_lawyer' },
    { id: 'q10', clueId: 'memory_card', type: 'multiple', text: 'How does metadata 23:35 relate to the will’s validity?', options: [{ id: 'o17', text: 'Death before midnight means Kim Lawyer’s will is legally void.', correct: true }, { id: 'o18', text: 'Death after 12:00 means the will is valid.', correct: false }], revealCharacterId: 'journalist' },
  ],

  hints: [
    'No bleeding from the neck wound suggests it was inflicted after death. What did Junho do?',
    'All mansion clocks were 30 minutes fast. What was the real time of the maid’s 12 o’clock injection?',
    'The real cause of death isn’t cyanide. Think about hypertension, the half-bath, and a certain drug.',
    '1205 is a hotel room number and the laptop password. Who does it belong to?',
    'If the actual time of death was before midnight, the will is void.',
  ],

  correctCriminalId: 'kim_lawyer',
  hotspots: [],
};
