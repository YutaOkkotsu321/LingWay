import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { GrammarTopic, VocabularyWord, Flashcard, FlashcardProgress, NewFlashcard } from '../core/models';

// ── MOCK DATA (used when backend is not yet available) ──────────────────────
const MOCK_GRAMMAR: GrammarTopic[] = [
  {
    id: 1, title: 'Present Perfect', slug: 'present-perfect', level: 'intermediate', category: 'Tenses',
    description: 'Used for actions that started in the past and continue to the present',
    rules: [
      { id: 1, title: 'Affirmative', explanation: 'Subject + have/has + past participle', formula: 'S + have/has + V3', examples: ['I have lived here for 5 years.', 'She has finished her homework.'] },
      { id: 2, title: 'Negative', explanation: 'Subject + have/has + not + past participle', formula: 'S + haven\'t/hasn\'t + V3', examples: ['I haven\'t seen that movie.', 'He hasn\'t eaten yet.'] },
      { id: 3, title: 'Question', explanation: 'Have/Has + subject + past participle?', formula: 'Have/Has + S + V3?', examples: ['Have you ever been to London?', 'Has she called you?'] },
    ],
    examples: ['I have worked here since 2020.', 'They have already left.', 'We have just arrived.'],
  },
  {
    id: 2, title: 'Conditional Sentences', slug: 'conditionals', level: 'intermediate', category: 'Grammar',
    description: 'Express hypothetical situations and their consequences',
    rules: [
      { id: 1, title: 'Zero Conditional', explanation: 'General truths and scientific facts', formula: 'If + Present Simple, Present Simple', examples: ['If you heat water to 100°C, it boils.'] },
      { id: 2, title: 'First Conditional', explanation: 'Real/possible future situations', formula: 'If + Present Simple, will + V1', examples: ['If it rains, I will stay home.'] },
      { id: 3, title: 'Second Conditional', explanation: 'Imaginary/unlikely situations', formula: 'If + Past Simple, would + V1', examples: ['If I won the lottery, I would travel the world.'] },
    ],
    examples: ['If you study hard, you will pass.', 'If I were you, I would apologize.'],
  },
  {
    id: 3, title: 'Passive Voice', slug: 'passive-voice', level: 'intermediate', category: 'Grammar',
    description: 'Focus on the action rather than who performs it',
    rules: [
      { id: 1, title: 'Present Passive', explanation: 'am/is/are + past participle', formula: 'S + am/is/are + V3', examples: ['The letter is written by John.', 'English is spoken worldwide.'] },
      { id: 2, title: 'Past Passive', explanation: 'was/were + past participle', formula: 'S + was/were + V3', examples: ['The book was published in 2020.', 'The windows were broken.'] },
    ],
    examples: ['The report was submitted on time.', 'The cake has been eaten.'],
  },
  {
    id: 4, title: 'Articles (a, an, the)', slug: 'articles', level: 'beginner', category: 'Grammar',
    description: 'Determine specificity and countability of nouns',
    rules: [
      { id: 1, title: 'Indefinite Article (a/an)', explanation: 'Used before singular countable nouns mentioned for the first time', formula: 'a + consonant sound / an + vowel sound', examples: ['I saw a dog.', 'She is an engineer.'] },
      { id: 2, title: 'Definite Article (the)', explanation: 'Used when both speaker and listener know which thing is meant', formula: 'the + noun', examples: ['The sun rises in the east.', 'Pass me the salt, please.'] },
    ],
    examples: ['I bought a book. The book is interesting.', 'An apple a day keeps the doctor away.'],
  },
  {
    id: 5, title: 'Modal Verbs', slug: 'modal-verbs', level: 'intermediate', category: 'Verbs',
    description: 'Express ability, possibility, permission and obligation',
    rules: [
      { id: 1, title: 'Can / Could', explanation: 'Ability and possibility', formula: 'S + can/could + V1', examples: ['I can swim.', 'Could you help me?'] },
      { id: 2, title: 'Must / Should', explanation: 'Obligation and advice', formula: 'S + must/should + V1', examples: ['You must wear a seatbelt.', 'You should exercise daily.'] },
    ],
    examples: ['You must submit the report by Friday.', 'She might be late.'],
  },
  {
    id: 6, title: 'Relative Clauses', slug: 'relative-clauses', level: 'advanced', category: 'Clauses',
    description: 'Add extra information about a noun using who, which, that, where, when',
    rules: [
      { id: 1, title: 'Defining Relative Clauses', explanation: 'Essential information, no commas', formula: 'Noun + who/which/that + clause', examples: ['The woman who lives next door is a doctor.'] },
      { id: 2, title: 'Non-defining Relative Clauses', explanation: 'Extra information, uses commas', formula: 'Noun, + who/which + clause,', examples: ['My brother, who lives in London, is a teacher.'] },
    ],
    examples: ['The car that I bought is very fast.', 'Paris, which is the capital of France, is beautiful.'],
  },
];

