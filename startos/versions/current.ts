import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:22',
  releaseNotes: {
    en_US: `Lets 16 GB devices turn on indexing.

Mempool checked your RAM against a 16 GB floor, but what it measures is the share StartOS grants to services — the system total minus the 1 GiB StartOS keeps for itself — so no 16 GB device could ever clear the bar. Indexing now warns instead of refusing, and the choice is yours. The Lightning form uses the same measurement, so its memory warning is reserved for devices that really are short on RAM.`,
    es_ES: `Permite activar la indexación en dispositivos de 16 GB.

Mempool comparaba tu RAM con un umbral de 16 GB, pero lo que mide es la parte que StartOS concede a los servicios —el total del sistema menos el 1 GiB que StartOS se reserva—, así que ningún dispositivo de 16 GB podía superarlo. Ahora la indexación avisa en lugar de rechazar y te deja decidir. El formulario de Lightning usa la misma medición, así que su aviso de memoria queda reservado a los dispositivos que realmente van justos de RAM.`,
    de_DE: `Ermöglicht das Aktivieren der Indexierung auf 16-GB-Geräten.

Mempool prüfte deinen Arbeitsspeicher gegen eine 16-GB-Schwelle, misst aber den Anteil, den StartOS den Diensten zuteilt – die Systemgesamtmenge abzüglich des 1 GiB, das StartOS für sich behält –, sodass kein 16-GB-Gerät die Hürde je nehmen konnte. Die Indexierung warnt jetzt, statt abzuweisen, und überlässt dir die Entscheidung. Das Lightning-Formular verwendet dieselbe Messung, sodass sein Speicherhinweis Geräten vorbehalten bleibt, die wirklich knapp bei Arbeitsspeicher sind.`,
    pl_PL: `Umożliwia włączenie indeksowania na urządzeniach z 16 GB.

Mempool porównywał twoją pamięć RAM z progiem 16 GB, ale mierzy część, którą StartOS przydziela usługom — całość systemu pomniejszoną o 1 GiB, który StartOS zatrzymuje dla siebie — więc żadne urządzenie z 16 GB nie mogło przekroczyć tego progu. Indeksowanie teraz ostrzega, zamiast odrzucać, i pozostawia decyzję tobie. Formularz Lightning korzysta z tego samego pomiaru, więc jego ostrzeżenie o pamięci jest zarezerwowane dla urządzeń, którym naprawdę brakuje RAM.`,
    fr_FR: `Permet d'activer l'indexation sur les appareils de 16 Go.

Mempool comparait votre RAM à un seuil de 16 Go, alors qu'il mesure la part que StartOS accorde aux services — le total du système moins le 1 Gio que StartOS garde pour lui —, si bien qu'aucun appareil de 16 Go ne pouvait franchir ce seuil. L'indexation avertit désormais au lieu de refuser et vous laisse décider. Le formulaire Lightning utilise la même mesure, de sorte que son avertissement mémoire est réservé aux appareils qui manquent réellement de RAM.`,
  },
  migrations: {},
})
