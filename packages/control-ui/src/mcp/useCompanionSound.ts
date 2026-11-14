import { useLayoutEffect, useRef, useState } from 'react';
import cue from './boxenfunk-sanft.wav?inline';

function openPlayer() {
  let context: AudioContext | undefined;
  try {
    const audio = context = new AudioContext();
    void audio.resume().catch(() => {});
    const bytes = Uint8Array.from(atob(cue.slice(cue.indexOf(',') + 1)), char => char.charCodeAt(0));
    const decoded = audio.decodeAudioData(bytes.buffer).catch(() => null);
    return {
      async play(isCurrent: () => boolean) {
        const buffer = await decoded;
        if (!buffer || audio.state !== 'running' || !isCurrent()) return;
        const source = audio.createBufferSource();
        source.buffer = buffer;
        source.connect(audio.destination);
        source.onended = () => source.disconnect();
        source.start();
      },
      close() { void audio.close().catch(() => {}); },
    };
  } catch {
    if (context) void context.close().catch(() => {});
    return null;
  }
}

export function useCompanionSound(scope: string | null, decision: string | null) {
  const [sound, setSound] = useState(false);
  const enabled = useRef(false);
  const player = useRef<ReturnType<typeof openPlayer>>(null);
  const observed = useRef(new Map<string, Set<string>>());
  const current = useRef<symbol | null>(null);
  const silentSelection = useRef(false);

  const remember = () => {
    if (!scope || document.hidden) return false;
    const seen = observed.current.get(scope);
    if (!seen) {
      observed.current.set(scope, new Set(decision ? [decision] : []));
      return false;
    }
    if (!decision || seen.has(decision)) return false;
    seen.add(decision);
    return true;
  };

  useLayoutEffect(() => {
    const occurrence = Symbol();
    current.current = occurrence;
    const newDecision = remember();
    const silent = silentSelection.current;
    if (scope && !document.hidden) silentSelection.current = false;
    if (newDecision && enabled.current && !silent) {
      void player.current?.play(() => current.current === occurrence && enabled.current && !document.hidden).catch(() => {});
    }
    const onVisibility = () => {
      if (document.hidden) current.current = null;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      current.current = null;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [scope, decision]);

  useLayoutEffect(() => () => { player.current?.close(); }, []);

  const onToggleSound = () => {
    current.current = null;
    enabled.current = !enabled.current;
    setSound(enabled.current);
    if (enabled.current) {
      remember();
      player.current = openPlayer();
    } else {
      player.current?.close();
      player.current = null;
    }
  };

  const silenceNextSelection = () => {
    current.current = null;
    silentSelection.current = true;
  };

  return { sound, onToggleSound, silenceNextSelection };
}