const MOCK_VOCABULARY: Record<string, VocabularyWord[]> = {
  business: [
    { id: 1, word: 'Leverage', partOfSpeech: 'verb', definition: 'To use something to maximum advantage', example: '"We can leverage our expertise to win new clients."', synonyms: ['utilize', 'exploit', 'employ'], category: 'business', isFavorited: false },
    { id: 2, word: 'Synergy', partOfSpeech: 'noun', definition: 'The combined power of a group working together', example: '"The merger created great synergy between the two companies."', synonyms: ['collaboration', 'cooperation', 'teamwork'], category: 'business', isFavorited: false },
    { id: 3, word: 'Streamline', partOfSpeech: 'verb', definition: 'To make a process simpler and more efficient', example: '"We need to streamline our workflow to save time."', synonyms: ['simplify', 'optimize', 'improve'], category: 'business', isFavorited: false },
    { id: 4, word: 'Stakeholder', partOfSpeech: 'noun', definition: 'A person with an interest or concern in something', example: '"All stakeholders must approve the new policy."', synonyms: ['shareholder', 'investor', 'participant'], category: 'business', isFavorited: false },
    { id: 5, word: 'Pivot', partOfSpeech: 'verb', definition: 'To change business strategy based on market feedback', example: '"The startup had to pivot its entire business model."', synonyms: ['shift', 'change', 'adapt'], category: 'business', isFavorited: false },
    { id: 6, word: 'Scalable', partOfSpeech: 'adjective', definition: 'Able to be expanded to handle increasing demand', example: '"We need a scalable solution for our growing user base."', synonyms: ['expandable', 'flexible', 'adaptable'], category: 'business', isFavorited: false },
  ],
  academic: [
    { id: 7, word: 'Empirical', partOfSpeech: 'adjective', definition: 'Based on observation or experience rather than theory', example: '"The study provided empirical evidence for the hypothesis."', synonyms: ['observational', 'experimental', 'factual'], category: 'academic', isFavorited: false },
    { id: 8, word: 'Hypothesis', partOfSpeech: 'noun', definition: 'A proposed explanation made as a starting point for investigation', example: '"The researchers formulated a hypothesis before conducting experiments."', synonyms: ['theory', 'assumption', 'proposition'], category: 'academic', isFavorited: false },
    { id: 9, word: 'Paradigm', partOfSpeech: 'noun', definition: 'A typical example or pattern of something; a model', example: '"This discovery represents a paradigm shift in our understanding."', synonyms: ['model', 'framework', 'pattern'], category: 'academic', isFavorited: false },
    { id: 10, word: 'Synthesis', partOfSpeech: 'noun', definition: 'Combination of elements to form a new whole', example: '"Her paper offered a synthesis of two competing theories."', synonyms: ['combination', 'integration', 'fusion'], category: 'academic', isFavorited: false },
    { id: 11, word: 'Ambiguous', partOfSpeech: 'adjective', definition: 'Open to more than one interpretation', example: '"The results were ambiguous and required further analysis."', synonyms: ['unclear', 'vague', 'equivocal'], category: 'academic', isFavorited: false },
    { id: 12, word: 'Methodology', partOfSpeech: 'noun', definition: 'A system of methods used in a particular study', example: '"The research methodology was clearly outlined in the paper."', synonyms: ['approach', 'procedure', 'technique'], category: 'academic', isFavorited: false },
  ],
  everyday: [
    { id: 13, word: 'Serendipity', partOfSpeech: 'noun', definition: 'The occurrence of fortunate events by chance', example: '"Meeting her was pure serendipity — we were both lost!"', synonyms: ['luck', 'chance', 'fortune'], category: 'everyday', isFavorited: false },
    { id: 14, word: 'Procrastinate', partOfSpeech: 'verb', definition: 'To delay or postpone action; to put off doing something', example: '"Stop procrastinating and start working on your assignment."', synonyms: ['delay', 'postpone', 'stall'], category: 'everyday', isFavorited: false },
    { id: 15, word: 'Ephemeral', partOfSpeech: 'adjective', definition: 'Lasting for a very short time', example: '"The beauty of cherry blossoms is ephemeral."', synonyms: ['brief', 'fleeting', 'transient'], category: 'everyday', isFavorited: false },
    { id: 16, word: 'Resilient', partOfSpeech: 'adjective', definition: 'Able to withstand or recover quickly from difficult conditions', example: '"She is incredibly resilient despite all the challenges she faced."', synonyms: ['tough', 'strong', 'adaptable'], category: 'everyday', isFavorited: false },
  ],
};

