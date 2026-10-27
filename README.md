# Saison, sondes de température : brancher une sonde

Guide et exemples pour envoyer les mesures d'une sonde de température vers Saison, les carnets sanitaires en ligne des campings et hôtels (offre « Grand site », ou essai de 30 jours avec 2 sondes).

Saison reçoit les mesures en HTTPS, trace la courbe du point, ouvre une action et prévient les gestionnaires quand la température reste hors seuil au-delà de la temporisation choisie, et signale une sonde muette.

## 1. Créer la sonde dans Saison

*Sondes → Ajouter une sonde* : choisissez le point (en général un retour de boucle ou un départ de production), la temporisation de l'alarme et le délai de silence. Saison affiche **une seule fois** la clé de la sonde : copiez-la dans votre passerelle, jamais dans un dépôt de code.

## 2. Format accepté

```
POST <adresse de Saison>/api/v1/mesures
Authorization: Bearer <clé de la sonde>
Content-Type: application/json
```

Corps : un objet, ou un tableau de 100 objets au plus.

```json
{ "temperature": 56.4, "horodatage": "2026-03-02T08:15:00Z" }
```

* Température en °C, entre -30 et 130. Champ cherché dans cet ordre : `temperature`, `temp`, `temperature_c`, `temp_c`, `TempC_DS`, `TempC_SHT`, `TempC1`, `TEMP`, `valeur`, `value`. Un autre nom se règle sur la fiche de la sonde (« Champ de température »).
* Date facultative (`horodatage`, `timestamp` ou `time`, ISO 8601) : sinon l'heure de réception. Mesures acceptées jusqu'à 7 jours en arrière, pour rattraper une coupure de passerelle.
* 120 envois par heure au plus et par sonde.

Réponses : `200 {"acceptees":1,"ignorees":0,"etat":…}`, `401` clé inconnue ou sonde désactivée, `402` abonnement sans sondes, `422` aucune température lisible, `429` trop d'envois.

## 3. The Things Network (LoRaWAN)

Dans la console TTN, application → *Integrations → Webhooks → Custom webhook* :

* *Base URL* : `<adresse de Saison>/api/v1/mesures`
* *Additional headers* : `Authorization` = `Bearer <clé de la sonde>`
* *Enabled event types* : *Uplink message* seulement.

Saison lit `uplink_message.decoded_payload` et `received_at`. Il faut donc un *payload formatter* qui décode la trame : la plupart des fabricants en publient un dans le dépôt des appareils LoRaWAN (*Device Repository*), choisi automatiquement quand l'appareil est enregistré depuis ce dépôt. Une sonde par webhook : si une application TTN contient plusieurs sondes, créez un webhook par appareil avec un filtre, ou une application par sonde.

## 4. ChirpStack

*Applications → Integrations → HTTP* : URL `<adresse de Saison>/api/v1/mesures`, en-tête `Authorization: Bearer <clé>`, encodage JSON. Saison lit le champ `object` (charge décodée par le codec de l'appareil) et `time`.

## 5. Tester sans sonde

```sh
SAISON_URL=https://votre-saison.exemple SAISON_CLE=… node exemples/simuler.mjs 55.2
```

ou avec curl :

```sh
curl -X POST "$SAISON_URL/api/v1/mesures" \
  -H "Authorization: Bearer $SAISON_CLE" -H "Content-Type: application/json" \
  -d '{"temperature": 55.2}'
```

La mesure apparaît aussitôt sur la fiche du point. Une valeur sous le seuil, répétée au-delà de la temporisation, déclenche l'alarme.

## Questions

support@consignestudio.fr

Licence MIT (ce guide et ses exemples). Saison lui-même est un service commercial édité par Consigne.
