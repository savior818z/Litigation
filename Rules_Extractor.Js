// https://www.calbar.ca.gov/legal-professionals/rules/rules-professional-conduct/current-rules-professional-conduct/chapter-1-lawyer-client-relationship#1.9

const rules = [];

const headings = [...document.querySelectorAll("h3")].filter(h3 => {
    const a = h3.querySelector("a[id]");
    return a && /^\d+\.\d+/.test(a.id);
});

for (const h3 of headings) {

    const anchor = h3.querySelector("a[id]");

    const rule = {
        id: anchor.id,
        title: h3.innerText.trim(),
        html: "",
        text: "",
        elements: []
    };

    let node = h3.nextElementSibling;

    while (node &&
           !(node.tagName === "H3" &&
             node.querySelector("a[id]") &&
             /^\d+\.\d+/.test(node.querySelector("a[id]").id))) {

        rule.elements.push({
            tag: node.tagName.toLowerCase(),
            text: node.innerText.trim(),
            html: node.outerHTML
        });

        rule.html += node.outerHTML + "\n";
        rule.text += node.innerText + "\n\n";

        node = node.nextElementSibling;
    }

    rules.push(rule);
}

(() => {

const db = {
    metadata: {
        title: document.querySelector("h2")?.innerText.trim() ?? "",
        url: location.href,
        scraped: new Date().toISOString()
    },

    chapters: [],
    rules: {},
    paragraphs: {},
    comments: {},
    citations: [],
    relationships: [],

    index: {
        rules: {},
        keywords: {},
        tags: {},
        citations: {},
        autocomplete: {}
    },

    vectors: []
};

const stopWords = new Set([
    "the","and","that","shall","this","with","from","into",
    "have","been","will","their","there","which","under",
    "rule","comment","paragraph","lawyer","client"
]);

function tokenize(text){

    return [...new Set(
        text.toLowerCase()
            .replace(/[^a-z0-9 ]/g," ")
            .split(/\s+/)
            .filter(w=>w.length>2)
            .filter(w=>!stopWords.has(w))
    )];

}

function addIndex(index,key,value){

    if(!key) return;

    key=key.toLowerCase();

    if(!index[key])
        index[key]=[];

    if(!index[key].includes(value))
        index[key].push(value);

}

function auto(word){

    for(let i=2;i<=Math.min(word.length,6);i++){

        const p=word.substring(0,i);

        if(!db.index.autocomplete[p])
            db.index.autocomplete[p]=[];

        if(!db.index.autocomplete[p].includes(word))
            db.index.autocomplete[p].push(word);

    }

}

const headings=[...document.querySelectorAll("h3")].filter(h=>{

    const a=h.querySelector("a[id]");
    return a && /^\d+\.\d+/.test(a.id);

});

for(const h3 of headings){

    const anchor=h3.querySelector("a[id]");

    const number=anchor.id;

    const title=h3.innerText
        .replace(/^Rule\s+\d+\.\d+\s*/,"")
        .trim();

    const ruleId="rpc-"+number;

    db.rules[ruleId]={

        id:ruleId,
        number,
        title,
        paragraphs:[],
        comments:[],
        tags:[],
        search_queries:[
            `Rule ${number}`,
            title,
            `${number} ${title}`,
            `${title} California`
        ]
    };

    db.index.rules[number]=ruleId;

    let node=h3.nextElementSibling;

    let inComment=false;
    let seq=0;
    let commentSeq=0;

    while(node){

        if(node.tagName==="H3"){

            const next=node.querySelector("a[id]");

            if(next && /^\d+\.\d+/.test(next.id))
                break;

        }

        const text=node.innerText.trim();

        if(/^comment/i.test(text)){

            inComment=true;
            node=node.nextElementSibling;
            continue;

        }

        if(text){

            const words=tokenize(text);

            words.forEach(w=>{

                addIndex(db.index.keywords,w,ruleId);
                auto(w);

                if(!db.rules[ruleId].tags.includes(w))
                    db.rules[ruleId].tags.push(w);

            });

            const cites=text.match(
                /(Rule\s+\d+\.\d+)|(Business\s+and\s+Professions\s+Code\s+section\s+\d+)/gi
            ) || [];

            cites.forEach(c=>{

                db.citations.push({
                    source:ruleId,
                    citation:c
                });

                addIndex(db.index.citations,c,ruleId);

                const m=c.match(/Rule\s+(\d+\.\d+)/i);

                if(m){

                    db.relationships.push({
                        from:ruleId,
                        to:"rpc-"+m[1],
                        relation:"references"
                    });

                }

            });

            if(inComment){

                commentSeq++;

                const id=`${ruleId}-comment-${commentSeq}`;

                db.comments[id]={
                    id,
                    rule:ruleId,
                    number:commentSeq,
                    text
                };

                db.rules[ruleId].comments.push(id);

                db.vectors.push({
                    id,
                    type:"comment",
                    text,
                    metadata:{rule:number}
                });

            }else{

                seq++;

                const label=(text.match(/^\(([a-z0-9]+)\)/)||[])[1] || seq;

                const id=`${ruleId}-${label}`;

                db.paragraphs[id]={
                    id,
                    rule:ruleId,
                    section:label,
                    sequence:seq,
                    text
                };

                db.rules[ruleId].paragraphs.push(id);

                db.vectors.push({
                    id,
                    type:"paragraph",
                    text,
                    metadata:{
                        rule:number,
                        section:label
                    }
                });

            }

        }

        node=node.nextElementSibling;

    }

}

Object.values(db.rules).forEach(r=>{

    r.tags.forEach(t=>{

        addIndex(db.index.tags,t,r.id);

    });

});

db.search = {

    rule(number){

        return db.rules[db.index.rules[number]];

    },

    keyword(word){

        return (db.index.keywords[word.toLowerCase()]||[])
            .map(id=>db.rules[id]);

    },

    tag(tag){

        return (db.index.tags[tag.toLowerCase()]||[])
            .map(id=>db.rules[id]);

    },

    citation(c){

        return (db.index.citations[c]||[])
            .map(id=>db.rules[id]);

    }

};

window.RPC = db;

console.log("RPC Database Loaded");
console.log(RPC);

copy(JSON.stringify(RPC,null,2));

})();

console.log(rules);