// ── SERVICE ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class LearningService {
  private readonly API = 'http://localhost:8000/api';

  isLoading   = signal(false);
  apiError    = signal<string | null>(null);

  // Local mutable state
  private _flashcards = signal<Flashcard[]>([]);
  flashcards = this._flashcards.asReadonly();

  private _vocabulary = signal<VocabularyWord[]>([]);
  vocabulary = this._vocabulary.asReadonly();

  constructor(private http: HttpClient) {}

  // ── GRAMMAR TOPICS ────────────────────────────────────────────────────
  getGrammarTopics(): Observable<GrammarTopic[]> {
    this.isLoading.set(true);
    this.apiError.set(null);

    return this.http.get<GrammarTopic[]>(`${this.API}/grammar/`).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 0 || err.status === 404) {
          return of(MOCK_GRAMMAR);
        }
        this.apiError.set('Failed to load grammar topics.');
        return throwError(() => err);
      })
    );
  }

  getGrammarTopic(id: number): Observable<GrammarTopic> {
    this.isLoading.set(true);
    this.apiError.set(null);

    return this.http.get<GrammarTopic>(`${this.API}/grammar/${id}/`).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const mock = MOCK_GRAMMAR.find(t => t.id === id);
        if (mock) return of(mock);
        this.apiError.set('Grammar topic not found.');
        return throwError(() => err);
      })
    );
  }

  // ── VOCABULARY ────────────────────────────────────────────────────────
  getVocabulary(category: string): Observable<VocabularyWord[]> {
    this.isLoading.set(true);
    this.apiError.set(null);

    return this.http.get<VocabularyWord[]>(`${this.API}/vocabulary/?category=${category}`).pipe(
      tap((words) => {
        this._vocabulary.set(words);
        this.isLoading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const mock = MOCK_VOCABULARY[category] || MOCK_VOCABULARY['business'];
        this._vocabulary.set(mock);
        return of(mock);
      })
    );
  }

  searchVocabulary(query: string, category: string): Observable<VocabularyWord[]> {
    this.isLoading.set(true);

    return this.http.get<VocabularyWord[]>(`${this.API}/vocabulary/?search=${query}&category=${category}`).pipe(
      tap((words) => {
        this._vocabulary.set(words);
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.isLoading.set(false);
        const source = MOCK_VOCABULARY[category] || MOCK_VOCABULARY['business'];
        const filtered = source.filter(w =>
          w.word.toLowerCase().includes(query.toLowerCase()) ||
          w.definition.toLowerCase().includes(query.toLowerCase())
        );
        this._vocabulary.set(filtered);
        return of(filtered);
      })
    );
  }

  toggleFavorite(wordId: number): Observable<VocabularyWord> {
    return this.http.post<VocabularyWord>(`${this.API}/vocabulary/${wordId}/favorite/`, {}).pipe(
      tap((updated) => {
        this._vocabulary.update(words => words.map(w => w.id === wordId ? updated : w));
      }),
      catchError(() => {
        // Optimistic UI update
        this._vocabulary.update(words =>
          words.map(w => w.id === wordId ? { ...w, isFavorited: !w.isFavorited } : w)
        );
        const word = this._vocabulary().find(w => w.id === wordId);
        return of(word!);
      })
    );
  }

  // ── FLASHCARDS ────────────────────────────────────────────────────────
  getFlashcards(): Observable<Flashcard[]> {
    this.isLoading.set(true);
    this.apiError.set(null);

    return this.http.get<{ flashcards: Flashcard[] }>(
      `${this.API}/flashcards/my/`, { withCredentials: true },
    ).pipe(
      map(({ flashcards }) => {
        this._flashcards.set(flashcards);
        this.isLoading.set(false);
        return flashcards;
      }),
      catchError(() => {
        this.isLoading.set(false);
        this._flashcards.set([]);
        return of([] as Flashcard[]);
      }),
    );
  }

  markMastered(cardId: number): Observable<Flashcard> {
    return this.http.post<Partial<Flashcard>>(
      `${this.API}/flashcards/my/${cardId}/master/`, {}, { withCredentials: true },
    ).pipe(
      catchError(() => of<Partial<Flashcard>>({ isMastered: true })),
      map(patch => this.applyPatch(cardId, patch, { isMastered: true })),
    );
  }

  markNeedsPractice(cardId: number): Observable<Flashcard> {
    return this.http.post<Partial<Flashcard>>(
      `${this.API}/flashcards/my/${cardId}/practice/`, {}, { withCredentials: true },
    ).pipe(
      catchError(() => of<Partial<Flashcard>>({ isMastered: false })),
      map(patch => this.applyPatch(cardId, patch, { isMastered: false })),
    );
  }

  shuffleFlashcards(): Observable<Flashcard[]> {
    const shuffled = [...this._flashcards()].sort(() => Math.random() - 0.5);
    this._flashcards.set(shuffled);
    return of(shuffled);
  }

  // Resets mastery on all user flashcards (keeps the cards themselves).
  resetFlashcards(): Observable<Flashcard[]> {
    return this.http.post(`${this.API}/flashcards/my/reset/`, {}, { withCredentials: true }).pipe(
      catchError(() => of(null)),
      tap(() => {
        this._flashcards.update(cards =>
          cards.map(c => ({ ...c, isMastered: false, timesReviewed: 0 })),
        );
      }),
      map(() => this._flashcards()),
    );
  }

  addFlashcard(card: NewFlashcard): Observable<Flashcard> {
    return this.http.post<Flashcard>(
      `${this.API}/flashcards/my/`, card, { withCredentials: true },
    ).pipe(
      tap(created => this._flashcards.update(cards => [...cards, created])),
    );
  }

  clearUserFlashcards(): Observable<void> {
    return this.http.post(`${this.API}/flashcards/my/clear/`, {}, { withCredentials: true }).pipe(
      tap(() => this._flashcards.set([])),
      map(() => void 0),
    );
  }

  private applyPatch(cardId: number, patch: Partial<Flashcard>, fallback: Partial<Flashcard>): Flashcard {
    const merged: Partial<Flashcard> = { ...fallback, ...patch };
    this._flashcards.update(cards =>
      cards.map(c => {
        if (c.id !== cardId) return c;
        const next = { ...c, ...merged };
        if (merged.timesReviewed === undefined) next.timesReviewed = c.timesReviewed + 1;
        return next;
      }),
    );
    return this._flashcards().find(c => c.id === cardId)!;
  }

  getProgress(): FlashcardProgress {
    const cards = this._flashcards();
    return {
      total: cards.length,
      mastered: cards.filter(c => c.isMastered).length,
      needPractice: cards.filter(c => !c.isMastered && c.timesReviewed > 0).length,
    };
  }
}
