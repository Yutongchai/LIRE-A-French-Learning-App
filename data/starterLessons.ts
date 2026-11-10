import type { Lesson } from "@/lib/types";

export const starterLessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "L'art de prendre son temps",
    category: "Vie quotidienne",
    level: "B1",
    duration: "5 min",
    content:
      "Dans une société où tout va de plus en plus vite, prendre son temps est devenu un véritable luxe. Beaucoup de personnes ont l'impression de devoir toujours être productives. Pourtant, apprendre à ralentir peut avoir des effets positifs sur notre bien-être. Par exemple, prendre un café sans regarder son téléphone ou se promener dans un parc permet de profiter davantage du moment présent. Il ne s'agit pas de ne rien faire, mais simplement de trouver un meilleur équilibre entre le travail et la vie personnelle.",
    translation:
      "In a society where everything is moving faster and faster, taking one's time has become a real luxury. Many people feel that they always have to be productive. However, learning to slow down can have positive effects on our well-being. For example, having a coffee without looking at one's phone or walking in a park allows us to enjoy the present moment more. It is not about doing nothing, but simply finding a better balance between work and personal life.",
    vocabulary: [
      { word: "un luxe", meaning: "a luxury", example: "Le temps libre est un luxe." },
      { word: "ralentir", meaning: "to slow down", example: "Il faut parfois ralentir." },
      { word: "le bien-être", meaning: "well-being", example: "Le sport améliore le bien-être." },
      { word: "davantage", meaning: "more / further", example: "Je voudrais en apprendre davantage." },
      { word: "un équilibre", meaning: "a balance", example: "Trouver un équilibre est important." },
    ],
    grammar: [
      {
        title: "Devenir + noun / adjective",
        explanation:
          "Devenir means 'to become'. It is commonly followed by a noun or an adjective.",
        example: "Prendre son temps est devenu un luxe.",
      },
      {
        title: "Il ne s'agit pas de...",
        explanation:
          "This expression means 'It is not a question of...' or 'It is not about...'.",
        example: "Il ne s'agit pas de travailler plus.",
      },
    ],
    questions: [
      {
        question: "Pourquoi prendre son temps est-il devenu un luxe ?",
        options: [
          "Parce que les gens sont toujours occupés.",
          "Parce que les cafés sont chers.",
          "Parce que les parcs sont fermés.",
        ],
        answer: 0,
      },
      {
        question: "Quel est l'objectif de ralentir ?",
        options: [
          "Travailler davantage.",
          "Profiter du moment présent.",
          "Éviter toutes les responsabilités.",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "lesson-2",
    title: "Voyager seul : une expérience unique",
    category: "Voyage",
    level: "B1",
    duration: "5 min",
    content:
      "Voyager seul peut sembler intimidant au début, surtout lorsqu'on a l'habitude de partir avec des amis ou sa famille. Cependant, cette expérience permet de mieux se connaître. On peut organiser ses journées comme on le souhaite, découvrir des endroits inattendus et rencontrer des personnes de cultures différentes. Bien sûr, il faut aussi apprendre à résoudre certains problèmes sans l'aide de quelqu'un. Mais avec un peu de préparation, voyager seul peut devenir une expérience enrichissante et inoubliable.",
    translation:
      "Travelling alone can seem intimidating at first, especially when one is used to travelling with friends or family. However, this experience allows us to get to know ourselves better. We can organise our days as we wish, discover unexpected places and meet people from different cultures. Of course, we also have to learn to solve certain problems without someone's help. But with a little preparation, travelling alone can become an enriching and unforgettable experience.",
    vocabulary: [
      { word: "intimidant", meaning: "intimidating", example: "Parler en public peut être intimidant." },
      { word: "avoir l'habitude de", meaning: "to be used to", example: "J'ai l'habitude de voyager." },
      { word: "inattendu", meaning: "unexpected", example: "Nous avons découvert un endroit inattendu." },
      { word: "enrichissant", meaning: "enriching", example: "Cette expérience était enrichissante." },
      { word: "sans l'aide de", meaning: "without the help of", example: "Elle a réussi sans l'aide de personne." },
    ],
    grammar: [
      {
        title: "Avoir l'habitude de + infinitive",
        explanation:
          "Use this expression to describe something you are accustomed to doing.",
        example: "J'ai l'habitude de voyager seule.",
      },
      {
        title: "Permettre de + infinitive",
        explanation:
          "This construction means 'to allow someone to do something'.",
        example: "Voyager permet de découvrir le monde.",
      },
    ],
    questions: [
      {
        question: "Que permet de faire un voyage en solo ?",
        options: [
          "Mieux se connaître.",
          "Éviter toutes les difficultés.",
          "Voyager gratuitement.",
        ],
        answer: 0,
      },
      {
        question: "Que faut-il faire avant de voyager seul ?",
        options: [
          "Ne rien organiser.",
          "Bien se préparer.",
          "Toujours voyager avec sa famille.",
        ],
        answer: 1,
      },
    ],
  },
];