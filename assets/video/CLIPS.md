# Preview clips: where each one was cut from

House format: 1280x720, 30 fps, silent, H.264 (`-crf 22`, `-preset slow`,
`+faststart`). 21:9 captures are scaled to 720 tall and centre-cropped to
1280 wide, never letterboxed or stretched.

## scraps.mp4 (39 s, recut 2026-09-04)

Source: https://youtu.be/d73XO2deG84 (1280x536 at 720p, full-screen capture).

| Clip        | Source (YouTube time) | Notes |
|-------------|-----------------------|-------|
| 0:00 - 0:18 | 0:45 - 1:03           | The cut seen at 0:02 is an edit inside the demo video. |
| 0:18 - 0:21 | 1:06 - 1:09           | |
| 0:21 - 0:34 | 1:26 - 1:39           | |
| 0:34 - 0:39 | 1:46 - 1:51           | Flashlight flicker in the dark |

Previous cut (2026-08-11 to 2026-09-04) was 0:42-1:16, 1:26-1:39, 1:46-1:51;
those timestamps were recovered by frame-matching because the commit that
added the clip did not record them.

## amphib.mp4 (14 s)

Source: https://www.youtube.com/watch?v=oA_1XPhMadQ, taken at 3440x1440.
That upload is a windowed capture: a 31 px title bar at the top and a 48 px
taskbar at the bottom are cropped off (`crop=3440:1360:0:31`) before the
usual scale and centre crop.

| Clip        | Source      |
|-------------|-------------|
| 0:00 - 0:05 | 0:12 - 0:17 |
| 0:05 - 0:10 | 0:22 - 0:27 |
| 0:10 - 0:14 | 1:04 - 1:08 |

Stills `amphib-sc-2.jpg` and `amphib-sc-3.jpg` are frames from the same
upload at 0:14.5 and 1:06 with the same crop, scaled to 1920 wide.
`amphib-sc-1.jpg` is a desktop screenshot; `amphib-thumb.jpg` is its centre
16:9.

## crosstographer.mp4 (16 s, cut 2026-09-28)

Source: https://www.youtube.com/watch?v=WNp3QRpj02s (1920x1080, 60 fps, already
16:9: scaled to 720, nothing cropped). Sixteen seconds at most (Nik); a first
cut of 33 s with the terminal and the door in it was too long.

| Clip          | Source (YouTube time) | Notes |
|---------------|-----------------------|-------|
| 0:00 - 0:03.5 | 2:37 - 2:40.5         | Movement: walking the corridor, the map pad filling in |
| 0:03.5 - 0:07 | 0:41 - 0:44.5         | Dialogue: Sorrel and Ida, both portraits |
| 0:07 - 0:12   | 4:18 - 4:23           | Crossword entry in the words pad |
| 0:12 - 0:15.8 | 2:12.4 - 2:16.2       | The gate: the prompt, then it rises |

Stills are Nik's own screenshots of the itch build (2026-09-28, about 2555x1439),
centre-cropped to 16:9 and scaled to 1920x1080. Slide 1 (the title painting) is
JPEG, slides 2 to 5 PNG; the thumb is slide 1 at 1280x720.

## Recipe

```
yt-dlp -f "bv*[height<=1440][ext=mp4]/bv*[height<=1440]" -o src.mp4 <url>
ffmpeg -i src.mp4 -filter_complex \
  "[0:v]trim=A1:B1,setpts=PTS-STARTPTS[a];[0:v]trim=A2:B2,setpts=PTS-STARTPTS[b]; \
   [a][b]concat=n=2:v=1:a=0,scale=-2:720:flags=lanczos,crop=1280:720" \
  -r 30 -pix_fmt yuv420p -an -c:v libx264 -preset slow -crf 22 -movflags +faststart out.mp4
```

Put any window-chrome crop at the start of each trim branch, not on a shared
label: one filter output cannot feed several trims without `split`.
