import { json } from './_utils.mjs';
export async function handler(){ return json({ ok:true, app:'SODAR', mode:'live-only', demoData:'disabled', wallet:'EIP-1193 browser wallet connect/disconnect' }); }
