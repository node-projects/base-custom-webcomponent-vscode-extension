
export class TagContext {
    static ALLOWED_TAGS = new Set<string>([ // in lit plugin suchen, da wird eine funktion verwendet die alle html tags zurück gibt
".checked","html","head","body","title","meta","link","style","script",
"h1","h2","h3","h4","h5","h6","p","br","hr","span","div","pre","blockquote","address",
"strong","em","b","i","u","small","mark","sub","sup","code","kbd","samp","var","del","ins",
"a","img","audio","video","source","track","picture","figure","figcaption",
"ul","ol","li","dl","dt","dd",
"table","caption","thead","tbody","tfoot","tr","th","td","col","colgroup",
"form","input","textarea","button","select","option","optgroup","label","fieldset","legend","datalist","output","progress","meter",
"header","nav","main","section","article","aside","footer","details","summary","dialog","template","slot",
"iframe","embed","object","param","canvas","svg","math",
"id","class","style","title","lang","dir","hidden","tabindex","accesskey","contenteditable","draggable","spellcheck","translate",
"onclick","ondblclick","onmousedown","onmouseup","onmousemove","onmouseover","onmouseout",
"onkeydown","onkeyup","onkeypress","onload","onunload","onchange","onsubmit","onreset",
"onfocus","onblur","oninput",
"type","name","value","placeholder","required","readonly","disabled","checked","selected",
"multiple","maxlength","minlength","min","max","step","pattern","autocomplete","autofocus",
"form","action","method","enctype","novalidate",
"text","password","email","number","date","datetime-local","time","month","week","url","tel",
"search","checkbox","radio","range","color","file","submit","reset","button","image",
"src","alt","width","height","controls","autoplay","loop","muted","poster","preload","playsinline",
"href","target","rel","download","hreflang","referrerpolicy","integrity","crossorigin",
"role","aria-label","aria-labelledby","aria-hidden","aria-expanded","aria-checked",
"aria-disabled","aria-live","aria-controls","aria-describedby",
"data-*"
  ]);

   isAllowed(tag: string): boolean {
    return TagContext.ALLOWED_TAGS.has(tag.toLowerCase());
  }

  getAll(): string[] {
    return Array.from(TagContext.ALLOWED_TAGS);
  }
}
