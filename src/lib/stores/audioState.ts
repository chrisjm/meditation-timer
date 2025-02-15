import { writable } from 'svelte/store';

interface AudioState {
    activeAudio: Set<HTMLAudioElement>;
}

function createAudioState() {
    const { subscribe, update } = writable<AudioState>({
        activeAudio: new Set()
    });

    return {
        subscribe,
        trackAudio: (audio: HTMLAudioElement | undefined, isPlaying: boolean) => 
            update(state => {
                if (!audio) return state;
                
                if (isPlaying) {
                    state.activeAudio.add(audio);
                } else {
                    state.activeAudio.delete(audio);
                }
                return state;
            }),
        reset: () => 
            update(state => {
                state.activeAudio.clear();
                return state;
            })
    };
}

export const audioState = createAudioState();
