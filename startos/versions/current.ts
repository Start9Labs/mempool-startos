import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:2',
  releaseNotes: {
    en_US:
      'Mempool keeps the CPU busy enough to hold the fan on and the temperature high. Run it only while you are using it, and stop it afterwards.',
    es_ES:
      'Mempool mantiene la CPU lo bastante ocupada como para que el ventilador no se detenga y la temperatura siga alta. Ejecútelo solo mientras lo usa y deténgalo después.',
    de_DE:
      'Mempool lastet die CPU so stark aus, dass der Lüfter nicht abschaltet und die Temperatur hoch bleibt. Lassen Sie es nur laufen, während Sie es nutzen, und stoppen Sie es danach.',
    pl_PL:
      'Mempool obciąża procesor na tyle, że wentylator nie przestaje pracować, a temperatura pozostaje wysoka. Uruchamiaj go tylko na czas korzystania i zatrzymuj po zakończeniu.',
    fr_FR:
      "Mempool sollicite suffisamment le processeur pour que le ventilateur ne s'arrête pas et que la température reste élevée. Ne l'exécutez que pendant que vous l'utilisez, puis arrêtez-le.",
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
