

import React, { useMemo, useRef, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { humanizeText } from "../services/humanizerService";

const TONES = ["Standard", "Formal", "Professional", "Casual", "Friendly", "Empathetic"];

export default function HumanizeUploadPage() {
  const [tone, setTone] = useState("Standard");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [copied, setCopied] = useState(false);
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

  /* -------------------- TOAST (TOP CENTER) -------------------- */
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%) translateY(-10px)";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "15px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "99999";
    toast.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.35s ease, transform 0.35s ease";

    if (type === "error") {
      toast.style.background = "linear-gradient(to right, #ff4b2b, #ff416c)";
      toast.style.color = "white";
    } else {
      toast.style.background = "linear-gradient(to right, #ff7849, #ff416c)";
      toast.style.color = "white";
    }

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(-10px)";
      setTimeout(() => toast.remove(), 350);
    }, 2000);
  }

  /* -------------------- HUMANIZE HANDLER -------------------- */
 async function handleHumanize() {
  if (!input.trim()) return;

  // Minimum 50 characters check
  if (input.trim().length < 50) {
    showToast("Minimum 50 characters required.", "error");
    return;
  }

  setIsProcessing(true);
  setOutput("");

  try {
    const selectedTone = tone === "Standard" ? undefined : tone;
    const result = await humanizeText(input, selectedTone);

    // 🔥 NEW: Backend error text filter – do NOT show in output box
    if (result) {
      const trimmed = result.trim();

      // You can tweak these conditions, but this catches your Gemini error case
      const looksLikeError =
        trimmed.startsWith("❌") ||
        trimmed.toLowerCase().includes("error while calling gemini api") ||
        trimmed.toLowerCase().includes("the model is overloaded");

      if (looksLikeError) {
        console.error("Backend returned error text:", result);
        showToast("Something went wrong. Please try again after some time.", "error");
        return; // ⬅️ important: don't setOutput
      }
    }

    setOutput(result || "No response received.");
  } catch (error) {
    console.error("Humanize API error:", error);
    showToast("Something went wrong. Please try again.", "error");
  } finally {
    setIsProcessing(false);
  }
}


  function handleCopyOutput() {
    if (output.trim()) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDeleteClick() {
    if (dontShowAgain) {
      setInput("");
      setOutput("");
      return;
    }
    setShowDeleteModal(true);
  }

  function confirmDelete() {
    setInput("");
    setOutput("");
    setShowDeleteModal(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff4e8] to-[#fffaf6] text-gray-800 font-sans">

      {/* --- NAVBAR --- */}
      <header className="border-b border-orange-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-3 flex items-center gap-3">
          <img src="/quutoo.png" alt="SimplifyAITools Logo" className="h-9 w-9 object-contain" />
          <span className="font-semibold text-lg text-gray-900 tracking-tight">
            Simplify<span className="text-orange-500">AITools</span>
          </span>
        </div>
      </header>

      {/* ------------------ PAGE CONTENT ------------------ */}
      <div className="w-full px-4 md:px-8 py-10 overflow-hidden">
        <h1 className="text-center text-3xl md:text-4xl font-bold text-gray-800 mb-8">
          Humanize Your AI Text Effortlessly ✨
        </h1>

        {/* Tone Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
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

        {/* Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ---------- INPUT BOX ---------- */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 flex flex-col relative h-[65vh] md:h-[62vh]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-600">Insert text here</span>
              <div className="flex items-center gap-2">
                {input && (
                  <button onClick={handleDeleteClick} className="p-1 text-red-500 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={handlePasteFromClipboard}
                  className="px-3 py-1 rounded-md text-sm font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 transition"
                >
                  Paste
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden pr-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste or type your text here..."
                className="w-full h-full resize-none outline-none bg-transparent text-gray-700 p-2 overflow-y-auto"
              />
            </div>

            <div className="sticky bottom-0 left-0 right-0 -mx-4 px-4 pt-2 bg-white">
              <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-2">
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
          </div>

          {/* ---------- OUTPUT BOX ---------- */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 flex flex-col relative h-[65vh] md:h-[62vh]">
            <div className="flex justify-between items-center mb-2 relative">
              <span className="font-medium text-gray-600">Humanized output</span>

              <div className="relative">
                <button
                  onClick={handleCopyOutput}
                  title="Copy to clipboard"
                  className="text-orange-500 hover:text-orange-600 transition"
                >
                  <Copy size={18} />
                </button>
                {copied && (
                  <div className="absolute -top-8 right-0 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-md">
                    Copied ✓
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden pr-0">
              <textarea
                readOnly
                value={output}
                placeholder="Your humanized text will appear here."
                className="w-full h-full resize-none outline-none bg-transparent text-gray-700 p-2 overflow-y-auto"
              />
            </div>

            <div className="sticky bottom-0 left-0 right-0 -mx-4 px-4 bg-white pt-2">
              <div className="text-sm text-gray-500 border-t border-gray-100 pt-2">
                {outputWordCount} words
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Paste your text and click <strong>Humanize</strong> to get a natural rewrite.
          Styled for SimplifyAITools ✨
        </p>
      </div>

      {/* --- CLEAN FOOTER (MATCHES SIMPLIFYAITOOLS.COM) --- */}
<footer className="bg-white border-t border-gray-200 mt-20 pt-12">
  <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-gray-800">

    {/* Left Section - Logo + About */}
    <div>
      <div className="flex items-center gap-3 mb-4">
        <img src="/quutoo.png" className="h-12 w-12 object-contain" alt="Logo" />
        <span className="text-2xl font-bold text-[#0f2137]">
          Simplify<span className="text-orange-500">AITools</span>
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Discover 1000+ AI tools with user reviews and a research lab for easy
        exploration and informed choices.
      </p>

      {/* Social Icons - SVG (small & clean) */}
      <div className="flex items-center gap-4 text-gray-600">

        {/* Instagram */}
        <a href="https://www.instagram.com/simplifyaitools/" target="_blank">
          <svg className="w-6 h-6 hover:text-orange-500 transition" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.5.5.6.2 1 .5 1.5 1 .5.5.8.9 1 1.5.2.5.4 1.3.5 2.5.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.5-.2.6-.5 1-1 1.5-.5.5-.9.8-1.5 1-.5.2-1.3.4-2.5.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.5-.5-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.4-1.3-.5-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .5-2.5.2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1.3-.4 2.5-.5C8.4 2.2 8.8 2.2 12 2.2m0 2.3c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-2 .4-.5.2-.8.4-1.2.8-.4.4-.6.7-.8 1.2-.1.4-.3 1-.4 2-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.4 2 .2.5.4.8.8 1.2.4.4.7.6 1.2.8.4.1 1 .3 2 .4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 2-.4.5-.2.8-.4 1.2-.8.4-.4.6-.7.8-1.2.1-.4.3-1 .4-2 .1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.4-2-.2-.5-.4-.8-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.1-1-.3-2-.4-1.2-.1-1.6-.1-4.7-.1z" />
            <path d="M12 5.8A6.2 6.2 0 1 0 18.2 12 6.2 6.2 0 0 0 12 5.8m0 10.3A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.9a1.4 1.4 0 1 1-1.4-1.4 1.4 1.4 0 0 1 1.4 1.4z" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a href="https://www.linkedin.com/company/simplify-aitools/posts/?feedView=all" target="_blank">
          <svg className="w-6 h-6 hover:text-orange-500 transition" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.5c-1 0-1.7-.8-1.7-1.7 0-1 .8-1.7 1.7-1.7s1.7.8 1.7 1.7c0 1-.8 1.7-1.7 1.7zm13.5 11.5h-3v-5.6c0-1.3-.5-2.2-1.7-2.2-.9 0-1.4.6-1.7 1.2-.1.2-.1.5-.1.8v5.8h-3v-10h3v1.4c.4-.6 1.3-1.5 3-1.5 2.2 0 3.8 1.4 3.8 4.4v5.7z" />
          </svg>
        </a>

        {/* Facebook */}
        <a href="https://www.facebook.com/people/simplifyaitools/61577789122286/" target="_blank">
          <svg className="w-6 h-6 hover:text-orange-500 transition" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v2h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12z"/>
          </svg>
        </a>

        {/* X / Twitter */}
        <a href="https://x.com/SimplifyAItools" target="_blank">
          <svg className="w-6 h-6 hover:text-orange-500 transition" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.9 2H22l-7.8 9 9 11h-7l-5.3-6.6L5.7 22H2l8.3-9.7L2.8 2h7l4.8 6.1L18.9 2z" />
          </svg>
        </a>

        {/* YouTube */}
        <a href="https://www.youtube.com/@Simplifyaitoolsmkt" target="_blank">
          <svg className="w-6 h-6 hover:text-orange-500 transition" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.5 6.2s-.2-1.7-.9-2.4c-.9-.9-1.9-.9-2.4-1C16.7 2.4 12 2.4 12 2.4h-.1s-4.7 0-8.1.4c-.5.1-1.5.1-2.4 1-.7.7-.9 2.4-.9 2.4S0 8.1 0 9.9v1.9c0 1.8.2 3.7.2 3.7s.2 1.7.9 2.4c.9.9 2.1.8 2.6 1 1.9.2 7.9.4 7.9.4s4.7 0 8.1-.4c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.4.9-2.4s.2-1.9.2-3.7V9.9c0-1.8-.2-3.7-.2-3.7zM9.7 14.5V7.9l6.1 3.3-6.1 3.3z"/>
          </svg>
        </a>
      </div>
    </div>

    {/* Explore */}
    <div>
      <h3 className="font-bold text-lg mb-4">Explore</h3>
      <ul className="space-y-2 text-sm">
        <li><a href="https://simplifyaitools.com/ai-tools/" target="_blank" className="hover:text-orange-500">Free Tools</a></li>
        <li><a href="https://simplifyaitools.com/ai-categories/" target="_blank" className="hover:text-orange-500">ChatBots</a></li>
        <li><a href="https://simplifyaitools.com/category/productivity/llm-ai-models/" target="_blank" className="hover:text-orange-500">LLM</a></li>
        <li><a href="https://simplifyaitools.com/submit-tool/" target="_blank" className="hover:text-orange-500">Submit Tool</a></li>
        <li><a href="https://simplifyaitools.com/guest-contributor/" target="_blank" className="hover:text-orange-500">Apply as a Guest contributor</a></li>
      </ul>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="font-bold text-lg mb-4">Quick Links</h3>
      <ul className="space-y-2 text-sm">
        <li><a href="https://simplifyaitools.com/submit-tool/" className="hover:text-orange-500">Submit Tool</a></li>
        <li><a href="https://simplifyaitools.com/advertise/" className="hover:text-orange-500">Advertise</a></li>
        <li><a href="https://simplifyaitools.com/contributors/" className="hover:text-orange-500">Our Contributors</a></li>
        <li><a href="https://simplifyaitools.com/careers/" className="hover:text-orange-500">Careers</a></li>
        <li><a href="https://simplifyaitools.com/contact-us/" className="hover:text-orange-500">Contact Us</a></li>
      </ul>
    </div>

    {/* Get In Touch */}
    <div>
      <h3 className="font-bold text-lg mb-4">Get In Touch</h3>

      <p className="text-sm text-gray-700">
        <strong>Address : </strong>D-225, 3<sup>rd</sup> FLOOR, B–BLOCK, SECTOR–63, NOIDA
      </p>
      <p className="text-sm text-gray-700 mt-2">
        <strong>Email:</strong> ainerdbox@simplifyaitools.com
      </p>
      <p className="text-sm text-gray-700 mt-2">
        <strong>Hours:</strong> Mon–Fri 9:00AM – 5:00PM
      </p>

      <p className="text-gray-500 text-xs mt-4">Powered By</p>
      <img
        src="https://simplifyaitools.com/wp-content/uploads/2024/09/byond-boundrys.png"
        className="h-12 mt-2"
        alt="BYOND BOUNDRYS"
      />
    </div>
  </div>

  {/* Bottom Grey Bar */}
  <div className="bg-[#f5f5f5] text-center text-xs text-gray-600 py-4 mt-10">
    © {new Date().getFullYear()} SimplifyAITools. All rights reserved.
  </div>
</footer>


      {/* ------------------ DELETE MODAL ------------------ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              You’re about to delete the Original and Paraphrased text
            </h2>
            <label className="flex items-center justify-center gap-2 text-gray-600 mb-4 text-sm">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              Don’t show again
            </label>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold hover:opacity-90 transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function countWords(text) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  return tokens.length;
}
