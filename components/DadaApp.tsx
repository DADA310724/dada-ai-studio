"use client";
import {useEffect,useRef,useState} from "react";
import {Moon,Sun,Send,Sparkles,Code2,Search,Image as ImageIcon,Plus,Paperclip} from "lucide-react";
import {MODELS} from "../lib/models";
type Message={role:"user"|"assistant";content:string};
const starter:Message[]=[{role:"assistant",content:"স্বাগতম! আমি DADA-AI। বাংলা বা English-এ প্রশ্ন করুন—chat, coding, research বা image generation দিয়ে শুরু করতে পারেন।"}];

export default function DadaApp(){
 const [dark,setDark]=useState(true),[mode,setMode]=useState<"chat"|"code"|"research"|"image">("chat");
 const [model,setModel]=useState<string>(MODELS[0].id),[messages,setMessages]=useState(starter),[input,setInput]=useState(""),[loading,setLoading]=useState(false);
 const [file,setFile]=useState(""),end=useRef<HTMLDivElement>(null);
 useEffect(()=>{document.documentElement.classList.toggle("dark",dark)},[dark]);
 useEffect(()=>end.current?.scrollIntoView({behavior:"smooth"}),[messages]);
 const titles={chat:"AI Assistant",code:"Coding Agent",research:"Research",image:"Image Studio"};
 async function send(){
  const text=input.trim();if(!text||loading)return;setInput("");setLoading(true);
  const next=[...messages,{role:"user" as const,content:text}];setMessages([...next,{role:"assistant",content:""}]);
  try{
   if(mode==="image"){
    const r=await fetch("/api/image",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({prompt:text})});
    const d=await r.json();setMessages([...next,{role:"assistant",content:d.dataUrl?`[IMAGE]${d.dataUrl}`:(d.error||"Image generation failed.")}]);return;
   }
   const r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({messages:next,model,mode})});
   if(!r.ok)throw new Error();const reader=r.body?.getReader();const dec=new TextDecoder();let answer="";
   while(reader){const x=await reader.read();if(x.done)break;answer+=dec.decode(x.value,{stream:true});setMessages([...next,{role:"assistant",content:answer}]);}
  }catch{setMessages([...next,{role:"assistant",content:"সংযোগে সমস্যা হয়েছে। GEMINI_API_KEY সেট করা আছে কি না দেখুন।"}]);}
  finally{setLoading(false);}
 }
 function newChat(){setMessages(starter);setInput("");setFile("")}
 return <div className="app">
  <aside className="side"><div className="brand"><div className="logo">D</div>DADA-AI</div>
   <button className="btn" style={{background:"var(--accent)",color:"var(--bg)"}} onClick={newChat}><Plus size={15}/> New Chat</button>
   <nav className="nav">{[["chat","AI Assistant",Sparkles],["code","Coding Agent",Code2],["research","Research",Search],["image","Image Studio",ImageIcon]].map(([id,label,Icon]:any)=>
    <button className={mode===id?"active":""} onClick={()=>setMode(id)}><span style={{display:"flex",gap:8,alignItems:"center"}}><Icon size={15}/>{label}</span></button>)}</nav>
   <div className="sidebottom"><button className="btn" onClick={()=>setDark(!dark)}>{dark?<Sun size={15}/>:<Moon size={15}/>} {dark?"Light":"Dark"} theme</button><span className="pill">Gemini powered</span></div>
  </aside>
  <main className="main"><header className="top"><strong>{titles[mode]}</strong><div className="actions"><select value={model} onChange={e=>setModel(e.target.value)}>{MODELS.map(m=><option value={m.id} key={m.id}>{m.label}</option>)}</select><button className="btn" onClick={()=>setDark(!dark)}>{dark?<Sun size={15}/>:<Moon size={15}/>}</button></div></header>
   <section className="content">{messages.length===1&&<div className="hero"><h1>What can I help you build?</h1><p className="muted">DADA-AI is your bilingual workspace for chat, coding, research and AI image creation.</p><div className="grid"><div className="card"><h3>⚡ Fast Chat</h3><p>Stream answers in real time.</p></div><div className="card"><h3>⌘ Coding</h3><p>Generate and debug code.</p></div><div className="card"><h3>✦ Research</h3><p>Structured research-style answers.</p></div></div></div>}
    <div className="messages">{messages.map((m,i)=><div className={"msg "+m.role} key={i}><div className="bubble">{m.content.startsWith("[IMAGE]")?<img src={m.content.slice(7)} alt="Generated" style={{maxWidth:"100%",borderRadius:12}}/>:m.content}{loading&&i===messages.length-1&&m.role==="assistant"?" ▌":""}</div></div>)}<div ref={end}/></div>
   </section>
   <div className="composer">{file&&<div className="muted" style={{fontSize:12,padding:"2px 8px 6px"}}>Attached: {file}</div>}<textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==="image"?"Describe the image you want…":"Message DADA-AI…"}/><div className="row"><div className="actions"><label className="btn"><Paperclip size={15}/><input hidden type="file" onChange={e=>setFile(e.target.files?.[0]?.name||"")}/></label><span className="pill">{mode}</span></div><button className="btn" style={{background:"var(--accent)",color:"var(--bg)"}} onClick={send} disabled={loading}><Send size={15}/>{loading?" Working…":" Send"}</button></div></div>
  </main>
 </div>
}
