import { useState, useRef, useCallback, createContext, useContext } from "react";

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

const T = {
  dark: {
    bg:"#050505",card:"#0A0A0A",hover:"rgba(255,255,255,0.03)",input:"rgba(255,255,255,0.025)",
    text:"#fff",sub:"rgba(255,255,255,0.45)",faint:"rgba(255,255,255,0.25)",
    subtle:"rgba(255,255,255,0.38)",ghost:"rgba(255,255,255,0.15)",hero:"rgba(255,255,255,0.35)",
    bio:"rgba(255,255,255,0.6)",border:"rgba(255,255,255,0.06)",
    inputB:"rgba(255,255,255,0.08)",inputBF:"rgba(255,255,255,0.2)",avatarBg:"#111",
    panel:"#0A0A0A",panelB:"rgba(255,255,255,0.08)",overlay:"rgba(0,0,0,0.7)",
    closeB:"rgba(0,0,0,0.5)",closeBrd:"rgba(255,255,255,0.1)",closeC:"#fff",
    badge:"rgba(255,255,255,0.06)",badgeT:"rgba(255,255,255,0.3)",
    lnkBg:"rgba(255,255,255,0.02)",lnkBgH:"rgba(255,255,255,0.06)",
    lnkB:"rgba(255,255,255,0.06)",lnkBH:"rgba(255,255,255,0.15)",
    lnkT:"rgba(255,255,255,0.7)",lnkI:"rgba(255,255,255,0.4)",
    togBg:"rgba(255,255,255,0.06)",togB:"rgba(255,255,255,0.1)",togI:"rgba(255,255,255,0.5)",
    grad:"#0A0A0A",pIcon:"rgba(255,255,255,0.2)",fIcon:"rgba(255,255,255,0.12)",
    arrow:"rgba(255,255,255,0.15)",arrowH:"rgba(255,255,255,0.4)",
    chamb:"rgba(255,255,255,0.2)",hdr:"rgba(255,255,255,0.2)",
    tabA:"#fff",tabI:"rgba(255,255,255,0.25)",avB:"rgba(255,255,255,0.1)",
    ring:"#0A0A0A",statL:"rgba(255,255,255,0.3)",pulse:"#fff",
    statGrid:"rgba(255,255,255,0.04)",gridOp:0.025,
    logoBrd:"#fff",logoC:"#fff",
  },
  light: {
    bg:"#FAFAF8",card:"#FFFFFF",hover:"rgba(0,0,0,0.02)",input:"rgba(0,0,0,0.02)",
    text:"#111",sub:"rgba(0,0,0,0.5)",faint:"rgba(0,0,0,0.3)",
    subtle:"rgba(0,0,0,0.45)",ghost:"rgba(0,0,0,0.12)",hero:"rgba(0,0,0,0.3)",
    bio:"rgba(0,0,0,0.6)",border:"rgba(0,0,0,0.06)",
    inputB:"rgba(0,0,0,0.1)",inputBF:"rgba(0,0,0,0.25)",avatarBg:"#F0F0EE",
    panel:"#FFFFFF",panelB:"rgba(0,0,0,0.08)",overlay:"rgba(0,0,0,0.25)",
    closeB:"rgba(255,255,255,0.9)",closeBrd:"rgba(0,0,0,0.12)",closeC:"#333",
    badge:"rgba(0,0,0,0.04)",badgeT:"rgba(0,0,0,0.35)",
    lnkBg:"rgba(0,0,0,0.02)",lnkBgH:"rgba(0,0,0,0.05)",
    lnkB:"rgba(0,0,0,0.08)",lnkBH:"rgba(0,0,0,0.15)",
    lnkT:"rgba(0,0,0,0.65)",lnkI:"rgba(0,0,0,0.35)",
    togBg:"rgba(0,0,0,0.04)",togB:"rgba(0,0,0,0.1)",togI:"rgba(0,0,0,0.5)",
    grad:"#FFFFFF",pIcon:"rgba(0,0,0,0.15)",fIcon:"rgba(0,0,0,0.1)",
    arrow:"rgba(0,0,0,0.12)",arrowH:"rgba(0,0,0,0.4)",
    chamb:"rgba(0,0,0,0.25)",hdr:"rgba(0,0,0,0.25)",
    tabA:"#111",tabI:"rgba(0,0,0,0.3)",avB:"rgba(0,0,0,0.08)",
    ring:"#FFFFFF",statL:"rgba(0,0,0,0.35)",pulse:"#111",
    statGrid:"rgba(0,0,0,0.03)",gridOp:0.04,
    logoBrd:"#111",logoC:"#111",
  },
};

