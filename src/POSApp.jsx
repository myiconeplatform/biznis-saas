import { useState } from 'react';
import EmployeeLogin from './EmployeeLogin';
import ICSBiznis from './ICSBiznis';

export default function POSApp() {
  const [emp, setEmp] = useState(null);
  const tenantId = 'd1922f24-aac4-4f85-a55a-dbc59740d0bb';
  if(!emp) return <EmployeeLogin tenantId={tenantId} onLogin={setEmp}/>;
  return <ICSBiznis profile={{tenant_id:tenantId, role:'client'}} onLogout={()=>setEmp(null)}/>;
}
