// Original note sequences authored for this project; MIDI pitches, 0 means rest.
export const AUDIO_SCORES: Readonly<Record<string, readonly number[]>> = {
    preparation: [60, 64, 67, 69, 67, 64, 62, 0, 64, 67, 72, 69, 67, 62, 60, 0,
        60, 62, 64, 67, 64, 62, 60, 0, 64, 69, 67, 64, 62, 60, 60, 0,
        67, 69, 72, 74, 72, 69, 67, 0, 69, 72, 76, 74, 72, 69, 67, 0,
        64, 67, 69, 72, 69, 67, 64, 0, 62, 64, 67, 64, 62, 60, 60, 0],
    selling: [67, 72, 69, 67, 64, 67, 69, 0, 72, 74, 72, 69, 67, 64, 62, 0,
        64, 67, 72, 67, 69, 72, 74, 0, 76, 74, 72, 69, 67, 64, 60, 0,
        69, 72, 76, 72, 74, 76, 79, 0, 76, 74, 72, 69, 67, 69, 72, 0,
        67, 69, 72, 74, 72, 69, 67, 0, 64, 67, 69, 67, 64, 62, 60, 0],
    results: [60, 64, 67, 72, 69, 67, 64, 60, 0, 0, 0, 0, 0, 0, 0, 0],
};
export const AUDIO_STEP_SECONDS: Readonly<Record<string, number>> = { preparation: .48, selling: .3, results: .48 };