const CHAMBERS = ["All","Senate","House","Governor","Presidential"];
const PARTIES = {
  Democrat:{color:"#2563EB"},
  Republican:{color:"#DC2626"},
  Green:{color:"#16A34A"},
  Independent:{color:"#7C3AED"},
};
const pc = (party) => (PARTIES[party]||PARTIES.Independent).color;

function DonkeyIcon({size=16,color="#2563EB"}) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width={size} height={size} style={{flexShrink:0}}>
    <path opacity=".4" fill={color} d="M0 288L0 448c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-64 192 0 0 64c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-96 32 0 0 48c0 44.2 35.8 80 80 80s80-35.8 80-80l0-48c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-112-544 0z"/>
    <path fill={color} d="M160 32C71.6 32 0 103.6 0 192l0 96 544 0 0-96c0-88.4-71.6-160-160-160L160 32zM128 136a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm232 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM256 136a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
  </svg>;
}

function ElephantIcon({size=16,color="#DC2626"}) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width={size} height={size} style={{flexShrink:0}}>
    <path opacity=".4" fill={color} d="M192 320l352 0 0 160c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-64-160 0 0 64c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-160z"/>
    <path fill={color} d="M64 32c0-8.9 3.8-20.9 6.2-27.3 1-2.8 3.8-4.7 6.8-4.7 1.9 0 3.8.7 5.2 2.1L128 45.7 173.8 2.1c1.4-1.3 3.2-2.1 5.2-2.1 3 0 5.8 1.8 6.8 4.7 2.4 6.5 6.2 18.4 6.2 27.3 0 26.5-21.9 42-29.5 46.6l76.2 72.6c6 5.7 13.9 8.8 22.1 8.8l219.2 0 32 0c40.3 0 78.2 19 102.4 51.2l19.2 25.6c10.6 14.1 7.7 34.2-6.4 44.8s-34.2 7.7-44.8-6.4l-19.2-25.6c-5.3-7-11.8-12.8-19.2-17l0 87.4-352 0-40.4-94.3c-3.9-9.2-15.3-12.6-23.6-7l-42.1 28c-9.1 6.1-19.7 9.3-30.7 9.3l-2 0C23.9 256 0 232.1 0 202.7 0 190.6 4.1 178.9 11.7 169.4L87.6 74.6C78.1 67.4 64 53.2 64 32zM256 280a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm248-24a24 24 0 1 0-48 0 24 24 0 1 0 48 0zM368 280a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/>
  </svg>;
}

function GreenDiamond({size=16,color="#16A34A"}) {
  return <svg viewBox="0 0 20 20" width={size} height={size} style={{flexShrink:0}}>
    <rect x="4" y="4" width="12" height="12" rx="2" fill={color} transform="rotate(45 10 10)"/>
  </svg>;
}

function StarIcon({size=16,color="#7C3AED"}) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width={size} height={size} style={{flexShrink:0}}>
    <path fill={color} d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L348.2 329 452.5 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L290.3 150.3 316.9 18z"/>
  </svg>;
}

function PartyIcon({party,size=16}) {
  const c = pc(party);
  if (party==="Democrat") return <DonkeyIcon size={size} color={c}/>;
  if (party==="Republican") return <ElephantIcon size={size} color={c}/>;
  if (party==="Green") return <GreenDiamond size={size} color={c}/>;
  return <StarIcon size={size} color={c}/>;
}

