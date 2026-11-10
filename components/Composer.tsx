type Props = {
  title: string;
  text: string;
  onTitleChange: (v: string) => void;
  onTextChange: (v: string) => void;
  onSave: () => void;
  onBack: () => void;
  placeholder: string
};

export default function Composer({
  title,
  text,
  onTitleChange,
  onTextChange,
  onSave,
  onBack,
  placeholder,
}: Props) {
  return (
    <div className="lire-composer mx-auto max-w-2xl">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-[#89877e] hover:text-black"
      >
        ← Back to reading
      </button>
      <p className="text-xs uppercase tracking-[0.18em] text-[#89877e]">
        Personal collection
      </p>
      <h1 className="mt-2 font-serif text-3xl">Add a reading</h1>
      <p className="mt-2 text-sm text-[#89877e]">
        Paste a text you want to study. It will be saved in this
        browser.
      </p>
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Reading title"
        className="mt-6 w-full rounded-lg border border-[#e8e5dc] p-3 text-sm outline-none focus:border-[#71816c]"
      />
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className="mt-3 w-full resize-y rounded-lg border border-[#e8e5dc] p-3 text-sm leading-7 outline-none focus:border-[#71816c]"
      />
      <button
        onClick={onSave}
        disabled={!title.trim() || !text.trim()}
        className="mt-4 rounded-lg bg-[#465642] px-6 py-3 text-sm text-white hover:bg-[#34432f] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Save reading
      </button>
    </div>
  );
}