import { json, getSoDEXPairs } from './_utils.mjs';
export async function handler() {
  try { return json({ live:true, source:'SoDEX API', pairs: await getSoDEXPairs() }); }
  catch(e){ return json({ live:false, error:e.message }, 502); }
}
