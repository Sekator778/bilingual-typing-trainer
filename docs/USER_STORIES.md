# User Stories

## US-001: Basic typing training

As a user learning touch typing,  
I want to type individual English words  
so that I can improve typing accuracy and speed.[1]

### Acceptance Criteria
- A single English word is shown on the screen.[2]
- User can type characters and use backspace in a typing area.[2]
- Incorrect characters are visually highlighted as the user types.[3]
- When the word is typed correctly and Enter is pressed, the next word is shown.[2]
- Input focus is preserved after each transition between words.[1]
- The app works with a standard MacBook keyboard layout.[2]

***

## US-002: Always-visible translation

As a non-native English speaker,  
I want to always see the translation of the word I am typing  
so that I understand and memorize the meaning while practicing.[2]

### Acceptance Criteria
- Translation is displayed directly under the English word in a smaller font.[2]
- Translation is visible at all times (no hover, no click, no popups).[2]
- User can select translation language (UA / RU / DE) in settings or before session start.[2]
- Switching translation language updates the translation for the current and subsequent words immediately.[4]
- If an online translation API is unavailable, the app falls back to local translations or shows a clear, non-blocking message.[5]

***

## US-003: Typing statistics

As a user,  
I want to see my typing speed and accuracy  
so that I can track my progress over time.[1]

### Acceptance Criteria
- Words per minute (WPM) is calculated for the current training session.[6]
- Accuracy percentage is calculated based on correct vs incorrect characters.[5]
- Session results (date/time, WPM, accuracy, words attempted) are stored locally on the device.[4]
- User can open a “History” view and see a list of previous sessions with their main metrics.[7]
- If local storage is cleared or unavailable, the app handles it gracefully without crashing.[5]

***

## US-004: Pronunciation support

As a user,  
I want to hear the pronunciation of a word  
so that I can learn how it sounds while typing it.[8]

### Acceptance Criteria
- The word can be pronounced via a dedicated button near the word.[8]
- Auto-play of pronunciation for each new word can be enabled or disabled in settings.[9]
- The pronunciation feature can be turned on or off without affecting the typing flow.[4]
- If pronunciation is not available (no TTS / offline / error), the app does not break and shows a subtle indication or does nothing silently.[5]

***

## US-005: Level and topic selection (MVP/next)

As a learner with a specific language level,  
I want to choose word difficulty and topic  
so that I practice vocabulary that matches my goals.[2]

### Acceptance Criteria
- Before starting a session, user can select a level (A2 / B1 / B2 / TOEFL / Tech).[2]
- The app uses only words from the selected level for that session.[3]
- (Optional v1.1) User can additionally select a topic (IT / Daily / Business) to further filter the word set.[2]
- Selected level and topic are visible somewhere on the training screen or session header.[1]

***

## US-006: Practice mistakes only (v1.1)

As a returning user,  
I want to practice only the words where I previously made mistakes  
so that I can efficiently close my vocabulary and typing gaps.[10]

### Acceptance Criteria
- The app records per-word mistakes on word commit; a word counts as a mistake if any errors were typed before commit.[6]
- Mistakes are stored locally and survive reloads; if storage is unavailable, the app degrades gracefully.[5]
- User can start a session in “mistakes only” mode from the setup screen.[10]
- In “mistakes only” mode, the word list is limited to words with at least one recorded mistake, filtered by the current level pack.[10]
- Words with more mistakes appear earlier (tie-break by recency).[10]
- If there are no recorded mistakes for the selected level, the app shows a clear message and does not start a session.[5]
