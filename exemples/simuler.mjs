// Envoie une ou plusieurs mesures de test à Saison, comme le ferait une passerelle.
//   SAISON_URL=https://… SAISON_CLE=… node exemples/simuler.mjs 55.2 [54.8 …]
// Plusieurs valeurs : envoyées en un seul lot, espacées de 15 minutes et finissant maintenant.
const url = (process.env.SAISON_URL || '').replace(/\/$/, '');
const cle = process.env.SAISON_CLE || '';
const valeurs = process.argv.slice(2).map((v) => Number(v.replace(',', '.')));
if (!url || !cle || !valeurs.length || valeurs.some((v) => !Number.isFinite(v))) {
  console.error('Usage : SAISON_URL=https://… SAISON_CLE=… node exemples/simuler.mjs 55.2 [54.8 …]');
  process.exit(1);
}
const maintenant = Date.now();
const corps = valeurs.map((temperature, i) => ({ temperature, horodatage: new Date(maintenant - (valeurs.length - 1 - i) * 15 * 60000).toISOString() }));
const rep = await fetch(`${url}/api/v1/mesures`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(corps.length === 1 ? corps[0] : corps),
});
console.log(rep.status, await rep.text());
process.exit(rep.ok ? 0 : 1);