const POLS = [
  {id:1,name:"John Fetterman",state:"PA",chamber:"Senate",party:"Democrat",title:"U.S. Senator",since:"2023",bio:"Junior United States Senator from Pennsylvania. Former Lieutenant Governor and Mayor of Braddock.",website:"https://www.fetterman.senate.gov",donate:"https://www.fetterman.senate.gov",wiki:"https://en.wikipedia.org/wiki/John_Fetterman",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Sen._John_Fetterman_official_portrait%2C_118th_Congress.jpg/440px-Sen._John_Fetterman_official_portrait%2C_118th_Congress.jpg"},
  {id:2,name:"Ted Cruz",state:"TX",chamber:"Senate",party:"Republican",title:"U.S. Senator",since:"2013",bio:"Senior United States Senator from Texas. Previously served as the 34th Solicitor General of Texas.",website:"https://www.cruz.senate.gov",donate:"https://www.tedcruz.org",wiki:"https://en.wikipedia.org/wiki/Ted_Cruz",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Ted_Cruz_official_116th_portrait.jpg/440px-Ted_Cruz_official_116th_portrait.jpg"},
  {id:3,name:"Alexandria Ocasio-Cortez",state:"NY",chamber:"House",party:"Democrat",title:"U.S. Representative",since:"2019",bio:"U.S. Representative for New York's 14th congressional district. Known for progressive policy advocacy.",website:"https://ocasio-cortez.house.gov",donate:"https://ocasiocortez.com",wiki:"https://en.wikipedia.org/wiki/Alexandria_Ocasio-Cortez",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Alexandria_Ocasio-Cortez_Official_Portrait.jpg/440px-Alexandria_Ocasio-Cortez_Official_Portrait.jpg"},
  {id:4,name:"Marjorie Taylor Greene",state:"GA",chamber:"House",party:"Republican",title:"U.S. Representative",since:"2021",bio:"U.S. Representative for Georgia's 14th congressional district.",website:"https://greene.house.gov",donate:"https://www.greene.house.gov",wiki:"https://en.wikipedia.org/wiki/Marjorie_Taylor_Greene",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Marjorie_Taylor_Greene_117th_Congress_portrait_%28cropped%29.jpg/440px-Marjorie_Taylor_Greene_117th_Congress_portrait_%28cropped%29.jpg"},
  {id:5,name:"Bernie Sanders",state:"VT",chamber:"Senate",party:"Independent",title:"U.S. Senator",since:"2007",bio:"Senior U.S. Senator from Vermont. Longest-serving independent member of Congress in American history.",website:"https://www.sanders.senate.gov",donate:"https://berniesanders.com",wiki:"https://en.wikipedia.org/wiki/Bernie_Sanders",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bernie_Sanders.jpg/440px-Bernie_Sanders.jpg"},
  {id:6,name:"Ron DeSantis",state:"FL",chamber:"Governor",party:"Republican",title:"Governor of Florida",since:"2019",bio:"46th Governor of Florida. Former member of the United States House of Representatives.",website:"https://www.flgov.com",donate:"https://www.rondesantis.com",wiki:"https://en.wikipedia.org/wiki/Ron_DeSantis",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Ron_DeSantis_at_CPAC_2023_%28cropped%29.jpg/440px-Ron_DeSantis_at_CPAC_2023_%28cropped%29.jpg"},
  {id:7,name:"Gavin Newsom",state:"CA",chamber:"Governor",party:"Democrat",title:"Governor of California",since:"2019",bio:"40th Governor of California. Former Mayor of San Francisco and Lieutenant Governor of California.",website:"https://www.gov.ca.gov",donate:"https://gavinnewsom.com",wiki:"https://en.wikipedia.org/wiki/Gavin_Newsom",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Official_Photo_of_Governor_Gavin_Newsom_%28cropped%29.jpg/440px-Official_Photo_of_Governor_Gavin_Newsom_%28cropped%29.jpg"},
  {id:8,name:"Josh Hawley",state:"MO",chamber:"Senate",party:"Republican",title:"U.S. Senator",since:"2019",bio:"Junior United States Senator from Missouri. Former Attorney General of Missouri.",website:"https://www.hawley.senate.gov",donate:"https://joshhawley.com",wiki:"https://en.wikipedia.org/wiki/Josh_Hawley",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Josh_Hawley_official_portrait_%28cropped%29.jpg/440px-Josh_Hawley_official_portrait_%28cropped%29.jpg"},
  {id:9,name:"Katie Porter",state:"CA",chamber:"House",party:"Democrat",title:"Former U.S. Representative",since:"2019",bio:"American politician and law professor who served as U.S. representative for California's 47th district.",website:"https://katieporter.com",donate:"https://katieporter.com",wiki:"https://en.wikipedia.org/wiki/Katie_Porter",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Katie_Porter_117th_Congress_portrait.jpg/440px-Katie_Porter_117th_Congress_portrait.jpg"},
  {id:10,name:"Greg Abbott",state:"TX",chamber:"Governor",party:"Republican",title:"Governor of Texas",since:"2015",bio:"48th Governor of Texas. Previously served as the 50th Attorney General of Texas.",website:"https://gov.texas.gov",donate:"https://www.gregabbott.com",wiki:"https://en.wikipedia.org/wiki/Greg_Abbott",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Greg_Abbott_official_portrait.jpg/440px-Greg_Abbott_official_portrait.jpg"},
  {id:11,name:"JD Vance",state:"OH",chamber:"Senate",party:"Republican",title:"Vice President of the United States",since:"2025",bio:"49th Vice President of the United States. Author of Hillbilly Elegy. Former U.S. Senator from Ohio.",website:"https://www.whitehouse.gov/administration/vice-president-vance",donate:null,wiki:"https://en.wikipedia.org/wiki/JD_Vance",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/J.D._Vance_official_Senate_portrait_%28cropped%29.jpg/440px-J.D._Vance_official_Senate_portrait_%28cropped%29.jpg"},
  {id:12,name:"Hakeem Jeffries",state:"NY",chamber:"House",party:"Democrat",title:"House Minority Leader",since:"2013",bio:"House Minority Leader and U.S. Representative for New York's 8th congressional district.",website:"https://jeffries.house.gov",donate:"https://hakeemjeffries.com",wiki:"https://en.wikipedia.org/wiki/Hakeem_Jeffries",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Hakeem_Jeffries_118th_Congress_portrait.jpg/440px-Hakeem_Jeffries_118th_Congress_portrait.jpg"},
  {id:13,name:"Mike Johnson",state:"LA",chamber:"House",party:"Republican",title:"Speaker of the House",since:"2017",bio:"56th Speaker of the United States House of Representatives. Represents Louisiana's 4th congressional district.",website:"https://mikejohnson.house.gov",donate:"https://mikejohnsonforcongress.com",wiki:"https://en.wikipedia.org/wiki/Mike_Johnson",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Speaker_Mike_Johnson_Official_Portrait_%28cropped%29.jpg/440px-Speaker_Mike_Johnson_Official_Portrait_%28cropped%29.jpg"},
  {id:14,name:"Chuck Schumer",state:"NY",chamber:"Senate",party:"Democrat",title:"Senate Minority Leader",since:"1999",bio:"Senate Minority Leader. Senior United States Senator from New York.",website:"https://www.schumer.senate.gov",donate:"https://www.chuckschumer.com",wiki:"https://en.wikipedia.org/wiki/Chuck_Schumer",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sen._Chuck_Schumer_official_portrait%2C_118th_Congress.jpg/440px-Sen._Chuck_Schumer_official_portrait%2C_118th_Congress.jpg"},
  {id:15,name:"John Thune",state:"SD",chamber:"Senate",party:"Republican",title:"Senate Majority Leader",since:"2005",bio:"Senate Majority Leader and senior United States Senator from South Dakota.",website:"https://www.thune.senate.gov",donate:"https://www.johnthune.com",wiki:"https://en.wikipedia.org/wiki/John_Thune",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/John_Thune_official_photo_%28cropped%29.jpg/440px-John_Thune_official_photo_%28cropped%29.jpg"},
  {id:16,name:"Gretchen Whitmer",state:"MI",chamber:"Governor",party:"Democrat",title:"Governor of Michigan",since:"2019",bio:"49th Governor of Michigan. Previously served in the Michigan Senate and House of Representatives.",website:"https://www.michigan.gov/whitmer",donate:"https://gretchenwhitmer.com",wiki:"https://en.wikipedia.org/wiki/Gretchen_Whitmer",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Gretchen_Whitmer_%28cropped%29.jpg/440px-Gretchen_Whitmer_%28cropped%29.jpg"},
];

function useSearch() {
  const [query,setQuery]=useState("");
  const [results,setResults]=useState([]);
  const [loading,setLoading]=useState(false);
  const abortRef=useRef(null);
  const search=useCallback(async(q)=>{
    if(!q.trim()){setResults([]);return;}
    if(abortRef.current)abortRef.current.abort();
    const ctrl=new AbortController();abortRef.current=ctrl;
    setLoading(true);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},signal:ctrl.signal,
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Search the web for the politician "${q}". Return ONLY a JSON object (no markdown, no backticks) with: {"name":"Full Name","state":"XX","chamber":"Senate|House|Governor|Presidential","party":"Democrat|Republican|Green|Independent","title":"Title","since":"Year","bio":"2 sentences","website":"URL","donate":"URL or null","wiki":"URL","image":"portrait URL"}. If not found return {"error":"not found"}.`}],
        }),
      });
      const d=await r.json();
      const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("");
      const clean=txt.replace(/```json|```/g,"").trim();
      try{const p=JSON.parse(clean);if(!p.error)setResults([{...p,id:Date.now()}]);else setResults([]);}catch{setResults([]);}
    }catch(e){if(e.name!=="AbortError")setResults([]);}
    setLoading(false);
  },[]);
  return{query,setQuery,results,loading,search};
}

function PartyPill({party,size="sm"}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:size==="lg"?8:6,
    fontSize:size==="lg"?13:11,letterSpacing:"0.08em",textTransform:"uppercase",
    fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:pc(party)}}>
    <PartyIcon party={party} size={size==="lg"?20:14}/>{party}
  </span>;
}

function Card({pol,onClick}){
  const[h,setH]=useState(false);
  const[imgE,setImgE]=useState(false);
  const{mode}=useTheme();const t=T[mode];const c=pc(pol.party);
  return <div onClick={()=>onClick(pol)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{cursor:"pointer",background:h?t.hover:"transparent",borderBottom:`1px solid ${t.border}`,
      padding:"18px 12px",transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",
      display:"grid",gridTemplateColumns:"56px 1fr auto",gap:16,alignItems:"center"}}>
    <div style={{position:"relative"}}>
      <div style={{width:56,height:56,borderRadius:"50%",overflow:"hidden",
        border:`2px solid ${h?c:t.avB}`,background:t.avatarBg,transition:"border-color 0.3s"}}>
        {!imgE&&pol.image?<img src={pol.image} alt={pol.name} onError={()=>setImgE(true)}
          style={{width:"100%",height:"100%",objectFit:"cover",filter:h?"none":"grayscale(40%)",transition:"filter 0.3s"}}/>
        :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'Instrument Serif',Georgia,serif",fontSize:22,color:t.text,opacity:0.4}}>{pol.name?.charAt(0)}</div>}
      </div>
      <div style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",
        background:t.ring,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${t.ring}`}}>
        <PartyIcon party={pol.party} size={12}/>
      </div>
    </div>
    <div style={{minWidth:0}}>
      <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:19,
        color:h?c:t.text,lineHeight:1.2,marginBottom:3,transition:"color 0.2s"}}>{pol.name}</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:t.sub,
        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pol.title} · {pol.state}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:11,color:t.chamb,fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.05em"}}>{pol.chamber}</span>
      <span style={{color:h?t.arrowH:t.arrow,fontSize:18,transition:"transform 0.2s,color 0.2s",
        ...(h?{transform:"translateX(3px)"}:{})}}>→</span>
    </div>
  </div>;
}

function LinkBtn({href,label,icon,accent}){
  const[h,setH]=useState(false);const{mode}=useTheme();const t=T[mode];
  return <a href={href} target="_blank" rel="noopener noreferrer"
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",
      background:h?t.lnkBgH:t.lnkBg,
      border:`1px solid ${accent?accent+(h?"66":"33"):(h?t.lnkBH:t.lnkB)}`,
      borderRadius:6,textDecoration:"none",transition:"all 0.2s"}}>
    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:accent||t.lnkT,fontWeight:500}}>{label}</span>
    <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:16,color:accent||t.lnkI}}>{icon}</span>
  </a>;
}

function Detail({pol,onClose}){
  const[imgE,setImgE]=useState(false);
  const{mode}=useTheme();const t=T[mode];const c=pc(pol.party);
  return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"flex-end"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:t.overlay,backdropFilter:"blur(4px)"}}/>
    <div style={{position:"relative",width:"100%",maxWidth:540,background:t.panel,
      borderLeft:`1px solid ${t.panelB}`,overflowY:"auto",
      animation:"slideIn 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
      <button onClick={onClose} style={{position:"absolute",top:20,right:20,zIndex:2,
        background:t.closeB,border:`1px solid ${t.closeBrd}`,color:t.closeC,
        width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:16,
        display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>✕</button>
      <div style={{position:"relative",height:340,overflow:"hidden"}}>
        {!imgE&&pol.image?<img src={pol.image} alt={pol.name} onError={()=>setImgE(true)}
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top",filter:"grayscale(20%)"}}/>
        :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
          background:t.avatarBg,fontFamily:"'Instrument Serif',Georgia,serif",fontSize:120,color:t.text,opacity:0.1}}>
          {pol.name?.charAt(0)}</div>}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:160,
          background:`linear-gradient(transparent,${t.grad})`}}/>
      </div>
      <div style={{padding:"0 36px 48px",marginTop:-60,position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:`${c}12`,
            border:`1px solid ${c}33`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <PartyIcon party={pol.party} size={20}/>
          </div>
          <PartyPill party={pol.party} size="lg"/>
        </div>
        <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:38,fontWeight:400,
          color:t.text,margin:"8px 0 6px",lineHeight:1.05}}>{pol.name}</h2>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:t.sub,marginBottom:28}}>
          {pol.title} · {pol.state} · Since {pol.since}</div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,lineHeight:1.75,
          color:t.bio,margin:"0 0 36px"}}>{pol.bio}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:36}}>
          {pol.website&&<LinkBtn href={pol.website} label="Official Website" icon="→"/>}
          {pol.wiki&&<LinkBtn href={pol.wiki} label="Wikipedia" icon="W"/>}
          {pol.donate&&<LinkBtn href={pol.donate} label="Donate" icon="$" accent={c}/>}
        </div>
        <div style={{padding:"24px 0",borderTop:`1px solid ${t.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            {[["State",pol.state],["Chamber",pol.chamber],["Since",pol.since]].map(([l,v])=>
              <div key={l}><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:t.statL,
                textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{l}</div>
              <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:t.text}}>{v}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

export default function Poli(){
  const[mode,setMode]=useState("dark");
  const toggle=()=>setMode(m=>m==="dark"?"light":"dark");
  const t=T[mode];
  const[chamber,setChamber]=useState("All");
  const[sel,setSel]=useState(null);
  const{query,setQuery,results,loading,search}=useSearch();
  const[input,setInput]=useState("");
  const timer=useRef(null);

  const all=[...POLS,...results.filter(r=>!POLS.find(s=>s.name===r.name))];
  const filtered=all.filter(p=>{
    const mc=chamber==="All"||p.chamber===chamber;
    const ms=!query||p.name.toLowerCase().includes(query.toLowerCase())||
      p.state.toLowerCase().includes(query.toLowerCase())||
      p.party.toLowerCase().includes(query.toLowerCase());
    return mc&&ms;
  });
  const onInput=(v)=>{setInput(v);setQuery(v);
    if(timer.current)clearTimeout(timer.current);
    if(v.trim().length>2)timer.current=setTimeout(()=>search(v),1500);
  };
  const stats={total:all.length,dem:all.filter(p=>p.party==="Democrat").length,
    rep:all.filter(p=>p.party==="Republican").length,
    grn:all.filter(p=>p.party==="Green").length,
    ind:all.filter(p=>p.party==="Independent").length};

  return <ThemeContext.Provider value={{mode,toggle}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
      @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
      *{box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:3px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px}
      ::selection{background:${mode==="dark"?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.08)"}}
    `}</style>

    <div style={{minHeight:"100vh",background:t.bg,color:t.text,
      fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden",
      transition:"background 0.4s,color 0.4s"}}>

      <div style={{position:"fixed",inset:0,opacity:t.gridOp,pointerEvents:"none",
        backgroundImage:`linear-gradient(${t.grid} 1px,transparent 1px),linear-gradient(90deg,${t.grid} 1px,transparent 1px)`,
        backgroundSize:"80px 80px",transition:"opacity 0.4s"}}/>

      <header style={{padding:"36px 40px 0",maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:56,borderBottom:`1px solid ${t.border}`,paddingBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:30,height:30,border:`1.5px solid ${t.logoBrd}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'Instrument Serif',Georgia,serif",fontSize:15,color:t.logoC,
              transition:"border-color 0.4s,color 0.4s"}}>C</div>
            <span style={{fontSize:12,letterSpacing:"0.18em",textTransform:"uppercase",
              color:t.sub,fontWeight:500}}>Poli</span>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:3,
              background:t.badge,color:t.badgeT,letterSpacing:"0.06em",marginLeft:4}}>BETA</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <button onClick={toggle} style={{background:t.togBg,border:`1px solid ${t.togB}`,
              borderRadius:20,padding:"6px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,
              transition:"all 0.3s",fontSize:12,color:t.togI,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>
              <span style={{fontSize:14}}>{mode==="dark"?"☀":"☾"}</span>
              {mode==="dark"?"Light":"Dark"}
            </button>
            <DonkeyIcon size={14} color={t.pIcon}/>
            <ElephantIcon size={14} color={t.pIcon}/>
            <span style={{fontSize:11,color:t.faint,letterSpacing:"0.08em",textTransform:"uppercase"}}>
              Political Directory · 2026</span>
          </div>
        </div>

        <div style={{maxWidth:740,marginBottom:52}}>
          <h1 style={{fontFamily:"'Instrument Serif',Georgia,serif",
            fontSize:"clamp(40px,5.5vw,68px)",fontWeight:400,lineHeight:1.05,
            marginBottom:20,animation:"fadeUp 0.6s ease-out"}}>
            Every elected official.{" "}
            <span style={{fontStyle:"italic",color:t.hero}}>One directory.</span>
          </h1>
          <p style={{fontSize:15.5,lineHeight:1.7,color:t.subtle,maxWidth:500,
            animation:"fadeUp 0.6s ease-out 0.1s both"}}>
            Biographies, official websites, campaign links, and donation pages for current U.S. politicians and candidates.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,
          marginBottom:48,background:t.statGrid,animation:"fadeUp 0.6s ease-out 0.2s both"}}>
          {[
            {label:"Total Officials",val:stats.total,icon:null,color:null},
            {label:"Democrat",val:stats.dem,icon:<DonkeyIcon size={16} color={PARTIES.Democrat.color}/>,color:PARTIES.Democrat.color},
            {label:"Republican",val:stats.rep,icon:<ElephantIcon size={16} color={PARTIES.Republican.color}/>,color:PARTIES.Republican.color},
            {label:"Independent",val:stats.ind,icon:<StarIcon size={16} color={PARTIES.Independent.color}/>,color:PARTIES.Independent.color},
          ].map((s,i)=><div key={i} style={{background:t.card,padding:"20px 24px",transition:"background 0.4s"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,textTransform:"uppercase",
              letterSpacing:"0.1em",color:t.statL,marginBottom:10}}>{s.icon}{s.label}</div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:34,
              color:s.color||t.text}}>{s.val}</div>
          </div>)}
        </div>
      </header>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 40px"}}>
        <div style={{position:"relative",marginBottom:24,animation:"fadeUp 0.6s ease-out 0.3s both"}}>
          <input type="text" value={input} onChange={e=>onInput(e.target.value)}
            placeholder="Search by name, state, or party — or look up anyone on the web..."
            style={{width:"100%",padding:"16px 20px",background:t.input,
              border:`1px solid ${t.inputB}`,borderRadius:0,color:t.text,fontSize:14.5,
              fontFamily:"'DM Sans',sans-serif",outline:"none",transition:"border-color 0.2s,background 0.4s"}}
            onFocus={e=>e.target.style.borderColor=t.inputBF}
            onBlur={e=>e.target.style.borderColor=t.inputB}/>
          {loading&&<div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",
            display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:t.pulse,animation:"pulse 0.8s infinite"}}/>
            <span style={{color:t.sub,fontSize:12}}>Searching web...</span>
          </div>}
        </div>

        <div style={{display:"flex",gap:0,marginBottom:36,borderBottom:`1px solid ${t.border}`,
          animation:"fadeUp 0.6s ease-out 0.35s both"}}>
          {CHAMBERS.map(c=><button key={c} onClick={()=>setChamber(c)} style={{
            background:"none",border:"none",cursor:"pointer",padding:"12px 20px",
            fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:chamber===c?600:400,
            color:chamber===c?t.tabA:t.tabI,
            borderBottom:chamber===c?`2px solid ${t.tabA}`:"2px solid transparent",
            transition:"all 0.2s"}}>{c}</button>)}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"56px 1fr auto",gap:16,
          padding:"0 12px 10px",alignItems:"center",borderBottom:`1px solid ${t.border}`,
          animation:"fadeUp 0.6s ease-out 0.38s both"}}>
          <span/>
          <span style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.15em",color:t.hdr}}>Official</span>
          <span style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.15em",color:t.hdr,textAlign:"right"}}>Chamber</span>
        </div>

        <div style={{animation:"fadeUp 0.6s ease-out 0.4s both"}}>
          {filtered.map((pol,i)=><div key={pol.id} style={{animation:`fadeUp 0.35s ease-out ${i*0.025}s both`}}>
            <Card pol={pol} onClick={setSel}/></div>)}
          {filtered.length===0&&<div style={{textAlign:"center",padding:"80px 0",color:t.faint}}>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:24,marginBottom:8}}>No results</div>
            <div style={{fontSize:14}}>Try searching for a specific politician by name</div>
          </div>}
        </div>

        <footer style={{padding:"48px 0 36px",borderTop:`1px solid ${t.border}`,
          marginTop:40,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <DonkeyIcon size={12} color={t.fIcon}/>
            <ElephantIcon size={12} color={t.fIcon}/>
            <GreenDiamond size={12} color={t.fIcon}/>
            <span style={{fontSize:11,color:t.ghost,letterSpacing:"0.08em",textTransform:"uppercase"}}>
              Poli Political Directory</span>
          </div>
          <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:13,
            fontStyle:"italic",color:t.ghost}}>Built for civic transparency</span>
        </footer>
      </div>

      {sel&&<Detail pol={sel} onClose={()=>setSel(null)}/>}
    </div>
  </ThemeContext.Provider>;
}
