# Preview clips: where each one was cut from

House format: 1280x720, 30 fps, silent, H.264 (`-crf 22`, `-preset slow`,
`+faststart`). 21:9 captures are scaled to 720 tall and centre-cropped to
1280 wide, never letterboxed or stretched.

## scraps.mp4 (53 s, rebuilt 2026-09-04)

Two sources, both 1280x536 at 720p:

- A = https://youtu.be/d73XO2deG84 (facility demo)
- B = https://www.youtube.com/watch?v=oA_1XPhMadQ (water demo)

| Clip        | Source | Source time   | Notes |
|-------------|--------|---------------|-------|
| 0:00 - 0:18 | A      | 0:45 - 1:03   | The cut seen at 0:02 is an edit inside the demo video. |
| 0:18 - 0:23 | B      | 0:12 - 0:17   | Water 1 |
| 0:23 - 0:26 | A      | 1:06 - 1:09   | |
| 0:26 - 0:31 | B      | 0:22 - 0:27   | Water 2 |
| 0:31 - 0:44 | A      | 1:26 - 1:39   | |
| 0:44 - 0:48 | B      | 1:04 - 1:08   | Water 3 |
| 0:48 - 0:53 | A      | 1:46 - 1:51   | Flashlight flicker in the dark |

### Previous cut (2026-08-11 to 2026-09-04), for reference

Recovered by frame-matching, since the commit that added it did not record
the timestamps: A 0:42-1:16, then A 1:26-1:39, then A 1:46-1:51.

## Recipe

```
yt-dlp -f "bv*[height<=720][ext=mp4]/bv*[height<=720]" -o A.mp4 <url>
ffmpeg -i A.mp4 -i B.mp4 -filter_complex \
  "[0:v]trim=45:63,setpts=PTS-STARTPTS[s1];[1:v]trim=12:17,setpts=PTS-STARTPTS[w1]; \
   [0:v]trim=66:69,setpts=PTS-STARTPTS[s2];[1:v]trim=22:27,setpts=PTS-STARTPTS[w2]; \
   [0:v]trim=86:99,setpts=PTS-STARTPTS[s3];[1:v]trim=64:68,setpts=PTS-STARTPTS[w3]; \
   [0:v]trim=106:111,setpts=PTS-STARTPTS[s4]; \
   [s1][w1][s2][w2][s3][w3][s4]concat=n=7:v=1:a=0,scale=-2:720,crop=1280:720[v]" \
  -map "[v]" -r 30 -pix_fmt yuv420p -an -c:v libx264 -preset slow -crf 22 \
  -movflags +faststart scraps.mp4
```
