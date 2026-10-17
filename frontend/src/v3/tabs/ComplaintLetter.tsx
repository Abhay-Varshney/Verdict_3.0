import { useEffect, useState } from "react";
import { api, download } from "../api";
import { Btn, CasePicker, DISCLAIMER, ErrorBox, Field, inputCls, Panel, SpeakButton, Spinner } from "../ui";

type FieldDef = { key: string; label: string; type: string; required: boolean; placeholder?: string };
type DraftType = { key: string; label: string; fields: FieldDef[] };

export default function ComplaintLetter({ language }: { language: string }) {
  const [types, setTypes] = useState<DraftType[]>([]);
  const [sel, setSel] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [caseId, setCaseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    api<{ types: DraftType[] }>("/api/v3/draft/types")
      .then((r) => { setTypes(r.types); setSel(r.types[0]?.key || ""); })
      .catch((e) => setError(e.message));
  }, []);

  const spec = types.find((t) => t.key === sel);

  const generate = async () => {
    setError(null); setNote(null);
    setBusy(true);
    try {
      const r = await api<{ title: string; text: string }>("/api/v3/draft/generate", { json: { doc_type: sel, fields: vals, language } });
      setText(r.text); setTitle(r.title);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const exportAs = async (format: "docx" | "pdf") => {
    setError(null);
    try { await download("/api/v3/export", `${title || "letter"}.${format}`, { title: title || "Letter", text, format }); }
    catch (e: any) { setError(e.message); }
  };

  const saveToCase = async () => {
    if (!caseId) return;
    setError(null);
    try {
      await api(`/api/v3/cases/${caseId}/documents/text`, { json: { filename: `${title || "Draft"}.txt`, text, kind: "draft" } });
      setNote("Saved to the case documents.");
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      <Panel title="Draft a letter or application">
        <div className="space-y-3">
          <Field label="What do you need?">
            <select value={sel} onChange={(e) => { setSel(e.target.value); setVals({}); setText(""); }} className={inputCls}>
              {types.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </Field>
          {spec?.fields.map((f) => (
            <Field key={f.key} label={f.label + (f.required ? " *" : "")}>
              {f.type === "textarea" ? (
                <textarea rows={3} className={inputCls} value={vals[f.key] || ""} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
              ) : (
                <input type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"} className={inputCls} value={vals[f.key] || ""} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
              )}
            </Field>
          ))}
          <div className="flex items-center gap-3">
            <Btn onClick={generate} disabled={busy || !sel}>Create draft</Btn>
            {busy && <Spinner label="Drafting..." />}
          </div>
          <ErrorBox message={error} />
        </div>
      </Panel>

      {text && (
        <Panel title={`${title} (edit before using)`} right={<SpeakButton text={text} language={language} />}>
          <textarea rows={18} value={text} onChange={(e) => setText(e.target.value)} className={inputCls + " font-serif leading-relaxed"} />
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <Btn onClick={() => exportAs("docx")}>Download Word</Btn>
            <Btn variant="ghost" onClick={() => exportAs("pdf")}>Download PDF</Btn>
            <div className="ml-auto flex items-end gap-2">
              <div className="w-56"><CasePicker value={caseId} onChange={setCaseId} label="Save copy to case" /></div>
              <Btn variant="ghost" onClick={saveToCase} disabled={!caseId}>Save</Btn>
            </div>
          </div>
          {note && <p className="mt-2 text-sm text-green-700">{note}</p>}
          <p className="mt-2 text-xs text-slate-500">Replace every [PLACEHOLDER], check names, dates and amounts. For Hindi or other Indian languages, prefer the Word download (PDF may not show all characters correctly). {DISCLAIMER}</p>
        </Panel>
      )}
    </div>
  );
}
