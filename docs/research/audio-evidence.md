# Original audio: retained metadata, unresolved playback

2026-11-02, #236. Reuses the preserved archive audit and candidate gallery;
[21 metadata rows](audio-evidence/audio-records.csv) and
[hashes and limitations](audio-evidence/audio-evidence.json) contain no audio
payload. Run `python scripts/audio-evidence.py --legacy LEGACY --output OUTPUT`
with the existing parent tree. Two runs must produce identical reports.

Confirmed: section3 has21 records,17 unique payload hashes, all tag16.
Record9 equals1;16/18/19 equal0. Existing offsets, byte lengths and24-byte
prefixes are reused rather than re-extracted. Prefixes are sample-like bytes,
not an independently identified container header. No rate, channel count,
codec, loop point or original duration is established by those prefixes.
Every playback field in the ledger therefore remains `unverified`.

The existing viewer interprets bytes as unsigned PCM8 mono and offers8000,
11025,16000,22050 and44100Hz. Those are manually chosen candidates, not source
metadata. Waveform and mean/RMS statistics are properties of that
interpretation; plausibility does not independently prove a decoder. Tag16
must not be relabelled16-bit PCM. FMOD3.6 presence alone does not identify a
sample's source encoding or playback arguments. A size/rate quotient is a
hypothetical duration, not a measured original duration. No new rate guessing
or listening experiment was performed in this pass; no failed decoder is
being represented as a confirmed result.

Missing evidence is specific: an identified archive loader and mapping from
record index to the audio API, with encoding flags, channel count and rate;
or a legitimate same-version runtime capture of sample metadata and playback
calls. The retained loaded-image import descriptors lack the original-thunk
name table, and this pass has no independently resolved sample-loading call
chain. Archive release identity is also unverified, so a1.1.6 program import
cannot silently prove metadata for this archive. A future bounded static trace
must establish the record-to-call link before adopting any constants.

The legitimate original trial expired2026-10-14. A valid licensed environment
is required for any new original runtime observation; no expired launch or
license bypass was used. Preserve source hashes, version and call arguments,
then independently compare a decoded sample with that reference. Until those
gates are met, the investigation result is an explicit unresolved metadata
record, as allowed by #236. Product music implementation/listening acceptance
belongs to #113. Original audio redistribution is not authorized by this audit.
