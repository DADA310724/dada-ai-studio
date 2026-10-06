import {NextRequest} from "next/server";
import {GoogleGenAI} from "@google/genai";
export const runtime="nodejs";
export async function POST(req:NextRequest){
  try{
    const {prompt,model="gemini-2.5-flash-image"}=await req.json();
    const key=process.env.GEMINI_API_KEY;
    if(!key)return Response.json({error:"GEMINI_API_KEY is not configured."},{status:500});
    const ai=new GoogleGenAI({apiKey:key});
    const r=await ai.models.generateContent({model,contents:prompt||"Create a professional illustration."});
    for(const p of r.candidates?.[0]?.content?.parts??[]){
      if(p.inlineData?.data&&p.inlineData?.mimeType)
        return Response.json({dataUrl:`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`});
    }
    return Response.json({error:"No image returned by this model."},{status:502});
  }catch{return Response.json({error:"Image generation failed."},{status:500});}
}
