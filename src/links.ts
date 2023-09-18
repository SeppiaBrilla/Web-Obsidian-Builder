import { lstatSync, readdirSync } from "fs";
import { join, extname, basename } from "path";

class ObsidianLink{
    public OriginalName: string;
    public Link: string;

    constructor(name: string, link: string){
        this.OriginalName = name;
        this.Link = link;
    }
}

class ObsidianlinkArray extends Array<ObsidianLink>{
    private Links: Array<ObsidianLink> = [];
    public length: number;
    constructor(links:Array<ObsidianLink>){
        super();
        this.Links = links
        this.length = links.length;
    }

    toDict(): Record<string, string>{
        let rec: Record<string,string> = {}
        for(let element of this.Links){
            rec[element.OriginalName] = element.Link;
        }
        return rec;
    }

    GetNames(): Array<string>{
        return this.Links.map(v => v.OriginalName);
    }

}

function CreateObsidianLinksFromFolder(folderName:string, baseUri:string, keepStructure:boolean = true): ObsidianlinkArray{
    let links: Array<ObsidianLink> = [];
    const callback = (filename: string) => {
        if(extname(filename) === ".md") {
            let uri = baseUri 
            if(uri[ uri.length - 1] != "/"){
                uri += "/"
            }
            if(keepStructure){
                let name = filename.replace(".md", "").replaceAll(" ", "_");
                if(name[0] === "/"){
                    name = name.substring(1);
                }
                uri += name;
            }else{
                uri += basename(filename).replace(".md","").replaceAll(" ","_");
            }
            links.push(new ObsidianLink(basename(filename).replace(".md", ""), uri));
        }
    }
    walk(folderName, callback);
    return new ObsidianlinkArray(links);
}

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

export { ObsidianLink, ObsidianlinkArray, CreateObsidianLinksFromFolder };
