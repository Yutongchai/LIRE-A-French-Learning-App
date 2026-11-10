import type { GrammarItem } from "@/lib/types";

export default function GrammarSection({ items, title }: { items: GrammarItem[], title: string }) {
    return (
        <div className="mt-10 border-t border-[#eeece5] pt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#99958a]">
                02 — Grammar
            </p>
            <h3 className="mt-2 font-serif text-2xl">{title}</h3>
            {items.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {items.map((item) => (
                        <div key={item.title} className="rounded-lg bg-[#f8f7f3] p-5">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="mt-3 text-sm leading-6 text-[#77756c]">
                                {item.explanation}
                            </p>
                            <p className="mt-3 font-serif text-sm italic">{item.example}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-sm text-[#89877e]">
                    Grammar notes can be added in a future version.
                </p>
            )}
        </div>
    );
}