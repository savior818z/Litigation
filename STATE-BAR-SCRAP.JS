//  https://www.calbar.ca.gov/legal-professionals/rules/rules-state-bar/title-5-discipline


(() => {

const metadata = {
    title: document.title,
    url: location.href,
    scraped: new Date().toISOString(),
    version: 4,
    source: "Developer Console",
    generator: "Legal Knowledge Graph Extractor"
};

const result = {
    metadata,
    document: {},
    nodes: [],
    edges: [],
    search: {
        autocomplete: [],
        keywords: [],
        citations: []
    }
};

let currentDivision = null;
let currentChapter = null;
let currentArticle = null;
let currentRule = null;

const slug = s =>
    s.toLowerCase()
     .replace(/[^\w]+/g,"-")
     .replace(/^-|-$/g,"");

function addNode(node){

    node.uuid ??= crypto.randomUUID();

    result.nodes.push(node);

    return node;
}

function edge(parent,child,type="contains"){

    result.edges.push({
        from: parent,
        to: child,
        type
    });

}

function extractCitations(text){

    const matches = [];

    const regex = /((Business|Government|Civil|Evidence|Probate|Penal|Vehicle|Code of Civil Procedure).*?§+\s*[\d\.]+)/gi;

    let m;

    while((m=regex.exec(text))!==null){

        matches.push(m[1]);

    }

    return matches;

}

function keywords(text){

    return [...new Set(

        text.toLowerCase()

        .replace(/[^\w\s]/g," ")

        .split(/\s+/)

        .filter(x=>x.length>3)

    )];

}

const content=document.querySelector(".node__content");

if(!content){

    console.log("No content.");

    return;

}

content.querySelectorAll("h2,h3,h4,p,li").forEach(el=>{

    const text=el.innerText.trim();

    if(!text) return;

    if(el.matches("h2")){

        currentDivision=addNode({

            id:slug(text),

            type:"division",

            title:text,

            text,

            children:[]

        });

        return;

    }

    if(el.matches("h3")){

        currentChapter=addNode({

            id:slug(text),

            type:"chapter",

            title:text,

            text,

            parent:currentDivision?.id,

            children:[]

        });

        if(currentDivision)
            edge(currentDivision.id,currentChapter.id);

        return;

    }

    if(/^Rule\s+\d+(\.\d+)+/.test(text)){

        const rule=text.match(/Rule\s+([\d\.]+)/)[1];

        currentRule=addNode({

            id:"rule-"+rule,

            type:"rule",

            ruleNumber:rule,

            title:text,

            parent:currentChapter?.id,

            children:[],

            citations:[],

            entities:[],

            keywords:[],

            vectorText:""

        });

        if(currentChapter)
            edge(currentChapter.id,currentRule.id);

        return;

    }

    const id=crypto.randomUUID();

    const cites=extractCitations(text);

    const node=addNode({

        id,

        type:el.tagName.toLowerCase()=="li"
            ?"listItem"
            :"paragraph",

        parent:currentRule?.id,

        text,

        html:el.innerHTML,

        keywords:keywords(text),

        citations:cites,

        entities:[],

        embedding:null,

        vectorText:text

    });

    if(currentRule)
        edge(currentRule.id,id);

    cites.forEach(c=>{

        result.search.citations.push(c);

    });

    result.search.keywords.push(...keywords(text));

});

result.search.keywords=[...new Set(result.search.keywords)].sort();

result.search.citations=[...new Set(result.search.citations)];

result.search.autocomplete=result.search.keywords;

result.document={
    divisions:result.nodes.filter(n=>n.type=="division").length,
    chapters:result.nodes.filter(n=>n.type=="chapter").length,
    rules:result.nodes.filter(n=>n.type=="rule").length,
    paragraphs:result.nodes.filter(n=>n.type=="paragraph").length,
    listItems:result.nodes.filter(n=>n.type=="listItem").length
};

console.log(result);

const blob=new Blob(
    [JSON.stringify(result,null,2)],
    {type:"application/json"}
);

const a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download=document.title.replace(/[^\w]/g,"_")+"_graph.json";
a.click();

})();
