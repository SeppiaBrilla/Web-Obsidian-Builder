import { WebObsidian } from './WebObsidian';
import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { CreateObsidianLinksFromFolder } from './links';
import { basename, extname, join } from 'path';

const s = CreateObsidianLinksFromFolder('./test_vault/test', '.', true);
let files:Array<string> = [];
const callback = (filename:string) => {
    if(extname(filename) === ".md") {
            files.push(filename);
        }
}
walk('./test_vault/test',callback);
let p = new WebObsidian(s)
let new_file = "";
for(let file of files){
    const name = basename(file).replace('.md','');
    console.log(`analyzing note ${name}`)
    new_file = p.AddAndConvert(name, readFileSync(file).toString());
    writeFileSync(`./test_vault/out/${name}.html`, new_file); 
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
