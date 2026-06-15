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

const NAV = [
  {id:"dashboard", label:"Dashboard", icon:"📊"},
  {id:"businesses", label:"Biznis Mwen", icon:"🏢"},
  {id:"pos", label:"Vant / Kès", icon:"💳"},
  {id:"inventory", label:"Envantè", icon:"📦"},
  {id:"employees", label:"Anplwaye", icon:"👥"},
  {id:"reports", label:"Rapò", icon:"📈"},
];

export default function ICSBiznis({ profile, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [businesses, setBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [posBizId, setPosBizId] = useState(null);
  const [filterBiz, setFilterBiz] = useState(0);

  const tenantId = profile?.tenant_id;

  useEffect(() => { if(tenantId) loadAll(); }, [tenantId]);

  async function loadAll() {
    setLoading(true);
    const [b, p, e, s] = await Promise.all([
      supabase.from("businesses").select("*").eq("tenant_id", tenantId),
      supabase.from("products").select("*").eq("tenant_id", tenantId),
      supabase.from("employees").select("*").eq("tenant_id", tenantId),
      supabase.from("sales").select("*").eq("tenant_id", tenantId).order("created_at", {ascending: false}),
    ]);
    if(b.data) { setBusinesses(b.data); if(b.data[0]) setPosBizId(b.data[0].id); }
    if(p.data) setProducts(p.data);
    if(e.data) setEmployees(e.data);
    if(s.data) setSales(s.data);
    setLoading(false);
  }

  // POS
  function addToCart(product) {
    setCart(c => {
      const ex = c.find(i => i.id === product.id);
      if(ex) return c.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i);
      return [...c, {...product, qty:1}];
    });
  }
  function removeFromCart(id) { setCart(c => c.filter(i => i.id !== id)); }
  const cartTotal = () => cart.reduce((s,i) => s + i.price * i.qty, 0);

  async function completeSale() {
    if(cart.length === 0) return;
    for(const item of cart) {
      await supabase.from("sales").insert([{
        tenant_id: tenantId,
        business_id: posBizId,
        product_id: item.id,
        product_name: item.name,
        qty: item.qty,
        total: item.price * item.qty,
        date: new Date().toISOString().slice(0,10),
      }]);
      if(item.stock < 999) {
        await supabase.from("products").update({stock: item.stock - item.qty}).eq("id", item.id);
      }
    }
    alert("✅ Vant konfime! " + fmt(cartTotal()));
    setCart([]);
    loadAll();
  }

  const totalSales = sales.reduce((s,x) => s + Number(x.total), 0);
  const todaySales = sales.filter(s => s.date === new Date().toISOString().slice(0,10)).reduce((s,x) => s + Number(x.total), 0);
  const lowStock = products.filter(p => p.stock < 15 && p.stock < 999);

  const S = {
    app:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Sora','Segoe UI',sans-serif",display:"flex"},
    sidebar:{width:220,background:C.surface,borderRight:`1px solid ${C.border}`,padding:"24px 0",display:"flex",flexDirection:"column",flexShrink:0},
    nav:(active)=>({display:"flex",alignItems:"center",gap:10,padding:"10px 20px",cursor:"pointer",color:active?C.accentLight:C.muted,background:active?`${C.accent}18`:"transparent",borderLeft:active?`3px solid ${C.accent}`:"3px solid transparent",fontSize:14,fontWeight:active?600:400}),
    main:{flex:1,overflow:"auto",padding:28},
    card:{background:C.card,borderRadius:14,padding:20,border:`1px solid ${C.border}`,marginBottom:16},
    statCard:(color)=>({background:C.card,borderRadius:14,padding:20,border:`1px solid ${C.border}`,borderTop:`3px solid ${color}`}),
    grid3:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20},
    grid2:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,marginBottom:20},
    btn:(color)=>({background:color,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}),
    th:{textAlign:"left",padding:"10px 14px",fontSize:11,color:C.muted,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`},
    td:{padding:"12px 14px",fontSize:13,borderBottom:`1px solid ${C.border}18`},
    badge:(color)=>({display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:`${color}22`,color}),
  };

  if(loading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:16}}>
      ⏳ Ap chaje done...
    </div>
  );

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{padding:"0 20px 24px",borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:800,color:C.accentLight}}>ICS Biznis</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>ICS ONE Platform</div>
        </div>
        {NAV.map(n => (
          <div key={n.id} style={S.nav(page===n.id)} onClick={()=>setPage(n.id)}>
            <span>{n.icon}</span><span>{n.label}</span>
          </div>
        ))}
        <div style={{flex:1}}/>
        <div style={{padding:"16px 20px",borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,color:C.muted}}>{businesses.length} biznis aktif</div>
          <button onClick={onLogout} style={{marginTop:8,background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:12}}>
            🚪 Dekonekte
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>

        {/* DASHBOARD */}
        {page==="dashboard" && (
          <>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:24,fontWeight:800}}>Bonjou! 👋</div>
              <div style={{fontSize:13,color:C.muted,marginTop:4}}>{businesses.length} biznis • {products.length} pwodui • {employees.length} anplwaye</div>
            </div>
            <div style={S.grid3}>
              <div style={S.statCard(C.green)}>
                <div style={{fontSize:24,fontWeight:800,color:C.green,marginBottom:4}}>{fmt(totalSales)}</div>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase"}}>Total Vant</div>
              </div>
              <div style={S.statCard(C.accent)}>
                <div style={{fontSize:24,fontWeight:800,color:C.accentLight,marginBottom:4}}>{fmt(todaySales)}</div>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase"}}>Vant Jodi a</div>
              </div>
              <div style={S.statCard(C.orange)}>
                <div style={{fontSize:24,fontWeight:800,color:C.orange,marginBottom:4}}>{lowStock.length}</div>
                <div style={{fontSize:11,color:C.muted,textTransform:"uppercase"}}>Stock Ba</div>
              </div>
            </div>
            <div style={S.grid3}>
              {businesses.map(b => {
                const bSales = sales.filter(s=>s.business_id===b.id).reduce((s,x)=>s+Number(x.total),0);
                return (
                  <div key={b.id} style={{...S.card,borderLeft:`4px solid ${b.color||C.accent}`,cursor:"pointer"}} onClick={()=>setPage("businesses")}>
                    <div style={{fontSize:28,marginBottom:8}}>{b.icon||"🏪"}</div>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{b.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{b.type}</div>
                    <div style={{color:b.color||C.accent,fontWeight:800,fontSize:16}}>{fmt(bSales)}</div>
                    <div style={{fontSize:11,color:C.muted}}>Total Vant</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* BUSINESSES */}
        {page==="businesses" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>🏢 Biznis Mwen</div>
            </div>
            <div style={S.grid3}>
              {businesses.map(b => {
                const bSales = sales.filter(s=>s.business_id===b.id).reduce((s,x)=>s+Number(x.total),0);
                const bProds = products.filter(p=>p.business_id===b.id).length;
                const bEmps = employees.filter(e=>e.business_id===b.id).length;
                return (
                  <div key={b.id} style={{...S.card,borderLeft:`4px solid ${b.color||C.accent}`}}>
                    <div style={{fontSize:32,marginBottom:8}}>{b.icon||"🏪"}</div>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{b.name}</div>
                    <span style={S.badge(b.color||C.accent)}>{b.type}</span>
                    <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[["Vant",fmt(bSales)],["Pwodui",bProds],["Anplwaye",bEmps],["Tx",sales.filter(s=>s.business_id===b.id).length]].map(([l,v])=>(
                        <div key={l} style={{background:"#ffffff08",borderRadius:8,padding:"8px 10px"}}>
                          <div style={{fontWeight:700,fontSize:14}}>{v}</div>
                          <div style={{fontSize:11,color:C.muted}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* POS */}
        {page==="pos" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>💳 Kès / Vant</div>
              <select style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13}} value={posBizId||""} onChange={e=>{ setPosBizId(e.target.value); setCart([]); }}>
                {businesses.map(b=><option key={b.id} value={b.id}>{b.icon||"🏪"} {b.name}</option>)}
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
              <div>
                <div style={{fontWeight:700,marginBottom:12}}>Pwodui Disponib</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {products.filter(p=>p.business_id===posBizId).map(p=>(
                    <div key={p.id} style={{...S.card,cursor:"pointer",opacity:p.stock===0?0.4:1,padding:14}} onClick={()=>p.stock>0&&addToCart(p)}>
                      <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{p.name}</div>
                      <div style={{color:C.green,fontWeight:800}}>{fmt(p.price)}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:4}}>{p.stock<999?`${p.stock} disponib`:"∞"}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={S.card}>
                <div style={{fontWeight:700,marginBottom:12}}>🛒 Kòmand</div>
                {cart.length===0 ? <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"30px 0"}}>Klike sou pwodui</div> : (
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

        {/* INVENTORY */}
        {page==="inventory" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>📦 Envantè</div>
              <select style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13}} value={filterBiz} onChange={e=>setFilterBiz(e.target.value)}>
                <option value={0}>Tout Biznis</option>
                {businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={S.card}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  {["Pwodui","Biznis","Kategori","Pri","Stock","Eta"].map(h=><th key={h} style={S.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {products.filter(p=>!filterBiz||filterBiz==0||p.business_id===filterBiz).map(p=>{
                    const biz=businesses.find(b=>b.id===p.business_id);
                    const sc=p.stock<999?(p.stock<10?"ba":p.stock<20?"mwayen":"bon"):"ilimite";
                    const sc2=sc==="ba"?C.red:sc==="mwayen"?C.yellow:sc==="ilimite"?C.accent:C.green;
                    return (
                      <tr key={p.id}>
                        <td style={{...S.td,fontWeight:600}}>{p.name}</td>
                        <td style={S.td}>{biz?.icon} {biz?.name||"—"}</td>
                        <td style={S.td}><span style={S.badge(C.muted)}>{p.category||"—"}</span></td>
                        <td style={{...S.td,color:C.green,fontWeight:700}}>{fmt(p.price)}</td>
                        <td style={S.td}>{p.stock<999?p.stock:"∞"}</td>
                        <td style={S.td}><span style={S.badge(sc2)}>{sc}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* EMPLOYEES */}
        {page==="employees" && (
          <>
            <div style={{fontSize:22,fontWeight:800,marginBottom:20}}>👥 Anplwaye</div>
            <div style={S.grid2}>
              {employees.filter(e=>!filterBiz||filterBiz==0||e.business_id===filterBiz).map(emp=>{
                const biz=businesses.find(b=>b.id===emp.business_id);
                return (
                  <div key={emp.id} style={S.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <div style={{width:40,height:40,borderRadius:"50%",background:`${biz?.color||C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👤</div>
                        <div>
                          <div style={{fontWeight:700}}>{emp.name}</div>
                          <div style={{fontSize:12,color:C.muted}}>{emp.role}</div>
                        </div>
                      </div>
                      <span style={S.badge(emp.status==="aktif"?C.green:C.yellow)}>{emp.status}</span>
                    </div>
                    <div style={{marginTop:12,fontSize:12,color:biz?.color||C.accent}}>{biz?.icon} {biz?.name}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* REPORTS */}
        {page==="reports" && (
          <>
            <div style={{fontSize:22,fontWeight:800,marginBottom:20}}>📈 Rapò</div>
            <div style={S.grid3}>
              {businesses.map(b=>{
                const bSales=sales.filter(s=>s.business_id===b.id);
                const total=bSales.reduce((s,x)=>s+Number(x.total),0);
                return (
                  <div key={b.id} style={{...S.card,borderTop:`3px solid ${b.color||C.accent}`}}>
                    <div style={{fontSize:24,marginBottom:6}}>{b.icon||"🏪"}</div>
                    <div style={{fontWeight:700,marginBottom:12}}>{b.name}</div>
                    {[["Total Vant",fmt(total),b.color||C.accent],["Tranzaksyon",bSales.length,C.text],["Anplwaye",employees.filter(e=>e.business_id===b.id).length,C.text]].map(([l,v,c])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{color:C.muted,fontSize:13}}>{l}</span>
                        <span style={{color:c,fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📋 Dènye Vant</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Dat","Biznis","Pwodui","Kantite","Montan"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {sales.slice(0,10).map(s=>{
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
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
