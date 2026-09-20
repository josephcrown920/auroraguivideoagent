# Creator reference uploads

Aurora's creator flow accepts local image, video, and audio references without asking users to paste URLs.

## Storage

The web app uses Vercel Blob client uploads so large reference videos do not pass through the serverless function. Vercel's client-upload flow is designed for files larger than the 4.5 MB server request limit.

Create/connect a public Vercel Blob store to the deployed project. Vercel supplies the Blob authentication environment automatically. Public access is intentional here because Seedance requires a publicly reachable HTTPS reference URL while the generation task is running.

The browser uploads directly to Blob and receives the URL. Aurora then sends that URL to the existing Seedance reference routing layer.

## Supported creator media

- Images: JPEG, PNG, WebP, GIF, HEIC/HEIF
- Video: MP4, MOV
- Audio: MP3, WAV
- Maximum reference file size: 200 MB

The UI does not expose Blob, LAS, asset IDs, provider model IDs, or raw API payloads.

## Backend behavior

/api/reference-upload generates the secure client-upload token. The upload is then handled directly by Vercel Blob. The returned URL is passed internally as video_url, image_url, or audio_url to the existing Aurora /api/ark generation route.

Real-person authorization remains handled by the existing Seedance/LAS safety routing. The creator sees only a friendly remediation message when provider authorization is genuinely required.