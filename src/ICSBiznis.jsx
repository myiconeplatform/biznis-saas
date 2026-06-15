import EmployeeLogin from './EmployeeLogin';
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg:"#0f1117", surface:"#1a1d2e", card:"#222538",
  accent:"#6c63ff", accentLight:"#8b85ff",
  green:"#22d3a0", orange:"#f97316", red:"#ef4444",
  yellow:"#facc15", text:"#e8eaf6", muted:"#7b80a0",
  border:"#2e3250",
};

const fmt = n => Number(n||0).toLocaleString() + " HTG";
const today = () => new Date().toISOString().slice(0,10);

const NAV = [
  {id:"dashboard", label:"Dashboard", icon:"📊"},
  {id:"businesses", label:"Biznis Mwen", icon:"🏢"},
  {id:"pos", label:"Vant / Kès", icon:"💳"},
  {id:"inventory", label:"Envantè", icon:"📦"},
  {id:"employees", label:"Anplwaye", icon:"👥"},
  {id:"reports", label:"Rapò", icon:"📈"},
];

const ICONS = ["🏪","🍽️","💇","🏬","🛒","🏥","🎓","💊","🔧","👗","📱","🚗"];
const COLORS = ["#6c63ff","#22d3a0","#f97316","#ef4444","#facc15","#3b82f6","#ec4899","#8b5cf6"];

