import { useAudioPlayer } from "expo-audio";

const beepSource = require("@/assets/sounds/beep.wav");
const restEndSource = require("@/assets/sounds/rest_end.wav");
const completeSource = require("@/assets/sounds/complete.wav");

export type SoundEffects = {
  playBeep: () => void;
  playRestEnd: () => void;
  playComplete: () => void;
};

/**
 * Tonos cortos sintetizados localmente (sin asset externo): tick de cuenta
 * regresiva, fin de descanso, y celebración al terminar. Se silencian según
 * la preferencia de sonido en Ajustes (`enabled`), que sigue permitiendo
 * la vibración háptica y la notificación por separado.
 */
export function useSoundEffects(enabled: boolean): SoundEffects {
  const beepPlayer = useAudioPlayer(beepSource);
  const restEndPlayer = useAudioPlayer(restEndSource);
  const completePlayer = useAudioPlayer(completeSource);

  return {
    playBeep: () => {
      if (!enabled) return;
      beepPlayer.seekTo(0);
      beepPlayer.play();
    },
    playRestEnd: () => {
      if (!enabled) return;
      restEndPlayer.seekTo(0);
      restEndPlayer.play();
    },
    playComplete: () => {
      if (!enabled) return;
      completePlayer.seekTo(0);
      completePlayer.play();
    },
  };
}
