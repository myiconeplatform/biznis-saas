import { useState } from "react";
import { supabase } from "./supabase";
import EmployeeLogin from "./EmployeeLogin";

const TENANT_ID = "d1922f24-aac4-4f85-a55a-dbc59740d0bb";
const C = {
  bg:"#0f1117", card:"#222538", accent:"#6c63ff",
  green:"#22d3a0", red:"#ef4444", text:"#e8eaf6", 
  muted:"#7b80a0", border:"#2e3250", orange:"#f97316"
};

function CashierPOS({ emp, onLogout }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif"}}>
      <div style={{background:C.card,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontWeight:800,color:"#8b85ff"}}>💳 Kès — {emp.name}</span>
        <button onClick={onLogout} style={{background:C.red+"33",color:C.red,border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>Dekonekte</button>
      </div>
      <div style={{padding:24,textAlign:"center",color:C.muted,marginTop:40}}>
        <div style={{fontSize:48}}>💳</div>
        <div style={{fontSize:18,marginTop:12}}>Ekran Kès ap vini...</div>
        <div style={{fontSize:13,marginTop:8}}>Konekte kòm: <strong style={{color:C.green}}>{emp.name}</strong> ({emp.role})</div>
      </div>
    </div>
  );
}

function ManagerView({ emp, onLogout }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif"}}>
      <div style={{background:C.card,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontWeight:800,color:"#8b85ff"}}>📊 Manadjè — {emp.name}</span>
        <button onClick={onLogout} style={{background:C.red+"33",color:C.red,border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>Dekonekte</button>
      </div>
      <div style={{padding:24,textAlign:"center",color:C.muted,marginTop:40}}>
        <div style={{fontSize:48}}>📊</div>
        <div style={{fontSize:18,marginTop:12}}>Dashboard Manadjè ap vini...</div>
        <div style={{fontSize:13,marginTop:8}}>Konekte kòm: <strong style={{color:C.orange}}>{emp.name}</strong> ({emp.role})</div>
      </div>
    </div>
  );
}

function AdminView({ emp, onLogout }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif"}}>
      <div style={{background:C.card,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontWeight:800,color:"#8b85ff"}}>⚙️ Admin — {emp.name}</span>
        <button onClick={onLogout} style={{background:C.red+"33",color:C.red,border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>Dekonekte</button>
      </div>
      <div style={{padding:24,textAlign:"center",color:C.muted,marginTop:40}}>
        <div style={{fontSize:48}}>⚙️</div>
        <div style={{fontSize:18,marginTop:12}}>Panel Admin ap vini...</div>
        <div style={{fontSize:13,marginTop:8}}>Konekte kòm: <strong style={{color:C.accent}}>{emp.name}</strong> ({emp.role})</div>
      </div>
    </div>
  );
}

export default function POSApp() {
  const [emp, setEmp] = useState(null);

  function handleLogout() {
    setEmp(null);
  }

  if (!emp) {
    return <EmployeeLogin tenantId={TENANT_ID} onLogin={setEmp} />;
  }

  const role = emp.role?.toLowerCase();

  if (role === "cashier" || role === "kachè") return <CashierPOS emp={emp} onLogout={handleLogout} />;
  if (role === "manager" || role === "manadjè") return <ManagerView emp={emp} onLogout={handleLogout} />;
  if (role === "admin") return <AdminView emp={emp} onLogout={handleLogout} />;

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontFamily:"sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48}}>❓</div>
        <div style={{marginTop:12}}>Wòl enkoni: {emp.role}</div>
        <button onClick={handleLogout} style={{marginTop:16,background:C.red+"33",color:C.red,border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer"}}>Dekonekte</button>
      </div>
    </div>
  );
}
