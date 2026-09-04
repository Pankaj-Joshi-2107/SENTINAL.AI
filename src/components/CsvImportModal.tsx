import React, { useState, useRef } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Post, Platform } from "../types";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedPosts: Post[]) => void;
  onResetToDemo: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onResetToDemo
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedPosts, setParsedPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setWarning(null);
    setParsedPosts(null);
    setFileName(file.name);

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Invalid file format. Please upload a .csv file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setError("File appears to be empty.");
        return;
      }
      parseCSV(text);
    };
    reader.onerror = () => {
      setError("Failed to read the uploaded CSV file.");
    };
    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
    const lines = content.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setError("CSV must contain at least a header row and 1 data row.");
      return;
    }

    // Required columns: id, username, platform, timestamp, text, hashtags, url, likes, comments, shares, followers
    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));

    const requiredCols = ["username", "text"];
    const missing = requiredCols.filter((col) => !headers.includes(col));
    if (missing.length > 0) {
      setError(`Missing required column(s): ${missing.join(", ")}. Standard required schema: id, username, platform, timestamp, text, hashtags, url, likes, comments, shares, followers`);
      return;
    }

    const colIndex = (name: string) => headers.indexOf(name);

    const posts: Post[] = [];
    let malformedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle simple CSV splitting with quotes
      const values: string[] = [];
      let inQuote = false;
      let currentVal = "";

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuote = !inQuote;
        } else if (char === "," && !inQuote) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const getVal = (colName: string) => {
        const idx = colIndex(colName);
        if (idx === -1 || idx >= values.length) return "";
        return values[idx].replace(/^["']|["']$/g, "").trim();
      };

      const username = getVal("username");
      const postText = getVal("text");

      if (!username || !postText) {
        malformedCount++;
        continue;
      }

      const id = getVal("id") || `custom-${i}`;
      const platformRaw = getVal("platform").toLowerCase();
      const platform: Platform = ["twitter", "instagram", "facebook", "linkedin", "threads"].includes(platformRaw)
        ? (platformRaw as Platform)
        : "twitter";
      const timestamp = getVal("timestamp") || new Date().toISOString();
      const hashtagsRaw = getVal("hashtags");
      const hashtags = hashtagsRaw
        ? hashtagsRaw.split(";").map((t) => (t.startsWith("#") ? t.trim() : `#${t.trim()}`))
        : [];
      const url = getVal("url") || undefined;
      const likes = parseInt(getVal("likes"), 10) || 12;
      const comments = parseInt(getVal("comments"), 10) || 2;
      const shares = parseInt(getVal("shares"), 10) || 1;
      const followerCount = parseInt(getVal("followers"), 10) || 500;

      posts.push({
        id,
        username,
        displayName: username.replace(/_/g, " "),
        platform,
        timestamp,
        text: postText,
        hashtags,
        url,
        likes,
        comments,
        shares,
        followerCount,
        scenario: "normal"
      });
    }

    if (posts.length === 0) {
      setError("No valid rows could be extracted from the file.");
      return;
    }

    if (malformedCount > 0) {
      setWarning(`Parsed ${posts.length} posts successfully (${malformedCount} malformed rows skipped).`);
    }

    setParsedPosts(posts);
  };

  const handleAnalyze = () => {
    if (parsedPosts && parsedPosts.length > 0) {
      onImportSuccess(parsedPosts);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                border: "1px solid var(--accent-border)",
              }}
            >
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Import Social Dataset (CSV)
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Upload custom social media posts to recompute analytics dynamically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragActive ? "var(--accent)" : "var(--border)",
              background: dragActive ? "var(--accent-subtle)" : "var(--bg-base)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-80" style={{ color: "var(--accent)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {fileName ? fileName : "Drag & drop CSV file or click to browse"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Supports CSV with standard columns: id, username, platform, timestamp, text, hashtags, url, likes, comments, shares, followers
            </p>
          </div>

          {error && (
            <div
              className="p-3.5 rounded-xl text-xs flex items-start gap-2.5"
              style={{
                background: "var(--sev-critical-bg)",
                border: "1px solid var(--sev-critical-bd)",
                color: "var(--sev-critical)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Validation Error:</span> {error}
                <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>
                  Reverting to built-in synthetic dataset to guarantee uninterrupted operation.
                </p>
              </div>
            </div>
          )}

          {warning && (
            <div
              className="p-3 rounded-xl text-xs"
              style={{
                background: "var(--sev-medium-bg)",
                border: "1px solid var(--sev-medium-bd)",
                color: "var(--sev-medium)",
              }}
            >
              {warning}
            </div>
          )}

          {parsedPosts && !error && (
            <div
              className="p-3.5 rounded-xl text-xs flex items-center justify-between"
              style={{
                background: "var(--sev-low-bg)",
                border: "1px solid var(--sev-low-bd)",
                color: "var(--sev-low)",
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Successfully validated <strong className="font-mono">{parsedPosts.length}</strong> posts. Ready for analysis!
                </span>
              </div>
            </div>
          )}

          {/* Sample template info */}
          <div
            className="p-3 rounded-xl text-[11px]"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <span className="font-semibold block mb-1" style={{ color: "var(--text-primary)" }}>
              Expected CSV Header Format:
            </span>
            <code className="font-mono text-[10px] block overflow-x-auto" style={{ color: "var(--accent)" }}>
              id,username,platform,timestamp,text,hashtags,url,likes,comments,shares,followers
            </code>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => {
              onResetToDemo();
              onClose();
            }}
            className="text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Synthetic Default
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
              }}
            >
              Cancel
            </button>
            <button
              id="btn-confirm-csv-analysis"
              disabled={!parsedPosts || parsedPosts.length === 0}
              onClick={handleAnalyze}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: parsedPosts && parsedPosts.length > 0 ? "var(--accent)" : "var(--bg-surface)",
                color: parsedPosts && parsedPosts.length > 0 ? "var(--accent-text-on)" : "var(--text-muted)",
                cursor: parsedPosts && parsedPosts.length > 0 ? "pointer" : "not-allowed",
                border: `1px solid ${parsedPosts && parsedPosts.length > 0 ? "var(--accent-border)" : "var(--border)"}`,
              }}
            >
              Analyze Dataset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
