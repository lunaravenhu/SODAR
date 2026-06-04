import { json, getSoSoValueTape } from './_utils.mjs';
export async function handler() {
  try { return json({ live:true, source:'SoSoValue API', tape: await getSoSoValueTape() }); }
  catch(e){ return json({ live:false, error:e.message }, 502); }
}
