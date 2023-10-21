# Web Obsidian Builder

This is a simple node module written in typescript that helps you to transform your [Obsidian](https://obsidian.md/) notes in html pages that can be seen in the browser.

## Dependencies

This library uses [katex](https://katex.org/) to convert math and [marked](https://marked.js.org/) to convert markdown

## Install

To install this package you can simply type:
'''
npm i web-obsidian-builder
'''

## Usage

To use this library create a WebObsidianBuilder instance and pass to the constructor two ObsidianLinkArray(s) the first with the links you want to be added to the graph, the second with the elements you don't want into the graph. 
Then use the method AddAndConvert to convert a note from markdown to html and add it to the grap. 
You can also use the method Convert to convert the note without adding it to the graph. 
The method GetGraph gives you back a representation of the graph of notes.
The method GetCss gives you back a string containing the css to add to your page (if needed. The method will return empty string otherwise).

### ObsidianLinkArray
The ObsidianLinkArray class is a class that extends an array of ObsidianLinks with some extra methods needed in the library. An ObsidianLink is a class with two elements: the "OriginalName" element contains the name of the link that will be found in the obsidian notes, while the "link" element will contain the link that will be host the corresponding note in the website. E.g. if I have a note called "myNote" that will be hosted at "https://myWebsite.com/myNote", the ObisidianLink class will be declared as: 
```typescript
new OBsidianLink("myNote", "https://myWebsite.com/myNote");
```


## Supported elements

As now, the library supports: normal obsidian note links, display math elements, inline math elements, mermaid elements*, images.

\* To support mermaid elements you need to add the [mermaid cdn](https://cdnjs.com/libraries/mermaid) to your html. 

## Known issues

As for now, the library does not support escaping within the supported elemets and can throw error if it encounter one.
