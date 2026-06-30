import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [tab, setTab] = useState("planejamento");
  const [accounts, setAccounts] = useState([]);

  async function connectInstagram() {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        scopes: "instagram_basic,pages_show_list,pages_read_engagement",
        redirectTo: window.location.origin
      }
    });
  }

  async function load() {
    const { data } = await supabase.from("instagram_accounts").select("*");
    setAccounts(data || []);
  }

  async function disconnect(id) {
    await supabase.from("instagram_accounts").delete().eq("id", id);
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Coral Hub - Sprint 02</h2>

      <button onClick={() => setTab("planejamento")}>Planejamento</button>
      <button onClick={() => setTab("instagram")}>Instagram</button>

      {tab === "planejamento" && (
        <div>
          <h3>Planejamento</h3>
          <div>Marketing (preservado)</div>
        </div>
      )}

      {tab === "instagram" && (
        <div>
          <h3>Contas Instagram</h3>
          <button onClick={connectInstagram}>Conectar Meta OAuth</button>

          {accounts.map(a => (
            <div key={a.id}>
              {a.username} - {a.status}
              <button onClick={() => disconnect(a.id)}>Desconectar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
