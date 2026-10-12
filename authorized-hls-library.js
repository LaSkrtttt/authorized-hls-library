var AUTHORIZED_LIBRARY_BASE_URL = "https://YOUR-AUTHORIZED-CATALOG.example";

function libraryUrl(path) {
  return AUTHORIZED_LIBRARY_BASE_URL.replace(/\/$/, "") + path;
}

function libraryId(value) {
  return encodeURIComponent(String(value || "").split("/").pop());
}

async function libraryJson(url) {
  var response = await fetchv2(url, { "Accept": "application/json" }, "GET", null);
  if (!response || typeof response.json !== "function") {
    throw new Error("Authorized catalog did not return JSON");
  }
  return await response.json();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

async function searchResults(keyword) {
  try {
    var data = await libraryJson(libraryUrl("/v1/search?q=" + encodeURIComponent(keyword || "")));
    return JSON.stringify(safeArray(data.results || data).map(function (item) {
      return {
        title: String(item.title || "Untitled"),
        image: String(item.image || ""),
        href: libraryUrl("/v1/titles/" + encodeURIComponent(item.id))
      };
    }));
  } catch (error) {
    return JSON.stringify([]);
  }
}

async function extractDetails(url) {
  try {
    var item = await libraryJson(libraryUrl("/v1/titles/" + libraryId(url)));
    return JSON.stringify([{
      description: String(item.description || ""),
      aliases: Array.isArray(item.aliases) ? item.aliases.join(", ") : String(item.aliases || ""),
      airdate: String(item.airdate || "")
    }]);
  } catch (error) {
    return JSON.stringify([{ description: "", aliases: "", airdate: "" }]);
  }
}

async function extractEpisodes(url) {
  try {
    var data = await libraryJson(libraryUrl("/v1/titles/" + libraryId(url) + "/episodes"));
    return JSON.stringify(safeArray(data.episodes || data).map(function (episode, index) {
      return {
        href: libraryUrl("/v1/episodes/" + encodeURIComponent(episode.id)),
        number: Number(episode.number || index + 1)
      };
    }));
  } catch (error) {
    return JSON.stringify([]);
  }
}

async function extractStreamUrl(url) {
  try {
    var data = await libraryJson(libraryUrl("/v1/episodes/" + libraryId(url) + "/playback"));
    var streams = safeArray(data.streams).filter(function (stream) {
      return stream && stream.streamUrl && /^https:\/\//i.test(stream.streamUrl);
    }).map(function (stream) {
      return {
        title: String(stream.title || "Authorized stream"),
        streamUrl: String(stream.streamUrl),
        headers: stream.headers && typeof stream.headers === "object" ? stream.headers : {}
      };
    });
    var result = { streams: streams };
    if (data.subtitles && /^https:\/\//i.test(data.subtitles)) {
      result.subtitles = data.subtitles;
    }
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({ streams: [] });
  }
}
