import {NextRequest} from "next/server";
import {GoogleGenAI} from "@google/genai";
export const runtime="nodejs";
export async function POST(req:NextRequest){
  try{
    const {messages=[],model="gemini-2.5-flash",mode="chat"}=await req.json();
    const key=process.env.GEMINI_API_KEY;
    if(!key)return Response.json({error:"GEMINI_API_KEY is not configured."},{status:500});
    const ai=new GoogleGenAI({apiKey:key});
    const system=mode==="code"
      ?"You are DADA-AI Coding Agent. Generate correct maintainable code. Never claim code was executed unless it was actually executed."
      :mode==="research"
      ?"You are DADA-AI Research Assistant. Be structured and careful. Do not invent sources or claim live browsing when unavailable."
      :"You are DADA-AI, a helpful bilingual assistant. Reply in the user's language unless asked otherwise.";
    const contents=messages.map((m:{role:string;content:string})=>({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]}));
    const result=await ai.models.generateContentStream({model,config:{systemInstruction:system},contents});
    const enc=new TextEncoder();
    const stream=new ReadableStream({async start(controller){
      try{for await(const chunk of result){const t=chunk.text??"";if(t)controller.enqueue(enc.encode(t));}}
      finally{controller.close();}
    }});
    return new Response(stream,{headers:{"content-type":"text/plain;charset=utf-8","cache-control":"no-cache"}});
  }catch{return Response.json({error:"Request failed."},{status:400});}
}
