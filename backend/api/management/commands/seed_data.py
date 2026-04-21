"""
Management command to populate the database with initial data
matching the mock data used in the Angular frontend.
Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    UserProfile, GrammarTopic, GrammarRule, Exercise,
    VocabularyWord, Flashcard,
)


GRAMMAR_DATA = [
    {
        'title': 'Present Perfect',
        'slug': 'present-perfect',
        'level': 'intermediate',
        'category': 'Tenses',
        'description': 'Used for actions that started in the past and continue to the present',
        'examples': ['I have worked here since 2020.', 'They have already left.', 'We have just arrived.'],
        'rules': [
            {'title': 'Affirmative', 'explanation': 'Subject + have/has + past participle', 'formula': 'S + have/has + V3', 'examples': ['I have lived here for 5 years.', 'She has finished her homework.'], 'order': 0},
            {'title': 'Negative', 'explanation': "Subject + have/has + not + past participle", 'formula': "S + haven't/hasn't + V3", 'examples': ["I haven't seen that movie.", "He hasn't eaten yet."], 'order': 1},
            {'title': 'Question', 'explanation': 'Have/Has + subject + past participle?', 'formula': 'Have/Has + S + V3?', 'examples': ['Have you ever been to London?', 'Has she called you?'], 'order': 2},
        ],
        'exercises': [
            {'question': 'Complete: "She ___ (live) here for 10 years." (Present Perfect)', 'options': ['has lived', 'lived', 'is living', 'have lived'], 'correct_answer': 'has lived', 'explanation': 'Use "has" for third person singular + past participle.', 'order': 0},
            {'question': 'Which sentence uses Present Perfect correctly?', 'options': ['I have went to Paris.', 'She has gone to Paris.', 'They has visited Rome.', 'He have finished.'], 'correct_answer': 'She has gone to Paris.', 'explanation': 'Has + past participle; "gone" is the past participle of "go".', 'order': 1},
        ],
    },
    {
        'title': 'Conditional Sentences',
        'slug': 'conditionals',
        'level': 'intermediate',
        'category': 'Grammar',
        'description': 'Express hypothetical situations and their consequences',
        'examples': ['If you study hard, you will pass.', 'If I were you, I would apologize.'],
        'rules': [
            {'title': 'Zero Conditional', 'explanation': 'General truths and scientific facts', 'formula': 'If + Present Simple, Present Simple', 'examples': ['If you heat water to 100°C, it boils.'], 'order': 0},
            {'title': 'First Conditional', 'explanation': 'Real/possible future situations', 'formula': 'If + Present Simple, will + V1', 'examples': ['If it rains, I will stay home.'], 'order': 1},
            {'title': 'Second Conditional', 'explanation': 'Imaginary/unlikely situations', 'formula': 'If + Past Simple, would + V1', 'examples': ['If I won the lottery, I would travel the world.'], 'order': 2},
            {'title': 'Third Conditional', 'explanation': 'Impossible past situations', 'formula': 'If + Past Perfect, would have + V3', 'examples': ['If I had studied, I would have passed.'], 'order': 3},
        ],
        'exercises': [
            {'question': 'Complete: "If I ___ (be) you, I would apologize."', 'options': ['am', 'was', 'were', 'be'], 'correct_answer': 'were', 'explanation': 'Second conditional uses past subjunctive: "were" for all persons.', 'order': 0},
            {'question': 'Which is a First Conditional?', 'options': ['If it rains, I stay home.', 'If it rains, I will stay home.', 'If it rained, I would stay home.', 'If it had rained, I would have stayed home.'], 'correct_answer': 'If it rains, I will stay home.', 'explanation': 'First conditional: If + Present Simple, will + base verb.', 'order': 1},
        ],
    },
    {
        'title': 'Passive Voice',
        'slug': 'passive-voice',
        'level': 'intermediate',
        'category': 'Grammar',
        'description': 'Focus on the action rather than who performs it',
        'examples': ['The report was submitted on time.', 'The cake has been eaten.'],
        'rules': [
            {'title': 'Present Passive', 'explanation': 'am/is/are + past participle', 'formula': 'S + am/is/are + V3', 'examples': ['The letter is written by John.', 'English is spoken worldwide.'], 'order': 0},
            {'title': 'Past Passive', 'explanation': 'was/were + past participle', 'formula': 'S + was/were + V3', 'examples': ['The book was published in 2020.', 'The windows were broken.'], 'order': 1},
            {'title': 'Future Passive', 'explanation': 'will be + past participle', 'formula': 'S + will be + V3', 'examples': ['The results will be announced tomorrow.'], 'order': 2},
        ],
        'exercises': [
            {'question': 'Complete: "The report ___ (submit) yesterday." (Passive)', 'options': ['was submitted', 'submitted', 'is submitted', 'has submitted'], 'correct_answer': 'was submitted', 'explanation': 'Past passive: was/were + past participle.', 'order': 0},
        ],
    },
    {
        'title': 'Articles (a, an, the)',
        'slug': 'articles',
        'level': 'beginner',
        'category': 'Grammar',
        'description': 'Determine specificity and countability of nouns',
        'examples': ['I bought a book. The book is interesting.', 'An apple a day keeps the doctor away.'],
        'rules': [
            {'title': 'Indefinite Article (a/an)', 'explanation': 'Used before singular countable nouns mentioned for the first time', 'formula': 'a + consonant sound / an + vowel sound', 'examples': ['I saw a dog.', 'She is an engineer.'], 'order': 0},
            {'title': 'Definite Article (the)', 'explanation': 'Used when both speaker and listener know which thing is meant', 'formula': 'the + noun', 'examples': ['The sun rises in the east.', 'Pass me the salt, please.'], 'order': 1},
            {'title': 'No Article (zero article)', 'explanation': 'Used with plural/uncountable nouns in general statements', 'formula': '∅ + noun', 'examples': ['Water is essential for life.', 'Cats are independent animals.'], 'order': 2},
        ],
        'exercises': [
            {'question': 'What article goes before "hour"?', 'options': ['a', 'an', 'the', 'no article'], 'correct_answer': 'an', 'explanation': '"Hour" starts with a vowel sound /aʊ/, so we use "an".', 'order': 0},
        ],
    },
    {
        'title': 'Modal Verbs',
        'slug': 'modal-verbs',
        'level': 'intermediate',
        'category': 'Verbs',
        'description': 'Express ability, possibility, permission and obligation',
        'examples': ['You must submit the report by Friday.', 'She might be late.'],
        'rules': [
            {'title': 'Can / Could', 'explanation': 'Ability and possibility', 'formula': 'S + can/could + V1', 'examples': ['I can swim.', 'Could you help me?'], 'order': 0},
            {'title': 'Must / Should', 'explanation': 'Obligation and advice', 'formula': 'S + must/should + V1', 'examples': ['You must wear a seatbelt.', 'You should exercise daily.'], 'order': 1},
            {'title': 'May / Might', 'explanation': 'Possibility and permission', 'formula': 'S + may/might + V1', 'examples': ['It may rain tomorrow.', 'You may leave now.'], 'order': 2},
            {'title': 'Would / Will', 'explanation': 'Future/hypothetical actions', 'formula': 'S + would/will + V1', 'examples': ['Would you like some tea?', 'I will call you later.'], 'order': 3},
        ],
        'exercises': [
            {'question': 'Which modal expresses obligation?', 'options': ['can', 'might', 'must', 'would'], 'correct_answer': 'must', 'explanation': '"Must" expresses strong obligation or necessity.', 'order': 0},
        ],
    },
    {
        'title': 'Relative Clauses',
        'slug': 'relative-clauses',
        'level': 'advanced',
        'category': 'Clauses',
        'description': 'Add extra information about a noun using who, which, that, where, when',
        'examples': ['The car that I bought is very fast.', 'Paris, which is the capital of France, is beautiful.'],
        'rules': [
            {'title': 'Defining Relative Clauses', 'explanation': 'Essential information, no commas', 'formula': 'Noun + who/which/that + clause', 'examples': ['The woman who lives next door is a doctor.'], 'order': 0},
            {'title': 'Non-defining Relative Clauses', 'explanation': 'Extra information, uses commas', 'formula': 'Noun, + who/which + clause,', 'examples': ['My brother, who lives in London, is a teacher.'], 'order': 1},
            {'title': 'Relative Pronouns', 'explanation': 'who (people), which (things), that (people/things), where (places)', 'formula': 'who / which / that / where / when / whose', 'examples': ['The house where I grew up was sold.', "The man whose car was stolen called the police."], 'order': 2},
        ],
        'exercises': [
            {'question': 'Choose the correct relative pronoun: "The book ___ I read was amazing."', 'options': ['who', 'which', 'whom', 'where'], 'correct_answer': 'which', 'explanation': '"Which" is used for things. "That" would also be acceptable in defining clauses.', 'order': 0},
        ],
    },
]

VOCABULARY_DATA = [
    # Business
    {'word': 'Leverage', 'part_of_speech': 'verb', 'definition': 'To use something to maximum advantage', 'example': '"We can leverage our expertise to win new clients."', 'synonyms': ['utilize', 'exploit', 'employ'], 'category': 'business'},
    {'word': 'Synergy', 'part_of_speech': 'noun', 'definition': 'The combined power of a group working together', 'example': '"The merger created great synergy between the two companies."', 'synonyms': ['collaboration', 'cooperation', 'teamwork'], 'category': 'business'},
    {'word': 'Streamline', 'part_of_speech': 'verb', 'definition': 'To make a process simpler and more efficient', 'example': '"We need to streamline our workflow to save time."', 'synonyms': ['simplify', 'optimize', 'improve'], 'category': 'business'},
    {'word': 'Stakeholder', 'part_of_speech': 'noun', 'definition': 'A person with an interest or concern in something', 'example': '"All stakeholders must approve the new policy."', 'synonyms': ['shareholder', 'investor', 'participant'], 'category': 'business'},
    {'word': 'Pivot', 'part_of_speech': 'verb', 'definition': 'To change business strategy based on market feedback', 'example': '"The startup had to pivot its entire business model."', 'synonyms': ['shift', 'change', 'adapt'], 'category': 'business'},
    {'word': 'Scalable', 'part_of_speech': 'adjective', 'definition': 'Able to be expanded to handle increasing demand', 'example': '"We need a scalable solution for our growing user base."', 'synonyms': ['expandable', 'flexible', 'adaptable'], 'category': 'business'},
    {'word': 'Benchmark', 'part_of_speech': 'noun', 'definition': 'A standard or point of reference for comparison', 'example': '"Our performance exceeded the industry benchmark."', 'synonyms': ['standard', 'measure', 'yardstick'], 'category': 'business'},
    {'word': 'Onboard', 'part_of_speech': 'verb', 'definition': 'To integrate a new employee or client into an organization', 'example': '"We need to onboard five new developers this quarter."', 'synonyms': ['integrate', 'train', 'orient'], 'category': 'business'},
    # Academic
    {'word': 'Empirical', 'part_of_speech': 'adjective', 'definition': 'Based on observation or experience rather than theory', 'example': '"The study provided empirical evidence for the hypothesis."', 'synonyms': ['observational', 'experimental', 'factual'], 'category': 'academic'},
    {'word': 'Hypothesis', 'part_of_speech': 'noun', 'definition': 'A proposed explanation made as a starting point for investigation', 'example': '"The researchers formulated a hypothesis before conducting experiments."', 'synonyms': ['theory', 'assumption', 'proposition'], 'category': 'academic'},
    {'word': 'Paradigm', 'part_of_speech': 'noun', 'definition': 'A typical example or pattern of something; a model', 'example': '"This discovery represents a paradigm shift in our understanding."', 'synonyms': ['model', 'framework', 'pattern'], 'category': 'academic'},
    {'word': 'Synthesis', 'part_of_speech': 'noun', 'definition': 'Combination of elements to form a new whole', 'example': '"Her paper offered a synthesis of two competing theories."', 'synonyms': ['combination', 'integration', 'fusion'], 'category': 'academic'},
    {'word': 'Ambiguous', 'part_of_speech': 'adjective', 'definition': 'Open to more than one interpretation', 'example': '"The results were ambiguous and required further analysis."', 'synonyms': ['unclear', 'vague', 'equivocal'], 'category': 'academic'},
    {'word': 'Methodology', 'part_of_speech': 'noun', 'definition': 'A system of methods used in a particular study', 'example': '"The research methodology was clearly outlined in the paper."', 'synonyms': ['approach', 'procedure', 'technique'], 'category': 'academic'},
    {'word': 'Qualitative', 'part_of_speech': 'adjective', 'definition': 'Relating to the quality or nature of something rather than quantity', 'example': '"We used qualitative research methods for this study."', 'synonyms': ['descriptive', 'non-numerical', 'subjective'], 'category': 'academic'},
    {'word': 'Quantitative', 'part_of_speech': 'adjective', 'definition': 'Relating to, measuring, or measured by quantity', 'example': '"The quantitative data showed a 30% increase in sales."', 'synonyms': ['numerical', 'measurable', 'statistical'], 'category': 'academic'},
    # Everyday
    {'word': 'Serendipity', 'part_of_speech': 'noun', 'definition': 'The occurrence of fortunate events by chance', 'example': '"Meeting her was pure serendipity — we were both lost!"', 'synonyms': ['luck', 'chance', 'fortune'], 'category': 'everyday'},
    {'word': 'Procrastinate', 'part_of_speech': 'verb', 'definition': 'To delay or postpone action; to put off doing something', 'example': '"Stop procrastinating and start working on your assignment."', 'synonyms': ['delay', 'postpone', 'stall'], 'category': 'everyday'},
    {'word': 'Ephemeral', 'part_of_speech': 'adjective', 'definition': 'Lasting for a very short time', 'example': '"The beauty of cherry blossoms is ephemeral."', 'synonyms': ['brief', 'fleeting', 'transient'], 'category': 'everyday'},
    {'word': 'Resilient', 'part_of_speech': 'adjective', 'definition': 'Able to withstand or recover quickly from difficult conditions', 'example': '"She is incredibly resilient despite all the challenges she faced."', 'synonyms': ['tough', 'strong', 'adaptable'], 'category': 'everyday'},
    {'word': 'Melancholy', 'part_of_speech': 'noun', 'definition': 'A feeling of pensive sadness, typically with no obvious cause', 'example': '"There was a touch of melancholy in the autumn air."', 'synonyms': ['sadness', 'gloom', 'sorrow'], 'category': 'everyday'},
    {'word': 'Tenacious', 'part_of_speech': 'adjective', 'definition': 'Tending to keep a firm hold of something; persistent', 'example': '"Her tenacious spirit helped her overcome every obstacle."', 'synonyms': ['persistent', 'determined', 'stubborn'], 'category': 'everyday'},
]

FLASHCARD_DATA = [
    {'question': 'What is the past tense of "go"?', 'answer': 'went', 'category': 'Irregular Verbs', 'difficulty': 'easy'},
    {'question': 'What is the past tense of "bring"?', 'answer': 'brought', 'category': 'Irregular Verbs', 'difficulty': 'easy'},
    {'question': 'What is the past tense of "teach"?', 'answer': 'taught', 'category': 'Irregular Verbs', 'difficulty': 'medium'},
    {'question': 'Complete: "If I ___ (be) you, I would apologize."', 'answer': 'were', 'category': 'Conditionals', 'difficulty': 'medium'},
    {'question': 'What article goes before "hour"?', 'answer': 'an (because "hour" starts with a vowel sound)', 'category': 'Articles', 'difficulty': 'easy'},
    {'question': 'What is the past tense of "write"?', 'answer': 'wrote', 'category': 'Irregular Verbs', 'difficulty': 'easy'},
    {'question': 'Complete: "The report ___ (submit) yesterday." (Passive)', 'answer': 'was submitted', 'category': 'Passive Voice', 'difficulty': 'medium'},
    {'question': 'What word means "to use something to maximum advantage"?', 'answer': 'leverage', 'category': 'Vocabulary', 'difficulty': 'easy'},
    {'question': 'What is the past tense of "choose"?', 'answer': 'chose', 'category': 'Irregular Verbs', 'difficulty': 'medium'},
    {'question': 'Complete: "She ___ (live) here for 10 years." (Present Perfect)', 'answer': 'has lived', 'category': 'Present Perfect', 'difficulty': 'medium'},
    {'question': 'What does "ephemeral" mean?', 'answer': 'Lasting for a very short time', 'category': 'Vocabulary', 'difficulty': 'hard'},
    {'question': 'What is the formula for First Conditional?', 'answer': 'If + Present Simple, will + base verb', 'category': 'Conditionals', 'difficulty': 'medium'},
    {'question': 'What is the past tense of "think"?', 'answer': 'thought', 'category': 'Irregular Verbs', 'difficulty': 'easy'},
    {'question': 'What is the past tense of "know"?', 'answer': 'knew', 'category': 'Irregular Verbs', 'difficulty': 'easy'},
    {'question': 'Complete: "English ___ (speak) all over the world." (Passive)', 'answer': 'is spoken', 'category': 'Passive Voice', 'difficulty': 'medium'},
    {'question': 'Which relative pronoun is used for people?', 'answer': 'who', 'category': 'Relative Clauses', 'difficulty': 'easy'},
    {'question': 'What does "empirical" mean?', 'answer': 'Based on observation or experience rather than theory', 'category': 'Vocabulary', 'difficulty': 'hard'},
    {'question': 'What is the past tense of "begin"?', 'answer': 'began', 'category': 'Irregular Verbs', 'difficulty': 'medium'},
    {'question': 'What modal verb expresses strong obligation?', 'answer': 'must', 'category': 'Modal Verbs', 'difficulty': 'easy'},
    {'question': 'What does "serendipity" mean?', 'answer': 'The occurrence of fortunate events by chance', 'category': 'Vocabulary', 'difficulty': 'hard'},
]


class Command(BaseCommand):
    help = 'Seed the database with initial grammar, vocabulary, and flashcard data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding grammar topics...')
        for item in GRAMMAR_DATA:
            rules_data = item.pop('rules', [])
            exercises_data = item.pop('exercises', [])
            topic, created = GrammarTopic.objects.update_or_create(
                slug=item['slug'], defaults=item
            )
            if created or self.style.SUCCESS:
                GrammarRule.objects.filter(topic=topic).delete()
                for r in rules_data:
                    GrammarRule.objects.create(topic=topic, **r)
                Exercise.objects.filter(topic=topic).delete()
                for e in exercises_data:
                    Exercise.objects.create(topic=topic, **e)

        self.stdout.write('Seeding vocabulary words...')
        for item in VOCABULARY_DATA:
            VocabularyWord.objects.get_or_create(
                word=item['word'], category=item['category'], defaults=item
            )

        self.stdout.write('Seeding flashcards...')
        for item in FLASHCARD_DATA:
            Flashcard.objects.get_or_create(
                question=item['question'], defaults=item
            )

        self.stdout.write('Creating demo user (username: demo, password: demo1234)...')
        if not User.objects.filter(username='demo').exists():
            user = User.objects.create_user(username='demo', email='demo@example.com', password='demo1234')
            UserProfile.objects.create(user=user, display_name='Demo User', bio='English learner')

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
