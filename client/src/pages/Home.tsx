import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Crosshair,
  Database,
  FileText,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Menu,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const palette = ["#18b6a4", "#2f6fed", "#7e57c2"];

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function riskColor(value: number) {
  if (value >= 0.7) return "#ff6b5f";
  if (value >= 0.5) return "#f5b942";
  return "#18b6a4";
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-[#475569]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field-control">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export default function Home() {
  const { data, isLoading } = trpc.risk.summary.useQuery();
  const predict = trpc.risk.predict.useMutation();
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({ amount: "5800", duration: "24", age: "36", checking: "zero_to_two_hundred", savings: "medium", employment: "one_to_four", housing: "rent" });

  const scoreResult = predict.data;
  const modelChart = useMemo(() => data?.modelMetrics ?? [], [data]);
  const importanceChart = useMemo(() => data?.featureImportance ?? [], [data]);
  const checkingChart = useMemo(() => data?.checkingRisk ?? [], [data]);

  const jumpTo = (id: string) => {
    setActiveSection(id);
    setMobileNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const runPrediction = () => {
    predict.mutate({
      amount: Number(form.amount),
      duration: Number(form.duration),
      age: Number(form.age),
      checking: form.checking as "below_zero" | "zero_to_two_hundred" | "two_hundred_plus" | "none",
      savings: form.savings as "low" | "medium" | "high" | "unknown",
      employment: form.employment as "unemployed" | "under_one" | "one_to_four" | "four_to_seven" | "seven_plus",
      housing: form.housing as "rent" | "own" | "free",
    }, { onSuccess: () => toast.success("Application scored with the Random Forest champion model") });
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "model-lab", label: "Model lab", icon: GitBranch },
    { id: "explainability", label: "Explainability", icon: Radar },
    { id: "scorer", label: "Application scorer", icon: Crosshair },
    { id: "methodology", label: "Methodology", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#172033]">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="flex items-center justify-between px-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="brand-mark"><ShieldCheck size={19} strokeWidth={2.4} /></div>
            <div><div className="text-[15px] font-semibold tracking-tight">Risk Intelligence</div><div className="text-[10px] uppercase tracking-[0.22em] text-[#94a3b8]">Decision lab</div></div>
          </div>
          <button className="nav-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="mt-11 px-4">
          <div className="eyebrow px-3 pb-3">Workspace</div>
          <nav className="space-y-1">
            {navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => jumpTo(item.id)} className={`nav-item ${activeSection === item.id ? "nav-item-active" : ""}`}><Icon size={17} /><span>{item.label}</span>{activeSection === item.id && <ChevronRight className="ml-auto" size={15} />}</button>; })}
          </nav>
        </div>
        <div className="mt-auto px-6 pb-7">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white"><Sparkles size={14} className="text-[#6de2cf]" /> Portfolio build</div>
            <p className="text-xs leading-5 text-[#a8b5c8]">A reproducible R classification study paired with a decision-ready web interface.</p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-[#7b8ba6]"><CircleDot size={11} className="text-[#18b6a4]" /> Live analysis snapshot</div>
          </div>
          <div className="mt-5 text-[11px] leading-5 text-[#6f7d92]">UCI Statlog German Credit<br />R 4.3 · 14 Sep 2026</div>
        </div>
      </aside>

      <main className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-[#e4e9f0]/80 bg-[#f6f8fb]/90 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between">
            <div className="flex items-center gap-3"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div><div className="eyebrow">Portfolio analytics / credit decisioning</div><h1 className="mt-1 text-[18px] font-semibold tracking-tight sm:text-[20px]">Loan default risk intelligence</h1></div></div>
            <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#dce7e7] bg-[#f0faf8] px-3 py-2 text-xs font-medium text-[#137f72] sm:flex"><span className="status-dot" /> Analysis healthy</div><Button onClick={() => jumpTo("scorer")} className="button-dark hidden sm:flex"><Crosshair size={15} /> Score an application</Button></div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-7 px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <section id="overview" className="scroll-mt-28">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="eyebrow flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#18b6a4]" /> Decision intelligence, made legible</div>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#111827] sm:text-5xl">Turn a black-box score into a <span className="text-[#2f6fed]">reviewable decision.</span></h2>
                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#64748b]">An end-to-end credit-risk workbench built on the UCI German Credit dataset. Compare models, trace the signals behind risk, and route applications to human review with a calibrated operating threshold.</p>
                <div className="mt-7 flex flex-wrap items-center gap-3"><Button onClick={() => jumpTo("scorer")} className="button-blue"><Target size={16} /> Run a live score</Button><button onClick={() => jumpTo("methodology")} className="text-button">Read the methodology <ChevronRight size={15} /></button></div>
              </div>
              <div className="hero-insight"><div className="absolute right-7 top-7 h-20 w-20 rounded-full border border-[#bfeee7]" /><div className="absolute right-14 top-14 h-7 w-7 rounded-full bg-[#18b6a4] shadow-[0_0_0_8px_#dff7f3]" /><div className="eyebrow text-[#35736e]">Champion model</div><div className="mt-6 flex items-end justify-between"><div><div className="text-3xl font-semibold tracking-[-0.04em] text-[#123b43]">Random forest</div><div className="mt-2 text-sm text-[#5c7d82]">Highest AUC on held-out data</div></div><div className="text-right"><div className="text-4xl font-semibold tracking-[-0.05em] text-[#123b43]">80.9%</div><div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#5c8b87]">AUC</div></div></div><div className="mt-7 h-2 overflow-hidden rounded-full bg-[#c9eee8]"><div className="h-full w-[81%] rounded-full bg-[#18b6a4]" /></div><div className="mt-3 flex justify-between text-xs text-[#5c7d82]"><span>Ranking quality</span><span>0.8085</span></div></div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Applications analyzed" value={data ? data.dataset.applications.toLocaleString() : "—"} detail="UCI German Credit sample" icon={Database} tone="blue" />
            <MetricCard label="Observed bad-risk rate" value={data ? formatPct(data.dataset.badRate) : "—"} detail="300 of 1,000 applications" icon={Gauge} tone="coral" />
            <MetricCard label="Held-out test set" value={data ? data.dataset.test.toLocaleString() : "—"} detail="Stratified 25% evaluation" icon={ClipboardCheck} tone="purple" />
            <MetricCard label="Review threshold" value="0.50" detail="Human-in-the-loop policy" icon={Target} tone="teal" />
          </section>

          <section id="model-lab" className="scroll-mt-28 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="dashboard-card"><CardHeader className="card-header"><div><div className="eyebrow">01 / Model lab</div><CardTitle className="mt-2">Three models, one operating decision</CardTitle></div><Badge className="badge-soft">Cost-aware evaluation</Badge></CardHeader><CardContent><div className="chart-wrap h-[290px]">{isLoading ? <LoadingBlock /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={modelChart} margin={{ top: 18, right: 8, left: -20, bottom: 4 }}><CartesianGrid stroke="#edf0f4" vertical={false} /><XAxis dataKey="model" tickLine={false} axisLine={false} tick={{ fill: "#8491a5", fontSize: 11 }} tickFormatter={(value) => value === "Logistic regression" ? "Logistic" : value === "Decision tree" ? "Tree" : "Forest"} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#8491a5", fontSize: 11 }} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} domain={[0, 1]} /><Tooltip formatter={(value: number) => formatPct(value)} contentStyle={{ borderRadius: 12, border: "1px solid #e5eaf0", boxShadow: "0 8px 30px rgba(15,23,42,.08)" }} /><Bar dataKey="auc" radius={[7, 7, 0, 0]} barSize={48}>{modelChart.map((entry, index) => <Cell key={entry.model} fill={palette[index]} />)}</Bar></BarChart></ResponsiveContainer>}</div><div className="mt-5 grid grid-cols-3 gap-3">{modelChart.map((metric) => <div key={metric.model} className="metric-mini"><div className="text-xs text-[#8793a5]">{metric.model.replace(" regression", "")}</div><div className="mt-1 text-lg font-semibold text-[#1d293d]">{formatPct(metric.auc)}</div><div className="mt-1 text-[11px] text-[#94a3b8]">AUC · cost {metric.cost}</div></div>)}</div><p className="mt-5 text-xs leading-5 text-[#8290a4]">The Random Forest model is the champion for ranking quality (AUC 0.8085) and has the lowest observed weighted cost at 226. Logistic regression is close at 227, while the tree is less competitive at 245.</p></CardContent></Card>
            <Card className="dashboard-card"><CardHeader className="card-header"><div><div className="eyebrow">Signal scan</div><CardTitle className="mt-2">Where risk separates</CardTitle></div><BarChart3 size={18} className="text-[#2f6fed]" /></CardHeader><CardContent><div className="space-y-5 pt-2">{checkingChart.map((item, index) => <div key={item.code}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-[#334155]">{item.label}</span><span className="font-semibold" style={{ color: riskColor(item.badRate) }}>{formatPct(item.badRate)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{ width: `${item.badRate * 100}%`, background: riskColor(item.badRate) }} /></div><div className="mt-1.5 flex justify-between text-[11px] text-[#98a3b3]"><span>{item.applications} applications</span><span>segment {index + 1}</span></div></div>)}</div><div className="insight-note mt-6"><ArrowUpRight size={15} className="mt-0.5 shrink-0 text-[#ff6b5f]" /><span>The below-zero checking segment shows a <strong>49.3% bad-risk rate</strong>, versus 11.7% for applicants without a checking account.</span></div></CardContent></Card>
          </section>

          <section id="explainability" className="scroll-mt-28 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="dashboard-card"><CardHeader className="card-header"><div><div className="eyebrow">02 / Explainability</div><CardTitle className="mt-2">Feature importance</CardTitle></div><Radar size={18} className="text-[#7e57c2]" /></CardHeader><CardContent><div className="chart-wrap h-[300px]">{isLoading ? <LoadingBlock /> : <ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={importanceChart} margin={{ top: 4, right: 20, left: 25, bottom: 4 }}><CartesianGrid stroke="#edf0f4" horizontal={false} /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#9aa5b4", fontSize: 10 }} /><YAxis type="category" dataKey="feature" tickLine={false} axisLine={false} tick={{ fill: "#536175", fontSize: 11 }} width={110} /><Tooltip formatter={(value: number) => value.toFixed(1)} contentStyle={{ borderRadius: 12, border: "1px solid #e5eaf0" }} /><Bar dataKey="value" fill="#7e57c2" radius={[0, 6, 6, 0]} barSize={18} /></BarChart></ResponsiveContainer>}</div><p className="mt-3 text-xs leading-5 text-[#8290a4]">Mean decrease in Gini from the Random Forest fit. Higher values indicate greater contribution to node purity across the ensemble.</p></CardContent></Card>
            <Card className="dashboard-card"><CardHeader className="card-header"><div><div className="eyebrow">Decision context</div><CardTitle className="mt-2">The model is a triage layer, not a verdict</CardTitle></div><ShieldCheck size={18} className="text-[#18b6a4]" /></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3">{[
              ["01", "Prioritize", "Route higher-risk applications into analyst review before a final decision."],
              ["02", "Explain", "Surface the strongest observed drivers so a reviewer can challenge the signal."],
              ["03", "Improve", "Log outcomes and recalibrate the threshold as the portfolio changes."],
            ].map(([number, title, copy]) => <div key={number} className="explain-step"><div className="step-number">{number}</div><div className="mt-5 font-semibold text-[#1f2a3d]">{title}</div><p className="mt-2 text-xs leading-5 text-[#77859a]">{copy}</p></div>)}</div><div className="mt-5 rounded-xl bg-[#f8fafc] p-4 text-xs leading-5 text-[#708096]"><strong className="text-[#38465a]">Model limitation:</strong> this is a historical benchmark dataset. It is suitable for demonstrating an analytical workflow, not for automated credit approval or denial.</div></CardContent></Card>
          </section>

          <section id="scorer" className="scroll-mt-28">
            <div className="section-banner"><div><div className="eyebrow text-[#86a5ff]">03 / Application scorer</div><h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Test the decision layer</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#aebbd0]">Change the applicant profile and see how the champion model routes the case. This interface intentionally recommends human review instead of automatic decline.</p></div><div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#6de2cf] sm:flex"><Crosshair size={26} /></div></div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="dashboard-card"><CardHeader className="card-header"><div><div className="eyebrow">Applicant profile</div><CardTitle className="mt-2">Input variables</CardTitle></div><Badge className="badge-neutral">7 signals</Badge></CardHeader><CardContent><div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm"><span className="font-medium text-[#475569]">Credit amount (€)</span><input className="field-control" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><label className="space-y-2 text-sm"><span className="font-medium text-[#475569]">Duration (months)</span><input className="field-control" type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></label><label className="space-y-2 text-sm"><span className="font-medium text-[#475569]">Age (years)</span><input className="field-control" type="number" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></label><SelectField label="Checking status" value={form.checking} onChange={(value) => setForm({ ...form, checking: value })} options={[{ value: "below_zero", label: "Below €0" }, { value: "zero_to_two_hundred", label: "€0–200" }, { value: "two_hundred_plus", label: "€200+ / salary assignment" }, { value: "none", label: "No checking account" }]} /><SelectField label="Savings buffer" value={form.savings} onChange={(value) => setForm({ ...form, savings: value })} options={[{ value: "low", label: "Low / under €100" }, { value: "medium", label: "€100–1,000" }, { value: "high", label: "€1,000+" }, { value: "unknown", label: "Unknown" }]} /><SelectField label="Employment tenure" value={form.employment} onChange={(value) => setForm({ ...form, employment: value })} options={[{ value: "unemployed", label: "Unemployed" }, { value: "under_one", label: "Under 1 year" }, { value: "one_to_four", label: "1–4 years" }, { value: "four_to_seven", label: "4–7 years" }, { value: "seven_plus", label: "7+ years" }]} /><SelectField label="Housing" value={form.housing} onChange={(value) => setForm({ ...form, housing: value })} options={[{ value: "rent", label: "Rent" }, { value: "own", label: "Own" }, { value: "free", label: "Free / provided" }]} /></div><Button onClick={runPrediction} disabled={predict.isPending} className="button-blue mt-6 w-full sm:w-auto"><Sparkles size={15} /> {predict.isPending ? "Scoring…" : "Run champion model"}</Button></CardContent></Card>
              <Card className="score-card"><CardContent className="flex h-full flex-col p-6">{scoreResult ? <><div className="flex items-center justify-between"><div className="eyebrow text-[#7e91ac]">Live output</div><Badge className={scoreResult.decision === "Review" ? "badge-coral" : "badge-teal"}>{scoreResult.decision}</Badge></div><div className="mt-7 flex items-end gap-3"><span className="text-6xl font-semibold tracking-[-0.06em] text-[#172033]">{formatPct(scoreResult.probability)}</span><span className="mb-2 text-sm text-[#8491a5]">bad-risk probability</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full transition-all" style={{ width: `${scoreResult.probability * 100}%`, background: riskColor(scoreResult.probability) }} /></div><div className="mt-3 flex justify-between text-xs text-[#8996a9]"><span>0.00 lower risk</span><span>0.50 review</span><span>1.00 higher risk</span></div><div className="mt-6 rounded-xl bg-[#f8fafc] p-4"><div className="flex items-center gap-2 text-sm font-semibold text-[#35445a]"><FileText size={15} className="text-[#2f6fed]" /> Why this route?</div><div className="mt-3 space-y-2">{scoreResult.drivers.map((driver) => <div key={driver.label} className="flex gap-2 text-xs leading-5 text-[#708096]">{driver.impact === "up" ? <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-[#ff6b5f]" /> : <ArrowDownRight size={14} className="mt-0.5 shrink-0 text-[#18b6a4]" />}<span><strong className="text-[#475569]">{driver.label}:</strong> {driver.detail}</span></div>)}</div></div><div className="mt-auto pt-5 text-[11px] text-[#9aa5b4]">Model: {scoreResult.model} · threshold {scoreResult.threshold.toFixed(2)} · band {scoreResult.band}</div></> : <div className="flex flex-1 flex-col justify-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#2f6fed]"><Crosshair size={27} /></div><h4 className="mt-5 text-center text-lg font-semibold text-[#243148]">Ready to score</h4><p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-[#7a889c]">Enter an applicant profile to generate a review-oriented probability and driver summary.</p></div>}</CardContent></Card>
            </div>
          </section>

          <section className="dashboard-card overflow-hidden"><div className="flex flex-col justify-between gap-3 border-b border-[#edf0f4] p-6 sm:flex-row sm:items-center"><div><div className="eyebrow">Monitoring sample</div><h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Recent held-out applications</h3></div><div className="flex items-center gap-2 text-xs text-[#8090a5]"><span className="status-dot" /> Sorted by predicted risk</div></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Application</th><th>Amount</th><th>Duration</th><th>Checking</th><th>Predicted risk</th><th>Decision</th><th>Observed</th></tr></thead><tbody>{(data?.sampleApplications ?? []).map((row) => <tr key={row.id}><td className="font-semibold text-[#334155]">{row.id}</td><td>€{row.amount.toLocaleString()}</td><td>{row.duration} mo</td><td>{row.checking}</td><td><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: riskColor(row.probability) }} />{formatPct(row.probability)}</div></td><td><span className="table-pill table-pill-coral">{row.decision}</span></td><td><span className={row.outcome === "Bad" ? "table-pill table-pill-coral" : "table-pill table-pill-teal"}>{row.outcome}</span></td></tr>)}</tbody></table></div></section>

          <section id="methodology" className="scroll-mt-28 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
            <Card className="dashboard-card"><CardHeader className="card-header"><div><div className="eyebrow">04 / Methodology</div><CardTitle className="mt-2">A workflow built to be reproduced</CardTitle></div><BookOpen size={18} className="text-[#2f6fed]" /></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(data?.methodology ?? []).map((item, index) => <div key={item} className="method-card"><div className="text-xs font-semibold text-[#2f6fed]">0{index + 1}</div><div className="mt-3 text-sm font-semibold text-[#314056]">{item}</div></div>)}</div><div className="mt-5 flex flex-wrap gap-2 text-xs text-[#7c8ba0]"><span className="tech-chip">R 4.3</span><span className="tech-chip">Logistic regression</span><span className="tech-chip">Decision tree</span><span className="tech-chip">Random Forest</span><span className="tech-chip">tRPC</span><span className="tech-chip">React + Recharts</span></div></CardContent></Card>
            <Card className="dashboard-card"><CardHeader className="card-header"><div><div className="eyebrow">Project note</div><CardTitle className="mt-2">What to take into a review</CardTitle></div><FileText size={18} className="text-[#ff6b5f]" /></CardHeader><CardContent><p className="text-sm leading-6 text-[#718096]">The dataset is historical and intentionally small. Treat the output as a portfolio-quality demonstration of a full analytics lifecycle: source validation, modeling, interpretation, and productization.</p><div className="mt-5 rounded-xl border border-[#f1d8d4] bg-[#fff8f7] p-4 text-xs leading-5 text-[#866760]"><strong className="text-[#9b4e42]">Responsible use:</strong> never use this benchmark alone to approve, decline, price, or otherwise materially affect a real person’s access to credit.</div><div className="mt-5 flex items-center gap-2 text-xs text-[#8491a5]"><Database size={14} /> {data?.lastRun ?? "Analysis snapshot"}</div></CardContent></Card>
          </section>

          <footer className="flex flex-col justify-between gap-3 border-t border-[#e4e9f0] pt-6 text-xs text-[#9aa5b4] sm:flex-row"><span>Loan Default Risk Intelligence · portfolio build</span><span>Data: UCI Statlog German Credit · analysis artifacts included in repository</span></footer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof Database; tone: "blue" | "coral" | "purple" | "teal" }) {
  return <Card className="metric-card"><CardContent className="flex items-start justify-between p-5"><div><div className="text-xs font-medium text-[#8390a4]">{label}</div><div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#1b273a]">{value}</div><div className="mt-1 text-[11px] text-[#9aa5b4]">{detail}</div></div><div className={`metric-icon metric-icon-${tone}`}><Icon size={17} /></div></CardContent></Card>;
}

function LoadingBlock() { return <div className="h-full animate-pulse rounded-2xl bg-[#f3f5f8]" />; }
