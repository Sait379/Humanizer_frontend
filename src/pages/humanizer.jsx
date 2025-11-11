import React, { useMemo, useRef, useState } from "react";
import { Copy } from "lucide-react";

const TONES = [
  "Standard",
  "Formal",
  "Professional",
  "Casual",
  "Friendly",
  "Empathetic",
];

export default function HumanizeUploadPage() {
  const [tone, setTone] = useState("Standard");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);

  const inputWordCount = useMemo(() => countWords(input), [input]);
  const outputWordCount = useMemo(() => countWords(output), [output]);

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        if (inputRef.current) inputRef.current.focus();
      }
    } catch (error) {
      console.error("Clipboard access denied:", error);
      alert("Please allow clipboard access or press Ctrl+V manually.");
    }
  }

  async function handleHumanize() {
    if (!input.trim()) return;
    setIsProcessing(true);

    await new Promise((r) => setTimeout(r, 800));
    setOutput(
      `Humanized (${tone}) version:\n\n` +
        input.replace(/\s+/g, " ").replace(/\n{2,}/g, "\n\n").trim()
    );
    setIsProcessing(false);
  }

  function handleCopyOutput() {
    if (output.trim()) {
      navigator.clipboard.writeText(output);
      alert("Humanized text copied to clipboard!");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff4e8] to-[#fffaf6] text-gray-800 font-sans">
      {/* Navbar */}
      <header className="border-b border-orange-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="w-full px-6 md:px-12 py-4 flex items-center gap-2">
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-lg px-2 py-1 text-sm">
            🤖 SimplifyAITools
          </div>
          <span className="font-semibold text-lg text-gray-800">Humanizer</span>
        </div>
      </header>

      {/* Page Content */}
     <div className="w-full px-4 md:px-8 py-10">

        <h1 className="text-center text-3xl md:text-4xl font-bold text-gray-800 mb-8">
          Humanize Your AI Text Effortlessly ✨
        </h1>

        {/* Tone Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 shadow-sm ${
                tone === t
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Text Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 flex flex-col min-h-[550px]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-600">Insert text here</span>
              <button
                onClick={handlePasteFromClipboard}
                className="px-3 py-1 rounded-md text-sm font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 transition"
              >
                Paste
              </button>
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type your text here..."
              className="flex-1 resize-none outline-none bg-transparent text-gray-700 p-2"
            />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>{inputWordCount} words</span>
              <button
                onClick={handleHumanize}
                disabled={!input.trim() || isProcessing}
                className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                {isProcessing ? "Processing..." : "Humanize"}
              </button>
            </div>
          </div>

          {/* Output Box */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 flex flex-col min-h-[550px]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-600">Humanized output</span>
              <button
                onClick={handleCopyOutput}
                title="Copy to clipboard"
                className="text-orange-500 hover:text-orange-600 transition"
              >
                <Copy size={18} />
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Your humanized text will appear here."
              className="flex-1 resize-none outline-none bg-transparent text-gray-700 p-2"
            />
            <div className="text-sm text-gray-500 mt-2">{outputWordCount} words</div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-10">
          Paste your text and click <strong>Humanize</strong> to get a natural rewrite.
          Styled for SimplifyAITools ✨
        </p>
      </div>
    </div>
  );
}

function countWords(text) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  return tokens.length;
}
