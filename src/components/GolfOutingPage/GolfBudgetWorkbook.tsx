const SHEET_ID = "1aPzN0zJiNtH5uCii0gFTHxmcu67P13uqs5YNvjOAtp0";
const PREVIEW_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/preview`;
const OPEN_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;

export default function GolfBudgetWorkbook() {
  return (
    <section id="budget-model" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">Planning workbook</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1C315F] md:text-4xl">Golf Outing Budget Model</h2>
            <p className="mt-3 text-lg text-[#1C315F]/75">
              Use the preview to browse Inputs, Summary, Budget, Scenarios, and Sensitivity. Open the
              full workbook in Google Sheets if you want to copy it for your department.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={OPEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#1C315F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ED3237]"
            >
              Open full screen
            </a>
            <a
              href={OPEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#1C315F] px-5 py-2.5 text-sm font-semibold text-[#1C315F] transition hover:bg-[#1C315F] hover:text-white"
            >
              Open in Google Sheets
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#1C315F]/10 bg-white shadow-[0_18px_40px_rgba(11,27,58,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C315F]/10 bg-[#F7F4EA] px-5 py-3">
            <div>
              <p className="text-sm font-bold text-[#1C315F]">Golf Outing Budget Model</p>
              <p className="text-xs text-[#1C315F]/60">Read Me tab first — switch sheets in the preview below</p>
            </div>
            <p className="rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7014]">
              Yellow cells are inputs
            </p>
          </div>
          <div className="relative h-[72vh] min-h-[560px] w-full bg-[#f8f8f6]">
            <iframe
              src={PREVIEW_URL}
              title="Golf Outing Budget Model"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            ["1. Inputs", "Event details, pricing, expected field, sponsorships, auction goals, and costs."],
            ["2. Summary", "Revenue, costs, net profit, break-even golfers, and donor-deductible amounts."],
            ["3. Budget", "Line items with a yellow Actual column for variance after the event."],
            ["4. Scenarios", "Low, base, and high turnout to stress-test the plan."],
            ["5. Sensitivity", "Net profit grid across ticket prices and field sizes."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl border border-[#1C315F]/8 bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-[#1C315F]">{title}</p>
              <p className="mt-1 text-sm text-[#1C315F]/70">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
