# Placeholder Videos

This directory should contain placeholder video files for the video generator.

## Required File

- `placeholder.mp4` - A default placeholder video file

## To Create a Placeholder Video

You can create a simple placeholder video using FFmpeg:

```bash
# Create a 10-second blue gradient video
ffmpeg -f lavfi -i color=c=blue:s=1280x720:d=10 -c:v libx264 -pix_fmt yuv420p placeholder.mp4

# Or create a gradient animation
ffmpeg -f lavfi -i "color=c=0x4285f4:s=1280x720[bg];[bg]drawtext=text='Placeholder Video':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -t 10 -c:v libx264 -pix_fmt yuv420p placeholder.mp4
```

## Alternative Sources

You can also download free stock videos from:
- [Pixabay Videos](https://pixabay.com/videos/)
- [Pexels Videos](https://www.pexels.com/videos/)
- [Videvo](https://www.videvo.net/)

## Current Behavior

When placeholder videos are not available, the system will automatically fall back to generating static images with gradients and text overlays.