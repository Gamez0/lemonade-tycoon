2026-10-20: User likes the coherent whole-map direction but correctly flags
inconsistent road/sidewalk width and disconnected pavement/crosswalk geometry.

New original image-generation edit `environment-v3-streets.png` and exact prompt
are retained beside v2. V3 has a substantially clearer T junction, continuous
turning sidewalk corners and one six-bar zebra crossing between branch sidewalks.
Buildings/palette are retained in direction. Chromium comparison at300/600px
regenerated successfully. This is still a study: no numeric width guarantee,
walk/service anchor verification or runtime replacement is claimed. Foreground
house occludes part of the far corner. #229 stays Running and #97 stays open.

Next: validate the updated footprint and customer route together before adopting
it as the product background. Existing assets and unrelated work are preserved.
