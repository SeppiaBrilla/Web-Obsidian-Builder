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
        for(let element of this.Links)
            rec[element.OriginalName] = element.Link;
        return rec;
    }

    GetNames(): Array<string>{
        return this.Links.map(v => v.OriginalName);
    }

}

export { ObsidianLink, ObsidianlinkArray };
