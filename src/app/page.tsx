"use client";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

type Tone = "温和" | "直接" | "坚定" | "幽默" | "理性" | "关怀";

export default function Home() {
  const [background, setBackground] = useState("");
  const [intimacy, setIntimacy] = useState<number>(6);
  const [tone, setTone] = useState<Tone>("理性");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cwp_state");
      if (saved) {
        const d = JSON.parse(saved);
        if (typeof d.background === "string") setBackground(d.background);
        if (typeof d.intimacy === "number") setIntimacy(d.intimacy);
        if (typeof d.tone === "string") setTone(d.tone as Tone);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "cwp_state",
        JSON.stringify({ background, intimacy, tone })
      );
    } catch {}
  }, [background, intimacy, tone]);

  const canSubmit = useMemo(() => background.trim().length > 5, [background]);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    setMarkdown("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background, intimacy, tone }),
      });
      if (!res.ok) throw new Error(`服务异常：${res.status}`);
      const data = await res.json();
      setMarkdown(data.markdown || "");
    } catch (e: any) {
      setError(e?.message || "请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Chat with Partner</h1>
          <p style={styles.subtitle}>两性沟通与冲突化解助手</p>
        </header>

        <section style={styles.card}>
          <label style={styles.label} htmlFor="background">
            你想要分析的一件事（背景/原因/想分析什么）
          </label>
          <textarea
            id="background"
            placeholder="例：周末说好一起出门，他临时加班。我想分析我的期待和边界，怎么推进沟通。"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            style={styles.textarea}
            rows={5}
          />

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label} htmlFor="intimacy">
                亲密度（1-10）
              </label>
              <input
                id="intimacy"
                type="range"
                min={1}
                max={10}
                value={intimacy}
                onChange={(e) => setIntimacy(Number(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.hint}>当前：{intimacy}</div>
            </div>

            <div style={styles.col}>
              <label style={styles.label} htmlFor="tone">
                语气风格（点击下方按钮选择）
              </label>
              <div style={styles.toneGroup} role="group" aria-label="语气风格">
                {(["温和", "直接", "坚定", "幽默", "理性", "关怀"] as Tone[]).map((t) => {
                  const active = t === tone;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      style={{
                        ...styles.toneButton,
                        backgroundColor: active ? "#1AAD19" : "#fff",
                        color: active ? "#fff" : "#111",
                        borderColor: active ? "#1AAD19" : "#E5E5E5",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            style={{
              ...styles.button,
              opacity: !canSubmit || loading ? 0.7 : 1,
              cursor: !canSubmit || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "生成中…" : "开始交流"}
          </button>
          {error && <div style={styles.error}>{error}</div>}
        </section>

        {markdown && (
          <section style={styles.output}>
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </section>
        )}

        <footer style={styles.footer}>
          <span>配色参考微信 · 仅供沟通建议</span>
        </footer>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    backgroundColor: "#F8F8F8",
    color: "#111",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "16px",
  },
  container: {
    width: "100%",
    maxWidth: 720,
  },
  header: {
    padding: "16px",
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#666",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    display: "block",
  },
  textarea: {
    width: "100%",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    padding: 12,
    outline: "none",
    fontSize: 14,
    resize: "vertical",
  },
  row: {
    display: "flex",
    gap: 16,
    marginTop: 12,
    flexWrap: "wrap",
  },
  col: { flex: 1, minWidth: 240 },
  slider: { width: "100%" },
  hint: { color: "#888", fontSize: 12, marginTop: 4 },
  select: {
    width: "100%",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    padding: 10,
    outline: "none",
    fontSize: 14,
    backgroundColor: "#fff",
  },
  toneGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  toneButton: {
    border: "1px solid #E5E5E5",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
  },
  button: {
    width: "100%",
    backgroundColor: "#1AAD19",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "12px 16px",
    fontSize: 16,
    fontWeight: 600,
    marginTop: 16,
  },
  error: {
    marginTop: 12,
    color: "#D0021B",
    fontSize: 14,
  },
  output: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    lineHeight: 1.6,
  },
  footer: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginTop: 16,
  },
};
