# Landing page photographs

Drop the two client-supplied images here with **exactly these filenames**:

| File | Where it appears | Suggested crop |
|---|---|---|
| `students-group.jpg` | Under the two-column section after the hero | wide, around 16:7 |
| `student-studying.jpg` | Beside the final call to action, above the footer | 4:3 |

Both are rendered with `next/image` and `object-cover`, so any reasonable size
works — the aspect ratio is enforced in CSS and the browser crops to fit.

Aim for roughly 2000px on the long edge and keep each file under ~400KB; these
load on Nigerian mobile data, where every kilobyte is somebody's airtime.

Until the files exist the sections still lay out correctly — the image area
shows as an empty tinted block rather than breaking the page.
