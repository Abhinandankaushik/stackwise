import { useState } from "react";
import { Code, X, Copy, Check } from "lucide-react";
import type { UseCase } from "@/lib/audit-engine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTeamSize?: number;
  initialUseCase?: UseCase;
}

export function WidgetModal({ isOpen, onClose, initialTeamSize = 1, initialUseCase = "coding" }: Props) {
  const [widgetSize, setWidgetSize] = useState(initialTeamSize);
  const [widgetUseCase, setWidgetUseCase] = useState<UseCase>(initialUseCase);
  const [widgetTheme, setWidgetTheme] = useState("dark");
  const [widgetCodeCopied, setWidgetCodeCopied] = useState(false);

  if (!isOpen) return null;

  function handleCopyWidgetCode() {
    const embedCode = `<iframe src="${window.location.origin}/widget?theme=${widgetTheme}&teamSize=${widgetSize}&useCase=${widgetUseCase}" width="100%" height="450" style="border:1px solid #30363d;border-radius:12px;background:${widgetTheme === "dark" ? "#14151a" : "transparent"};"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setWidgetCodeCopied(true);
    setTimeout(() => setWidgetCodeCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 no-print animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer p-1"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Code className="text-primary" size={20} /> Embeddable Widget Creator
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize and embed a mini Stackwise calculator on your website or blog. Attract leads and refer users directly to Stackwise.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Customization</h4>
            
            <label className="block">
              <span className="text-xs text-muted-foreground font-medium">Default Team Size</span>
              <input
                type="number"
                min={1}
                value={widgetSize}
                onChange={(e) => setWidgetSize(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg bg-input text-foreground border border-border px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </label>

            <label className="block">
              <span className="text-xs text-muted-foreground font-medium">Default Use Case</span>
              <select
                value={widgetUseCase}
                onChange={(e) => setWidgetUseCase(e.target.value as UseCase)}
                className="mt-1 w-full rounded-lg bg-input text-foreground border border-border px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
                <option value="coding">Coding</option>
                <option value="writing">Writing</option>
                <option value="data">Data</option>
                <option value="research">Research</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-muted-foreground font-medium">Theme Style</span>
              <select
                value={widgetTheme}
                onChange={(e) => setWidgetTheme(e.target.value)}
                className="mt-1 w-full rounded-lg bg-input text-foreground border border-border px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
                <option value="dark">Dark Editorial</option>
                <option value="transparent">Transparent / Light</option>
              </select>
            </label>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Live Preview</h4>
            <div className="rounded-xl border border-border overflow-hidden bg-background h-[200px] relative">
              <iframe
                src={`${window.location.origin}/widget?theme=${widgetTheme}&teamSize=${widgetSize}&useCase=${widgetUseCase}`}
                title="Stackwise Widget Preview"
                className="w-full h-full border-none"
                scrolling="no"
              />
            </div>
          </div>
        </div>

        {/* Copy Code */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">Copy Embed Code</span>
            <button
              onClick={handleCopyWidgetCode}
              className="text-xs font-semibold text-primary flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              {widgetCodeCopied ? (
                <>
                  <Check size={12} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy to clipboard
                </>
              )}
            </button>
          </div>
          <textarea
            readOnly
            value={`<iframe src="${window.location.origin}/widget?theme=${widgetTheme}&teamSize=${widgetSize}&useCase=${widgetUseCase}" width="100%" height="450" style="border:1px solid #30363d;border-radius:12px;background:${widgetTheme === "dark" ? "#14151a" : "transparent"};"></iframe>`}
            className="w-full rounded-lg bg-background font-mono text-xs border border-border p-3 outline-none min-h-[80px] focus:ring-1 focus:ring-primary/50 resize-none text-foreground"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary text-foreground px-4 py-2 text-sm font-semibold border border-border hover:border-primary/50 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
