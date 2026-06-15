import { useState } from "react";
import EmployeeLogin from "./EmployeeLogin";
import ICSBiznis from "./ICSBiznis";

const TENANT_ID = "d1922f24-aac4-4f85-a55a-dbc59740d0bb";
const BUSINESS_ID = "b95b5981-0449-493f-a999-f0166d349e66";

const PERMISSIONS = {
  cashier: {
    pos_vann: true,
    envante_we: true,
    rapò_we: false,
    biznis_jere: false,
    anplwaye_jere: false,
  },
  kachè: {
    pos_vann: true,
    envante_we: true,
    rapò_we: false,
    biznis_jere: false,
    anplwaye_jere: false,
  },
  manager: {
    pos_vann: true,
    envante_we: true,
    rapò_we: true,
    biznis_jere: false,
    anplwaye_jere: false,
  },
  manadjè: {
    pos_vann: true,
    envante_we: true,
    rapò_we: true,
    biznis_jere: false,
    anplwaye_jere: false,
  },
  admin: {
    pos_vann: true,
    envante_we: true,
    rapò_we: true,
    biznis_jere: true,
    anplwaye_jere: true,
  },
};

export default function POSApp() {
  const [emp, setEmp] = useState(null);

  function handleLogin(empData) {
    const role = empData.role?.toLowerCase() || "cashier";
    const perms = PERMISSIONS[role] || PERMISSIONS.cashier;
    setEmp({
      ...empData,
      role_level: role,
      permissions: perms,
    });
  }

  function handleLogout() {
    setEmp(null);
  }

  if (!emp) {
    return <EmployeeLogin tenantId={TENANT_ID} onLogin={handleLogin} />;
  }

  const profile = {
    tenant_id: TENANT_ID,
    business_id: BUSINESS_ID,
    role: emp.role_level,
  };

  return <ICSBiznis profile={profile} empSession={emp} onLogout={handleLogout} />;
}
