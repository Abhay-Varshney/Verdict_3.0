import { useState } from "react";
import { LangSelect } from "../ui";
import NoticeDecoder from "../tabs/NoticeDecoder";
import ComplaintLetter from "../tabs/ComplaintLetter";
import KnowYourRights from "../tabs/KnowYourRights";
import ActionPlanner from "../tabs/ActionPlanner";
import WhereToComplain from "../tabs/WhereToComplain";
import SectionConverter from "../tabs/SectionConverter";
import SourcedAnswer from "../tabs/SourcedAnswer";

const TABS = [
  { id: "notice", label: "Notice decoder" },
  { id: "letter", label: "Complaint letter" },
  { id: "rights", label: "Know your rights" },
  { id: "plan", label: "Action planner" },
  { id: "where", label: "Where to complain" },
  { id: "ask", label: "Sourced answer" },
  { id: "convert", label: "IPC to BNS" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function EverydayHelp() {
  const [tab, setTab] = useState<TabId>("notice");
  const [language, setLanguage] = useState("English");

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Everyday legal help</h1>
          <p className="text-sm text-slate-600">Understand a notice, write a letter, know your rights and find the right office.</p>
        </div>
        <LangSelect value={language} onChange={setLanguage} />
      </header>

      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
        Emergency: call <strong>112</strong>. Women Helpline <strong>181</strong>. Cyber fraud <strong>1930</strong>.
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px rounded-t-md border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div role="tabpanel">
        {tab === "notice" && <NoticeDecoder language={language} />}
        {tab === "letter" && <ComplaintLetter language={language} />}
        {tab === "rights" && <KnowYourRights language={language} />}
        {tab === "plan" && <ActionPlanner language={language} />}
        {tab === "where" && <WhereToComplain />}
        {tab === "ask" && <SourcedAnswer language={language} />}
        {tab === "convert" && <SectionConverter />}
      </div>
    </div>
  );
}