const S = {
  app:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Sora','Segoe UI',sans-serif",display:"flex"},
  sidebar:{width:220,background:C.surface,borderRight:`1px solid ${C.border}`,padding:"24px 0",display:"flex",flexDirection:"column",flexShrink:0},
  nav:(a)=>({display:"flex",alignItems:"center",gap:10,padding:"10px 20px",cursor:"pointer",color:a?C.accentLight:C.muted,background:a?`${C.accent}18`:"transparent",borderLeft:a?`3px solid ${C.accent}`:"3px solid transparent",fontSize:14,fontWeight:a?600:400}),
  main:{flex:1,overflow:"auto",padding:28},
  card:{background:C.card,borderRadius:14,padding:20,border:`1px solid ${C.border}`,marginBottom:16},
  btn:(color,extra={})=>({background:color,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",...extra}),
  btnOutline:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 18px",fontSize:13,cursor:"pointer"},
  input:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",width:"100%"},
  select:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",width:"100%"},
  label:{display:"block",fontSize:11,color:C.muted,marginBottom:5,fontWeight:"bold",textTransform:"uppercase",letterSpacing:".4px"},
  th:{textAlign:"left",padding:"10px 14px",fontSize:11,color:C.muted,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`},
  td:{padding:"12px 14px",fontSize:13,borderBottom:`1px solid ${C.border}18`},
  badge:(color)=>({display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:`${color}22`,color}),
  modal:{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20},
  modalBox:{background:C.card,borderRadius:14,width:"100%",maxWidth:520,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 60px rgba(0,0,0,0.4)"},
};

// ── COMPOSANTS UTILITÈ ──────────────────────────────────────
const Fld = ({label,val,onChange,type="text",ph}) => (
  <div style={{marginBottom:14}}>
    <label style={S.label}>{label}</label>
    <input type={type} value={val||""} onChange={e=>onChange(e.target.value)} placeholder={ph||""} style={S.input}/>
  </div>
);

const Sel = ({label,val,opts,onChange}) => (
  <div style={{marginBottom:14}}>
    <label style={S.label}>{label}</label>
    <select value={val||""} onChange={e=>onChange(e.target.value)} style={S.select}>
      {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const Modal = ({title,onClose,onSave,saving,children}) => (
  <div style={S.modal}>
    <div style={S.modalBox}>
      <div style={{padding:"18px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.surface,borderRadius:"14px 14px 0 0"}}>
        <span style={{fontWeight:700,fontSize:15,color:C.text}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
      </div>
      <div style={{padding:24,overflowY:"auto",flex:1}}>{children}</div>
      <div style={{padding:"14px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={S.btnOutline}>Anile</button>
        <button onClick={onSave} disabled={saving} style={S.btn(C.accent,{opacity:saving?0.7:1})}>
          {saving?"Ap sovgade…":"💾 Sovgade"}
        </button>
      </div>
    </div>
  </div>
);

const Toast = ({msg,type,onClose}) => {
  const c = type==="error"?C.red:type==="warning"?C.orange:C.green;
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:3000,background:`${c}22`,color:c,borderLeft:`4px solid ${c}`,padding:"14px 18px",borderRadius:10,display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",fontSize:14,maxWidth:360}}>
      {msg}
      <button onClick={onClose} style={{background:"none",border:"none",marginLeft:8,fontSize:18,color:c,cursor:"pointer"}}>×</button>
    </div>
  );
};

const Confirm = ({msg,onYes,onNo}) => (
  <div style={{...S.modal,zIndex:2000}}>
    <div style={{background:C.card,borderRadius:12,padding:28,maxWidth:400,width:"90%"}}>
      <p style={{color:C.text,marginBottom:20}}>⚠️ {msg}</p>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onNo} style={S.btnOutline}>Anile</button>
        <button onClick={onYes} style={S.btn(C.red)}>Konfime</button>
      </div>
    </div>
  </div>
);

// ── MAIN APP ────────────────────────────────────────────────
export default function ICSBiznis({ profile, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [businesses, setBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empSession, setEmpSession] = useState(null);
  const [toast, setToast] = useState(null);
  const [cart, setCart] = useState([]);
  const [posBizId, setPosBizId] = useState(null);
  const [filterBiz, setFilterBiz] = useState("");

  // Modals
  const [bizModal, setBizModal] = useState(null);
  const [prodModal, setProdModal] = useState(null);
  const [empModal, setEmpModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const tenantId = profile?.tenant_id;

  const notify = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 4000);
  };

  useEffect(() => { if(tenantId) loadAll(); }, [tenantId]);

  async function loadAll() {
    setLoading(true);
    const [b,p,e,s] = await Promise.all([
      supabase.from("businesses").select("*").eq("tenant_id",tenantId),
      supabase.from("products").select("*").eq("tenant_id",tenantId),
      supabase.from("employees").select("*").eq("tenant_id",tenantId),
      supabase.from("sales").select("*").eq("tenant_id",tenantId).order("created_at",{ascending:false}),
    ]);
    if(b.data){ setBusinesses(b.data); if(b.data[0]&&!posBizId) setPosBizId(b.data[0].id); }
    if(p.data) setProducts(p.data);
    if(e.data) setEmployees(e.data);
    if(s.data) setSales(s.data);
    setLoading(false);
  }

  // ── BIZNIS CRUD ──────────────────────────────────────────
  const efBiz = {name:"",type:"boutik",icon:"🏪",color:"#6c63ff"};
  const [bizForm, setBizForm] = useState(efBiz);

  async function saveBiz() {
    if(!bizForm.name.trim()){notify("Non biznis obligatwa!","error");return;}
    setSaving(true);
    const payload = {...bizForm, tenant_id:tenantId};
    if(bizModal==="add"){
      const {error} = await supabase.from("businesses").insert([payload]);
      if(error){notify("Erè: "+error.message,"error");}
      else notify("✅ Biznis ajoute!");
    } else {
      const {error} = await supabase.from("businesses").update(bizForm).eq("id",bizModal.id);
      if(error){notify("Erè: "+error.message,"error");}
      else notify("✅ Biznis mete ajou!");
    }
    await loadAll(); setBizModal(null); setSaving(false);
  }

  async function deleteBiz(b) {
    await supabase.from("businesses").delete().eq("id",b.id);
    notify("Biznis efase.","warning");
    await loadAll(); setConfirm(null);
  }

  // ── PRODUI CRUD ──────────────────────────────────────────
  const efProd = {name:"",price:"",stock:"",category:"",business_id:""};
  const [prodForm, setProdForm] = useState(efProd);

  async function saveProd() {
    if(!prodForm.name||!prodForm.price){notify("Non ak pri obligatwa!","error");return;}
    if(!prodForm.business_id){notify("Chwazi yon biznis!","error");return;}
    setSaving(true);
    const payload = {...prodForm, tenant_id:tenantId, price:Number(prodForm.price), stock:Number(prodForm.stock)||0};
    if(prodModal==="add"){
      const {error} = await supabase.from("products").insert([payload]);
      if(error){notify("Erè: "+error.message,"error");}
      else notify("✅ Pwodui ajoute!");
    } else {
      const {error} = await supabase.from("products").update(payload).eq("id",prodModal.id);
      if(error){notify("Erè: "+error.message,"error");}
      else notify("✅ Pwodui mete ajou!");
    }
    await loadAll(); setProdModal(null); setSaving(false);
  }

  async function deleteProd(p) {
    await supabase.from("products").delete().eq("id",p.id);
    notify("Pwodui efase.","warning");
    await loadAll(); setConfirm(null);
  }

  // ── ANPLWAYE CRUD ────────────────────────────────────────
  const efEmp = {name:"",role:"",business_id:"",status:"aktif"};
  const [empForm, setEmpForm] = useState(efEmp);

  async function saveEmp() {
    if(!empForm.name||!empForm.business_id){notify("Non ak biznis obligatwa!","error");return;}
    setSaving(true);
    const payload = {...empForm, tenant_id:tenantId};
    if(empModal==="add"){
      const {error} = await supabase.from("employees").insert([payload]);
      if(error){notify("Erè: "+error.message,"error");}
      else notify("✅ Anplwaye ajoute!");
    } else {
      const {error} = await supabase.from("employees").update(payload).eq("id",empModal.id);
      if(error){notify("Erè: "+error.message,"error");}
      else notify("✅ Anplwaye mete ajou!");
    }
    await loadAll(); setEmpModal(null); setSaving(false);
  }

  async function deleteEmp(e) {
    await supabase.from("employees").delete().eq("id",e.id);
    notify("Anplwaye efase.","warning");
    await loadAll(); setConfirm(null);
  }

  // ── POS ──────────────────────────────────────────────────
  const addToCart = (p) => {
    setCart(c => {
      const ex = c.find(i=>i.id===p.id);
      if(ex) return c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);
      return [...c,{...p,qty:1}];
    });
  };
  const removeFromCart = (id) => setCart(c=>c.filter(i=>i.id!==id));
  const cartTotal = () => cart.reduce((s,i)=>s+i.price*i.qty,0);

  async function completeSale() {
    if(!cart.length) return;
    for(const item of cart){
      await supabase.from("sales").insert([{
        tenant_id:tenantId, business_id:posBizId,
        product_id:item.id, product_name:item.name,
        qty:item.qty, total:item.price*item.qty,
        date:today(),
      }]);
      if(item.stock<999){
        await supabase.from("products").update({stock:Math.max(0,item.stock-item.qty)}).eq("id",item.id);
      }
    }
    notify("✅ Vant konfime! "+fmt(cartTotal()));
    setCart([]); loadAll();
  }

  const totalSales = sales.reduce((s,x)=>s+Number(x.total),0);
  const todaySales = sales.filter(s=>s.date===today()).reduce((s,x)=>s+Number(x.total),0);
  const lowStock = products.filter(p=>p.stock<10&&p.stock<999);
if(!empSession) return <EmployeeLogin tenantId={tenantId} onLogin={setEmpSession} />;
  if(loading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:16}}>
      ⏳ Ap chaje...
    </div>
  );

  return (
    <div style={S.app}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{padding:"0 20px 24px",borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:800,color:C.accentLight}}>ICS Biznis</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>ICS ONE Platform</div>
        </div>
        {NAV.map(n=>(
          <div key={n.id} style={S.nav(page===n.id)} onClick={()=>setPage(n.id)}>
            <span>{n.icon}</span><span>{n.label}</span>
          </div>
        ))}
        <div style={{flex:1}}/>
        <div style={{padding:"16px 20px",borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{businesses.length} biznis aktif</div>
          <button onClick={onLogout} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:12}}>
            🚪 Dekonekte
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* ── DASHBOARD ── */}
        {page==="dashboard" && (
          <>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:24,fontWeight:800}}>Bonjou! 👋</div>
              <div style={{fontSize:13,color:C.muted,marginTop:4}}>
                {businesses.length} biznis • {products.length} pwodui • {employees.length} anplwaye
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20}}>
              {[
                {label:"Total Vant",val:fmt(totalSales),color:C.green},
                {label:"Vant Jodi a",val:fmt(todaySales),color:C.accentLight},
                {label:"Stock Ba",val:lowStock.length,color:C.orange},
              ].map((k,i)=>(
                <div key={i} style={{...S.card,borderTop:`3px solid ${k.color}`,marginBottom:0}}>
                  <div style={{fontSize:22,fontWeight:800,color:k.color,marginBottom:4}}>{k.val}</div>
                  <div style={{fontSize:11,color:C.muted,textTransform:"uppercase"}}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {businesses.map(b=>{
                const bSales = sales.filter(s=>s.business_id===b.id).reduce((s,x)=>s+Number(x.total),0);
                return (
                  <div key={b.id} style={{...S.card,borderLeft:`4px solid ${b.color||C.accent}`,cursor:"pointer",marginBottom:0}} onClick={()=>{setPage("businesses");}}>
                    <div style={{fontSize:28,marginBottom:8}}>{b.icon||"🏪"}</div>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{b.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:10}}>{b.type}</div>
                    <div style={{color:b.color||C.accent,fontWeight:800,fontSize:16}}>{fmt(bSales)}</div>
                    <div style={{fontSize:11,color:C.muted}}>Total Vant</div>
                  </div>
                );
              })}
            </div>
            {lowStock.length>0&&(
              <div style={{...S.card,marginTop:16,borderLeft:`4px solid ${C.orange}`}}>
                <div style={{fontWeight:700,marginBottom:10,color:C.orange}}>⚠️ Stock Ba</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    <th style={S.th}>Pwodui</th>
                    <th style={S.th}>Biznis</th>
                    <th style={S.th}>Stock</th>
                  </tr></thead>
                  <tbody>
                    {lowStock.map(p=>(
                      <tr key={p.id}>
                        <td style={S.td}>{p.name}</td>
                        <td style={S.td}>{businesses.find(b=>b.id===p.business_id)?.name||"—"}</td>
                        <td style={S.td}><span style={S.badge(C.red)}>{p.stock} rete</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── BIZNIS ── */}
        {page==="businesses" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>🏢 Biznis Mwen</div>
              <button style={S.btn(C.accent)} onClick={()=>{setBizForm(efBiz);setBizModal("add");}}>
                + Nouvo Biznis
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {businesses.map(b=>{
                const bSales=sales.filter(s=>s.business_id===b.id).reduce((s,x)=>s+Number(x.total),0);
                const bProds=products.filter(p=>p.business_id===b.id).length;
                const bEmps=employees.filter(e=>e.business_id===b.id).length;
                return (
                  <div key={b.id} style={{...S.card,borderLeft:`4px solid ${b.color||C.accent}`,marginBottom:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <span style={{fontSize:36}}>{b.icon||"🏪"}</span>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>{setBizForm({...b});setBizModal(b);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",color:C.muted,cursor:"pointer",fontSize:12}}>✏️</button>
                        <button onClick={()=>setConfirm({msg:`Efase biznis "${b.name}"?`,onYes:()=>deleteBiz(b)})} style={{background:"none",border:`1px solid ${C.red}22`,borderRadius:6,padding:"4px 8px",color:C.red,cursor:"pointer",fontSize:12}}>🗑</button>
                      </div>
                    </div>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{b.name}</div>
                    <span style={S.badge(b.color||C.accent)}>{b.type}</span>
                    <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[["Vant",fmt(bSales)],["Pwodui",bProds],["Anplwaye",bEmps],["Tx",sales.filter(s=>s.business_id===b.id).length]].map(([l,v])=>(
                        <div key={l} style={{background:`${C.accent}11`,borderRadius:8,padding:"8px 10px"}}>
                          <div style={{fontWeight:700,fontSize:14}}>{v}</div>
                          <div style={{fontSize:11,color:C.muted}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {businesses.length===0&&<div style={{color:C.muted,fontSize:14,gridColumn:"1/-1",textAlign:"center",padding:40}}>Poko gen biznis. Klike "+ Nouvo Biznis"</div>}
            </div>
          </>
        )}

        {/* ── POS ── */}
        {page==="pos" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>💳 Vant / Kès</div>
              <select style={{...S.select,width:"auto"}} value={posBizId||""} onChange={e=>{setPosBizId(e.target.value);setCart([]);}}>
                {businesses.map(b=><option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
              <div>
                <div style={{fontWeight:700,marginBottom:12,color:C.muted,fontSize:12,textTransform:"uppercase"}}>Pwodui Disponib</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {products.filter(p=>p.business_id===posBizId).map(p=>(
                    <div key={p.id} style={{...S.card,cursor:p.stock===0?"not-allowed":"pointer",opacity:p.stock===0?0.4:1,padding:14,marginBottom:0,transition:"border-color .15s",borderColor:C.border}} onClick={()=>p.stock>0&&addToCart(p)}
                      onMouseEnter={e=>{if(p.stock>0)e.currentTarget.style.borderColor=C.accent}}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                      <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{p.name}</div>
                      <div style={{color:C.green,fontWeight:800,fontSize:15}}>{fmt(p.price)}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:4}}>{p.stock<999?`${p.stock} disponib`:"∞"}</div>
                    </div>
                  ))}
                  {products.filter(p=>p.business_id===posBizId).length===0&&(
                    <div style={{color:C.muted,fontSize:13,gridColumn:"1/-1",textAlign:"center",padding:40}}>
                      Poko gen pwodui. Ajoute nan Envantè.
                    </div>
                  )}
                </div>
              </div>
              <div style={{...S.card,height:"fit-content"}}>
                <div style={{fontWeight:700,marginBottom:12}}>🛒 Kòmand</div>
                {cart.length===0?(
                  <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"30px 0"}}>Klike sou pwodui</div>
                ):(
                  <>
                    {cart.map(item=>(
                      <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600}}>{item.name}</div>
                          <div style={{fontSize:12,color:C.muted}}>{item.qty} × {fmt(item.price)}</div>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{color:C.green,fontWeight:700}}>{fmt(item.price*item.qty)}</span>
                          <button style={{background:C.red+"33",color:C.red,border:"none",borderRadius:6,padding:"2px 8px",cursor:"pointer"}} onClick={()=>removeFromCart(item.id)}>×</button>
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:16,paddingTop:16,borderTop:`2px solid ${C.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                        <span style={{fontWeight:700}}>TOTAL</span>
                        <span style={{color:C.green,fontWeight:800,fontSize:16}}>{fmt(cartTotal())}</span>
                      </div>
                      <button style={{...S.btn(C.green),width:"100%",padding:"12px",fontSize:15}} onClick={completeSale}>✅ Konfime Vant</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── ENVANTÈ ── */}
        {page==="inventory" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>📦 Envantè</div>
              <div style={{display:"flex",gap:10}}>
                <select style={{...S.select,width:"auto"}} value={filterBiz} onChange={e=>setFilterBiz(e.target.value)}>
                  <option value="">Tout Biznis</option>
                  {businesses.map(b=><option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
                </select>
                <button style={S.btn(C.accent)} onClick={()=>{setProdForm({...efProd,business_id:filterBiz||businesses[0]?.id||""});setProdModal("add");}}>
                  + Ajoute Pwodui
                </button>
              </div>
            </div>
            <div style={S.card}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  {["Pwodui","Biznis","Kategori","Pri","Stock","Eta",""].map(h=><th key={h} style={S.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {products.filter(p=>!filterBiz||p.business_id===filterBiz).map(p=>{
                    const biz=businesses.find(b=>b.id===p.business_id);
                    const sc=p.stock<999?(p.stock<10?"ba":p.stock<20?"mwayen":"bon"):"ilimite";
                    const sc2=sc==="ba"?C.red:sc==="mwayen"?C.yellow:sc==="ilimite"?C.accent:C.green;
                    return (
                      <tr key={p.id}>
                        <td style={{...S.td,fontWeight:600}}>{p.name}</td>
                        <td style={S.td}><span style={{color:biz?.color||C.accent}}>{biz?.icon} {biz?.name||"—"}</span></td>
                        <td style={S.td}><span style={S.badge(C.muted)}>{p.category||"—"}</span></td>
                        <td style={{...S.td,color:C.green,fontWeight:700}}>{fmt(p.price)}</td>
                        <td style={S.td}>{p.stock<999?p.stock:"∞"}</td>
                        <td style={S.td}><span style={S.badge(sc2)}>{sc}</span></td>
                        <td style={S.td}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>{setProdForm({...p});setProdModal(p);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",color:C.muted,cursor:"pointer",fontSize:12}}>✏️</button>
                            <button onClick={()=>setConfirm({msg:`Efase pwodui "${p.name}"?`,onYes:()=>deleteProd(p)})} style={{background:"none",border:`1px solid ${C.red}22`,borderRadius:6,padding:"4px 8px",color:C.red,cursor:"pointer",fontSize:12}}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {products.filter(p=>!filterBiz||p.business_id===filterBiz).length===0&&(
                    <tr><td colSpan={7} style={{...S.td,textAlign:"center",color:C.muted,padding:40}}>Poko gen pwodui.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ANPLWAYE ── */}
        {page==="employees" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>👥 Anplwaye</div>
              <div style={{display:"flex",gap:10}}>
                <select style={{...S.select,width:"auto"}} value={filterBiz} onChange={e=>setFilterBiz(e.target.value)}>
                  <option value="">Tout Biznis</option>
                  {businesses.map(b=><option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
                </select>
                <button style={S.btn(C.accent)} onClick={()=>{setEmpForm({...efEmp,business_id:filterBiz||businesses[0]?.id||""});setEmpModal("add");}}>
                  + Ajoute Anplwaye
                </button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
              {employees.filter(e=>!filterBiz||e.business_id===filterBiz).map(emp=>{
                const biz=businesses.find(b=>b.id===emp.business_id);
                return (
                  <div key={emp.id} style={{...S.card,marginBottom:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <div style={{width:44,height:44,borderRadius:"50%",background:`${biz?.color||C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:15}}>{emp.name}</div>
                          <div style={{fontSize:12,color:C.muted}}>{emp.role||"—"}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={S.badge(emp.status==="aktif"?C.green:C.yellow)}>{emp.status}</span>
                        <button onClick={()=>{setEmpForm({...emp});setEmpModal(emp);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",color:C.muted,cursor:"pointer",fontSize:12}}>✏️</button>
                        <button onClick={()=>setConfirm({msg:`Efase "${emp.name}"?`,onYes:()=>deleteEmp(emp)})} style={{background:"none",border:`1px solid ${C.red}22`,borderRadius:6,padding:"4px 8px",color:C.red,cursor:"pointer",fontSize:12}}>🗑️</button>
                      </div>
                    </div>
                    <div style={{marginTop:10,fontSize:12,color:biz?.color||C.accent}}>{biz?.icon} {biz?.name||"—"}</div>
                  </div>
                );
              })}
              {employees.filter(e=>!filterBiz||e.business_id===filterBiz).length===0&&(
                <div style={{color:C.muted,fontSize:14,gridColumn:"1/-1",textAlign:"center",padding:40}}>Poko gen anplwaye.</div>
              )}
            </div>
          </>
        )}

        {/* ── RAPÒ ── */}
        {page==="reports" && (
          <>
            <div style={{fontSize:22,fontWeight:800,marginBottom:20}}>📈 Rapò</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20}}>
              {businesses.map(b=>{
                const bSales=sales.filter(s=>s.business_id===b.id);
                const total=bSales.reduce((s,x)=>s+Number(x.total),0);
                const tod=bSales.filter(s=>s.date===today()).reduce((s,x)=>s+Number(x.total),0);
                const pct=totalSales>0?Math.round((total/totalSales)*100):0;
                return (
                  <div key={b.id} style={{...S.card,borderTop:`3px solid ${b.color||C.accent}`,marginBottom:0}}>
                    <div style={{fontSize:28,marginBottom:6}}>{b.icon||"🏪"}</div>
                    <div style={{fontWeight:700,marginBottom:12,fontSize:15}}>{b.name}</div>
                    {[["Total Vant",fmt(total),b.color||C.accent],["Jodi a",fmt(tod),C.text],["Tx",bSales.length,C.text],["Anplwaye",employees.filter(e=>e.business_id===b.id).length,C.text]].map(([l,v,c])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{color:C.muted,fontSize:13}}>{l}</span>
                        <span style={{color:c,fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10}}>
                      <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:b.color||C.accent,borderRadius:3}}/>
                      </div>
                      <div style={{fontSize:11,color:C.muted,marginTop:4}}>{pct}% nan total vant</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📋 Dènye Vant</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Dat","Biznis","Pwodui","Kantite","Montan"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {sales.slice(0,15).map(s=>{
                    const biz=businesses.find(b=>b.id===s.business_id);
                    return (
                      <tr key={s.id}>
                        <td style={S.td}>{s.date}</td>
                        <td style={{...S.td,color:biz?.color||C.accent}}>{biz?.icon} {biz?.name||"—"}</td>
                        <td style={S.td}>{s.product_name||"—"}</td>
                        <td style={S.td}>{s.qty}</td>
                        <td style={{...S.td,color:C.green,fontWeight:700}}>{fmt(s.total)}</td>
                      </tr>
                    );
                  })}
                  {sales.length===0&&<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:C.muted,padding:40}}>Poko gen vant.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {/* ── MODAL BIZNIS ── */}
      {bizModal && (
        <Modal title={bizModal==="add"?"Nouvo Biznis":"Modifye Biznis"} onClose={()=>setBizModal(null)} onSave={saveBiz} saving={saving}>
          <Fld label="Non Biznis *" val={bizForm.name} onChange={v=>setBizForm(p=>({...p,name:v}))} ph="Ex: Boutik Gracia"/>
          <Fld label="Tip Biznis" val={bizForm.type} onChange={v=>setBizForm(p=>({...p,type:v}))} ph="boutik, restoran, sèvis..."/>
          <div style={{marginBottom:14}}>
            <label style={S.label}>Icòn</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {ICONS.map(ic=>(
                <button key={ic} onClick={()=>setBizForm(p=>({...p,icon:ic}))} style={{fontSize:22,background:bizForm.icon===ic?`${C.accent}33`:"transparent",border:`2px solid ${bizForm.icon===ic?C.accent:C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={S.label}>Koulè</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {COLORS.map(cl=>(
                <button key={cl} onClick={()=>setBizForm(p=>({...p,color:cl}))} style={{width:32,height:32,borderRadius:"50%",background:cl,border:`3px solid ${bizForm.color===cl?"#fff":cl}`,cursor:"pointer",outline:bizForm.color===cl?`3px solid ${cl}`:"none",outlineOffset:2}}/>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL PWODUI ── */}
      {prodModal && (
        <Modal title={prodModal==="add"?"Nouvo Pwodui":"Modifye Pwodui"} onClose={()=>setProdModal(null)} onSave={saveProd} saving={saving}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Fld label="Non Pwodui *" val={prodForm.name} onChange={v=>setProdForm(p=>({...p,name:v}))} ph="Ex: Chemiz"/>
            <Fld label="Pri (HTG) *" val={prodForm.price} onChange={v=>setProdForm(p=>({...p,price:v}))} type="number" ph="500"/>
            <Fld label="Stock" val={prodForm.stock} onChange={v=>setProdForm(p=>({...p,stock:v}))} type="number" ph="100"/>
            <Fld label="Kategori" val={prodForm.category} onChange={v=>setProdForm(p=>({...p,category:v}))} ph="Rad, Manje..."/>
          </div>
          <Sel label="Biznis *" val={prodForm.business_id} onChange={v=>setProdForm(p=>({...p,business_id:v}))}
            opts={businesses.map(b=>({v:b.id,l:`${b.icon} ${b.name}`}))}/>
        </Modal>
      )}

      {/* ── MODAL ANPLWAYE ── */}
      {empModal && (
        <Modal title={empModal==="add"?"Nouvo Anplwaye":"Modifye Anplwaye"} onClose={()=>setEmpModal(null)} onSave={saveEmp} saving={saving}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Fld label="Non Konplè *" val={empForm.name} onChange={v=>setEmpForm(p=>({...p,name:v}))} ph="Ex: Marie Paul"/>
            <Fld label="Wòl / Pòs" val={empForm.role} onChange={v=>setEmpForm(p=>({...p,role:v}))} ph="Kachè, Manadjè..."/>
          </div>
          <Sel label="Biznis *" val={empForm.business_id} onChange={v=>setEmpForm(p=>({...p,business_id:v}))}
            opts={businesses.map(b=>({v:b.id,l:`${b.icon} ${b.name}`}))}/>
          <Sel label="Estati" val={empForm.status} onChange={v=>setEmpForm(p=>({...p,status:v}))}
            opts={[{v:"aktif",l:"Aktif"},{v:"konje",l:"Konje"},{v:"inaktif",l:"Inaktif"}]}/>
        </Modal>
      )}

      {/* ── CONFIRM ── */}
      {confirm && <Confirm msg={confirm.msg} onYes={confirm.onYes} onNo={()=>setConfirm(null)}/>}

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
