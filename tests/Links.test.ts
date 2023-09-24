import { ObsidianLink, ObsidianlinkArray } from '../src/Links';

const Links: Array<ObsidianLink> = [new ObsidianLink('link1', 'link1.html'), new ObsidianLink('link2', 'link2.html'), new ObsidianLink('link3', 'link3.html')]


describe('ObsidianLinkArray', () => {
    test('ToDict', () => {
        const linkArray = new ObsidianlinkArray(Links);
        const dict = linkArray.toDict();

        for(let link of Links){
            expect(dict[link.OriginalName]).toEqual(link.Link)
        }
    });
    test('GetNames', () => {
        const linkArray = new ObsidianlinkArray(Links);
        const names = linkArray.GetNames();
        for(let link of Links){
            expect(names.includes(link.OriginalName)).toEqual(true);
        }
    });
});

