import React, { useState } from "react";
import { Delete, HelpCircle } from "lucide-react";

export default function AppCalc() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  const handlePress = (value: string) => {
    if (value === "=") {
      try {
        // Safe evaluation of mathematical expression without arbitrary eval
        // Substitute characters for computation
        const cleanExpression = expression
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-");

        // Validate that it only contains numbers and basic operators
        if (/^[0-9+\-*/().\s%]+$/.test(cleanExpression)) {
          // Calculate using Function constructor safely for simple arithmetic
          const evalResult = new Function(`return (${cleanExpression})`)();
          if (evalResult === undefined || isNaN(evalResult)) {
            setResult("خطأ");
          } else {
            setResult(Number(evalResult).toLocaleString("ar-EG", { maximumFractionDigits: 5 }));
          }
        } else {
          setResult("خطأ");
        }
      } catch (e) {
        setResult("خطأ");
      }
    } else if (value === "C") {
      setExpression("");
      setResult("");
    } else if (value === "back") {
      setExpression((prev) => prev.slice(0, -1));
    } else {
      setExpression((prev) => prev + value);
    }
  };

  const buttons = [
    ["C", "(", ")", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "back", "="],
  ];

  return (
    <div id="app-calc-container" className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans p-4 justify-between" dir="ltr">
      {/* Display screen */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-end text-right min-h-[90px] mb-4 shadow-inner">
        <span className="text-xs text-slate-500 font-mono overflow-x-auto whitespace-nowrap scrollbar-none h-4">
          {expression || "0"}
        </span>
        <span className="text-2xl font-bold font-mono text-emerald-400 overflow-x-auto whitespace-nowrap scrollbar-none mt-1">
          {result || "0"}
        </span>
      </div>

      {/* Button keyboard */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {buttons.flat().map((btn) => {
          const isOperator = ["÷", "×", "−", "+", "="].includes(btn);
          const isSpecial = ["C", "(", ")", "back"].includes(btn);

          let btnClass = "rounded-xl text-sm font-semibold transition flex items-center justify-center cursor-pointer select-none ";
          if (btn === "=") {
            btnClass += "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]";
          } else if (isOperator) {
            btnClass += "bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700/60";
          } else if (isSpecial) {
            btnClass += "bg-slate-900 hover:bg-slate-850 text-amber-500 border border-slate-800";
          } else {
            btnClass += "bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-900";
          }

          return (
            <button
              key={btn}
              onClick={() => handlePress(btn)}
              className={btnClass}
            >
              {btn === "back" ? <Delete size={16} /> : btn}
            </button>
          );
        })}
      </div>
    </div>
  );
}
