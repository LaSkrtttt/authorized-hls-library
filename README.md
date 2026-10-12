# Authorized HLS Library for Shirox

This repository is a safe Shirox module for an anime catalog and media library that you operate or are explicitly licensed to distribute. It does not scrape services, extract player URLs, reuse account cookies, circumvent DRM, or bypass geographic or subscription access controls.

## Why this approach

Crunchyroll is the strongest current mainstream option for licensed dubbed and subtitled anime. Its official help confirms that available audio and subtitle languages are title- and region-dependent, and that 1080p is available on supported devices. However, Crunchyroll playback is controlled by its official apps and website; it does not publish a consumer API that permits third-party Shirox clients to retrieve its protected playback streams. A Shirox connector to it would require written provider authorization and a supported partner API.

The same constraint generally applies to HIDIVE, Netflix, Hulu, Tubi, and other licensed consumer services. Do not build a module that discovers their private endpoints, copies session credentials, or extracts DRM-protected media URLs.

## Files

- `authorized-hls-library.json` is the Shirox import manifest.
- `authorized-hls-library.js` is the complete module script.
- `icon.png` is optional; add a square icon you own before publishing, or remove `iconUrl` from the manifest.

## Authorized catalog API

Host an HTTPS API that you control and that returns only media you are authorized to distribute. Replace `https://YOUR-AUTHORIZED-CATALOG.example` in both files with its root URL.

`GET /v1/search?q=naruto`

```json
{
  "results": [{"id":"title-123","title":"Example Anime","image":"https://cdn.example/poster.jpg"}]
}
```

`GET /v1/titles/title-123`

```json
{"description":"Licensed catalog entry.","aliases":["Example"],"airdate":"2026"}
```

`GET /v1/titles/title-123/episodes`

```json
{"episodes":[{"id":"episode-001","number":1}]}
```

`GET /v1/episodes/episode-001/playback`

```json
{
  "streams":[{"title":"1080p • English dub","streamUrl":"https://cdn.example/episode-001/master.m3u8","headers":{}}],
  "subtitles":"https://cdn.example/episode-001/en.vtt"
}
```

Only return direct HTTPS HLS or video URLs that your license and delivery platform allow this app to play. Use short-lived signed URLs if appropriate, but do not expose another provider's protected stream URLs.

## Publish on GitHub

1. Create a new public repository named `authorized-hls-library`.
2. Upload `authorized-hls-library.json` and `authorized-hls-library.js` to the repository root. Optionally upload your own `icon.png`.
3. Replace `YOUR-GITHUB-USERNAME`, `YOUR-NAME`, and `https://YOUR-AUTHORIZED-CATALOG.example` in the manifest and script. Keep the manifest `scriptUrl` aligned with the repository and branch you publish.
4. Commit the files to `main`.
5. In Shirox, open **Settings → Modules** and paste:

   `https://raw.githubusercontent.com/YOUR-GITHUB-USERNAME/authorized-hls-library/main/authorized-hls-library.json`

6. Search for a title and test one stream for every audio/subtitle combination you advertise.

## Validation

The script is compatible with Shirox's JavaScript runtime: all module entry points are global async functions and return JSON strings. Test the API with real authorized media before publishing. Shirox cannot guarantee 1080p, dubs, subtitles, or availability when the catalog does not return them.

## Sources consulted

- Shirox README: modules are JSON manifests pointing to JavaScript providers.
- Crunchyroll Help: audio and subtitle availability varies by title and region; supported devices can select 1080p.
- YouTube Developer Policies: clients must not retrieve audiovisual content outside authorized access methods or enable offline copying.
