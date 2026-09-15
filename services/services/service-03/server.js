require("dotenv").config();
const express=require("express");
const path=require("path");
const OpenAI=require("openai");
const nodemailer=require("nodemailer");
const cors = require("cors");
const app=express(),PORT=process.env.PORT||3003;
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

app.use(cors());
app.use(express.json({limit:"100kb"}));app.use(express.static(path.join(__dirname,"public")));

function mailer(){
 if(!process.env.SMTP_HOST||!process.env.SMTP_USER||!process.env.SMTP_PASS||!process.env.FOLLOWUP_FROM) return null;
 return nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE||"false")==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
}
async function sendEmail(lead,message){
 const transporter=mailer(); if(!transporter) throw new Error("Email sending is not configured. Add SMTP settings and FOLLOWUP_FROM in .env.");
 if(!lead.email) throw new Error("Recipient email is missing.");
 await transporter.sendMail({from:process.env.FOLLOWUP_FROM,to:lead.email,subject:process.env.FOLLOWUP_SUBJECT||"A quick follow-up from Atelier North",text:message});
}
app.post("/api/followup",async(req,res)=>{
 try{
  const lead=req.body.lead||{}, instruction=req.body.instruction||"Write a personalized follow-up.", history=Array.isArray(req.body.history)?req.body.history.slice(-8):[];
  const response=await client.responses.create({
   model:process.env.OPENAI_MODEL||"gpt-5.6-luna",
   instructions:`You are North Follow-up AI inside Atelier North. Create useful, natural, non-spammy follow-ups.
Lead name: ${lead.name||"Unknown"}; Email: ${lead.email||"Unknown"}; Company: ${lead.company||"Unknown"}; Context: ${lead.context||"None"}.
Never claim a message was sent or a CRM was changed. Answer the user's instruction directly.`,
   input:[...history.map(x=>({role:"user",content:x.instruction})),{role:"user",content:instruction}]
  });
  res.json({answer:response.output_text||"I couldn't generate a follow-up."});
 }catch(e){console.error(e);res.status(500).json({error:"AI request failed"});}
});

const jobs=[];
function addJob(job){
 jobs.push(job);
}
async function processJobs(){
 const now=Date.now();
 for(const job of jobs){
  if(job.done||job.nextAt>now) continue;
  try{
   await sendEmail(job.lead,job.message);
   job.sentCount++;
   if(job.intervalDays && job.sentCount<job.maxFollowups){
    job.nextAt=Date.now()+job.intervalDays*86400000;
   }else job.done=true;
   console.log("Follow-up sent to",job.lead.email);
  }catch(e){console.error("Scheduled send failed:",e.message);job.error=e.message;job.nextAt=Date.now()+3600000;}
 }
}
setInterval(processJobs,30000);

app.post("/api/schedule-followup",async(req,res)=>{
 try{
  const {lead,message,scheduleType="now",sendAt,intervalDays,maxFollowups=1}=req.body;
  if(!lead?.name||!lead?.email||!message) return res.status(400).json({error:"Recipient name, email and message are required."});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return res.status(400).json({error:"Invalid recipient email."});
  const firstAt=scheduleType==="later" ? new Date(sendAt).getTime() : Date.now();
  if(!Number.isFinite(firstAt)||firstAt<Date.now()-60000) return res.status(400).json({error:"Choose a future date and time."});
  const job={lead,message,nextAt:firstAt,intervalDays:intervalDays?Number(intervalDays):null,maxFollowups:Math.max(1,Number(maxFollowups||1)),sentCount:0,done:false};
  if(firstAt<=Date.now()){
   await sendEmail(lead,message);job.sentCount=1;
   if(job.intervalDays&&job.sentCount<job.maxFollowups) job.nextAt=Date.now()+job.intervalDays*86400000; else job.done=true;
   addJob(job);return res.json({status:"sent",message:`Follow-up sent automatically to ${lead.email}.`});
  }
  addJob(job);
  res.json({status:"scheduled",message:`Follow-up scheduled for ${new Date(firstAt).toLocaleString()}. ${job.intervalDays?`It will continue every ${job.intervalDays} days for up to ${job.maxFollowups} follow-ups.`:"One-time delivery."}`});
 }catch(e){console.error(e);res.status(500).json({error:e.message||"Scheduling failed"});}
});
app.listen(PORT, () => {
  console.log(`Atelier North Service 03 running at http://localhost:${PORT}`);
});