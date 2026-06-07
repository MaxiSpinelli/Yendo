"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Participant {
  id: string;
  nickname: string | null;
  first_name: string | null;
}

interface Expense {
  id: string;
  paid_by: string;
  description: string;
  amount: number;
  created_at: string;
}

interface Transfer {
  from: string;
  to: string;
  amount: number;
}

interface ExpensesPanelProps {
  tripId: string;
  participants: Participant[];
  currentUserId: string;
  initialExpenses: Expense[];
  accommodationCost: number;
  flightCost: number;
}

function getName(participants: Participant[], id: string): string {
  const p = participants.find((p) => p.id === id);
  return p?.nickname ?? p?.first_name ?? "?";
}

function formatAmount(n: number): string {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calculateTransfers(expenses: Expense[], participants: Participant[]): Transfer[] {
  if (expenses.length === 0 || participants.length === 0) return [];
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / participants.length;

  const balance: Record<string, number> = {};
  participants.forEach((p) => { balance[p.id] = -perPerson; });
  expenses.forEach((e) => { balance[e.paid_by] = (balance[e.paid_by] ?? 0) + e.amount; });

  const creditors = Object.entries(balance)
    .filter(([, b]) => b > 0.01)
    .map(([id, b]) => ({ id, balance: b }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = Object.entries(balance)
    .filter(([, b]) => b < -0.01)
    .map(([id, b]) => ({ id, balance: b }))
    .sort((a, b) => a.balance - b.balance);

  const transfers: Transfer[] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].balance, -debtors[di].balance);
    if (amount > 0.01) {
      transfers.push({ from: debtors[di].id, to: creditors[ci].id, amount: Math.round(amount) });
    }
    creditors[ci].balance -= amount;
    debtors[di].balance += amount;
    if (Math.abs(creditors[ci].balance) < 0.01) ci++;
    if (Math.abs(debtors[di].balance) < 0.01) di++;
  }
  return transfers;
}

export default function ExpensesPanel({
  tripId,
  participants,
  currentUserId,
  initialExpenses,
  accommodationCost,
  flightCost,
}: ExpensesPanelProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const transfers = calculateTransfers(expenses, participants);
  const sharedTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const sharedPerPerson = participants.length > 0 ? sharedTotal / participants.length : 0;
  const preTotal = accommodationCost + flightCost;
  const grandTotal = preTotal + sharedPerPerson;
  const hasAnyCost = preTotal > 0 || expenses.length > 0;

  async function handleAdd() {
    if (!description.trim() || !amount || isNaN(Number(amount))) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("expenses")
      .insert({ trip_id: tripId, paid_by: paidBy, description: description.trim(), amount: Number(amount) })
      .select()
      .single();
    if (!error && data) {
      setExpenses((prev) => [...prev, data]);
      setDescription("");
      setAmount("");
      setPaidBy(currentUserId);
      setShowForm(false);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  if (!hasAnyCost && !showForm) {
    return (
      <div className="rounded-2xl p-5" style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#6b5f54" }}>Gastos</p>
        <div className="flex flex-col items-center text-center py-2">
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#e8e0d8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#a09088" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "#1a1714" }}>Sin gastos todavía</p>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "#a09088" }}>
            Registrá lo que cada uno pagó y Yendo calcula cómo quedar a mano.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform"
            style={{ background: "#1a1714", color: "#faf7f2" }}
          >
            + Agregar gasto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8e0d8", background: "#f0ebe3" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b5f54" }}>Gastos</p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
            style={{ background: "#1a1714", color: "#faf7f2" }}
          >
            + Agregar
          </button>
        )}
      </div>

      {/* Costos pre-cargados */}
      {preTotal > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {accommodationCost > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏨</span>
                <span className="text-sm" style={{ color: "#6b5f54" }}>Alojamiento</span>
              </div>
              <span className="text-sm font-medium" style={{ color: "#1a1714" }}>${formatAmount(accommodationCost)}</span>
            </div>
          )}
          {flightCost > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">✈️</span>
                <span className="text-sm" style={{ color: "#6b5f54" }}>Transportes</span>
              </div>
              <span className="text-sm font-medium" style={{ color: "#1a1714" }}>${formatAmount(flightCost)}</span>
            </div>
          )}
        </div>
      )}

      {/* Separador si hay ambas secciones */}
      {preTotal > 0 && expenses.length > 0 && (
        <div className="mx-4 mb-3" style={{ borderTop: "1px dashed #e8e0d8" }} />
      )}

      {/* Gastos compartidos */}
      {expenses.length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-2 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#1a1714" }}>{e.description}</p>
                <p className="text-xs" style={{ color: "#a09088" }}>pagó {getName(participants, e.paid_by)}</p>
              </div>
              <span className="text-sm font-medium flex-shrink-0" style={{ color: "#1a1714" }}>
                ${formatAmount(e.amount)}
              </span>
              <button
                onClick={() => handleDelete(e.id)}
                disabled={deletingId === e.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: "#c4622d" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid #e8e0d8" }}>
            <span className="text-xs" style={{ color: "#a09088" }}>
              ${formatAmount(sharedTotal)} entre {participants.length}
            </span>
            <span className="text-xs font-medium" style={{ color: "#6b5f54" }}>
              ${formatAmount(sharedPerPerson)}/persona
            </span>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="px-4 pb-4 space-y-3">
          <div style={{ borderTop: "1px solid #e8e0d8", paddingTop: 12 }}>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6b5f54" }}>¿Quién pagó?</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl outline-none"
              style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nickname ?? p.first_name ?? "Sin nombre"}{p.id === currentUserId ? " (yo)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6b5f54" }}>Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Airbnb, nafta, supermercado..."
              className="w-full text-sm px-3 py-2 rounded-xl outline-none"
              style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6b5f54" }}>Monto</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full text-sm px-3 py-2 rounded-xl outline-none"
              style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowForm(false); setDescription(""); setAmount(""); }}
              className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ border: "1px solid #e8e0d8", color: "#6b5f54", background: "transparent" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={loading || !description.trim() || !amount}
              className="flex-1 py-2 rounded-xl text-sm font-semibold"
              style={{ background: loading ? "#2563eb80" : "#2563eb", color: "white" }}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Total general */}
      {grandTotal > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "1px solid #e8e0d8" }}
        >
          <span className="text-sm font-semibold" style={{ color: "#1a1714" }}>Total por persona</span>
          <span className="text-sm font-bold" style={{ color: "#1a1714" }}>${formatAmount(grandTotal)}</span>
        </div>
      )}

      {/* Transferencias */}
      {transfers.length > 0 && (
        <div className="mx-4 mb-4 rounded-xl p-3" style={{ background: "#1a1714" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: "#a09088" }}>
            Cómo quedar a mano
          </p>
          <div className="space-y-2">
            {transfers.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: "#faf7f2" }}>
                  {getName(participants, t.from)}
                </span>
                <span style={{ color: "#a09088" }}>→</span>
                <span className="text-xs font-medium" style={{ color: "#faf7f2" }}>
                  {getName(participants, t.to)}
                </span>
                <span className="ml-auto text-xs font-bold" style={{ color: "#faf7f2" }}>
                  ${formatAmount(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}