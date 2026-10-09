import { mkdir, cp, readdir, stat, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'dist');
await mkdir(output,{recursive:true});
for(const file of ['index.html','work.html','reference.css','reference.js','style.css','projects.js','experience.js','sound.js','motion.js','motion.css']) await cp(resolve(root,file),resolve(output,file));
await cp(resolve(root,'assets'),resolve(output,'assets'),{recursive:true});
const sources=await Promise.all(['index.html','work.html','style.css','reference.css','projects.js','sound.js'].map(file=>readFile(resolve(root,file),'utf8')));
const paths=new Set(['assets/sound/hover.wav','assets/sound/click.wav','assets/sound/background.mp3']);
for(const source of sources)for(const match of source.matchAll(/["'(](\/?assets\/[^"')`\s]+)["')]/g))paths.add(match[1].replace(/^\//,''));
for(const path of paths)await stat(resolve(output,path));
console.log(`Built portfolio. Verified ${paths.size} local asset references.`);

