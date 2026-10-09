import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2', '.mp3':'audio/mpeg','.wav':'audio/wav','.m4a':'audio/mp4','.jpeg':'image/jpeg'};
const allowed=new Set(['index.html','work.html','reference.css','reference.js','style.css','projects.js','experience.js','sound.js','motion.js','motion.css']);
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    const relative=(url.pathname==='/work'||url.pathname==='/work/'?'work.html':decodeURIComponent(url.pathname)).replace(/^\/+/, '') || 'index.html';
    if(!allowed.has(relative) && !relative.startsWith('assets/')){res.writeHead(404);res.end('Not found');return;}
    const path=resolve(root,relative);
    if(!path.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    if(!(await stat(path)).isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
    if(req.method==='HEAD')res.end();else res.end(await readFile(path));
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('Portfolio ready at http://127.0.0.1:3000'));


