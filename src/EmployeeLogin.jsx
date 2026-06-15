import { useState } from "react";
import { supabase } from "./supabase";

const C = {
  bg:"#0f1117", card:"#222538", accent:"#6c63ff",
  green:"#22d3a0", red:"#ef4444", text:"#e8eaf6", muted:"#7b80a0", border:"#2e3250"
};

export default function EmployeeLogin({ tenantId, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if(!username||!password){setErr("Ranpli tout chan!");return;}
    setLoading(true); setErr("");
    const {data,error} = await supabase.from("employees")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("username", username.trim())
      .eq("password", password)
      .eq("status", "aktif")
      .single();
    if(error||!data){
      setErr("Idantifyan oswa modpas mal!");
      setLoading(false); return;
    }
    onLogin(data);
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.card,borderRadius:16,padding:"40px 36px",width:380,border:`1px solid ${C.border}`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:40,marginBottom:10}}>🏪</div>
          <div style={{fontSize:20,fontWeight:800,color:C.text}}>ICS Biznis</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>Konekte kòm Anplwaye</div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:5,fontWeight:"bold",textTransform:"uppercase"}}>Idantifyan</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Ex: marie" onKeyDown={e=>e.key==="Enter"&&login()}
            style={{width:"100%",background:"#1a1d2e",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:11,color:C.muted,marginBottom:5,fontWeight:"bold",textTransform:"uppercase"}}>Modpas</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&login()}
            style={{width:"100%",background:"#1a1d2e",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none"}}/>
        </div>
        {err&&<div style={{background:`${C.red}22`,color:C.red,padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14}}>{err}</div>}
        <button onClick={login} disabled={loading}
          style={{width:"100%",padding:"12px",background:C.accent,color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1}}>
          {loading?"Ap konekte…":"Konekte"}
        </button>
      </div>
    </div>
  );
}
