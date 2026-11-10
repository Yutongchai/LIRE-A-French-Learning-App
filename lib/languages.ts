export type Language = "fr" | "zh" | "ms";
export type Script = "traditional" | "simplified";

export function parseLanguage(v: unknown): Language {
    return v === "zh" || v === "ms" ? v : "fr";
}

export const LANGUAGES: Record<
    Language,
    {
        label: string;
        flag: string;
        nativeLabel: string;
        headline: string;
        tagline: string;
        levels: readonly string[];
        defaultLevel: string;
        topicPlaceholder: string;
        composerPlaceholder: string;
        sectionTitles: { vocab: string; grammar: string; practice: string };
    }
> = {
    fr: {
        label: "French",
        flag: "🇫🇷",
        nativeLabel: "FR",
        headline: "Bonjour, lisons !",
        tagline: "Un peu de français, chaque jour.",
        levels: ["A1", "A2", "B1", "B2", "C1"],
        defaultLevel: "B1",
        topicPlaceholder: "e.g. street food in Lyon, climate change, job interview",
        composerPlaceholder: "Collez votre texte français ici...",
        sectionTitles: {
            vocab: "Mots à retenir",
            grammar: "Points de grammaire",
            practice: "Vérifiez votre compréhension",
        },
    },
    zh: {
        label: "Chinese",
        flag: "🇨🇳",
        nativeLabel: "中文",
        headline: "你好，一起来读吧！",
        tagline: "每天读一点中文。",
        levels: ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"],
        defaultLevel: "HSK 3",
        topicPlaceholder: "e.g. night markets, remote work, Chinese New Year",
        composerPlaceholder: "在这里粘贴中文文章……",
        sectionTitles: {
            vocab: "重点词汇",
            grammar: "语法要点",
            practice: "理解练习",
        },
    },
    ms: {
        label: "Malay",
        flag: "🇲🇾",
        nativeLabel: "BM",
        headline: "Selamat datang, jom baca!",
        tagline: "Sedikit Bahasa Melayu, setiap hari.",
        levels: ["A1", "A2", "B1", "B2", "C1"],
        defaultLevel: "B1",
        topicPlaceholder: "e.g. pasar malam, kerja dari rumah, Hari Raya",
        composerPlaceholder: "Tampal teks Bahasa Melayu di sini...",
        sectionTitles: {
            vocab: "Perbendaharaan kata",
            grammar: "Tatabahasa",
            practice: "Soalan kefahaman",
        },
    },
};