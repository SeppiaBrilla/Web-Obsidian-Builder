import { WebObsidian } from './WebObsidian';
import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { CreateObsidianLinksFromFolder } from './links';
import { basename, extname, join } from 'path';

const s = CreateObsidianLinksFromFolder('./test_vault/test', '127.0.0.1', true);
let files:Array<string> = [];
const callback = (filename:string) => {
    if(extname(filename) === ".md") {
            files.push(filename);
        }
}
walk('./test_vault/test',callback);
let p = new WebObsidian(s)
for(let file of files){
    const name = basename(file).replace('.md','');
    console.log(`analyzing note ${name}`)
    p.AddAndConvert(name, readFileSync(file).toString());

}
const graph = p.GetGraph();
console.log(graph);



function walk(currentDirPath:string, callback:Function) {
    for(let file of readdirSync(currentDirPath)){
        const filePath = join(currentDirPath, file);
        const stat = lstatSync(filePath);
        if (stat.isFile()) {
            callback(filePath);
        } else if (stat.isDirectory()) {
            walk(filePath, callback);
        }
    }
}
