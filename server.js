/**
 * Spotify Clone Custom Local Server & API Proxy
 * Serves static web assets and proxies YouTube music search queries to Invidious instances.
 * Implements fallback queries and bypasses browser origin CORS restrictions.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const urlParser = require('url');

const PORT = 8080;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
  const parsedUrl = urlParser.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. YouTube Search Proxy Endpoint
  if (pathname === '/api/search') {
    const query = parsedUrl.query.q;
    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ error: 'Missing query parameter q' }));
    }

    // List of active public Invidious instances for failover
    const instances = [
      "https://yewtu.be",
      "https://vid.puffyan.us",
      "https://invidious.nerdvpn.de",
      "https://invidious.flokinet.to",
      "https://inv.vern.cc",
      "https://invidious.projectsegfau.lt"
    ];

    let instanceIndex = 0;
    
    function tryInstance(index) {
      if (index >= instances.length) {
        console.error(`[Proxy] Search failed: All Invidious instances failed for query "${query}"`);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ error: 'All search instances failed' }));
        }
        return;
      }

      let attemptDone = false;
      const next = () => {
        if (!attemptDone) {
          attemptDone = true;
          tryInstance(index + 1);
        }
      };

      const base = instances[index];
      const targetUrl = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      
      console.log(`[Proxy] Querying instance [${index}/${instances.length}]: ${base} for "${query}"`);

      const request = https.get(targetUrl, { timeout: 4000 }, (apiRes) => {
        if (apiRes.statusCode !== 200) {
          console.warn(`[Proxy] Instance ${base} returned status code: ${apiRes.statusCode}`);
          return next();
        }

        let body = '';
        apiRes.on('data', chunk => body += chunk);
        apiRes.on('end', () => {
          if (attemptDone) return;
          try {
            const data = JSON.parse(body);
            if (!Array.isArray(data)) {
              console.warn(`[Proxy] Instance ${base} response is not an array`);
              return next();
            }

            // Transform raw YouTube metadata into Spotify Clone track objects
            const transformed = data.slice(0, 15).map(item => ({
              id: `yt-${item.videoId}`,
              title: item.title,
              artist: item.author,
              album: "YouTube Stream",
              duration: item.lengthSeconds,
              url: `${base}/latest_version?id=${item.videoId}&itag=140`,
              color: "#1e1e24", // neutral dark color
              cover: item.videoThumbnails && item.videoThumbnails.length > 0 
                     ? item.videoThumbnails.find(t => t.quality === "medium" || t.quality === "default")?.url || item.videoThumbnails[0].url
                     : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop",
              lyrics: [
                { time: 0, text: "🎵 YouTube Stream Active 🎵" },
                { time: 5, text: `Video Title: ${item.title}` },
                { time: 10, text: "Synced lyrics are not available for YouTube streams." }
              ],
              artistBio: {
                bio: `${item.author} is a creator on YouTube. Streaming audio track directly.`,
                followers: "N/A",
                listeners: "N/A",
                image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=350&auto=format&fit=crop"
              }
            }));

            console.log(`[Proxy] Search succeeded using: ${base}. Found ${transformed.length} tracks.`);
            if (!attemptDone) {
              attemptDone = true;
              if (!res.headersSent) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify(transformed));
              }
            }
          } catch (e) {
            console.error(`[Proxy] JSON parsing failed for ${base}:`, e.message);
            next();
          }
        });
      });

      request.on('error', (err) => {
        console.warn(`[Proxy] Instance ${base} connection error:`, err.message);
        next();
      });

      request.on('timeout', () => {
        console.warn(`[Proxy] Instance ${base} timed out`);
        request.destroy(); // this will likely emit an error event, but attemptDone prevents duplicate next() calls
        next();
      });
    }

    return tryInstance(instanceIndex);
  }

  // 2. Serve Static Frontend Files
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Guard against directory traversal attacks
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      return res.end('File Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[Spotify Local Server] Running at http://localhost:${PORT}/`);
});
