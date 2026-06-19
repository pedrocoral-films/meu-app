const CORAL_LOGO = "/coral-logo.png";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const APP_NAME = "Coral Hub";
const APP_SUBTITLE = "Sistema Inteligente de Gestão da Coral Films";
const APP_VERSION = "v3.1";

// ─── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  black:"#05070b",
  dark:"#090d14",
  surface:"#101722",
  card:"#121a27",
  card2:"#0c111b",
  border:"#223044",
  white:"#f8fafc",
  dim:"#94a3b8",
  muted:"#64748b",
  orange:"#f97316",
  orange2:"#fb923c",
  orangeG:"0 0 26px rgba(249,115,22,.42)",
  gold:"#fbbf24",
  neon:"#00f0ff",
  neonG:"0 0 28px rgba(0,240,255,.28)",
  danger:"#ef4444",
  danger2:"#fb7185",
  success:"#22c55e",
};
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const FMT_C = {Reels:C.orange,Stories:"#a855f7","Post Feed":"#0ea5e9",Carrossel:"#22c55e"};
const PIL_C = {Autoridade:"#e5e5e5",Conexão:C.orange,Conversão:C.gold};

// ─── Storage / Sync ────────────────────────────────────────────────────────────
// LocalStorage mantém o app funcionando mesmo sem internet.
// Supabase salva automaticamente cada plano gerado na tabela "planos".
const STORAGE_KEY = "coral_films_clientes_v8";
const OLD_STORAGE_KEYS = [
  "coral_films_clientes_v7",
  "coral_films_clientes_v6",
  "cf_v5",
  "cf_v4",
  "cf_v3",
  "coral_films_clientes_v5"
];

// Deixe vazio para não mostrar aviso na tela inicial.
// Se quiser mostrar status depois, você pode trocar por uma frase.
const STORAGE_MODE_LABEL = "";

const COMERCIAL_STORAGE_KEY = "coral_hub_comercial_v2";

const LEAD_STATUS_OPTIONS = [
  "Novo",
  "Primeiro Contato",
  "Reunião Agendada",
  "Proposta Enviada",
  "Negociação",
  "Fechado",
  "Perdido",
  "Cliente Ativo"
];

const PROPOSAL_STATUS_OPTIONS = ["Rascunho","Enviada","Em negociação","Aprovada","Convertida","Recusada"];
const SERVICE_TYPE_OPTIONS = ["Mensal","Implementação","Projeto"];

const DEFAULT_SERVICES = [
  {
    seedKey:"captacao-de-video",
    nome:"Captação de Vídeo",
    categoria:"Audiovisual",
    descricao:"Captação profissional de vídeos com planejamento, direção de cena, equipamentos adequados e produção audiovisual de alta qualidade.",
    valorPadrao:350,
    tipo:"Mensal",
    ativo:true,
    icone:"🎥",
    ordemExibicao:1
  },
  {
    seedKey:"edicao-de-video",
    nome:"Edição de Vídeo",
    categoria:"Audiovisual",
    descricao:"Edição profissional, correção de cor, tratamento de áudio, legendas e exportação otimizada para redes sociais.",
    valorPadrao:300,
    tipo:"Mensal",
    ativo:true,
    icone:"✂️",
    ordemExibicao:2
  },
  {
    seedKey:"gestao-de-redes-sociais",
    nome:"Gestão de Redes Sociais",
    categoria:"Gestão",
    descricao:"Planejamento estratégico, calendário de publicações, acompanhamento e gestão dos perfis.",
    valorPadrao:450,
    tipo:"Mensal",
    ativo:true,
    icone:"📱",
    ordemExibicao:3
  },
  {
    seedKey:"artes-digitais-e-impressao",
    nome:"Artes Digitais e Impressão",
    categoria:"Design",
    descricao:"Criação de artes para redes sociais e materiais gráficos impressos.",
    valorPadrao:250,
    tipo:"Mensal",
    ativo:true,
    icone:"🎨",
    ordemExibicao:4
  },
  {
    seedKey:"producao-de-conteudo",
    nome:"Produção de Conteúdo",
    categoria:"Conteúdo",
    descricao:"Planejamento de conteúdos, campanhas, estratégias e desenvolvimento de ideias.",
    valorPadrao:300,
    tipo:"Mensal",
    ativo:true,
    icone:"🧠",
    ordemExibicao:5
  },
  {
    seedKey:"roteirizacao",
    nome:"Roteirização",
    categoria:"Conteúdo",
    descricao:"Desenvolvimento de roteiros para vídeos institucionais, Reels e campanhas.",
    valorPadrao:180,
    tipo:"Mensal",
    ativo:true,
    icone:"📝",
    ordemExibicao:6
  },
  {
    seedKey:"identidade-visual",
    nome:"Identidade Visual",
    categoria:"Branding",
    descricao:"Desenvolvimento completo da identidade visual da empresa.",
    valorPadrao:900,
    tipo:"Implementação",
    ativo:true,
    icone:"💎",
    ordemExibicao:7
  },
  {
    seedKey:"cobertura-de-eventos",
    nome:"Cobertura de Eventos",
    categoria:"Eventos",
    descricao:"Cobertura profissional de eventos com fotografia e vídeo.",
    valorPadrao:1200,
    tipo:"Projeto",
    ativo:true,
    icone:"📸",
    ordemExibicao:8
  }
];

function emptyLeadForm(){
  return {
    id:null,
    empresa:"",
    responsavel:"",
    telefone:"",
    whatsapp:"",
    email:"",
    instagram:"",
    cidade:"",
    segmento:"",
    origemLead:"",
    observacoes:"",
    status:"Novo"
  };
}

function emptyServiceForm(){
  return {
    id:null,
    nome:"",
    categoria:"",
    descricao:"",
    valorPadrao:0,
    tipo:"Mensal",
    ativo:true,
    icone:"",
    ordemExibicao:1
  };
}

function emptyProposalForm(){
  return {
    id:null,
    leadId:"",
    empresa:"",
    responsavel:"",
    telefone:"",
    whatsapp:"",
    email:"",
    instagram:"",
    cidade:"",
    segmento:"",
    objetivos:"",
    condicoesPagamento:"Entrada de 50% para início do projeto e saldo conforme cronograma aprovado. Serviços mensais são cobrados de forma recorrente.",
    proximosPassos:"1. Aprovação da proposta. 2. Alinhamento estratégico. 3. Início da produção. 4. Entrega e acompanhamento.",
    status:"Rascunho",
    descontoValor:0,
    descontoPercentual:0,
    items:[]
  };
}

function moneyBR(value){
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

function toNumber(value){
  if(typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? "").replace(/\./g,"").replace(",",".").replace(/[^\d.-]/g,"");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCommercialStatus(value){
  return LEAD_STATUS_OPTIONS.includes(value) ? value : "Novo";
}

function normalizeLead(row={}){
  return {
    id:String(row.id || row.supabaseId || newLocalId()),
    supabaseId:row.supabaseId || (row.id && isCloudId(row.id) ? row.id : null),
    empresa:row.empresa || "",
    responsavel:row.responsavel || "",
    telefone:row.telefone || "",
    whatsapp:row.whatsapp || "",
    email:row.email || "",
    instagram:row.instagram || "",
    cidade:row.cidade || "",
    segmento:row.segmento || "",
    origemLead:row.origemLead || row.origem_lead || "",
    observacoes:row.observacoes || "",
    status:normalizeCommercialStatus(row.status),
    createdAt:row.createdAt || row.created_at || new Date().toISOString(),
    updatedAt:row.updatedAt || row.updated_at || new Date().toISOString()
  };
}

function normalizeService(row={}){
  return {
    id:String(row.id || row.supabaseId || row.seedKey || newLocalId()),
    supabaseId:row.supabaseId || (row.id && isCloudId(row.id) ? row.id : null),
    seedKey:row.seedKey || row.seed_key || "",
    nome:row.nome || "",
    categoria:row.categoria || "",
    descricao:row.descricao || "",
    valorPadrao:toNumber(row.valorPadrao ?? row.valor_padrao),
    tipo:SERVICE_TYPE_OPTIONS.includes(row.tipo) ? row.tipo : "Mensal",
    ativo:typeof row.ativo === "boolean" ? row.ativo : true,
    icone:row.icone || "",
    ordemExibicao:Number(row.ordemExibicao ?? row.ordem_exibicao ?? 1),
    createdAt:row.createdAt || row.created_at || new Date().toISOString(),
    updatedAt:row.updatedAt || row.updated_at || new Date().toISOString()
  };
}

function normalizeProposal(row={}){
  const snapshot = row.leadSnapshot || row.lead_snapshot || {};
  return {
    id:String(row.id || row.supabaseId || newLocalId()),
    supabaseId:row.supabaseId || (row.id && isCloudId(row.id) ? row.id : null),
    leadId:String(row.leadId || row.lead_id || snapshot.id || ""),
    leadSupabaseId:row.leadSupabaseId || row.lead_id || null,
    empresa:row.empresa || snapshot.empresa || "",
    responsavel:row.responsavel || snapshot.responsavel || "",
    telefone:row.telefone || snapshot.telefone || "",
    whatsapp:row.whatsapp || snapshot.whatsapp || "",
    email:row.email || snapshot.email || "",
    instagram:row.instagram || snapshot.instagram || "",
    cidade:row.cidade || snapshot.cidade || "",
    segmento:row.segmento || snapshot.segmento || "",
    objetivos:row.objetivos || "",
    condicoesPagamento:row.condicoesPagamento || row.condicoes_pagamento || "",
    proximosPassos:row.proximosPassos || row.proximos_passos || "",
    status:PROPOSAL_STATUS_OPTIONS.includes(row.status) ? row.status : "Rascunho",
    descontoValor:toNumber(row.descontoValor ?? row.desconto_valor),
    descontoPercentual:toNumber(row.descontoPercentual ?? row.desconto_percentual),
    valorTabela:toNumber(row.valorTabela ?? row.valor_tabela),
    descontoTotal:toNumber(row.descontoTotal ?? row.desconto_total),
    valorFinal:toNumber(row.valorFinal ?? row.valor_final),
    createdAt:row.createdAt || row.created_at || new Date().toISOString(),
    updatedAt:row.updatedAt || row.updated_at || new Date().toISOString()
  };
}

function normalizeProposalItem(row={}){
  return {
    id:String(row.id || newLocalId()),
    supabaseId:row.supabaseId || (row.id && isCloudId(row.id) ? row.id : null),
    proposalId:String(row.proposalId || row.proposta_id || row.proposal_id || ""),
    serviceId:String(row.serviceId || row.servico_id || row.service_id || ""),
    serviceName:row.serviceName || row.service_name || row.nome_servico || "",
    categoria:row.categoria || "",
    descricao:row.descricao || "",
    tipo:SERVICE_TYPE_OPTIONS.includes(row.tipo) ? row.tipo : "Mensal",
    quantidade:Number(row.quantidade || 1),
    valorUnitario:toNumber(row.valorUnitario ?? row.valor_unitario),
    ordem:Number(row.ordem || 1),
    createdAt:row.createdAt || row.created_at || new Date().toISOString()
  };
}

function proposalTotals(items=[],descontoValor=0,descontoPercentual=0){
  const normalized = (items||[]).map(item=>({
    ...item,
    quantidade:Number(item.quantidade || 1),
    valorUnitario:toNumber(item.valorUnitario)
  }));
  const valorTabela = normalized.reduce((sum,item)=>sum + (item.valorUnitario * item.quantidade),0);
  const valorImplementacao = normalized.filter(i=>i.tipo==="Implementação").reduce((sum,item)=>sum + (item.valorUnitario * item.quantidade),0);
  const valorMensal = normalized.filter(i=>i.tipo==="Mensal").reduce((sum,item)=>sum + (item.valorUnitario * item.quantidade),0);
  const valorProjeto = normalized.filter(i=>i.tipo==="Projeto").reduce((sum,item)=>sum + (item.valorUnitario * item.quantidade),0);
  const percentual = Math.max(0,toNumber(descontoPercentual));
  const descontoPercentualValor = valorTabela * (percentual / 100);
  const descontoTotal = Math.min(valorTabela, Math.max(0,toNumber(descontoValor)) + descontoPercentualValor);
  const valorFinal = Math.max(0, valorTabela - descontoTotal);
  return {valorTabela,valorImplementacao,valorMensal,valorProjeto,descontoPercentualValor,descontoTotal,valorFinal};
}

function localCommercialData(){
  const raw = safeJsonParse(window.localStorage?.getItem(COMERCIAL_STORAGE_KEY));
  return {
    leads:Array.isArray(raw?.leads) ? raw.leads.map(normalizeLead) : [],
    services:Array.isArray(raw?.services) ? raw.services.map(normalizeService) : [],
    proposals:Array.isArray(raw?.proposals) ? raw.proposals.map(normalizeProposal) : [],
    items:Array.isArray(raw?.items) ? raw.items.map(normalizeProposalItem) : []
  };
}

async function dbGetCommercial(){
  const local = localCommercialData();
  if(!isSupabaseReady()) return ensureDefaultCommercialServices(local);

  try{
    const [leadsRes,servicesRes,proposalsRes,itemsRes] = await Promise.all([
      supabase.from("coral_leads").select("*").order("created_at",{ascending:false}),
      supabase.from("coral_services").select("*").order("ordem_exibicao",{ascending:true}),
      supabase.from("coral_propostas").select("*").order("created_at",{ascending:false}),
      supabase.from("coral_proposta_itens").select("*").order("ordem",{ascending:true})
    ]);

    const hasError = [leadsRes,servicesRes,proposalsRes,itemsRes].some(r=>r.error);
    if(hasError){
      console.warn("Módulo Comercial usando cache local. Execute o SQL v2.0 no Supabase para ativar a nuvem.", {
        leads:leadsRes.error,
        services:servicesRes.error,
        proposals:proposalsRes.error,
        items:itemsRes.error
      });
      return ensureDefaultCommercialServices(local);
    }

    const cloud = {
      leads:(leadsRes.data||[]).map(normalizeLead),
      services:(servicesRes.data||[]).map(normalizeService),
      proposals:(proposalsRes.data||[]).map(normalizeProposal),
      items:(itemsRes.data||[]).map(normalizeProposalItem)
    };

    const merged = {
      leads:cloud.leads.length ? cloud.leads : local.leads,
      services:cloud.services.length ? cloud.services : local.services,
      proposals:cloud.proposals.length ? cloud.proposals : local.proposals,
      items:cloud.items.length ? cloud.items : local.items
    };

    return ensureDefaultCommercialServices(merged);
  }catch(error){
    console.warn("Erro ao carregar Comercial:", error);
    return ensureDefaultCommercialServices(local);
  }
}

async function dbSetCommercial(data){
  const normalized = {
    leads:(data.leads||[]).map(normalizeLead),
    services:(data.services||[]).map(normalizeService),
    proposals:(data.proposals||[]).map(normalizeProposal),
    items:(data.items||[]).map(normalizeProposalItem)
  };
  try{
    window.localStorage?.setItem(COMERCIAL_STORAGE_KEY, JSON.stringify(normalized));
    return {ok:true};
  }catch(error){
    console.error("Erro ao salvar módulo Comercial localmente:", error);
    return {ok:false,error};
  }
}

async function salvarLeadSupabase(lead){
  if(!isSupabaseReady()) return {ok:false,skipped:true};
  const payload = {
    empresa:lead.empresa || "",
    responsavel:lead.responsavel || "",
    telefone:lead.telefone || "",
    whatsapp:lead.whatsapp || "",
    email:lead.email || "",
    instagram:lead.instagram || "",
    cidade:lead.cidade || "",
    segmento:lead.segmento || "",
    origem_lead:lead.origemLead || "",
    observacoes:lead.observacoes || "",
    status:lead.status || "Novo"
  };

  try{
    const dbId = lead.supabaseId || (lead.id && isCloudId(lead.id) ? lead.id : null);
    if(dbId){
      const {data,error} = await supabase.from("coral_leads").update(payload).eq("id",dbId).select("*").single();
      if(error) throw error;
      return {ok:true,data:normalizeLead(data),id:data.id,updated:true};
    }
    const {data,error} = await supabase.from("coral_leads").insert([payload]).select("*").single();
    if(error) throw error;
    return {ok:true,data:normalizeLead(data),id:data.id};
  }catch(error){
    console.warn("Lead salvo apenas localmente:", error);
    return {ok:false,error};
  }
}

async function salvarServiceSupabase(service){
  if(!isSupabaseReady()) return {ok:false,skipped:true};
  const payload = {
    seed_key:service.seedKey || null,
    nome:service.nome || "",
    categoria:service.categoria || "",
    descricao:service.descricao || "",
    valor_padrao:toNumber(service.valorPadrao),
    tipo:service.tipo || "Mensal",
    ativo:service.ativo !== false,
    icone:service.icone || null,
    ordem_exibicao:Number(service.ordemExibicao || 1)
  };

  try{
    const dbId = service.supabaseId || (service.id && isCloudId(service.id) ? service.id : null);
    if(dbId){
      const {data,error} = await supabase.from("coral_services").update(payload).eq("id",dbId).select("*").single();
      if(error) throw error;
      return {ok:true,data:normalizeService(data),id:data.id,updated:true};
    }
    const {data,error} = await supabase.from("coral_services").insert([payload]).select("*").single();
    if(error) throw error;
    return {ok:true,data:normalizeService(data),id:data.id};
  }catch(error){
    console.warn("Serviço salvo apenas localmente:", error);
    return {ok:false,error};
  }
}

async function salvarProposalSupabase(proposal,items=[]){
  if(!isSupabaseReady()) return {ok:false,skipped:true};
  const totals = proposalTotals(items, proposal.descontoValor, proposal.descontoPercentual);
  const leadDbId = proposal.leadSupabaseId || (proposal.leadId && isCloudId(proposal.leadId) ? proposal.leadId : null);
  const leadSnapshot = {
    id:proposal.leadId,
    empresa:proposal.empresa,
    responsavel:proposal.responsavel,
    telefone:proposal.telefone,
    whatsapp:proposal.whatsapp,
    email:proposal.email,
    instagram:proposal.instagram,
    cidade:proposal.cidade,
    segmento:proposal.segmento
  };

  const payload = {
    lead_id:leadDbId || null,
    lead_snapshot:leadSnapshot,
    empresa:proposal.empresa || "",
    responsavel:proposal.responsavel || "",
    telefone:proposal.telefone || "",
    whatsapp:proposal.whatsapp || "",
    email:proposal.email || "",
    instagram:proposal.instagram || "",
    cidade:proposal.cidade || "",
    segmento:proposal.segmento || "",
    objetivos:proposal.objetivos || "",
    condicoes_pagamento:proposal.condicoesPagamento || "",
    proximos_passos:proposal.proximosPassos || "",
    status:proposal.status || "Rascunho",
    desconto_valor:toNumber(proposal.descontoValor),
    desconto_percentual:toNumber(proposal.descontoPercentual),
    valor_tabela:totals.valorTabela,
    desconto_total:totals.descontoTotal,
    valor_final:totals.valorFinal
  };

  try{
    const dbId = proposal.supabaseId || (proposal.id && isCloudId(proposal.id) ? proposal.id : null);
    let saved;
    if(dbId){
      const {data,error} = await supabase.from("coral_propostas").update(payload).eq("id",dbId).select("*").single();
      if(error) throw error;
      saved = data;
      await supabase.from("coral_proposta_itens").delete().eq("proposta_id",dbId);
    }else{
      const {data,error} = await supabase.from("coral_propostas").insert([payload]).select("*").single();
      if(error) throw error;
      saved = data;
    }

    const propostaId = saved.id;
    const itemPayload = (items||[]).map((item,index)=>({
      proposta_id:propostaId,
      servico_id:item.serviceId && isCloudId(item.serviceId) ? item.serviceId : null,
      nome_servico:item.serviceName || "",
      categoria:item.categoria || "",
      descricao:item.descricao || "",
      tipo:item.tipo || "Mensal",
      quantidade:Number(item.quantidade || 1),
      valor_unitario:toNumber(item.valorUnitario),
      ordem:index+1
    }));

    if(itemPayload.length){
      const {error:itemError} = await supabase.from("coral_proposta_itens").insert(itemPayload);
      if(itemError) console.warn("Proposta salva, mas os itens ficaram apenas locais:", itemError);
    }

    return {ok:true,data:normalizeProposal(saved),id:propostaId};
  }catch(error){
    console.warn("Proposta salva apenas localmente:", error);
    return {ok:false,error};
  }
}

async function deleteSupabaseRow(table,id){
  if(!isSupabaseReady() || !id || !isCloudId(id)) return {ok:false,skipped:true};
  const {error} = await supabase.from(table).delete().eq("id",id);
  if(error){
    console.warn(`Erro ao excluir em ${table}:`, error);
    return {ok:false,error};
  }
  return {ok:true};
}

async function ensureDefaultCommercialServices(data){
  const current = Array.isArray(data.services) ? data.services.map(normalizeService) : [];
  const bySeed = new Map(current.filter(s=>s.seedKey).map(s=>[s.seedKey,s]));
  const byName = new Map(current.map(s=>[String(s.nome||"").trim().toLowerCase(),s]));
  const merged = [...current];

  for(const service of DEFAULT_SERVICES){
    const exists = bySeed.get(service.seedKey) || byName.get(service.nome.toLowerCase());
    if(exists) continue;
    let normalized = normalizeService({...service,id:`local-service-${service.seedKey}`});
    const saved = await salvarServiceSupabase(normalized);
    if(saved?.ok && saved.data) normalized = saved.data;
    merged.push(normalized);
  }

  const next = {
    ...data,
    services:merged.sort((a,b)=>(Number(a.ordemExibicao||0)-Number(b.ordemExibicao||0)) || String(a.nome).localeCompare(String(b.nome)))
  };

  try{ await dbSetCommercial(next); }catch{}
  return next;
}

function openCommercialProposalPdf(proposal,items=[],lead=null){
  const totals = proposalTotals(items, proposal.descontoValor, proposal.descontoPercentual);
  const safe = esc;
  const generatedAt = new Date().toLocaleDateString("pt-BR");
  const selectedRows = (items||[]).map((item,index)=>`
    <tr>
      <td><b>${safe(item.serviceName)}</b><small>${safe(item.categoria||"Serviço")} · ${safe(item.tipo)}</small></td>
      <td>${safe(item.descricao)}</td>
      <td>${Number(item.quantidade||1)}</td>
      <td>${moneyBR(item.valorUnitario)}</td>
      <td>${moneyBR(toNumber(item.valorUnitario)*Number(item.quantidade||1))}</td>
    </tr>
  `).join("");

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>${safe(APP_NAME)} - Proposta ${safe(proposal.empresa||"Cliente")}</title>
    <style>
      @page{size:A4;margin:0}
      *{box-sizing:border-box}
      body{margin:0;font-family:Inter,Arial,sans-serif;background:#05070b;color:#f8fafc;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .page{width:210mm;min-height:297mm;padding:22mm;page-break-after:always;position:relative;overflow:hidden;background:
        radial-gradient(circle at 20% 0%,rgba(249,115,22,.22),transparent 34%),
        radial-gradient(circle at 88% 12%,rgba(0,240,255,.18),transparent 32%),
        linear-gradient(180deg,#07101a,#05070b 60%,#020409)}
      .page:last-child{page-break-after:auto}
      .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:13mm 13mm;mask-image:linear-gradient(to bottom,rgba(0,0,0,.85),transparent 80%)}
      .content{position:relative;z-index:1}
      .logo{width:38mm;height:38mm;object-fit:contain;mix-blend-mode:screen;filter:brightness(1.15) drop-shadow(0 0 18px rgba(0,240,255,.42))}
      .eyebrow{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#00f0ff;font-weight:900}
      h1{font-size:38px;line-height:1;margin:16mm 0 5mm;letter-spacing:-1.8px}
      h2{font-size:25px;line-height:1.05;margin:0 0 8mm;letter-spacing:-1px}
      p{font-size:12px;line-height:1.8;color:#cbd5e1}
      .orange{color:#f97316}
      .card{border:1px solid rgba(255,255,255,.10);background:rgba(15,23,42,.66);border-radius:18px;padding:8mm;backdrop-filter:blur(12px);box-shadow:0 20px 70px rgba(0,0,0,.28)}
      .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin:8mm 0}
      .kpi{border:1px solid rgba(249,115,22,.25);border-radius:14px;padding:5mm;background:rgba(249,115,22,.075)}
      .kpi small{display:block;font-size:7px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.8px;font-weight:900;margin-bottom:2mm}
      .kpi strong{font-size:15px;color:#f8fafc}
      table{width:100%;border-collapse:collapse;margin-top:7mm;border-radius:14px;overflow:hidden}
      th{font-size:8px;text-transform:uppercase;letter-spacing:1.7px;color:#94a3b8;text-align:left;padding:4mm;background:rgba(255,255,255,.055)}
      td{font-size:10px;color:#e2e8f0;padding:4mm;border-bottom:1px solid rgba(255,255,255,.08);vertical-align:top}
      td small{display:block;color:#94a3b8;margin-top:1.5mm}
      .summary{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:7mm}
      .total{border:1px solid rgba(0,240,255,.26);background:linear-gradient(135deg,rgba(0,240,255,.11),rgba(249,115,22,.10));border-radius:18px;padding:7mm}
      .total span{display:block;font-size:8px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;font-weight:900}
      .total strong{display:block;font-size:28px;margin-top:2mm;color:#f97316}
      .footer{position:absolute;left:22mm;right:22mm;bottom:12mm;display:flex;justify-content:space-between;color:#64748b;font-size:8px;letter-spacing:1px;text-transform:uppercase}
      .pill{display:inline-flex;align-items:center;border:1px solid rgba(249,115,22,.32);border-radius:999px;padding:3mm 5mm;color:#f97316;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1.6px;background:rgba(249,115,22,.08)}
      @media print{button{display:none}}
    </style>
  </head>
  <body>
    <section class="page">
      <div class="grid"></div>
      <div class="content">
        <img class="logo" src="${CORAL_LOGO}" alt="Coral Films"/>
        <div class="eyebrow">${safe(APP_NAME)} · Proposta Comercial</div>
        <h1>Proposta premium para <span class="orange">${safe(proposal.empresa||"Cliente")}</span></h1>
        <p>${safe(APP_SUBTITLE)}. Documento preparado pela Coral Films para apresentar serviços, investimento e próximos passos com clareza.</p>
        <div class="card" style="margin-top:14mm">
          <div class="eyebrow">Cliente</div>
          <p><b>${safe(proposal.responsavel||lead?.responsavel||"Responsável não informado")}</b><br/>
          ${safe(proposal.email||lead?.email||"")} ${proposal.whatsapp ? " · WhatsApp: "+safe(proposal.whatsapp) : ""}<br/>
          ${safe(proposal.cidade||lead?.cidade||"")} ${proposal.segmento ? " · "+safe(proposal.segmento) : ""}</p>
        </div>
      </div>
      <div class="footer"><span>Coral Films</span><span>${generatedAt}</span></div>
    </section>

    <section class="page">
      <div class="grid"></div>
      <div class="content">
        <div class="eyebrow">Objetivos e apresentação</div>
        <h2>Como a Coral Films pode acelerar a presença digital da marca</h2>
        <div class="card">
          <p>${safe(proposal.objetivos || "Estruturar uma presença digital consistente, com produção audiovisual, conteúdo estratégico e entregas comerciais alinhadas ao posicionamento da empresa.")}</p>
        </div>
        <div class="summary">
          <div class="card"><div class="eyebrow">Coral Films</div><p>Somos uma operação criativa focada em transformar negócios em marcas mais desejadas por meio de estratégia, vídeo, design e gestão de conteúdo.</p></div>
          <div class="card"><div class="eyebrow">Método</div><p>Unimos planejamento, produção e acompanhamento para entregar materiais com visual profissional, comunicação clara e foco em conversão.</p></div>
        </div>
      </div>
      <div class="footer"><span>${safe(APP_NAME)}</span><span>Apresentação</span></div>
    </section>

    <section class="page">
      <div class="grid"></div>
      <div class="content">
        <div class="eyebrow">Serviços selecionados</div>
        <h2>Escopo da proposta</h2>
        <table>
          <thead><tr><th>Serviço</th><th>Descrição</th><th>Qtd.</th><th>Valor</th><th>Total</th></tr></thead>
          <tbody>${selectedRows || `<tr><td colspan="5">Nenhum serviço selecionado.</td></tr>`}</tbody>
        </table>
      </div>
      <div class="footer"><span>${safe(APP_NAME)}</span><span>Escopo</span></div>
    </section>

    <section class="page">
      <div class="grid"></div>
      <div class="content">
        <div class="eyebrow">Investimento</div>
        <h2>Resumo financeiro da proposta</h2>
        <div class="kpis">
          <div class="kpi"><small>Implementação</small><strong>${moneyBR(totals.valorImplementacao)}</strong></div>
          <div class="kpi"><small>Mensal</small><strong>${moneyBR(totals.valorMensal)}</strong></div>
          <div class="kpi"><small>Projeto</small><strong>${moneyBR(totals.valorProjeto)}</strong></div>
          <div class="kpi"><small>Desconto</small><strong>${moneyBR(totals.descontoTotal)}</strong></div>
        </div>
        <div class="summary">
          <div class="card">
            <p><b>Valor de Tabela:</b> ${moneyBR(totals.valorTabela)}<br/>
            <b>Desconto aplicado:</b> ${moneyBR(totals.descontoTotal)}${Number(proposal.descontoPercentual||0)>0 ? ` (${Number(proposal.descontoPercentual||0)}%)` : ""}<br/>
            <b>Valor Final:</b> ${moneyBR(totals.valorFinal)}</p>
          </div>
          <div class="total"><span>Valor Final da Proposta</span><strong>${moneyBR(totals.valorFinal)}</strong></div>
        </div>
        <div class="card" style="margin-top:7mm">
          <div class="eyebrow">Condições de pagamento</div>
          <p>${safe(proposal.condicoesPagamento || "Condições a definir com o cliente após aprovação da proposta.")}</p>
        </div>
        <div class="card" style="margin-top:5mm">
          <div class="eyebrow">Próximos passos</div>
          <p>${safe(proposal.proximosPassos || "Aprovar proposta, alinhar cronograma e iniciar a produção.")}</p>
        </div>
        <div style="margin-top:8mm"><span class="pill">Pronto para aprovação</span></div>
      </div>
      <div class="footer"><span>Coral Films</span><span>Fim</span></div>
    </section>
    <script>setTimeout(function(){try{window.focus();window.print()}catch(e){}},600);</script>
  </body>
  </html>`;

  const w = window.open("","_blank");
  if(!w) return alert("Permita pop-ups para gerar o PDF.");
  w.document.open();
  w.document.write(html);
  w.document.close();
}


function isSupabaseReady(){
  return Boolean(supabase && typeof supabase.from === "function");
}

function isCloudId(value){
  return Boolean(value) && !String(value).startsWith("local-");
}

function newLocalId(){
  if(typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"){
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeJsonParse(v){
  try{return v ? JSON.parse(v) : null;}catch{return null;}
}

function parseSupabaseConteudo(value){
  if(!value) return null;
  if(typeof value === "string") return safeJsonParse(value) || {raw:value};
  if(typeof value === "object") return value;
  return null;
}

function extractPlanFromConteudo(conteudo){
  if(!conteudo) return null;
  if(conteudo.strategy || conteudo.calendar || conteudo.reels || conteudo.goals) return conteudo;
  if(conteudo.lastPlan) return conteudo.lastPlan;
  if(conteudo.plan) return conteudo.plan;
  return null;
}

function cleanClientForSupabase(client={}){
  const {
    supabaseId,
    importedFromSupabase,
    _storageWarning,
    ...rest
  } = client;

  return {
    ...rest,
    images:Array.isArray(client.images) ? client.images : [],
    links:Array.isArray(client.links) ? client.links : [{label:"",url:""}],
    approvalLinks:Array.isArray(client.approvalLinks) ? client.approvalLinks : [{type:"Vídeo",label:"",url:""}],
    approvalImages:Array.isArray(client.approvalImages) ? client.approvalImages : [],
    plans:Array.isArray(client.plans) ? client.plans : [],
  };
}

function normalizarPlanoSupabase(row,index=0){
  const conteudo = parseSupabaseConteudo(row.conteudo);
  const savedClient = conteudo?.client || conteudo?.cliente || null;
  const createdAt = row.created_at || new Date().toISOString();
  const plan = extractPlanFromConteudo(conteudo);
  const id = row.id ? String(row.id) : `supabase-row-${index}`;

  const baseClient = savedClient && typeof savedClient === "object"
    ? savedClient
    : {
        name:row.cliente || "Cliente sem nome",
        agency:"Coral Films",
        niche:row.nicho || "",
        instagram:"",
        month:new Date(createdAt).getMonth()+1,
        year:new Date(createdAt).getFullYear(),
        notes:row.objetivo || "",
        extra:"",
        links:[{label:"",url:""}],
        images:[],
        approvalLinks:[{type:"Vídeo",label:"",url:""}],
        approvalImages:[],
        plans:[],
      };

  const planRecord = plan ? {
    id:`plan-${id}`,
    createdAt,
    month:baseClient.month || new Date(createdAt).getMonth()+1,
    year:baseClient.year || new Date(createdAt).getFullYear(),
    plan
  } : null;

  const plans = Array.isArray(baseClient.plans) ? [...baseClient.plans] : [];
  if(planRecord && !plans.some(p=>String(p.id)===String(planRecord.id))){
    plans.push(planRecord);
  }

  return {
    ...baseClient,
    id,
    supabaseId:row.id,
    name:baseClient.name || row.cliente || "Cliente sem nome",
    niche:baseClient.niche || row.nicho || "",
    notes:baseClient.notes || row.objetivo || "",
    month:baseClient.month || new Date(createdAt).getMonth()+1,
    year:baseClient.year || new Date(createdAt).getFullYear(),
    links:Array.isArray(baseClient.links) ? baseClient.links : [{label:"",url:""}],
    images:Array.isArray(baseClient.images) ? baseClient.images : [],
    approvalLinks:Array.isArray(baseClient.approvalLinks) ? baseClient.approvalLinks : [{type:"Vídeo",label:"",url:""}],
    approvalImages:Array.isArray(baseClient.approvalImages) ? baseClient.approvalImages : [],
    plans,
    lastPlan:baseClient.lastPlan || plan || null,
    lastPlanId:baseClient.lastPlanId || planRecord?.id || null,
    importedFromSupabase:true,
    createdAt
  };
}

function mergeClientes(local=[],cloud=[]){
  const map = new Map();

  [...local, ...cloud].forEach((client)=>{
    if(!client) return;
    const key = client.supabaseId
      ? `db:${client.supabaseId}`
      : client.id
        ? `id:${client.id}`
        : `name:${String(client.name||"").trim().toLowerCase()}`;

    const prev = map.get(key);
    if(!prev){
      map.set(key, client);
      return;
    }

    const currentPlans = Array.isArray(prev.plans) ? prev.plans : [];
    const nextPlans = Array.isArray(client.plans) ? client.plans : [];
    map.set(key, {
      ...prev,
      ...client,
      plans:[...currentPlans, ...nextPlans].filter((p,idx,arr)=>arr.findIndex(x=>String(x.id)===String(p.id))===idx),
      lastPlan:client.lastPlan || prev.lastPlan,
      lastPlanId:client.lastPlanId || prev.lastPlanId,
    });
  });

  return Array.from(map.values()).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
}

function getLocalClients(k=STORAGE_KEY){
  const keys = [...new Set([STORAGE_KEY, k, ...OLD_STORAGE_KEYS].filter(Boolean))];
  for(const key of keys){
    const parsed = safeJsonParse(window.localStorage?.getItem(key));
    if(Array.isArray(parsed)) return parsed;
  }
  return [];
}

async function carregarPlanosSupabase(){
  if(!isSupabaseReady()) return [];

  try{
    const { data, error } = await supabase
      .from("planos")
      .select("id,cliente,nicho,objetivo,conteudo,created_at")
      .order("created_at", { ascending:false });

    if(error){
      console.error("Erro ao carregar planos do Supabase:", error);
      return [];
    }

    return (data || []).map(normalizarPlanoSupabase);
  }catch(error){
    console.error("Erro inesperado ao carregar planos do Supabase:", error);
    return [];
  }
}

async function salvarClienteSupabase(client, plano=null){
  if(!isSupabaseReady()){
    console.log("Supabase não configurado. Cliente salvo apenas no navegador.");
    return { ok:false, skipped:true };
  }

  try{
    const clientData = cleanClientForSupabase({
      ...client,
      lastPlan:plano || client?.lastPlan || null,
    });

    const payload = {
      cliente: clientData?.name || "Cliente sem nome",
      nicho: clientData?.niche || "",
      objetivo: plano?.strategy?.objective || clientData?.notes || "Plano de marketing mensal",
      conteudo: {
        __type:"coral_films_client",
        version:9,
        client:clientData,
        lastPlan:plano || clientData?.lastPlan || null
      }
    };

    const dbId = client?.supabaseId || (client?.importedFromSupabase ? client?.id : null);

    if(dbId && isCloudId(dbId)){
      const { data, error } = await supabase
        .from("planos")
        .update(payload)
        .eq("id", dbId)
        .select("id")
        .single();

      if(error){
        console.error("Erro ao atualizar cliente no Supabase:", error);
        return { ok:false, error };
      }

      console.log("Cliente atualizado no Supabase:", data);
      return { ok:true, id:data?.id || dbId, data, updated:true };
    }

    const { data, error } = await supabase
      .from("planos")
      .insert([{...payload, created_at:new Date().toISOString()}])
      .select("id")
      .single();

    if(error){
      console.error("Erro ao salvar cliente no Supabase:", error);
      return { ok:false, error };
    }

    console.log("Cliente salvo no Supabase com sucesso:", data);
    return { ok:true, id:data?.id, data };
  }catch(error){
    console.error("Erro inesperado ao salvar cliente no Supabase:", error);
    return { ok:false, error };
  }
}

async function salvarPlanoSupabase(client, plano){
  return salvarClienteSupabase(client, plano);
}

async function excluirPlanoSupabase(id){
  if(!isSupabaseReady() || !id || !isCloudId(id)) return { ok:false, skipped:true };

  const { error } = await supabase
    .from("planos")
    .delete()
    .eq("id", id);

  if(error){
    console.error("Erro ao deletar:", error);
    return { ok:false, error };
  }

  console.log("Cliente deletado");
  return { ok:true };
}
async function dbGet(k=STORAGE_KEY){
  try{
    const local = getLocalClients(k);
    const cloudClients = await carregarPlanosSupabase();

    if(cloudClients.length){
      const merged = mergeClientes(local, cloudClients);
      try{ window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(merged)); }catch(error){ console.log("Erro ao atualizar cache local:", error); }
      return merged;
    }

    if(local.length) return local;

    if(window.storage?.get){
      const keys = [...new Set([STORAGE_KEY, k, ...OLD_STORAGE_KEYS].filter(Boolean))];
      for(const key of keys){
        const r = await window.storage.get(key);
        const parsed = safeJsonParse(r?.value);
        if(Array.isArray(parsed)) return parsed;
      }
    }
    return [];
  }catch(error){
    console.log("Erro ao carregar clientes:", error);
    return [];
  }
}
async function dbSet(k=STORAGE_KEY,v=[]){
  const data = JSON.stringify(v);

  try{
    window.localStorage?.setItem(STORAGE_KEY,data);
    if(k && k !== STORAGE_KEY) window.localStorage?.setItem(k,data);
    if(window.storage?.set) await window.storage.set(STORAGE_KEY,data);
    return {ok:true};
  }catch(error){
    console.log("Erro ao salvar clientes localmente:", error);

    try{
      const light = v.map(c=>({
        ...c,
        images:[],
        approvalImages:[],
        _storageWarning:"As imagens foram removidas do salvamento local porque estavam pesadas demais. Use links do Drive para materiais finais muito grandes."
      }));
      const lightData = JSON.stringify(light);
      window.localStorage?.setItem(STORAGE_KEY,lightData);
      if(k && k !== STORAGE_KEY) window.localStorage?.setItem(k,lightData);
      return {ok:false,fallback:true,message:"Clientes salvos sem imagens porque o armazenamento do navegador ficou cheio."};
    }catch(error2){
      console.log("Fallback de salvamento também falhou:", error2);
      return {ok:false,fallback:false,message:error2?.message||"Erro local"};
    }
  }
}

function readFileAsDataURL(file){
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onload=()=>res(fr.result);
    fr.onerror=rej;
    fr.readAsDataURL(file);
  });
}

async function compressImageFile(file,maxSize=1280,quality=.78){
  const original = await readFileAsDataURL(file);
  if(!file.type?.startsWith("image/") || file.type === "image/gif"){
    return {name:file.name,data:original};
  }
  return new Promise((res)=>{
    const img = new Image();
    img.onload=()=>{
      try{
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0,w,h);
        const data = canvas.toDataURL("image/jpeg",quality);
        res({name:file.name.replace(/\.[^.]+$/,"") + ".jpg",data,compressed:true});
      }catch{
        res({name:file.name,data:original});
      }
    };
    img.onerror=()=>res({name:file.name,data:original});
    img.src=original;
  });
}

// ─── PDF / Impressão Premium ───────────────────────────────────────────────────
const esc = (v)=>String(v??"").replace(/[&<>'"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const arr = (v)=>Array.isArray(v)?v:[];

function openPremiumPdf(client,plan,mode="plan"){
  if(!client||!plan) return alert("Gere ou abra um plano antes de criar o PDF.");
  const month = MONTHS[(client.month||1)-1] || "Mês";
  const approvalImages = arr(client.approvalImages);
  const approvalLinks = arr(client.approvalLinks).filter(l=>l.url);
  const refImages = arr(client.images);
  const finalMode = mode === "approval";
  const hero = approvalImages[0]?.data || refImages[0]?.data || "";
  const safeName = esc(client.name || "Cliente");
  const safeAgency = esc(client.agency || "Coral Films");
  const title = finalMode ? "PLANO FINAL DE APROVAÇÃO" : "PLANEJAMENTO DE CONTEÚDO DIGITAL";
  const subtitle = finalMode ? "Plano mensal + artes e vídeos produzidos para aprovação" : "Plano mensal para alinhamento estratégico e aprovação de conteúdo";
  const normalizeUrl = (url)=>{
    const raw = String(url||"").trim();
    if(!raw) return "#";
    if(/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  };
  const imageCards = (imgs)=>imgs.map((img,i)=>`<div class="media-card"><img src="${img.data}"/><div class="media-tag">ARTE ${String(i+1).padStart(2,"0")}</div></div>`).join("");
  const linkCards = (links)=>links.map((l,i)=>{
    const href = normalizeUrl(l.url);
    return `<a class="link-card" href="${esc(href)}" target="_blank" rel="noreferrer"><div class="link-top"><b>${esc(l.type||"Material")} ${String(i+1).padStart(2,"0")}</b><span>${esc(l.label||"Link de aprovação")}</span></div><div class="open-link">Abrir material ↗</div><small>${esc(href)}</small></a>`;
  }).join("");
  const calendar = arr(plan.calendar).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.content)}</td><td>${esc(x.format)}</td><td>${esc(x.pillar)}</td></tr>`).join("");
  const reels = arr(plan.reels).map((r,i)=>`
    <section class="page page-inner">
      <div class="page-no">${String(i+4).padStart(2,"0")}</div>
      <div class="section-head"><span class="eyebrow">REELS ${String(i+1).padStart(2,"0")}</span><h2>${esc(r.title)}</h2></div>
      <div class="grid two equal">
        <div class="panel glass"><h3>Objetivo</h3><p>${esc(r.objective)}</p><h3>Legenda sugerida</h3><p>${esc(r.caption)}</p><h3>CTA</h3><p>${esc(r.cta)}</p></div>
        <div class="panel glass"><h3>Estrutura do vídeo</h3><ol>${arr(r.structure).map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>
      </div>
      <div class="footer"><span>Roteiro criativo</span><span>${safeAgency}</span></div>
    </section>`).join("");
  const goals = arr(plan.goals).map(g=>`<div class="goal"><b>${esc(g.icon)} ${esc(g.title)}</b><span>${esc(g.desc)}</span></div>`).join("");
  const approvalsCount = approvalImages.length + approvalLinks.length;
  const materialsSection = finalMode
    ? `<div class="media-grid">${imageCards(approvalImages)}</div>` +
      (approvalImages.length === 0 ? `<p class="muted" style="margin-top:5mm">Nenhuma arte final foi anexada ainda.</p>` : "") +
      `<div style="height:8mm"></div><h3>Links dos vídeos e arquivos</h3><div class="link-list">${linkCards(approvalLinks)}</div>` +
      (approvalLinks.length === 0 ? `<p class="muted" style="margin-top:4mm">Nenhum link final foi cadastrado ainda.</p>` : "")
    : `<div class="media-grid">${imageCards(refImages)}</div>` +
      (refImages.length === 0 ? `<p class="muted" style="margin-top:5mm">Nenhuma referência visual foi anexada ainda.</p>` : "");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${safeName} - ${title}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap');
    @page{size:A4 portrait;margin:0}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#0a0a0a;color:#f4f4f5;font-family:'Inter',Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    a{color:inherit;text-decoration:none}
    .printbar{position:sticky;top:0;z-index:99;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 18px;background:#0f0f10;border-bottom:1px solid #2b2b2b}
    .printbar .hint{font-size:12px;color:#d4d4d8;line-height:1.45}
    .printbar .hint b{color:#f97316}.print-actions{display:flex;gap:8px;flex-wrap:wrap}
    .pb-btn{background:#f97316;color:#111;border:none;padding:10px 14px;border-radius:10px;font-weight:800;cursor:pointer;font-size:12px;letter-spacing:.4px}
    .pb-btn.alt{background:#171717;color:#fff;border:1px solid #323232}
    .doc{padding:12px 0 28px}
    .page{width:210mm;min-height:297mm;margin:0 auto 12px;background:#090909;position:relative;overflow:hidden;box-shadow:0 18px 60px rgba(0,0,0,.28)}
    .page-inner{padding:17mm 16mm 16mm}
    .page::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top right, rgba(249,115,22,.18), transparent 32%),linear-gradient(180deg,#111 0%,#090909 75%)}
    .page::after{content:"";position:absolute;inset:8mm;border:1px solid rgba(249,115,22,.17);pointer-events:none;border-radius:14px}
    .cover-page{display:grid;grid-template-columns:1.02fr .98fr;min-height:297mm}
    .cover-copy,.cover-visual{position:relative;z-index:1}
    .cover-copy{padding:20mm 16mm 18mm 18mm;display:flex;flex-direction:column;justify-content:space-between}
    .brand{display:flex;align-items:center;gap:12px;margin-bottom:10mm}
    .brand-logo{width:42px;height:42px;object-fit:contain;mix-blend-mode:screen;filter:brightness(1.15)}
    .brand-logo-text{width:42px;height:42px;border-radius:12px;border:1px solid rgba(0,240,255,.38);background:linear-gradient(135deg,#071013,#0d0d0d);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;letter-spacing:1px;box-shadow:0 0 18px rgba(0,240,255,.14)}
    .brand-text strong{display:block;color:#fff;font-size:13px;letter-spacing:3.6px;text-transform:uppercase}
    .brand-text span{display:block;color:#a1a1aa;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin-top:3px}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.3);color:#f97316;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:8mm}
    .cover-title{font-family:'Space Grotesk','Inter',sans-serif;font-size:46px;line-height:.95;letter-spacing:-1.8px;text-transform:uppercase;margin:0 0 5mm;color:#fff;max-width:88%}
    .cover-subtitle{font-size:14px;line-height:1.75;color:#d4d4d8;max-width:88%;margin:0 0 8mm}
    .client-block{display:grid;gap:10px;padding:16px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);max-width:88%}
    .client-name{font-size:24px;font-weight:900;letter-spacing:-.6px;color:#fff;margin:0}
    .client-meta,.client-meta span{font-size:11px;color:#c9c9cf;letter-spacing:1.8px;text-transform:uppercase}
    .chip-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .chip{padding:8px 12px;border-radius:999px;border:1px solid rgba(249,115,22,.18);background:rgba(255,255,255,.03);color:#f4f4f5;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
    .impact-box{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px;max-width:88%}
    .impact-item{padding:14px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
    .impact-item b{display:block;color:#fff;font-size:12px;margin-bottom:4px}.impact-item span{color:#b5b5bc;font-size:12px;line-height:1.45}
    .cover-visual{padding:16mm 16mm 16mm 0;display:flex;align-items:center;justify-content:center}
    .hero-frame{width:100%;height:100%;min-height:260mm;border-radius:26px;overflow:hidden;border:1px solid rgba(249,115,22,.22);background:linear-gradient(180deg,#171717,#0f0f0f);position:relative;display:flex;align-items:flex-end;justify-content:flex-start}
    .hero-frame::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.55) 65%,rgba(0,0,0,.72));z-index:1}
    .hero-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .hero-overlay{position:relative;z-index:2;padding:18px 18px 20px;display:grid;gap:6px}
    .hero-overlay .eyebrow{color:#f97316}.hero-overlay strong{font-size:24px;line-height:1.05;max-width:85%}.hero-overlay span{font-size:12px;color:#ddd;max-width:85%;line-height:1.5}
    .hero-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:28px;color:#8b8b94;font-size:15px;line-height:1.6}
    .page-no{position:absolute;top:16mm;right:16mm;color:#5e5e66;font-size:12px;font-weight:800;letter-spacing:2px}
    .section-head{position:relative;z-index:1;margin-bottom:9mm}
    .eyebrow{display:block;color:#f97316;font-size:11px;font-weight:800;letter-spacing:2.8px;text-transform:uppercase;margin-bottom:3mm}
    h2{margin:0;font-family:'Space Grotesk','Inter',sans-serif;font-size:30px;line-height:1.03;letter-spacing:-1px;text-transform:uppercase;color:#fff}
    h3{color:#f97316;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 3mm}
    p{margin:0 0 4.2mm;font-size:14px;line-height:1.72;color:#dbdbde}
    .grid{display:grid;gap:8mm;position:relative;z-index:1}.two{grid-template-columns:1fr 1fr}.three{grid-template-columns:repeat(3,1fr)}.equal{align-items:stretch}
    .panel,.goal,.stat-card,.link-card,.media-card,.summary-card{border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.08);padding:16px}
    .glass{backdrop-filter: blur(2px)}
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;position:relative;z-index:1}
    .card{border-radius:18px;background:linear-gradient(180deg,rgba(249,115,22,.12),rgba(255,255,255,.03));border:1px solid rgba(249,115,22,.22);padding:16px;min-height:53mm}
    .card b{display:block;color:#fff;font-size:13px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.8px}
    .card span,.card p{font-size:13px;color:#dfdfdf;line-height:1.6}
    .summary-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:8mm;position:relative;z-index:1}
    .summary-list{display:grid;gap:10px}.summary-card b{display:block;color:#fff;font-size:13px;margin-bottom:4px}.summary-card span{display:block;color:#c9c9cf;font-size:13px;line-height:1.55}
    .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stat-card strong{display:block;color:#fff;font-size:30px;line-height:1;margin-bottom:4px}.stat-card span{display:block;font-size:11px;color:#a1a1aa;letter-spacing:1.8px;text-transform:uppercase}
    table{width:100%;border-collapse:collapse;position:relative;z-index:1;border-radius:16px;overflow:hidden;background:#101011}
    thead tr{background:rgba(249,115,22,.14)}th,td{padding:4mm;border-bottom:1px solid rgba(255,255,255,.07);text-align:left;vertical-align:top;font-size:12px;color:#efeff1}th{color:#f97316;text-transform:uppercase;letter-spacing:1.8px;font-size:10px}
    tbody tr:nth-child(even){background:rgba(255,255,255,.02)}
    ol{padding-left:18px;margin:0}li{font-size:14px;line-height:1.7;margin-bottom:6px;color:#e2e2e5}
    .goal{display:grid;gap:6px;margin-bottom:10px}.goal b{display:block;color:#fff;font-size:13px}.goal span{color:#d8d8dc;font-size:13px;line-height:1.6}
    .media-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7mm;position:relative;z-index:1}.media-card{padding:10px}.media-card img{width:100%;height:88mm;object-fit:cover;border-radius:12px;display:block}.media-tag{font-size:10px;font-weight:800;letter-spacing:2px;color:#f97316;text-transform:uppercase;margin-top:8px}
    .link-list{display:grid;gap:10px;position:relative;z-index:1}.link-card{display:block}.link-top{display:grid;gap:4px;margin-bottom:10px}.link-card b{color:#fff;font-size:13px;letter-spacing:1px;text-transform:uppercase}.link-card span{display:block;color:#d0d0d5;font-size:13px}.open-link{display:inline-flex;align-items:center;gap:6px;color:#f97316;font-size:12px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;margin-bottom:8px}.link-card small{display:block;color:#9898a1;font-size:11px;word-break:break-all;line-height:1.5}
    .cta-box{position:relative;z-index:1;padding:18px;border-radius:20px;background:linear-gradient(135deg,rgba(249,115,22,.17),rgba(255,255,255,.02));border:1px solid rgba(249,115,22,.24)}
    .status{font-family:'Space Grotesk','Inter',sans-serif;font-size:36px;line-height:1.02;letter-spacing:-1px;color:#fff;margin:0 0 5mm;text-transform:uppercase}
    .status-mark{display:inline-flex;padding:8px 14px;border-radius:999px;background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.28);color:#f97316;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:5mm}
    .footer{position:absolute;left:16mm;right:16mm;bottom:13mm;color:#7d7d86;font-size:10px;letter-spacing:2px;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;z-index:2}
    .muted{color:#9e9ea7}

    @media screen and (max-width:760px){
      .doc{padding:0;background:#090909}
      .printbar{position:sticky;top:0;flex-direction:column;align-items:stretch;padding:12px;gap:10px}
      .print-actions{display:grid;grid-template-columns:1fr;gap:8px}.pb-btn{width:100%;padding:12px 14px}
      .page{width:100%;min-height:auto;margin:0;box-shadow:none;border-bottom:1px solid rgba(255,255,255,.08)}
      .page-inner{padding:24px 16px 72px}
      .page::after{inset:8px;border-radius:12px}.page-no{top:14px;right:14px;font-size:10px}
      .cover-page{display:block;min-height:auto}.cover-copy{padding:28px 18px 24px;min-height:auto}
      .brand{margin-bottom:22px}.pill{margin-bottom:18px}.cover-title{font-size:34px;line-height:1;max-width:100%;letter-spacing:-1px}
      .cover-subtitle,.client-block,.impact-box{max-width:100%}.client-name{font-size:22px}
      .impact-box,.summary-grid,.stat-grid,.cards,.grid.two,.grid.three,.media-grid{grid-template-columns:1fr}
      .cover-visual{padding:0 16px 72px;min-height:380px}.hero-frame{min-height:380px;border-radius:20px}
      h2{font-size:25px}.status{font-size:28px}.card{min-height:auto}.panel,.goal,.stat-card,.link-card,.media-card,.summary-card{border-radius:14px}
      table{display:block;overflow-x:auto;border-radius:14px}th,td{min-width:128px;padding:12px;font-size:12px}
      .media-card img{height:auto;max-height:360px}.footer{left:16px;right:16px;bottom:18px;font-size:8px;gap:8px}
      .link-card small{font-size:10px}.open-link{font-size:11px}
    }
    @media print{.printbar{display:none}.doc{padding:0}.page{margin:0;box-shadow:none;page-break-after:always}}
  </style></head><body>
    <div class="printbar">
      <div class="hint"><b>PDF final clicável:</b> os links abaixo agora são âncoras reais. Salve usando <b>Imprimir → Salvar como PDF</b> para manter os links clicáveis.</div>
      <div class="print-actions"><button class="pb-btn" onclick="window.print()">Salvar / Imprimir PDF</button><button class="pb-btn alt" onclick="window.close()">Fechar</button></div>
    </div>
    <div class="doc">
      <section class="page cover-page">
        <div class="cover-copy">
          <div>
            <div class="brand"><img class="brand-logo" src="${CORAL_LOGO}" alt="Coral Hub"/><div class="brand-text"><strong>${safeAgency}</strong><span>Conteúdo • Vídeo • Estratégia</span></div></div>
            <div class="pill">${finalMode ? "Aprovação de Conteúdo" : "Planejamento do Mês"}</div>
            <h1 class="cover-title">${title}</h1>
            <p class="cover-subtitle">${esc(subtitle)}</p>
            <div class="client-block">
              <div>
                <div class="client-meta">Cliente</div>
                <div class="client-name">${safeName}</div>
              </div>
              <div class="client-meta">${esc(month)} ${esc(client.year)}${client.niche?` • ${esc(client.niche)}`:""}${client.instagram?` • @${esc(client.instagram)}`:""}</div>
              <div class="chip-row"><span class="chip">Autoridade</span><span class="chip">Conexão</span><span class="chip">Conversão</span></div>
            </div>
            <div class="impact-box">
              <div class="impact-item"><b>Material entregue</b><span>${finalMode?`${approvalsCount} item(ns) para aprovação`:`Plano mensal estruturado para validação`}</span></div>
              <div class="impact-item"><b>Foco do projeto</b><span>${finalMode?`Aprovar conteúdos antes da publicação`:`Organizar estratégia, calendário e produção`}</span></div>
            </div>
          </div>
          <div class="footer"><span>Documento executivo</span><span>01</span></div>
        </div>
        <div class="cover-visual">
          <div class="hero-frame">
            ${hero?`<img src="${hero}" alt="capa"/>`:`<div class="hero-empty">Adicione uma imagem do cliente, arte ou referência visual para criar uma capa ainda mais impactante.</div>`}
            <div class="hero-overlay"><span class="eyebrow">Apresentação premium</span><strong>${finalMode?"Conteúdos prontos para aprovação":"Planejamento criativo do mês"}</strong><span>${finalMode?"Revise as artes e os links de vídeos desta proposta final antes da publicação.":"Visual moderno, estratégia clara e organização profissional para impressionar o cliente."}</span></div>
          </div>
        </div>
      </section>

      <section class="page page-inner">
        <div class="page-no">02</div>
        <div class="section-head"><span class="eyebrow">Resumo executivo</span><h2>Visão estratégica do projeto</h2></div>
        <div class="summary-grid">
          <div class="summary-list">
            <div class="summary-card"><b>Objetivo do mês</b><span>${esc(plan.strategy?.objective)}</span></div>
            <div class="summary-card"><b>Autoridade</b><span>${esc(plan.strategy?.pillar1)}</span></div>
            <div class="summary-card"><b>Conexão</b><span>${esc(plan.strategy?.pillar2)}</span></div>
            <div class="summary-card"><b>Conversão</b><span>${esc(plan.strategy?.pillar3)}</span></div>
          </div>
          <div class="summary-list">
            <div class="stat-grid">
              <div class="stat-card"><strong>${arr(plan.calendar).length}</strong><span>Conteúdos</span></div>
              <div class="stat-card"><strong>${arr(plan.reels).length}</strong><span>Reels</span></div>
              <div class="stat-card"><strong>${approvalsCount}</strong><span>${finalMode?"Materiais":"Assets"}</span></div>
            </div>
            <div class="cta-box"><h3>Direção de impacto</h3><p>${finalMode?"Este documento foi montado para facilitar a aprovação final do cliente, com visual premium e acesso rápido às artes e vídeos.":"Este planejamento foi estruturado para aprovar rapidamente a linha criativa do mês e acelerar a produção das peças."}</p></div>
          </div>
        </div>
        <div class="footer"><span>Resumo estratégico</span><span>${safeAgency}</span></div>
      </section>

      <section class="page page-inner">
        <div class="page-no">03</div>
        <div class="section-head"><span class="eyebrow">Estratégia do mês</span><h2>Objetivos e pilares</h2></div>
        <p>${esc(plan.strategy?.objective)}</p>
        <div class="cards"><div class="card"><b>Reconhecer a marca</b><p>${esc(plan.strategy?.goal1)}</p></div><div class="card"><b>Gerar desejo</b><p>${esc(plan.strategy?.goal2)}</p></div><div class="card"><b>Aumentar conversão</b><p>${esc(plan.strategy?.goal3)}</p></div></div>
        <div style="height:8mm"></div>
        <div class="grid three"><div class="panel glass"><h3>Autoridade</h3><p>${esc(plan.strategy?.pillar1)}</p></div><div class="panel glass"><h3>Conexão</h3><p>${esc(plan.strategy?.pillar2)}</p></div><div class="panel glass"><h3>Conversão</h3><p>${esc(plan.strategy?.pillar3)}</p></div></div>
        <div class="footer"><span>Planejamento mensal</span><span>${safeAgency}</span></div>
      </section>

      <section class="page page-inner">
        <div class="page-no">04</div>
        <div class="section-head"><span class="eyebrow">Calendário editorial</span><h2>${esc(month)} ${esc(client.year)}</h2></div>
        <table><thead><tr><th>Data</th><th>Conteúdo</th><th>Formato</th><th>Pilar</th></tr></thead><tbody>${calendar}</tbody></table>
        <div class="footer"><span>Calendário de conteúdo</span><span>${safeAgency}</span></div>
      </section>
      ${reels}
      <section class="page page-inner">
        <div class="page-no">${String(arr(plan.reels).length+4).padStart(2,"0")}</div>
        <div class="section-head"><span class="eyebrow">Metas do mês</span><h2>Resultados esperados</h2></div>
        ${goals}
        <div style="height:7mm"></div>
        <div class="panel glass"><h3>Cronograma de produção</h3><p><strong>Captação:</strong> gravação dos conteúdos definidos no calendário.</p><p><strong>Edição:</strong> cortes, legendas, tratamento visual e adequação por formato.</p><p><strong>Entrega:</strong> materiais finais enviados para aprovação.</p><p><strong>Publicação:</strong> conteúdos publicados conforme calendário aprovado.</p></div>
        <div class="footer"><span>Metas e produção</span><span>${safeAgency}</span></div>
      </section>

      <section class="page page-inner">
        <div class="page-no">${String(arr(plan.reels).length+5).padStart(2,"0")}</div>
        <div class="section-head"><span class="eyebrow">${finalMode?"Aprovação final":"Referências visuais"}</span><h2>${finalMode?"Artes e vídeos para aprovação":"Direção visual do projeto"}</h2></div>
        ${materialsSection}
        <div class="footer"><span>${finalMode?"Materiais para aprovação":"Direção de arte"}</span><span>${safeAgency}</span></div>
      </section>

      <section class="page page-inner">
        <div class="page-no">${String(arr(plan.reels).length+6).padStart(2,"0")}</div>
        <div class="status-mark">${finalMode?"Aguardando feedback do cliente":"Pronto para validação"}</div>
        <div class="status">${finalMode?"Documento final para aprovação":"Planejamento pronto para alinhar a produção"}</div>
        <p>${finalMode?"Este PDF reúne estratégia, calendário, artes e links dos vídeos produzidos. O cliente pode revisar tudo em um material único, moderno e objetivo.":"Após aprovação deste material, a produção das artes e vídeos pode seguir com mais clareza, consistência visual e velocidade."}</p>
        <div style="height:10mm"></div>
        <div class="panel glass"><h3>Próximos passos</h3><p>${finalMode?"1. Revisar artes anexadas. 2. Abrir os links clicáveis dos vídeos. 3. Aprovar ou solicitar ajustes. 4. Publicar após validação final.":"1. Validar estratégia. 2. Aprovar calendário. 3. Produzir peças e vídeos. 4. Montar PDF final de aprovação com os materiais prontos."}</p></div>
        <div style="height:8mm"></div>
        <div class="cta-box"><h3>${safeAgency}</h3><p>Transformando negócios locais em marcas que vendem através do conteúdo.</p></div>
        <div class="footer"><span>Documento apresentado por ${safeAgency}</span><span>Fim</span></div>
      </section>
    </div>
    <script>setTimeout(function(){try{window.focus()}catch(e){}},300);</script>
  </body></html>`;
  const w = window.open("","_blank");
  if(!w) return alert("Permita pop-ups para gerar o PDF.");
  w.document.open();
  w.document.write(html);
  w.document.close();
}

// ─── OpenRouter API ────────────────────────────────────────────────────────────
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

async function callOpenRouter(prompt){
  try{
    if(!OPENROUTER_API_KEY){
      throw new Error("VITE_OPENROUTER_API_KEY não configurada no .env local ou nas Environment Variables da Vercel.");
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions",{
      method:"POST",
      headers:{
        Authorization:`Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"openai/gpt-3.5-turbo",
        max_tokens:2500,
        messages:[
          {
            role:"user",
            content:prompt
          }
        ]
      })
    });

    if(!res.ok){
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const d = await res.json();
    if(d.error) throw new Error(d.error.message||"Erro retornado pela API");

    const text = d.choices?.[0]?.message?.content||"";
    if(!text) throw new Error("Resposta vazia da API");

    return text;
  }catch(e){
    throw new Error("Não foi possível gerar o plano agora. Verifique sua API Key, conexão e tente novamente. Detalhes: "+e.message);
  }
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const btn = (v="primary",sz="md") => ({
  padding: sz==="sm"?"6px 14px":sz==="lg"?"13px 32px":"9px 20px",
  borderRadius:4, cursor:"pointer", fontWeight:800,
  fontSize:sz==="sm"?11:sz==="lg"?14:12,
  letterSpacing:2, textTransform:"uppercase", fontFamily:"inherit",
  border: v==="ghost"?`1px solid ${C.border}`:v==="neon"?`1px solid ${C.neon}`:v==="danger"?`1px solid ${C.danger}`:"none",
  background: v==="primary"?C.orange:v==="ghost"||v==="neon"||v==="danger"?"transparent":C.surface,
  color: v==="primary"?"#000":v==="neon"?C.neon:v==="danger"?C.danger:C.white,
  boxShadow: v==="primary"?C.orangeG:"none",
  transition:"all .15s",
});
const inp = {width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:"9px 13px",color:C.white,fontSize:13,fontFamily:"inherit",outline:"none"};
const lbl = {fontSize:10,fontWeight:800,letterSpacing:3,color:C.dim,textTransform:"uppercase",display:"block",marginBottom:6};
const card = {background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:20};
const ocrd = {background:"#100e0a",border:`1px solid #f9731633`,borderRadius:8,padding:20};
const ncrd = {background:"#0a0f10",border:`1px solid #00f0ff22`,borderRadius:8,padding:20};

// ─── Logo original da marca ───────────────────────────────────────────────────
function Logo({size=120,glow=false}){
  return(
    <div style={{
      width:size, height:size, position:"relative",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <img
        src={CORAL_LOGO}
        alt="Coral Hub"
        style={{
          width:"100%", height:"100%", objectFit:"contain",
          mixBlendMode:"screen",
          filter: glow
            ? "brightness(1.12) drop-shadow(0 0 14px #00f0ff) drop-shadow(0 0 36px #00f0ff66)"
            : "brightness(1.08)",
        }}
      />
    </div>
  );
}

// ─── LoadingScreen ─────────────────────────────────────────────────────────────
function LoadingScreen({onDone}){
  const messages = ["Inicializando sistema...","Carregando dados...","Conectando IA..."];
  const [step,setStep]=useState(0);
  const [leaving,setLeaving]=useState(false);

  useEffect(()=>{
    const timers=[
      setTimeout(()=>setStep(1),780),
      setTimeout(()=>setStep(2),1580),
      setTimeout(()=>setLeaving(true),2450),
      setTimeout(onDone,3000),
    ];
    return()=>timers.forEach(clearTimeout);
  },[onDone]);

  return(
    <div className={`loading-screen ${leaving ? "is-leaving" : ""}`}>
      <div className="loading-grid"/>
      <div className="particle-field">
        {Array.from({length:24}).map((_,i)=><span key={i} style={{"--i":i}}/>)}
      </div>

      <div className="loading-core">
        <div className="loading-logo-ring">
          <Logo size={126} glow/>
        </div>

        <div className="loading-copy">
          <strong>CORAL HUB</strong>
          <span>Sistema Inteligente de Gestão da Coral Films</span>
        </div>

        <div className="loading-status">
          {messages.map((msg,i)=>(
            <div key={msg} className={i===step ? "active" : i<step ? "done" : ""}>
              <span>{i<step ? "✓" : "•"}</span>{msg}
            </div>
          ))}
        </div>

        <div className="loading-bar">
          <span style={{width:step===0?"28%":step===1?"62%":leaving?"100%":"86%"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({screen,onBack,onNew,onCommercial,onNavigate}){
  const [drawerOpen,setDrawerOpen] = useState(false);
  const isCommercial = String(screen||"").startsWith("commercial");

  const closeAndRun = (fn)=>{
    setDrawerOpen(false);
    if(typeof fn === "function") fn();
  };

  const desktopButtons = (
    <>
      {screen!=="list"&&<button className="btn-glass" onClick={()=>closeAndRun(onBack)}>← Dashboard</button>}
      {isCommercial&&(
        <>
          <button className="btn-glass" onClick={()=>closeAndRun(()=>onNavigate("commercial-leads"))}>Leads</button>
          <button className="btn-glass" onClick={()=>closeAndRun(()=>onNavigate("commercial-proposals"))}>Propostas</button>
          <button className="btn-glass" onClick={()=>closeAndRun(()=>onNavigate("commercial-services"))}>Serviços</button>
        </>
      )}
      {screen==="list"&&<button className="btn-glass" onClick={()=>closeAndRun(onCommercial)}>Comercial</button>}
      {screen==="list"&&<button className="btn-new-client" onClick={()=>closeAndRun(onNew)}>+ Novo Cliente</button>}
    </>
  );

  const drawerButtons = (
    <>
      {screen!=="list"&&<button className="btn-glass w-full" onClick={()=>closeAndRun(onBack)}>← Dashboard</button>}
      {isCommercial&&(
        <>
          <button className="btn-glass w-full" onClick={()=>closeAndRun(()=>onNavigate("commercial-leads"))}>Leads</button>
          <button className="btn-glass w-full" onClick={()=>closeAndRun(()=>onNavigate("commercial-proposals"))}>Propostas</button>
          <button className="btn-glass w-full" onClick={()=>closeAndRun(()=>onNavigate("commercial-services"))}>Serviços</button>
        </>
      )}
      {screen==="list"&&<button className="btn-glass w-full" onClick={()=>closeAndRun(onCommercial)}>Comercial</button>}
      {screen==="list"&&<button className="btn-new-client w-full" onClick={()=>closeAndRun(onNew)}>+ Novo Cliente</button>}
    </>
  );

  return(
    <header className="app-header w-full sticky top-0 z-50">
      <div className="header-brand min-w-0">
        <div className="header-logo shrink-0">
          <img src={CORAL_LOGO} alt="Coral Hub"/>
        </div>
        <div className="min-w-0">
          <strong>{APP_NAME.toUpperCase()}</strong>
          <span>{APP_SUBTITLE}</span>
        </div>
      </div>

      <nav className="desktop-actions" aria-label="Menu principal">
        {desktopButtons}
      </nav>

      <button
        className="mobile-menu-toggle"
        aria-label={drawerOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={drawerOpen}
        onClick={()=>setDrawerOpen(v=>!v)}
      >
        {drawerOpen ? "×" : "☰"}
      </button>

      {drawerOpen&&(
        <div className="mobile-drawer">
          <div className="mobile-drawer-head">
            <span>Menu</span>
            <small>{APP_VERSION}</small>
          </div>
          <div className="mobile-drawer-actions">
            {drawerButtons}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── ClientCard ────────────────────────────────────────────────────────────────
function ClientCard({plano,index,onGenerate,onOpen,onEdit,onDelete}){
  const month = MONTHS[(plano.month||1)-1]?.slice(0,3) || "Mês";
  const hasPlan = plano.lastPlan || ((plano.plans||[]).length>0);
  const linksCount = (plano.links||[]).filter(l=>l.url).length;
  const imagesCount = (plano.images||[]).length;
  const createdAt = plano.createdAt || plano.created_at || null;
  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleDateString("pt-BR")
    : `${month} ${plano.year}`;

  return(
    <article className="client-card" style={{animationDelay:`${index*.045}s`}}>
      <div className="client-card-glow"/>
      <div className="client-card-head">
        <div>
          <h3>{plano.name || "Cliente sem nome"}</h3>
          <span>{plano.niche || "Sem nicho definido"}</span>
        </div>
        <div className="client-date">{dateLabel}</div>
      </div>

      {plano.instagram&&<div className="client-instagram">@{plano.instagram}</div>}

      <div className="client-meta-row">
        <span>📅 {month} {plano.year}</span>
        {linksCount>0&&<span>🔗 {linksCount} link(s)</span>}
        {imagesCount>0&&<span>🖼 {imagesCount} img</span>}
      </div>

      <div className="client-divider"/>

      <div className="client-actions">
        <button className="btn-generate" onClick={()=>onGenerate(plano)}>⚡ Gerar Plano</button>
        {hasPlan&&<button className="btn-icon" title="Abrir plano salvo" onClick={()=>onOpen(plano)}>📄</button>}
        <button className="btn-icon btn-edit" title="Editar cliente" onClick={()=>onEdit(plano)}>✏️</button>
        <button className="btn-danger-modern" title="Excluir cliente" onClick={() => onDelete(plano.id)}>🗑</button>
      </div>
    </article>
  );
}

// ─── Tag ───────────────────────────────────────────────────────────────────────
function Tag({label,color}){
  return <span style={{background:color+"22",color,border:`1px solid ${color}55`,padding:"3px 10px",borderRadius:3,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>{label}</span>;
}

// ─── PlanView ──────────────────────────────────────────────────────────────────
function PlanView({client,plan,onRegen,onExportPlan,onExportFinal,onEditClient}){
  const [tab,setTab]=useState("strategy");
  const month=MONTHS[(client.month||1)-1];
  const tabs=[["strategy","📋 Estratégia"],["calendar","📅 Calendário"],["reels","🎬 Reels"],["goals","🎯 Metas"],["approval","✅ Aprovação"]];
  return(
    <div style={{maxWidth:"72rem",margin:"0 auto",padding:"24px 20px"}}>
      {/* hero card */}
      <div style={{...ocrd,marginBottom:18,background:"linear-gradient(135deg,#110d08,#0f0f0f)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:C.orange,opacity:.04,borderRadius:"50%",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,position:"relative"}}>
          <div>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:6}}>Planejamento Mensal</div>
            <h1 style={{fontSize:28,fontWeight:900,letterSpacing:-1,margin:0,marginBottom:4}}>{client.name}</h1>
            <div style={{fontSize:12,color:C.dim,fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>{month} {client.year}{client.niche?` · ${client.niche}`:""}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button style={btn("primary","sm")} onClick={onExportPlan}>📄 PDF Plano</button>
            <button style={btn("neon","sm")} onClick={onExportFinal}>✅ PDF Final</button>
            <button style={btn("ghost","sm")} onClick={onEditClient}>+ Artes/Vídeos</button>
            <button style={btn("ghost","sm")} onClick={onRegen}>↺ Regenerar</button>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap",position:"relative"}}>
          {[["🏆","Autoridade",C.white],["🤝","Conexão",C.orange],["🛒","Conversão",C.gold]].map(([ic,lb,cl])=>(
            <div key={lb} style={{background:cl+"11",border:`1px solid ${cl}33`,borderRadius:20,padding:"4px 13px",fontSize:11,fontWeight:700,color:cl,display:"flex",gap:5,alignItems:"center"}}>
              {ic} {lb}
            </div>
          ))}
        </div>
      </div>

      {/* tab bar */}
      <div style={{display:"flex",gap:3,marginBottom:18,background:C.surface,padding:4,borderRadius:6,border:`1px solid ${C.border}`}}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1,padding:"9px 4px",border:"none",borderRadius:4,cursor:"pointer",
            fontWeight:800,fontSize:10,letterSpacing:1,textTransform:"uppercase",fontFamily:"inherit",
            background:tab===id?C.orange:"transparent",
            color:tab===id?"#000":C.dim,
            transition:"all .2s",
          }}>{label}</button>
        ))}
      </div>

      {/* STRATEGY */}
      {tab==="strategy"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={ocrd}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:C.orange,textTransform:"uppercase",marginBottom:10}}>Objetivo Geral do Mês</div>
            <p style={{fontSize:14,lineHeight:1.9,color:C.white,margin:0}}>{plan.strategy?.objective}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            {[["🏆","RECONHECER A MARCA","goal1",C.white],["❤️","GERAR DESEJO","goal2",C.orange],["🛒","AUMENTAR CONVERSÃO","goal3",C.gold]].map(([ic,lb,k,cl])=>(
              <div key={k} style={{...card,borderTop:`3px solid ${cl}`}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:cl,textTransform:"uppercase",marginBottom:8}}>{ic} {lb}</div>
                <p style={{fontSize:12,color:C.white,lineHeight:1.7,margin:0}}>{plan.strategy?.[k]}</p>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            {[["Autoridade","pillar1",C.white],["Conexão","pillar2",C.orange],["Conversão","pillar3",C.gold]].map(([lb,k,cl])=>(
              <div key={k} style={{background:C.surface,border:`1px solid ${C.border}`,borderLeft:`3px solid ${cl}`,borderRadius:6,padding:14}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:cl,textTransform:"uppercase",marginBottom:6}}>Pilar · {lb}</div>
                <p style={{fontSize:12,color:C.dim,lineHeight:1.6,margin:0}}>{plan.strategy?.[k]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR */}
      {tab==="calendar"&&(
        <div style={{...card,overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
            <thead>
              <tr>{["Data","Conteúdo","Formato","Pilar"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:800,letterSpacing:2,color:C.dim,textTransform:"uppercase",borderBottom:`2px solid #f9731633`}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {(plan.calendar||[]).map((row,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                  <td style={{padding:"11px 14px",fontWeight:800,color:C.orange,fontSize:13}}>{row.date}</td>
                  <td style={{padding:"11px 14px",fontSize:13}}>{row.content}</td>
                  <td style={{padding:"11px 14px"}}><Tag label={row.format} color={FMT_C[row.format]||"#888"}/></td>
                  <td style={{padding:"11px 14px"}}><Tag label={row.pillar} color={PIL_C[row.pillar]||"#888"}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REELS */}
      {tab==="reels"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {(plan.reels||[]).map((reel,i)=>(
            <div key={i} style={{...card,borderLeft:`4px solid ${C.orange}`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                <div>
                  <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:C.orange,textTransform:"uppercase",marginBottom:4}}>Reels {String(i+1).padStart(2,"0")}</div>
                  <div style={{fontSize:18,fontWeight:900,marginBottom:10,letterSpacing:-.5}}>{reel.title}</div>
                  <div style={{fontSize:12,color:C.dim,lineHeight:1.7,marginBottom:14}}>{reel.objective}</div>
                  <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.dim,textTransform:"uppercase",marginBottom:8}}>Estrutura</div>
                  {(reel.structure||[]).map((s,si)=>(
                    <div key={si} style={{display:"flex",gap:8,marginBottom:6,fontSize:12,alignItems:"flex-start"}}>
                      <span style={{color:C.orange,fontWeight:900,flexShrink:0}}>▸</span>{s}
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{background:C.surface,borderLeft:`3px solid ${C.gold}`,borderRadius:6,padding:14}}>
                    <div style={{fontSize:10,fontWeight:800,color:C.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>💬 Legenda</div>
                    <div style={{fontSize:12,color:C.gold,fontStyle:"italic",lineHeight:1.7}}>"{reel.caption}"</div>
                  </div>
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:14}}>
                    <div style={{fontSize:10,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>CTA</div>
                    <div style={{fontSize:12,color:C.white,lineHeight:1.6}}>{reel.cta}</div>
                  </div>
                  <div style={{background:C.orange,borderRadius:4,padding:"10px",fontSize:12,fontWeight:900,color:"#000",textAlign:"center",letterSpacing:1,textTransform:"uppercase"}}>→ {reel.cta_text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GOALS */}
      {tab==="goals"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            {(plan.goals||[]).map((g,i)=>(
              <div key={i} style={{...ocrd,borderLeft:`4px solid ${C.orange}`}}>
                <div style={{fontSize:28,marginBottom:8}}>{g.icon}</div>
                <div style={{fontSize:11,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:C.orange,marginBottom:6}}>{g.title}</div>
                <div style={{fontSize:13,color:C.white,lineHeight:1.7}}>{g.desc}</div>
              </div>
            ))}
          </div>
          {(client.images||[]).length>0&&(
            <div style={card}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:C.orange,textTransform:"uppercase",marginBottom:14}}>🖼 Referências Visuais</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
                {client.images.map((img,i)=>(
                  <div key={i} style={{borderRadius:6,overflow:"hidden",aspectRatio:"1",border:`1px solid #f9731633`}}>
                    <img src={img.data} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="ref"/>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(client.links||[]).filter(l=>l.url).length>0&&(
            <div style={card}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:C.orange,textTransform:"uppercase",marginBottom:14}}>🔗 Links de Arquivos</div>
              {client.links.filter(l=>l.url).map((l,i)=>(
                <div key={i} style={{display:"flex",gap:12,padding:"9px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.dim,textTransform:"uppercase",minWidth:110,flexShrink:0}}>{l.label||"Arquivo"}</span>
                  <a href={l.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.neon,wordBreak:"break-all",textDecoration:"none"}}>{l.url}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPROVAL */}
      {tab==="approval"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={ocrd}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:C.orange,textTransform:"uppercase",marginBottom:10}}>Materiais finais para aprovação</div>
            <p style={{fontSize:13,color:C.dim,lineHeight:1.7,margin:0}}>Aqui entram as artes e links dos vídeos já produzidos. Depois clique em <b style={{color:C.orange}}>PDF Final</b> para enviar ao cliente aprovar.</p>
          </div>
          {(client.approvalImages||[]).length===0 && (client.approvalLinks||[]).filter(l=>l.url).length===0 ? (
            <div style={{...card,textAlign:"center",color:C.dim,fontSize:13}}>Nenhum material final cadastrado ainda. Clique em “+ Artes/Vídeos” para anexar imagens e links.</div>
          ) : (
            <>
              {(client.approvalImages||[]).length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
                  {client.approvalImages.map((img,i)=>(
                    <div key={i} style={{...card,padding:8}}>
                      <img src={img.data} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:6,marginBottom:8}}/>
                      <div style={{fontSize:10,color:C.orange,fontWeight:800,letterSpacing:2,textTransform:"uppercase"}}>Arte {String(i+1).padStart(2,"0")}</div>
                    </div>
                  ))}
                </div>
              )}
              {(client.approvalLinks||[]).filter(l=>l.url).length>0&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {(client.approvalLinks||[]).filter(l=>l.url).map((l,i)=>(
                    <div key={i} style={ncrd}>
                      <div style={{fontSize:10,color:C.neon,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{l.type||"Material"}</div>
                      <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>{l.label||`Material ${i+1}`}</div>
                      <a href={l.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:C.dim,wordBreak:"break-all"}}>{l.url}</a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Proteção contra tela preta ────────────────────────────────────────────────
class AppErrorBoundary extends React.Component{
  constructor(props){
    super(props);
    this.state={hasError:false,error:null};
  }

  static getDerivedStateFromError(error){
    return {hasError:true,error};
  }

  componentDidCatch(error,info){
    console.log("Erro capturado no app:", error, info);
  }

  render(){
    if(this.state.hasError){
      return (
        <div style={{minHeight:"100vh",background:"#080808",color:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Inter, Arial, sans-serif"}}>
          <div style={{maxWidth:520,background:"#181818",border:"1px solid #2a2a2a",borderRadius:14,padding:24}}>
            <div style={{fontSize:22,fontWeight:900,color:"#f97316",marginBottom:10}}>Erro ao abrir o app</div>
            <p style={{fontSize:14,lineHeight:1.7,color:"#d4d4d8",margin:"0 0 14px"}}>O app encontrou um erro e foi protegido para não ficar com a tela preta.</p>
            <pre style={{whiteSpace:"pre-wrap",fontSize:12,color:"#aaa",background:"#0f0f0f",padding:12,borderRadius:8,overflow:"auto"}}>{String(this.state.error?.message || this.state.error)}</pre>
            <button onClick={()=>window.location.reload()} style={{marginTop:14,padding:"10px 14px",border:0,borderRadius:8,background:"#f97316",color:"#111",fontWeight:900,cursor:"pointer"}}>Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App ───────────────────────────────────────────────────────────────────────

function CommercialHome({leads,services,proposals,onNavigate}){
  const openLeads = leads.filter(l=>!["Fechado","Perdido","Cliente Ativo"].includes(l.status)).length;
  const activeServices = services.filter(s=>s.ativo!==false).length;
  const totalProposalValue = proposals.reduce((sum,p)=>sum + toNumber(p.valorFinal || p.valorTabela),0);

  const menu = [
    {id:"commercial-leads",icon:"🎯",title:"Leads",desc:"Cadastre, filtre e acompanhe oportunidades comerciais.",kpi:`${openLeads} em aberto`},
    {id:"commercial-proposals",icon:"📄",title:"Propostas",desc:"Monte propostas com serviços, descontos e PDF premium.",kpi:moneyBR(totalProposalValue)},
    {id:"commercial-services",icon:"🧩",title:"Catálogo de Serviços",desc:"Gerencie serviços, valores padrão e descrições automáticas.",kpi:`${activeServices} ativos`}
  ];

  return(
    <div style={{maxWidth:"72rem",margin:"0 auto",padding:"28px 20px",animation:"fadeIn .35s ease-out"}}>
      <div style={{...ocrd,marginBottom:20,background:"linear-gradient(135deg,#110d08,#07101a)"}}>
        <div style={{fontSize:10,fontWeight:900,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:8}}>Módulo Comercial</div>
        <h1 style={{fontSize:30,fontWeight:950,letterSpacing:-1,margin:"0 0 8px"}}>Pipeline comercial <span style={{color:C.neon}}>Coral Hub</span></h1>
        <p style={{fontSize:13,color:C.dim,lineHeight:1.8,margin:0,maxWidth:760}}>Gerencie leads, catálogo de serviços e propostas comerciais da Coral Films sem alterar o fluxo atual de clientes e planejamentos.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,16rem),1fr))",gap:16}}>
        {menu.map(item=>(
          <button key={item.id} onClick={()=>onNavigate(item.id)} style={{...card,textAlign:"left",cursor:"pointer",borderRadius:18,background:"linear-gradient(145deg,rgba(18,26,39,.96),rgba(7,11,18,.96))"}}>
            <div style={{fontSize:34,marginBottom:14}}>{item.icon}</div>
            <div style={{fontSize:10,fontWeight:900,letterSpacing:3,color:C.orange,textTransform:"uppercase",marginBottom:6}}>{item.kpi}</div>
            <h2 style={{fontSize:20,margin:"0 0 8px",fontWeight:950}}>{item.title}</h2>
            <p style={{fontSize:12,color:C.dim,lineHeight:1.7,margin:0}}>{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function CommercialTopMenu({current,onNavigate}){
  const items = [
    ["commercial","🏠 Comercial"],
    ["commercial-leads","🎯 Leads"],
    ["commercial-proposals","📄 Propostas"],
    ["commercial-services","🧩 Serviços"]
  ];
  return(
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
      {items.map(([id,label])=>(
        <button key={id} onClick={()=>onNavigate(id)} style={{
          ...btn(current===id?"primary":"ghost","sm"),
          borderRadius:999,
          padding:"8px 13px"
        }}>{label}</button>
      ))}
    </div>
  );
}

function LeadsView({leads,form,setForm,editingLead,filters,setFilters,onSave,onEdit,onDelete,onNew,onNavigate}){
  const search = String(filters.search||"").toLowerCase();
  const filtered = leads
    .filter(lead=>{
      const blob = [lead.empresa,lead.responsavel,lead.telefone,lead.whatsapp,lead.email,lead.instagram,lead.cidade,lead.segmento,lead.origemLead,lead.observacoes,lead.status].join(" ").toLowerCase();
      const statusOk = !filters.status || filters.status==="Todos" || lead.status===filters.status;
      return statusOk && (!search || blob.includes(search));
    })
    .sort((a,b)=>{
      if(filters.sort==="empresa") return String(a.empresa).localeCompare(String(b.empresa));
      if(filters.sort==="status") return String(a.status).localeCompare(String(b.status));
      if(filters.sort==="cidade") return String(a.cidade).localeCompare(String(b.cidade));
      return String(b.createdAt||"").localeCompare(String(a.createdAt||""));
    });

  return(
    <div className="max-w-6xl mx-auto px-4 w-full" style={{maxWidth:"74rem",margin:"0 auto",padding:"1.5rem 1rem",animation:"fadeIn .35s ease-out"}}>
      <CommercialTopMenu current="commercial-leads" onNavigate={onNavigate}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:18,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:6}}>Comercial</div>
          <h1 style={{fontSize:28,fontWeight:950,letterSpacing:-1,margin:0}}>Leads</h1>
        </div>
        <button style={btn("primary")} onClick={onNew}>+ Novo Lead</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(min(100%,20rem),26rem) minmax(0,1fr)",gap:16,alignItems:"start"}}>
        <div style={ocrd}>
          <div style={{fontSize:13,fontWeight:900,marginBottom:14}}>{editingLead ? "Editar Lead" : "Cadastro de Lead"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
            <div><label style={lbl}>Empresa *</label><input style={inp} value={form.empresa} onChange={e=>setForm(f=>({...f,empresa:e.target.value}))} placeholder="Nome da empresa"/></div>
            <div><label style={lbl}>Responsável</label><input style={inp} value={form.responsavel} onChange={e=>setForm(f=>({...f,responsavel:e.target.value}))} placeholder="Nome do responsável"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>Telefone</label><input style={inp} value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))}/></div>
              <div><label style={lbl}>WhatsApp</label><input style={inp} value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))}/></div>
            </div>
            <div><label style={lbl}>Email</label><input style={inp} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@empresa.com"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>Instagram</label><input style={inp} value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} placeholder="@empresa"/></div>
              <div><label style={lbl}>Cidade</label><input style={inp} value={form.cidade} onChange={e=>setForm(f=>({...f,cidade:e.target.value}))}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>Segmento</label><input style={inp} value={form.segmento} onChange={e=>setForm(f=>({...f,segmento:e.target.value}))} placeholder="Ex: Restaurante"/></div>
              <div><label style={lbl}>Origem do Lead</label><input style={inp} value={form.origemLead} onChange={e=>setForm(f=>({...f,origemLead:e.target.value}))} placeholder="Instagram, indicação..."/></div>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select style={inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {LEAD_STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Observações</label><textarea style={{...inp,height:84,resize:"vertical"}} value={form.observacoes} onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))}/></div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...btn("primary"),flex:1}} onClick={onSave}>{editingLead ? "Salvar Alterações" : "Salvar Lead"}</button>
              <button style={btn("ghost")} onClick={onNew}>Limpar</button>
            </div>
          </div>
        </div>

        <div>
          <div style={{...ncrd,marginBottom:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 170px 160px",gap:10}}>
              <input style={inp} value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))} placeholder="Pesquisar por empresa, responsável, cidade, origem..."/>
              <select style={inp} value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
                <option>Todos</option>
                {LEAD_STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
              </select>
              <select style={inp} value={filters.sort} onChange={e=>setFilters(f=>({...f,sort:e.target.value}))}>
                <option value="created_desc">Mais recentes</option>
                <option value="empresa">Empresa</option>
                <option value="status">Status</option>
                <option value="cidade">Cidade</option>
              </select>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,16rem),1fr))",gap:12}}>
            {filtered.map((lead,index)=>(
              <div key={lead.id} style={{...card,borderRadius:16,animation:"fadeIn .3s ease-out",animationDelay:`${index*.03}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}>
                  <div>
                    <h3 style={{fontSize:17,margin:"0 0 5px",fontWeight:950}}>{lead.empresa || "Empresa sem nome"}</h3>
                    <div style={{fontSize:11,color:C.orange,fontWeight:800,textTransform:"uppercase",letterSpacing:1.5}}>{lead.segmento || "Sem segmento"}</div>
                  </div>
                  <Tag label={lead.status} color={lead.status==="Cliente Ativo"?C.success:lead.status==="Perdido"?C.danger:C.orange}/>
                </div>
                <div style={{fontSize:12,color:C.dim,lineHeight:1.7,marginTop:12}}>
                  {lead.responsavel && <div>👤 {lead.responsavel}</div>}
                  {lead.whatsapp && <div>💬 {lead.whatsapp}</div>}
                  {lead.email && <div>✉️ {lead.email}</div>}
                  {lead.cidade && <div>📍 {lead.cidade}</div>}
                </div>
                {lead.observacoes && <p style={{fontSize:12,color:C.dim,lineHeight:1.6,margin:"12px 0 0"}}>{lead.observacoes}</p>}
                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <button style={{...btn("ghost","sm"),flex:1}} onClick={()=>onEdit(lead)}>Editar</button>
                  <button style={btn("danger","sm")} onClick={()=>onDelete(lead.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length===0&&(
            <div style={{...ocrd,textAlign:"center",padding:40}}>
              <div style={{fontSize:32,marginBottom:10}}>🔎</div>
              <p style={{color:C.dim,margin:0}}>Nenhum lead encontrado com os filtros atuais.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ServicesCatalogView({services,form,setForm,editingService,onSave,onEdit,onDelete,onNew,onNavigate}){
  const sorted = [...services].sort((a,b)=>(Number(a.ordemExibicao||0)-Number(b.ordemExibicao||0)) || String(a.nome).localeCompare(String(b.nome)));

  return(
    <div className="max-w-6xl mx-auto px-4 w-full" style={{maxWidth:"74rem",margin:"0 auto",padding:"1.5rem 1rem",animation:"fadeIn .35s ease-out"}}>
      <CommercialTopMenu current="commercial-services" onNavigate={onNavigate}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:18,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:6}}>Comercial</div>
          <h1 style={{fontSize:28,fontWeight:950,letterSpacing:-1,margin:0}}>Catálogo de Serviços</h1>
        </div>
        <button style={btn("primary")} onClick={onNew}>+ Novo Serviço</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(min(100%,20rem),26rem) minmax(0,1fr)",gap:16,alignItems:"start"}}>
        <div style={ocrd}>
          <div style={{fontSize:13,fontWeight:900,marginBottom:14}}>{editingService ? "Editar Serviço" : "Cadastro de Serviço"}</div>
          <div style={{display:"grid",gap:10}}>
            <div><label style={lbl}>Nome *</label><input style={inp} value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 130px",gap:10}}>
              <div><label style={lbl}>Categoria</label><input style={inp} value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}/></div>
              <div><label style={lbl}>Ícone</label><input style={inp} value={form.icone} onChange={e=>setForm(f=>({...f,icone:e.target.value}))} placeholder="🎥"/></div>
            </div>
            <div><label style={lbl}>Descrição</label><textarea style={{...inp,height:96,resize:"vertical"}} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>Valor padrão</label><input style={inp} type="number" min="0" step="0.01" value={form.valorPadrao} onChange={e=>setForm(f=>({...f,valorPadrao:e.target.value}))}/></div>
              <div>
                <label style={lbl}>Tipo</label>
                <select style={inp} value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
                  {SERVICE_TYPE_OPTIONS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>Ordem</label><input style={inp} type="number" value={form.ordemExibicao} onChange={e=>setForm(f=>({...f,ordemExibicao:e.target.value}))}/></div>
              <div>
                <label style={lbl}>Status</label>
                <select style={inp} value={form.ativo ? "Ativo" : "Inativo"} onChange={e=>setForm(f=>({...f,ativo:e.target.value==="Ativo"}))}>
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...btn("primary"),flex:1}} onClick={onSave}>{editingService ? "Salvar Alterações" : "Salvar Serviço"}</button>
              <button style={btn("ghost")} onClick={onNew}>Limpar</button>
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,16rem),1fr))",gap:12}}>
          {sorted.map(service=>(
            <div key={service.id} style={{...card,borderRadius:16,opacity:service.ativo===false ? .65 : 1}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
                <div style={{fontSize:28}}>{service.icone || "🧩"}</div>
                <Tag label={service.ativo===false?"Inativo":"Ativo"} color={service.ativo===false?C.muted:C.success}/>
              </div>
              <h3 style={{fontSize:17,margin:"12px 0 4px",fontWeight:950}}>{service.nome}</h3>
              <div style={{fontSize:10,color:C.orange,fontWeight:900,letterSpacing:2,textTransform:"uppercase"}}>{service.categoria || "Sem categoria"} · {service.tipo}</div>
              <p style={{fontSize:12,color:C.dim,lineHeight:1.6,minHeight:58}}>{service.descricao}</p>
              <div style={{fontSize:20,fontWeight:950,color:C.neon,marginBottom:12}}>{moneyBR(service.valorPadrao)}</div>
              <div style={{display:"flex",gap:8}}>
                <button style={{...btn("ghost","sm"),flex:1}} onClick={()=>onEdit(service)}>Editar</button>
                <button style={btn("danger","sm")} onClick={()=>onDelete(service.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProposalsView({proposals,items,leads,onNew,onEdit,onPdf,onConvert,onDelete,onNavigate}){
  const leadMap = new Map(leads.map(l=>[String(l.id),l]));
  const sorted = [...proposals].sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));

  return(
    <div className="max-w-6xl mx-auto px-4 w-full" style={{maxWidth:"74rem",margin:"0 auto",padding:"1.5rem 1rem",animation:"fadeIn .35s ease-out"}}>
      <CommercialTopMenu current="commercial-proposals" onNavigate={onNavigate}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:18,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:6}}>Comercial</div>
          <h1 style={{fontSize:28,fontWeight:950,letterSpacing:-1,margin:0}}>Propostas</h1>
        </div>
        <button style={btn("primary")} onClick={onNew}>+ Nova Proposta</button>
      </div>

      {sorted.length===0?(
        <div style={{...ocrd,textAlign:"center",padding:52}}>
          <div style={{fontSize:40,marginBottom:12}}>📄</div>
          <p style={{color:C.dim,margin:"0 0 18px"}}>Nenhuma proposta criada ainda.</p>
          <button style={btn("primary")} onClick={onNew}>Criar primeira proposta</button>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,20rem),1fr))",gap:14}}>
          {sorted.map(proposal=>{
            const proposalItems = items.filter(i=>String(i.proposalId)===String(proposal.id) || String(i.proposalId)===String(proposal.supabaseId));
            const totals = proposalTotals(proposalItems, proposal.descontoValor, proposal.descontoPercentual);
            const lead = leadMap.get(String(proposal.leadId));
            return(
              <div key={proposal.id} style={{...card,borderRadius:18,background:"linear-gradient(145deg,rgba(18,26,39,.96),rgba(7,11,18,.96))"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}>
                  <div>
                    <h3 style={{fontSize:18,margin:"0 0 5px",fontWeight:950}}>{proposal.empresa || lead?.empresa || "Cliente sem nome"}</h3>
                    <div style={{fontSize:11,color:C.dim}}>{proposal.responsavel || lead?.responsavel || "Responsável não informado"}</div>
                  </div>
                  <Tag label={proposal.status} color={proposal.status==="Convertida"?C.success:proposal.status==="Recusada"?C.danger:C.orange}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
                  <div style={{...ncrd,padding:12}}>
                    <div style={{fontSize:9,color:C.dim,fontWeight:900,letterSpacing:1.4,textTransform:"uppercase"}}>Valor Final</div>
                    <div style={{fontSize:18,fontWeight:950,color:C.neon,marginTop:4}}>{moneyBR(proposal.valorFinal || totals.valorFinal)}</div>
                  </div>
                  <div style={{...ocrd,padding:12}}>
                    <div style={{fontSize:9,color:C.dim,fontWeight:900,letterSpacing:1.4,textTransform:"uppercase"}}>Itens</div>
                    <div style={{fontSize:18,fontWeight:950,color:C.orange,marginTop:4}}>{proposalItems.length}</div>
                  </div>
                </div>
                {proposal.objetivos && <p style={{fontSize:12,color:C.dim,lineHeight:1.6,margin:"12px 0 0"}}>{proposal.objetivos.slice(0,170)}{proposal.objetivos.length>170?"...":""}</p>}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
                  <button style={btn("ghost","sm")} onClick={()=>onEdit(proposal)}>Editar</button>
                  <button style={btn("neon","sm")} onClick={()=>onPdf(proposal)}>PDF</button>
                  <button style={btn("primary","sm")} onClick={()=>onConvert(proposal)}>Converter em Cliente</button>
                  <button style={btn("danger","sm")} onClick={()=>onDelete(proposal.id)}>Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProposalFormView({form,setForm,leads,services,onLeadChange,onToggleService,onUpdateItem,onRemoveItem,onSave,onCancel,onPdfDraft,onNavigate,editingProposal}){
  const activeServices = services.filter(s=>s.ativo!==false).sort((a,b)=>(Number(a.ordemExibicao||0)-Number(b.ordemExibicao||0)) || String(a.nome).localeCompare(String(b.nome)));
  const selectedIds = new Set((form.items||[]).map(i=>String(i.serviceId)));
  const totals = proposalTotals(form.items, form.descontoValor, form.descontoPercentual);

  return(
    <div className="max-w-6xl mx-auto px-4 w-full" style={{maxWidth:"74rem",margin:"0 auto",padding:"1.5rem 1rem",animation:"fadeIn .35s ease-out"}}>
      <CommercialTopMenu current="commercial-proposals" onNavigate={onNavigate}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:18,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:6}}>{editingProposal ? "Editar Proposta" : "Nova Proposta"}</div>
          <h1 style={{fontSize:28,fontWeight:950,letterSpacing:-1,margin:0}}>Gerador de Propostas</h1>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button style={btn("neon")} onClick={onPdfDraft}>PDF Prévia</button>
          <button style={btn("ghost")} onClick={onCancel}>Cancelar</button>
          <button style={btn("primary")} onClick={onSave}>Salvar Proposta</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={ocrd}>
            <div style={{fontSize:13,fontWeight:900,marginBottom:14}}>Dados do cliente</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={lbl}>Lead</label>
                <select style={inp} value={form.leadId} onChange={e=>onLeadChange(e.target.value)}>
                  <option value="">Selecionar lead ou preencher manualmente</option>
                  {leads.map(lead=><option key={lead.id} value={lead.id}>{lead.empresa} {lead.responsavel?`· ${lead.responsavel}`:""}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Empresa *</label><input style={inp} value={form.empresa} onChange={e=>setForm(f=>({...f,empresa:e.target.value}))}/></div>
              <div><label style={lbl}>Responsável</label><input style={inp} value={form.responsavel} onChange={e=>setForm(f=>({...f,responsavel:e.target.value}))}/></div>
              <div><label style={lbl}>WhatsApp</label><input style={inp} value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))}/></div>
              <div><label style={lbl}>Email</label><input style={inp} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
              <div><label style={lbl}>Cidade</label><input style={inp} value={form.cidade} onChange={e=>setForm(f=>({...f,cidade:e.target.value}))}/></div>
              <div><label style={lbl}>Instagram</label><input style={inp} value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))}/></div>
              <div><label style={lbl}>Segmento</label><input style={inp} value={form.segmento} onChange={e=>setForm(f=>({...f,segmento:e.target.value}))}/></div>
            </div>
            <div style={{marginTop:12}}>
              <label style={lbl}>Objetivos</label>
              <textarea style={{...inp,height:90,resize:"vertical"}} value={form.objetivos} onChange={e=>setForm(f=>({...f,objetivos:e.target.value}))} placeholder="Objetivos do cliente e contexto da proposta..."/>
            </div>
          </div>

          <div style={ncrd}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:12}}>
              <div>
                <div style={{fontSize:13,fontWeight:900}}>Selecionar serviços do catálogo</div>
                <div style={{fontSize:11,color:C.dim,marginTop:4}}>Os valores e descrições entram automaticamente e podem ser editados abaixo.</div>
              </div>
              <Tag label={`${(form.items||[]).length} selecionado(s)`} color={C.neon}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,13rem),1fr))",gap:10}}>
              {activeServices.map(service=>{
                const selected = selectedIds.has(String(service.id));
                return(
                  <button key={service.id} onClick={()=>onToggleService(service)} style={{
                    textAlign:"left",
                    cursor:"pointer",
                    borderRadius:14,
                    padding:14,
                    border:`1px solid ${selected?C.orange:C.border}`,
                    background:selected?"rgba(249,115,22,.14)":C.card2,
                    color:C.white
                  }}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                      <span style={{fontSize:22}}>{service.icone || "🧩"}</span>
                      <span style={{fontSize:11,color:selected?C.orange:C.dim,fontWeight:900}}>{selected?"✓ SELECIONADO":"ADICIONAR"}</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:900,marginTop:8}}>{service.nome}</div>
                    <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,marginTop:4}}>{service.tipo} · {moneyBR(service.valorPadrao)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {(form.items||[]).length>0 && (
            <div style={{...card,overflowX:"auto"}}>
              <div style={{fontSize:13,fontWeight:900,marginBottom:14}}>Itens da proposta</div>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:"48rem"}}>
                <thead>
                  <tr>{["Serviço","Descrição","Tipo","Qtd.","Valor","Total",""].map(h=><th key={h} style={{padding:"10px",fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.4,textAlign:"left",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {(form.items||[]).map((item,index)=>(
                    <tr key={item.id || index} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:10,minWidth:160}}><input style={inp} value={item.serviceName} onChange={e=>onUpdateItem(index,"serviceName",e.target.value)}/></td>
                      <td style={{padding:10,minWidth:240}}><textarea style={{...inp,height:70,resize:"vertical"}} value={item.descricao} onChange={e=>onUpdateItem(index,"descricao",e.target.value)}/></td>
                      <td style={{padding:10,minWidth:130}}>
                        <select style={inp} value={item.tipo} onChange={e=>onUpdateItem(index,"tipo",e.target.value)}>
                          {SERVICE_TYPE_OPTIONS.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:10,width:80}}><input style={inp} type="number" min="1" value={item.quantidade} onChange={e=>onUpdateItem(index,"quantidade",e.target.value)}/></td>
                      <td style={{padding:10,width:120}}><input style={inp} type="number" min="0" step="0.01" value={item.valorUnitario} onChange={e=>onUpdateItem(index,"valorUnitario",e.target.value)}/></td>
                      <td style={{padding:10,fontWeight:900,color:C.neon,whiteSpace:"nowrap"}}>{moneyBR(toNumber(item.valorUnitario)*Number(item.quantidade||1))}</td>
                      <td style={{padding:10}}><button style={btn("danger","sm")} onClick={()=>onRemoveItem(index)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={ocrd}>
            <div style={{fontSize:13,fontWeight:900,marginBottom:14}}>Condições e próximos passos</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><label style={lbl}>Condições de pagamento</label><textarea style={{...inp,height:110,resize:"vertical"}} value={form.condicoesPagamento} onChange={e=>setForm(f=>({...f,condicoesPagamento:e.target.value}))}/></div>
              <div><label style={lbl}>Próximos passos</label><textarea style={{...inp,height:110,resize:"vertical"}} value={form.proximosPassos} onChange={e=>setForm(f=>({...f,proximosPassos:e.target.value}))}/></div>
            </div>
          </div>
        </div>

        <div style={{position:"sticky",top:88,display:"flex",flexDirection:"column",gap:12}}>
          <div style={ocrd}>
            <div style={{fontSize:13,fontWeight:900,marginBottom:14}}>Resumo financeiro</div>
            <div style={{display:"grid",gap:10}}>
              <div><label style={lbl}>Desconto em valor</label><input style={inp} type="number" min="0" step="0.01" value={form.descontoValor} onChange={e=>setForm(f=>({...f,descontoValor:e.target.value}))}/></div>
              <div><label style={lbl}>Desconto em %</label><input style={inp} type="number" min="0" step="0.01" value={form.descontoPercentual} onChange={e=>setForm(f=>({...f,descontoPercentual:e.target.value}))}/></div>
              <div>
                <label style={lbl}>Status da proposta</label>
                <select style={inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  {PROPOSAL_STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{...card,borderRadius:18,background:"linear-gradient(145deg,rgba(18,26,39,.98),rgba(7,11,18,.98))"}}>
            {[
              ["Valor de Implementação",totals.valorImplementacao,C.orange],
              ["Valor Mensal",totals.valorMensal,C.neon],
              ["Valor por Projeto",totals.valorProjeto,C.gold],
              ["Valor de Tabela",totals.valorTabela,C.white],
              ["Desconto",totals.descontoTotal,C.danger],
              ["Valor Final",totals.valorFinal,C.success]
            ].map(([label,value,color])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"10px 0",borderBottom:label==="Valor Final"?"none":`1px solid ${C.border}`}}>
                <span style={{fontSize:12,color:C.dim}}>{label}</span>
                <strong style={{fontSize:label==="Valor Final"?20:14,color}}>{moneyBR(value)}</strong>
              </div>
            ))}
          </div>

          <button style={{...btn("primary","lg"),width:"100%"}} onClick={onSave}>Salvar Proposta</button>
          <button style={{...btn("neon"),width:"100%"}} onClick={onPdfDraft}>Gerar PDF Premium</button>
        </div>
      </div>
    </div>
  );
}

function CoralFilmsApp(){
  const [splash,setSplash]  = useState(true);
  const [screen,setScreen]  = useState("list");
  const [clients,setClients]= useState([]);
  const [editing,setEditing]= useState(null);
  const [form,setForm]      = useState(emptyForm());
  const [plan,setPlan]      = useState(null);
  const [active,setActive]  = useState(null);
  const [genStep,setGenStep]= useState("");
  const [genPct,setGenPct]  = useState(0);
  const [genErr,setGenErr]  = useState("");
  const [loadingList,setLoadingList] = useState(true);
  const [feedback,setFeedback] = useState(null);
  const [leads,setLeads] = useState([]);
  const [services,setServices] = useState([]);
  const [proposals,setProposals] = useState([]);
  const [proposalItems,setProposalItems] = useState([]);
  const [commercialLoading,setCommercialLoading] = useState(true);
  const [leadForm,setLeadForm] = useState(emptyLeadForm());
  const [editingLead,setEditingLead] = useState(null);
  const [leadFilters,setLeadFilters] = useState({search:"",status:"Todos",sort:"created_desc"});
  const [serviceForm,setServiceForm] = useState(emptyServiceForm());
  const [editingService,setEditingService] = useState(null);
  const [proposalForm,setProposalForm] = useState(emptyProposalForm());
  const [editingProposal,setEditingProposal] = useState(null);
  const fileRef             = useRef(null);
  const finalFileRef        = useRef(null);

  function emptyForm(){
    return{name:"",agency:"Coral Films",niche:"",instagram:"",
           month:new Date().getMonth()+1,year:2026,
           notes:"",extra:"",links:[{label:"",url:""}],images:[],approvalLinks:[{type:"Vídeo",label:"",url:""}],approvalImages:[],plans:[]};
  }

  async function buscarPlanos(){
    setLoadingList(true);
    const data = await dbGet(STORAGE_KEY);
    setClients(Array.isArray(data) ? data : []);
    setLoadingList(false);
  }

  function showFeedback(message,type="success"){
    setFeedback({message,type,nonce:Date.now()});
  }

  useEffect(()=>{
    buscarPlanos();
    buscarComercial();
  },[]);

  useEffect(()=>{
    if(!feedback) return;
    const timer = setTimeout(()=>setFeedback(null),3200);
    return()=>clearTimeout(timer);
  },[feedback]);

  const persist = async(list)=>{
    setClients(list);
    const result = await dbSet(STORAGE_KEY,list);
    if(result?.fallback){
      alert("Cliente salvo, mas as imagens estavam pesadas demais para o navegador. Salvei os dados, planos e links. Para materiais finais, prefira links do Drive/Instagram/YouTube.");
    }else if(!result?.ok){
      alert("Não consegui salvar no navegador. Verifique se está em aba anônima, se o armazenamento do navegador está bloqueado ou se há imagens muito pesadas.");
    }
    return result;
  };

  const startNew  = ()=>{setForm(emptyForm());setEditing(null);setScreen("form");};
  const startEdit = (c)=>{setForm({...c,images:c.images||[],links:c.links||[{label:"",url:""}],approvalLinks:c.approvalLinks||[{type:"Vídeo",label:"",url:""}],approvalImages:c.approvalImages||[],plans:c.plans||[]});setEditing(c.id);setScreen("form");};

  async function deletarPlano(id) {
    const confirmacao = confirm("Tem certeza que deseja excluir este cliente?");
    if (!confirmacao) return;

    const plano = clients.find(c=>String(c.id)===String(id));
    const dbId = plano?.supabaseId || (plano?.importedFromSupabase ? plano?.id : null);

    if(dbId && isSupabaseReady()){
      const { error } = await supabase
        .from("planos")
        .delete()
        .eq("id", dbId);

      if (error) {
        console.error("Erro ao deletar:", error);
        showFeedback("Erro ao excluir cliente no Supabase.","error");
        return;
      } else {
        console.log("Cliente deletado");
      }
    }

    const next = clients.filter(c=>String(c.id)!==String(id));
    await persist(next);
    showFeedback("Cliente excluído com sucesso.","success");
    buscarPlanos(); // atualizar lista automaticamente
  }

  const openSavedPlan = (c)=>{
    const record = (c.plans||[]).find(p=>p.id===c.lastPlanId) || (c.plans||[]).slice(-1)[0];
    const savedPlan = record?.plan || c.lastPlan;
    if(!savedPlan) return alert("Este cliente ainda não tem plano salvo.");
    setActive(c); setPlan(savedPlan); setScreen("plan");
  };
  const saveForm  = async()=>{
    if(!form.name.trim())return alert("Nome obrigatório.");

    let c={
      ...form,
      id:editing || form.id || newLocalId(),
      createdAt:form.createdAt || new Date().toISOString()
    };

    const cloud = await salvarClienteSupabase(c, c.lastPlan || null);
    if(cloud?.ok && cloud.id){
      c = {...c,id:String(cloud.id),supabaseId:cloud.id,importedFromSupabase:true};
    }

    const exists = clients.some(x=>String(x.id)===String(editing || c.id));
    await persist(exists?clients.map(x=>String(x.id)===String(editing||c.id)?c:x):[...clients,c]);
    setActive(a=>a&&String(a.id)===String(c.id)?c:a);
    setScreen("list");
    showFeedback("Cliente salvo com sucesso.","success");
    buscarPlanos();
  };

  // ── generate ──────────────────────────────────────────────────────────────────
  const generate = async(client)=>{
    setActive(client);setPlan(null);setGenErr("");setScreen("generating");
    const steps=[[0,"Analisando perfil…"],[20,"Criando estratégia…"],[42,"Montando calendário…"],[65,"Escrevendo roteiros…"],[84,"Definindo metas…"]];
    let si=0;
    setGenStep(steps[0][1]);setGenPct(0);
    const iv=setInterval(()=>{si++;if(si<steps.length){setGenStep(steps[si][1]);setGenPct(steps[si][0]);}},1500);
    const month=MONTHS[(client.month||1)-1];
    const mm=String(client.month).padStart(2,"0");
    const linksResumo=(client.links||[]).filter(l=>l.url).map(l=>`- ${l.label||"Arquivo"}: ${l.url}`).join("\n")||"nenhum";
    const imagensResumo=(client.images||[]).length?`${client.images.length} imagem(ns) de referência anexada(s) no cadastro. Use isso como indicação visual do cliente, sem tentar enviar ou analisar a imagem pela API.`:"nenhuma";
    const prompt=`Você é um estrategista sênior de marketing digital para negócios locais, social media e performance.
Crie um plano de marketing mensal profissional, prático e pronto para apresentar ao cliente.

DADOS DO CLIENTE:
- Nome: ${client.name}
- Agência: ${client.agency||"não informado"}
- Nicho: ${client.niche||"negócio local"}
- Mês: ${month} ${client.year}
- Instagram: ${client.instagram||"não informado"}
- Observações / briefing: ${client.notes||"nenhuma"}
- Detalhes extras para IA: ${client.extra||"nenhum"}
- Links cadastrados: ${linksResumo}
- Referências visuais: ${imagensResumo}

REGRAS DO PLANO:
- Pense como uma agência premium.
- Use linguagem clara, estratégica e comercial.
- Adapte tudo ao nicho do cliente.
- Traga ideias específicas, não genéricas.
- Inclua estratégia de posicionamento, conteúdo, anúncios, calendário, reels e metas.
- O calendário deve equilibrar Autoridade, Conexão e Conversão.
- Os Reels devem ter estrutura de cena forte, com hook, desenvolvimento e CTA.
- As metas devem ser realistas e ligadas a alcance, seguidores, engajamento e conversão.

IMPORTANTE:
Responda APENAS com um JSON válido.
Não use markdown.
Não escreva explicações antes ou depois.
Não coloque comentários no JSON.
Mantenha exatamente as chaves abaixo para não quebrar a tela do app.

{
  "strategy":{
    "objective":"escreva 2-3 frases com o objetivo geral do mês para este cliente, incluindo posicionamento, desejo e conversão",
    "goal1":"escreva 1 frase sobre como aumentar reconhecimento e autoridade da marca no nicho",
    "goal2":"escreva 1 frase sobre como gerar desejo e conexão com o público",
    "goal3":"escreva 1 frase sobre como aumentar conversão em pedidos, orçamentos, visitas ou vendas",
    "pillar1":"explique em 1 frase como trabalhar o pilar Autoridade",
    "pillar2":"explique em 1 frase como trabalhar o pilar Conexão",
    "pillar3":"explique em 1 frase como trabalhar o pilar Conversão"
  },
  "calendar":[
    {"date":"02/${mm}","content":"nome de conteúdo específico para o nicho ${client.niche||'negócio local'}","format":"Reels","pillar":"Autoridade"},
    {"date":"05/${mm}","content":"nome de conteúdo específico","format":"Stories","pillar":"Conexão"},
    {"date":"08/${mm}","content":"nome de conteúdo específico","format":"Post Feed","pillar":"Conversão"},
    {"date":"10/${mm}","content":"nome de conteúdo específico","format":"Reels","pillar":"Conversão"},
    {"date":"12/${mm}","content":"nome de conteúdo específico","format":"Stories","pillar":"Conexão"},
    {"date":"15/${mm}","content":"nome de conteúdo específico","format":"Reels","pillar":"Autoridade"},
    {"date":"17/${mm}","content":"nome de conteúdo específico","format":"Carrossel","pillar":"Autoridade"},
    {"date":"19/${mm}","content":"nome de conteúdo específico","format":"Reels","pillar":"Conexão"},
    {"date":"22/${mm}","content":"nome de conteúdo específico","format":"Stories","pillar":"Conversão"},
    {"date":"25/${mm}","content":"nome de conteúdo específico","format":"Reels","pillar":"Conexão"},
    {"date":"28/${mm}","content":"nome de conteúdo específico","format":"Post Feed","pillar":"Autoridade"},
    {"date":"31/${mm}","content":"nome de conteúdo específico","format":"Stories","pillar":"Conexão"}
  ],
  "reels":[
    {"title":"TÍTULO DO REELS EM MAIÚSCULO","objective":"objetivo estratégico deste reel em 1-2 frases","structure":["cena 1 com hook visual forte","cena 2 mostrando problema ou desejo","cena 3 mostrando solução/oferta/prova","cena 4 com CTA claro"],"caption":"legenda sugerida chamativa com emojis","cta":"chamada para ação em 1 frase","cta_text":"texto curto do botão"},
    {"title":"TÍTULO DO REELS 02 EM MAIÚSCULO","objective":"objetivo estratégico","structure":["cena 1","cena 2","cena 3","cena 4"],"caption":"legenda","cta":"cta","cta_text":"botão"},
    {"title":"TÍTULO DO REELS 03 EM MAIÚSCULO","objective":"objetivo estratégico","structure":["cena 1","cena 2","cena 3","cena 4"],"caption":"legenda","cta":"cta","cta_text":"botão"}
  ],
  "goals":[
    {"icon":"📈","title":"AUMENTAR ALCANCE","desc":"descreva uma meta específica de alcance para o mês"},
    {"icon":"👥","title":"CRESCER SEGUIDORES","desc":"descreva uma meta específica de crescimento de seguidores qualificados"},
    {"icon":"💬","title":"ENGAJAMENTO","desc":"descreva uma meta específica de engajamento nos conteúdos"},
    {"icon":"🛒","title":"CONVERSÃO","desc":"descreva uma meta específica de conversão ligada ao objetivo comercial"}
  ]
}`;

    try{
      const raw = await callOpenRouter(prompt);
      clearInterval(iv); setGenPct(100);
      // extrai JSON mesmo que venha com texto antes/depois
      const match = raw.match(/\{[\s\S]*\}/);
      if(!match) throw new Error("JSON não encontrado na resposta");
      const parsed = JSON.parse(match[0]);
      const planRecord = {id:`plan-${Date.now()}`,createdAt:new Date().toISOString(),month:client.month,year:client.year,plan:parsed};
      let updatedClient = {...client,lastPlan:parsed,lastPlanId:planRecord.id,plans:[...(client.plans||[]),planRecord]};

      const cloud = await salvarPlanoSupabase(updatedClient, parsed);
      if(cloud?.ok && cloud.id){
        updatedClient = {...updatedClient,id:String(cloud.id),supabaseId:cloud.id,importedFromSupabase:true};
      }

      const updatedList = clients.some(x=>String(x.id)===String(client.id))
        ? clients.map(x=>String(x.id)===String(client.id)?updatedClient:x)
        : [...clients,updatedClient];

      await persist(updatedList);
      showFeedback("Plano gerado e salvo com sucesso.","success");
      setActive(updatedClient);
      setPlan(parsed);
      setScreen("plan");
    }catch(e){
      clearInterval(iv);
      setGenErr(e.message||"Não foi possível gerar o plano agora. Tente novamente em alguns instantes.");
    }
  };

  // ── image upload ───────────────────────────────────────────────────────────────
  const pickImages = ()=>{
    if(fileRef.current){ fileRef.current.value=""; fileRef.current.click(); }
  };
  const onFileChange = async(e)=>{
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    const loaded = await Promise.all(files.map(f=>compressImageFile(f,1280,.78)));
    setForm(f=>({...f,images:[...(f.images||[]),...loaded]}));
  };
  const removeImg = (idx)=>setForm(f=>({...f,images:f.images.filter((_,i)=>i!==idx)}));

  const pickFinalImages = ()=>{
    if(finalFileRef.current){ finalFileRef.current.value=""; finalFileRef.current.click(); }
  };
  const onFinalFileChange = async(e)=>{
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    const loaded = await Promise.all(files.map(f=>compressImageFile(f,1280,.78)));
    setForm(f=>({...f,approvalImages:[...(f.approvalImages||[]),...loaded]}));
  };
  const removeFinalImg = (idx)=>setForm(f=>({...f,approvalImages:f.approvalImages.filter((_,i)=>i!==idx)}));

  const addLink = ()=>setForm(f=>({...f,links:[...f.links,{label:"",url:""}]}));
  const updLink = (i,k,v)=>setForm(f=>({...f,links:f.links.map((l,li)=>li===i?{...l,[k]:v}:l)}));
  const delLink = (i)=>setForm(f=>({...f,links:f.links.filter((_,li)=>li!==i)}));

  const addApprovalLink = ()=>setForm(f=>({...f,approvalLinks:[...(f.approvalLinks||[]),{type:"Vídeo",label:"",url:""}]}));
  const updApprovalLink = (i,k,v)=>setForm(f=>({...f,approvalLinks:(f.approvalLinks||[]).map((l,li)=>li===i?{...l,[k]:v}:l)}));
  const delApprovalLink = (i)=>setForm(f=>({...f,approvalLinks:(f.approvalLinks||[]).filter((_,li)=>li!==i)}));


  async function buscarComercial(){
    setCommercialLoading(true);
    const data = await dbGetCommercial();
    setLeads(data.leads || []);
    setServices(data.services || []);
    setProposals(data.proposals || []);
    setProposalItems(data.items || []);
    setCommercialLoading(false);
  }

  const persistCommercial = async(next)=>{
    const normalized = {
      leads:(next.leads || leads).map(normalizeLead),
      services:(next.services || services).map(normalizeService),
      proposals:(next.proposals || proposals).map(normalizeProposal),
      items:(next.items || proposalItems).map(normalizeProposalItem)
    };
    setLeads(normalized.leads);
    setServices(normalized.services);
    setProposals(normalized.proposals);
    setProposalItems(normalized.items);
    await dbSetCommercial(normalized);
    return normalized;
  };

  const goCommercial = (target="commercial")=>{
    setScreen(target);
  };

  const startNewLead = ()=>{
    setLeadForm(emptyLeadForm());
    setEditingLead(null);
  };

  const editLead = (lead)=>{
    setLeadForm(normalizeLead(lead));
    setEditingLead(lead.id);
  };

  const saveLead = async()=>{
    if(!leadForm.empresa.trim()) return alert("Empresa é obrigatória.");
    let lead = normalizeLead({
      ...leadForm,
      id:editingLead || leadForm.id || newLocalId(),
      updatedAt:new Date().toISOString()
    });

    const cloud = await salvarLeadSupabase(lead);
    if(cloud?.ok && cloud.data) lead = cloud.data;

    const exists = leads.some(l=>String(l.id)===String(editingLead || lead.id) || (lead.supabaseId && String(l.supabaseId)===String(lead.supabaseId)));
    const nextLeads = exists
      ? leads.map(l=>(String(l.id)===String(editingLead || lead.id) || (lead.supabaseId && String(l.supabaseId)===String(lead.supabaseId))) ? lead : l)
      : [lead, ...leads];

    await persistCommercial({leads:nextLeads,services,proposals,items:proposalItems});
    setLeadForm(emptyLeadForm());
    setEditingLead(null);
    showFeedback("Lead salvo com sucesso.","success");
  };

  const deleteLead = async(id)=>{
    if(!confirm("Excluir este lead? As propostas já criadas continuarão no histórico.")) return;
    const lead = leads.find(l=>String(l.id)===String(id));
    await deleteSupabaseRow("coral_leads", lead?.supabaseId || (isCloudId(id) ? id : null));
    await persistCommercial({leads:leads.filter(l=>String(l.id)!==String(id)),services,proposals,items:proposalItems});
    showFeedback("Lead excluído.","success");
  };

  const startNewService = ()=>{
    setServiceForm({...emptyServiceForm(),ordemExibicao:(services.length||0)+1});
    setEditingService(null);
  };

  const editService = (service)=>{
    setServiceForm(normalizeService(service));
    setEditingService(service.id);
  };

  const saveService = async()=>{
    if(!serviceForm.nome.trim()) return alert("Nome do serviço é obrigatório.");
    let service = normalizeService({
      ...serviceForm,
      id:editingService || serviceForm.id || newLocalId(),
      updatedAt:new Date().toISOString()
    });

    const cloud = await salvarServiceSupabase(service);
    if(cloud?.ok && cloud.data) service = cloud.data;

    const exists = services.some(s=>String(s.id)===String(editingService || service.id) || (service.supabaseId && String(s.supabaseId)===String(service.supabaseId)));
    const nextServices = exists
      ? services.map(s=>(String(s.id)===String(editingService || service.id) || (service.supabaseId && String(s.supabaseId)===String(service.supabaseId))) ? service : s)
      : [...services, service];

    await persistCommercial({leads,services:nextServices,proposals,items:proposalItems});
    setServiceForm(emptyServiceForm());
    setEditingService(null);
    showFeedback("Serviço salvo com sucesso.","success");
  };

  const deleteService = async(id)=>{
    if(!confirm("Excluir este serviço do catálogo? Propostas antigas manterão o histórico do item.")) return;
    const service = services.find(s=>String(s.id)===String(id));
    await deleteSupabaseRow("coral_services", service?.supabaseId || (isCloudId(id) ? id : null));
    await persistCommercial({leads,services:services.filter(s=>String(s.id)!==String(id)),proposals,items:proposalItems});
    showFeedback("Serviço excluído.","success");
  };

  const startNewProposal = ()=>{
    setProposalForm(emptyProposalForm());
    setEditingProposal(null);
    setScreen("commercial-proposal-form");
  };

  const editProposal = (proposal)=>{
    const related = proposalItems.filter(item=>String(item.proposalId)===String(proposal.id) || (proposal.supabaseId && String(item.proposalId)===String(proposal.supabaseId)));
    setProposalForm({
      ...emptyProposalForm(),
      ...normalizeProposal(proposal),
      items:related.length ? related : []
    });
    setEditingProposal(proposal.id);
    setScreen("commercial-proposal-form");
  };

  const onProposalLeadChange = (leadId)=>{
    const lead = leads.find(l=>String(l.id)===String(leadId));
    if(!lead){
      setProposalForm(f=>({...f,leadId:""}));
      return;
    }
    setProposalForm(f=>({
      ...f,
      leadId:lead.id,
      leadSupabaseId:lead.supabaseId || (isCloudId(lead.id) ? lead.id : null),
      empresa:lead.empresa || f.empresa,
      responsavel:lead.responsavel || f.responsavel,
      telefone:lead.telefone || f.telefone,
      whatsapp:lead.whatsapp || f.whatsapp,
      email:lead.email || f.email,
      instagram:lead.instagram || f.instagram,
      cidade:lead.cidade || f.cidade,
      segmento:lead.segmento || f.segmento,
      objetivos:f.objetivos || `Proposta comercial para estruturar presença digital, produção de conteúdo e comunicação da ${lead.empresa}.`
    }));
  };

  const toggleProposalService = (service)=>{
    setProposalForm(f=>{
      const current = f.items || [];
      const exists = current.some(item=>String(item.serviceId)===String(service.id));
      if(exists){
        return {...f,items:current.filter(item=>String(item.serviceId)!==String(service.id))};
      }
      const nextItem = {
        id:newLocalId(),
        proposalId:f.id || "",
        serviceId:service.id,
        serviceName:service.nome,
        categoria:service.categoria,
        descricao:service.descricao,
        tipo:service.tipo,
        quantidade:1,
        valorUnitario:toNumber(service.valorPadrao),
        ordem:current.length+1
      };
      return {...f,items:[...current,nextItem]};
    });
  };

  const updateProposalItem = (index,key,value)=>{
    setProposalForm(f=>({
      ...f,
      items:(f.items||[]).map((item,i)=>i===index?{...item,[key]:value}:item)
    }));
  };

  const removeProposalItem = (index)=>{
    setProposalForm(f=>({
      ...f,
      items:(f.items||[]).filter((_,i)=>i!==index)
    }));
  };

  const saveProposal = async()=>{
    if(!proposalForm.empresa.trim()) return alert("Informe a empresa da proposta.");
    if((proposalForm.items||[]).length===0) return alert("Selecione pelo menos um serviço do catálogo.");

    let proposal = normalizeProposal({
      ...proposalForm,
      id:editingProposal || proposalForm.id || newLocalId(),
      updatedAt:new Date().toISOString()
    });
    const totals = proposalTotals(proposalForm.items, proposal.descontoValor, proposal.descontoPercentual);
    proposal = {
      ...proposal,
      valorTabela:totals.valorTabela,
      descontoTotal:totals.descontoTotal,
      valorFinal:totals.valorFinal
    };

    let itemsToSave = (proposalForm.items||[]).map((item,index)=>normalizeProposalItem({
      ...item,
      id:item.id || newLocalId(),
      proposalId:proposal.id,
      ordem:index+1
    }));

    const cloud = await salvarProposalSupabase(proposal,itemsToSave);
    if(cloud?.ok && cloud.data){
      const oldProposalId = proposal.id;
      proposal = {
        ...cloud.data,
        leadId:proposal.leadId,
        leadSupabaseId:proposal.leadSupabaseId,
        valorTabela:totals.valorTabela,
        descontoTotal:totals.descontoTotal,
        valorFinal:totals.valorFinal
      };
      itemsToSave = itemsToSave.map(item=>({...item,proposalId:proposal.id,oldProposalId}));
    }

    const proposalExists = proposals.some(p=>String(p.id)===String(editingProposal || proposal.id) || (proposal.supabaseId && String(p.supabaseId)===String(proposal.supabaseId)));
    const nextProposals = proposalExists
      ? proposals.map(p=>(String(p.id)===String(editingProposal || proposal.id) || (proposal.supabaseId && String(p.supabaseId)===String(proposal.supabaseId))) ? proposal : p)
      : [proposal, ...proposals];

    const removeIds = [editingProposal, proposal.id, proposal.supabaseId].filter(Boolean).map(String);
    const oldIds = itemsToSave.map(i=>i.oldProposalId).filter(Boolean).map(String);
    const allRemoveIds = [...new Set([...removeIds,...oldIds])];
    const nextItems = [
      ...proposalItems.filter(item=>!allRemoveIds.includes(String(item.proposalId))),
      ...itemsToSave.map(({oldProposalId,...item})=>item)
    ];

    let nextLeads = leads;
    const lead = leads.find(l=>String(l.id)===String(proposal.leadId));
    if(lead && !["Fechado","Perdido","Cliente Ativo"].includes(lead.status)){
      const updatedLead = {...lead,status:"Proposta Enviada",updatedAt:new Date().toISOString()};
      const cloudLead = await salvarLeadSupabase(updatedLead);
      const finalLead = cloudLead?.ok && cloudLead.data ? cloudLead.data : updatedLead;
      nextLeads = leads.map(l=>String(l.id)===String(lead.id)?finalLead:l);
    }

    await persistCommercial({leads:nextLeads,services,proposals:nextProposals,items:nextItems});
    setProposalForm(emptyProposalForm());
    setEditingProposal(null);
    setScreen("commercial-proposals");
    showFeedback("Proposta salva com sucesso.","success");
  };

  const deleteProposal = async(id)=>{
    if(!confirm("Excluir esta proposta?")) return;
    const proposal = proposals.find(p=>String(p.id)===String(id));
    await deleteSupabaseRow("coral_propostas", proposal?.supabaseId || (isCloudId(id) ? id : null));
    await persistCommercial({
      leads,
      services,
      proposals:proposals.filter(p=>String(p.id)!==String(id)),
      items:proposalItems.filter(item=>String(item.proposalId)!==String(id) && String(item.proposalId)!==String(proposal?.supabaseId||""))
    });
    showFeedback("Proposta excluída.","success");
  };

  const proposalPdf = (proposal)=>{
    const related = proposalItems.filter(item=>String(item.proposalId)===String(proposal.id) || (proposal.supabaseId && String(item.proposalId)===String(proposal.supabaseId)));
    const lead = leads.find(l=>String(l.id)===String(proposal.leadId));
    openCommercialProposalPdf(proposal, related, lead);
  };

  const proposalDraftPdf = ()=>{
    const draft = normalizeProposal({
      ...proposalForm,
      id:proposalForm.id || editingProposal || "preview"
    });
    const lead = leads.find(l=>String(l.id)===String(draft.leadId));
    openCommercialProposalPdf(draft, proposalForm.items || [], lead);
  };

  const convertProposalToClient = async(proposal)=>{
    const related = proposalItems.filter(item=>String(item.proposalId)===String(proposal.id) || (proposal.supabaseId && String(item.proposalId)===String(proposal.supabaseId)));
    if(!related.length){
      if(!confirm("Esta proposta não tem itens vinculados. Deseja converter mesmo assim?")) return;
    }
    if(!confirm("Converter esta proposta em cliente ativo? O cadastro será criado no módulo atual sem solicitar novo cadastro.")) return;

    const existing = clients.find(c=>String(c.name||"").trim().toLowerCase()===String(proposal.empresa||"").trim().toLowerCase());
    let client = existing ? {
      ...existing,
      niche:existing.niche || proposal.segmento || "",
      instagram:existing.instagram || String(proposal.instagram||"").replace("@",""),
      notes:existing.notes || proposal.objetivos || "",
      extra:[existing.extra,`Convertido pelo módulo Comercial em ${new Date().toLocaleDateString("pt-BR")}. Valor final da proposta: ${moneyBR(proposal.valorFinal)}.`].filter(Boolean).join("\n\n")
    } : {
      id:newLocalId(),
      name:proposal.empresa || "Cliente sem nome",
      agency:"Coral Films",
      niche:proposal.segmento || "",
      instagram:String(proposal.instagram||"").replace("@",""),
      month:new Date().getMonth()+1,
      year:new Date().getFullYear(),
      notes:proposal.objetivos || `Cliente convertido a partir da proposta comercial ${proposal.empresa}.`,
      extra:`Origem: Módulo Comercial do ${APP_NAME}.\nResponsável: ${proposal.responsavel || "não informado"}\nWhatsApp: ${proposal.whatsapp || "não informado"}\nValor final da proposta: ${moneyBR(proposal.valorFinal)}.`,
      links:[],
      images:[],
      approvalLinks:[{type:"Vídeo",label:"",url:""}],
      approvalImages:[],
      plans:[],
      createdAt:new Date().toISOString(),
      commercialProposalId:proposal.id
    };

    const cloudClient = await salvarClienteSupabase(client,null);
    if(cloudClient?.ok && cloudClient.id){
      client = {...client,id:String(cloudClient.id),supabaseId:cloudClient.id,importedFromSupabase:true};
    }

    const nextClients = existing
      ? clients.map(c=>String(c.id)===String(existing.id)?client:c)
      : [client, ...clients];
    await persist(nextClients);

    const updatedProposal = {...proposal,status:"Convertida",updatedAt:new Date().toISOString()};
    await salvarProposalSupabase(updatedProposal, related);
    const nextProposals = proposals.map(p=>String(p.id)===String(proposal.id)?updatedProposal:p);

    let nextLeads = leads;
    const lead = leads.find(l=>String(l.id)===String(proposal.leadId));
    if(lead){
      const updatedLead = {...lead,status:"Cliente Ativo",updatedAt:new Date().toISOString()};
      const cloudLead = await salvarLeadSupabase(updatedLead);
      const finalLead = cloudLead?.ok && cloudLead.data ? cloudLead.data : updatedLead;
      nextLeads = leads.map(l=>String(l.id)===String(lead.id)?finalLead:l);
    }

    await persistCommercial({leads:nextLeads,services,proposals:nextProposals,items:proposalItems});
    showFeedback("Proposta convertida em cliente ativo.","success");
    setScreen("list");
    buscarPlanos();
  };


  const wrap={width:"100%",maxWidth:"72rem",margin:"0 auto",padding:"1.5rem 1rem"};

  return(
    <div className="app-shell">
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 18px rgba(0,240,255,.16)}50%{box-shadow:0 0 34px rgba(249,115,22,.25),0 0 44px rgba(0,240,255,.18)}}
        @keyframes gridMove{from{transform:translateY(0)}to{transform:translateY(42px)}}
        @keyframes floatParticle{0%{transform:translate3d(0,20px,0);opacity:0}25%{opacity:.55}100%{transform:translate3d(calc((var(--i) - 12) * 8px),-110vh,0);opacity:0}}
        @keyframes statusIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(-12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}

        *{box-sizing:border-box}
        body{margin:0;background:${C.black};}
        input:focus,select:focus,textarea:focus{border-color:${C.neon}!important;box-shadow:0 0 0 3px rgba(0,240,255,.12),0 0 24px rgba(0,240,255,.08)!important;outline:none!important}
        button{will-change:transform,box-shadow,background;transition:transform .18s ease,box-shadow .18s ease,background .18s ease,border-color .18s ease,opacity .18s ease}
        button:hover{transform:translateY(-1px)}
        button:active{transform:translateY(0) scale(.98)}
        ::-webkit-scrollbar{width:7px;background:#070b12}
        ::-webkit-scrollbar-thumb{background:linear-gradient(${C.orange},${C.neon});border-radius:999px}

        .app-shell{min-height:100vh;background:
          radial-gradient(circle at 12% 0%,rgba(249,115,22,.14),transparent 32%),
          radial-gradient(circle at 88% 8%,rgba(0,240,255,.12),transparent 30%),
          linear-gradient(180deg,#05070b 0%,#080d15 48%,#05070b 100%);
          color:${C.white};font-family:'Inter','Helvetica Neue',Arial,sans-serif;animation:fadeIn .55s ease-out}
        .app-shell::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.75),transparent 80%);}

        .app-header{position:sticky;top:0;z-index:100;height:68px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:linear-gradient(135deg,rgba(11,18,32,.72),rgba(5,7,11,.46));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(0,240,255,.22);box-shadow:0 14px 45px rgba(0,0,0,.32),0 0 28px rgba(0,240,255,.08)}
        .app-header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:linear-gradient(90deg,transparent,${C.orange},${C.neon},transparent);box-shadow:0 0 18px rgba(0,240,255,.65)}
        .header-brand{display:flex;align-items:center;gap:12px;min-width:0}
        .header-logo{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(249,115,22,.12),rgba(0,240,255,.08));border:1px solid rgba(255,255,255,.10);box-shadow:0 0 22px rgba(0,240,255,.12);overflow:hidden}
        .header-logo img{width:100%;height:100%;object-fit:contain;mix-blend-mode:screen;filter:brightness(1.12)}
        .header-brand strong{display:block;font-size:12px;letter-spacing:4px;color:${C.white};font-weight:900}
        .header-brand span{display:block;margin-top:3px;font-size:10px;letter-spacing:2px;color:${C.dim};text-transform:uppercase}
        .header-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end}

        .btn-new-client,.btn-generate{border:0;cursor:pointer;color:#090909;font-weight:950;text-transform:uppercase;letter-spacing:1.4px;background:linear-gradient(135deg,${C.orange},${C.orange2});box-shadow:0 0 22px rgba(249,115,22,.35),inset 0 1px 0 rgba(255,255,255,.28)}
        .btn-new-client{border-radius:999px;padding:11px 18px;font-size:12px}
        .btn-new-client:hover,.btn-generate:hover{transform:translateY(-2px) scale(1.025);box-shadow:0 0 30px rgba(249,115,22,.52),0 0 20px rgba(0,240,255,.10)}
        .btn-glass,.btn-icon,.btn-danger-modern{cursor:pointer;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.045);color:${C.white};backdrop-filter:blur(10px)}
        .btn-glass{border-radius:999px;padding:10px 15px;font-size:12px;font-weight:850;letter-spacing:1px;text-transform:uppercase}
        .btn-glass:hover,.btn-icon:hover{border-color:rgba(0,240,255,.42);box-shadow:0 0 18px rgba(0,240,255,.16)}
        .btn-generate{flex:1;border-radius:12px;padding:11px 12px;font-size:11px}
        .btn-icon,.btn-danger-modern{width:42px;min-width:42px;height:42px;border-radius:12px;font-size:15px;display:inline-flex;align-items:center;justify-content:center}
        .btn-edit:hover{border-color:rgba(0,240,255,.45);color:${C.neon}}
        .btn-danger-modern{border-color:rgba(239,68,68,.38);background:linear-gradient(135deg,rgba(239,68,68,.16),rgba(127,29,29,.12));color:#fecaca}
        .btn-danger-modern:hover{border-color:rgba(251,113,133,.85);background:linear-gradient(135deg,rgba(239,68,68,.34),rgba(127,29,29,.22));box-shadow:0 0 24px rgba(239,68,68,.36);color:#fff}

        .client-card{position:relative;overflow:hidden;background:linear-gradient(145deg,rgba(18,26,39,.96),rgba(7,11,18,.96));border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:14px;box-shadow:0 18px 55px rgba(0,0,0,.22);animation:fadeIn .36s ease-out both;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}
        .client-card::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(249,115,22,.10),transparent 36%,rgba(0,240,255,.075));opacity:.72;pointer-events:none}
        .client-card-glow{position:absolute;right:-65px;top:-65px;width:150px;height:150px;background:${C.neon};opacity:.08;filter:blur(20px);border-radius:999px}
        .client-card:hover{transform:translateY(-5px) scale(1.015);border-color:rgba(0,240,255,.30);box-shadow:0 24px 70px rgba(0,0,0,.36),0 0 34px rgba(0,240,255,.10)}
        .client-card-head,.client-meta-row,.client-actions,.client-instagram,.client-divider{position:relative;z-index:1}
        .client-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
        .client-card h3{font-size:18px;line-height:1.18;font-weight:950;letter-spacing:-.55px;margin:0 0 6px;color:${C.white}}
        .client-card-head span{font-size:10px;color:${C.orange};font-weight:900;letter-spacing:2px;text-transform:uppercase}
        .client-date{white-space:nowrap;border:1px solid rgba(0,240,255,.22);background:rgba(0,240,255,.06);color:${C.neon};font-size:10px;font-weight:850;letter-spacing:1px;text-transform:uppercase;border-radius:999px;padding:7px 10px}
        .client-instagram{font-size:12px;color:${C.dim}}
        .client-meta-row{display:flex;gap:8px;flex-wrap:wrap;color:${C.dim};font-size:11px}
        .client-meta-row span{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:999px;padding:6px 9px}
        .client-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.13),transparent)}
        .client-actions{display:flex;gap:9px;flex-wrap:nowrap}

        .loading-screen{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(circle at 50% 20%,rgba(0,240,255,.12),transparent 30%),radial-gradient(circle at 70% 75%,rgba(249,115,22,.12),transparent 28%),#020409;transition:opacity .55s ease,filter .55s ease}
        .loading-screen.is-leaving{opacity:0;filter:blur(10px)}
        .loading-grid{position:absolute;inset:-80px;background-image:linear-gradient(rgba(0,240,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,.10) 1px,transparent 1px);background-size:42px 42px;transform-origin:center;animation:gridMove 1.4s linear infinite;mask-image:radial-gradient(circle,rgba(0,0,0,.9),transparent 72%)}
        .particle-field span{position:absolute;bottom:-30px;left:calc((var(--i) * 4.2%) + 2%);width:3px;height:3px;border-radius:999px;background:${C.neon};box-shadow:0 0 12px ${C.neon};animation:floatParticle calc(3s + (var(--i) * .08s)) linear infinite;animation-delay:calc(var(--i) * -.18s)}
        .loading-core{position:relative;z-index:1;width:min(92vw,420px);display:flex;flex-direction:column;align-items:center;gap:18px;padding:34px 28px;border-radius:28px;background:linear-gradient(145deg,rgba(15,23,42,.72),rgba(2,6,23,.38));border:1px solid rgba(255,255,255,.10);backdrop-filter:blur(18px);box-shadow:0 25px 80px rgba(0,0,0,.45);animation:pulseGlow 2.4s ease-in-out infinite}
        .loading-logo-ring{width:154px;height:154px;border-radius:999px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,240,255,.20);background:radial-gradient(circle,rgba(0,240,255,.08),transparent 62%)}
        .loading-copy{text-align:center}
        .loading-copy strong{display:block;font-size:12px;letter-spacing:5px;font-weight:950;color:${C.white}}
        .loading-copy span{display:block;margin-top:6px;font-size:10px;letter-spacing:2.5px;color:${C.dim}}
        .loading-status{width:100%;display:grid;gap:8px;margin-top:4px}
        .loading-status div{display:flex;align-items:center;gap:9px;color:${C.muted};font-size:12px;letter-spacing:.6px;opacity:.7}
        .loading-status div.active{color:${C.neon};opacity:1;animation:statusIn .28s ease-out}
        .loading-status div.done{color:${C.success};opacity:.95}
        .loading-status span{width:18px;display:inline-flex;justify-content:center;font-weight:900}
        .loading-bar{width:100%;height:5px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid rgba(255,255,255,.07)}
        .loading-bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,${C.orange},${C.neon});box-shadow:0 0 20px rgba(0,240,255,.45);transition:width .7s cubic-bezier(.22,1,.36,1)}

        .toast{position:fixed;top:84px;right:22px;z-index:2000;max-width:min(380px,calc(100vw - 44px));border-radius:16px;padding:13px 16px;font-size:13px;font-weight:800;line-height:1.45;animation:toastIn .22s ease-out;border:1px solid rgba(34,197,94,.35);background:linear-gradient(135deg,rgba(22,101,52,.92),rgba(5,46,22,.86));box-shadow:0 16px 45px rgba(0,0,0,.35),0 0 28px rgba(34,197,94,.16)}
        .toast.error{border-color:rgba(239,68,68,.45);background:linear-gradient(135deg,rgba(127,29,29,.95),rgba(69,10,10,.88));box-shadow:0 16px 45px rgba(0,0,0,.35),0 0 28px rgba(239,68,68,.18)}


        /* ── Coral Hub v3.0: camada responsiva mobile-first + fallback Tailwind ── */
        .w-full{width:100%}
        .max-w-6xl{max-width:72rem}
        .max-w-3xl{max-width:48rem}
        .mx-auto{margin-left:auto;margin-right:auto}
        .px-4{padding-left:1rem;padding-right:1rem}
        .min-w-0{min-width:0}
        .shrink-0{flex-shrink:0}
        .hidden{display:none}
        .flex{display:flex}
        .grid{display:grid}
        .gap-4{gap:1rem}
        .grid-cols-1{grid-template-columns:1fr}
        .flex-col{flex-direction:column}
        .sticky{position:sticky}
        .top-0{top:0}
        .z-50{z-index:50}

        .desktop-actions{display:none;gap:.625rem;align-items:center;justify-content:flex-end;flex-wrap:wrap;flex:0 1 auto}
        .desktop-actions .btn-glass,.desktop-actions .btn-new-client{width:auto!important;min-width:8.75rem;max-width:16rem;white-space:nowrap}
        .desktop-actions .btn-new-client{min-width:14rem}
        .mobile-menu-toggle{display:inline-flex;align-items:center;justify-content:center;width:2.875rem;height:2.875rem;border-radius:1rem;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.055);color:${C.white};font-size:1.35rem;font-weight:950;line-height:1}
        .mobile-drawer{position:absolute;top:calc(100% + .55rem);left:.75rem;right:.75rem;z-index:120;padding:1rem;border-radius:1.25rem;border:1px solid rgba(0,240,255,.22);background:linear-gradient(145deg,rgba(10,15,24,.98),rgba(4,7,12,.96));backdrop-filter:blur(18px);box-shadow:0 1.5rem 4rem rgba(0,0,0,.45),0 0 2rem rgba(0,240,255,.10);animation:fadeIn .18s ease-out}
        .mobile-drawer-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;color:${C.dim};font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.16rem}
        .mobile-drawer-actions{display:grid;grid-template-columns:1fr;gap:.625rem}
        .mobile-drawer-actions button{min-height:3rem;border-radius:1rem}
        .responsive-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}

        @media(min-width:40rem){
          .sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media(min-width:48rem){
          .md\\:flex{display:flex}
          .md\\:hidden{display:none!important}
          .md\\:w-auto{width:auto}
          .md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
          .md\\:flex-row{flex-direction:row}
          .desktop-actions{display:flex!important}
          .mobile-menu-toggle,.mobile-drawer{display:none!important}
        }
        @media(min-width:64rem){
          .lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
        }
        @media(min-width:80rem){
          .xl\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
        }

        @media(max-width:47.99rem){
          body{overflow-x:hidden}
          .app-shell{overflow-x:hidden}
          .app-header{height:auto;min-height:4.5rem;padding:.75rem 1rem;align-items:center;position:sticky}
          .header-brand{gap:.625rem;max-width:calc(100% - 3.4rem)}
          .header-logo{width:2.65rem;height:2.65rem;border-radius:.9rem}
          .header-brand strong{font-size:.72rem;letter-spacing:.18rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .header-brand span{font-size:.58rem;letter-spacing:.08rem;max-width:13rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .header-actions,.desktop-actions{display:none!important}
          .btn-new-client,.btn-glass,.btn-generate{width:100%;min-height:3rem;border-radius:1rem;font-size:.72rem}
          .btn-icon,.btn-danger-modern{width:3rem;min-width:3rem;height:3rem;border-radius:1rem}
          div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
          div[style*="min-width"]{min-width:0!important}
          input,select,textarea{font-size:1rem!important;min-height:2.875rem}
          textarea{min-height:5.25rem}
          table{min-width:42rem}
          .client-card{border-radius:1.25rem;padding:1rem}
          .client-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:.75rem!important;align-items:center}
          .client-actions .btn-generate{grid-column:1/-1;width:100%;min-height:3.25rem;border-radius:1rem}
          .client-actions .btn-icon,.client-actions .btn-danger-modern{width:100%!important;min-width:0!important;height:3.25rem!important;border-radius:1rem}
          .toast{top:5.2rem;left:1rem;right:1rem;max-width:none}
        }

        @media(max-width:720px){
          body{overflow-x:hidden}
          .app-header{height:auto;min-height:66px;padding:12px 14px}
          .header-brand strong{font-size:11px;letter-spacing:3px}
          .header-brand span{font-size:9px}
          .btn-new-client,.btn-glass{padding:10px 12px;font-size:11px}
          .btn-generate{min-width:100%}
          button{min-height:38px}
        }
      `}</style>

      {splash && <LoadingScreen onDone={()=>setSplash(false)}/>}
      <Header screen={screen} onBack={()=>setScreen("list")} onNew={startNew} onCommercial={()=>setScreen("commercial")} onNavigate={goCommercial}/>
      {feedback && <div className={`toast ${feedback.type==="error" ? "error" : ""}`}>{feedback.message}</div>}

      {/* ── LIST ── */}
      {screen==="list"&&(
        <div style={wrap}>
          <div style={{marginBottom:28,animation:"fadeIn .4s ease-out"}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:5}}>{APP_NAME}</div>
            <h1 style={{fontSize:28,fontWeight:900,letterSpacing:-1,margin:0}}>Clientes <span style={{color:C.orange}}>Cadastrados</span></h1>
            <p style={{fontSize:12,color:C.dim,lineHeight:1.7,margin:"8px 0 0"}}>{APP_SUBTITLE}</p>
            <div style={{width:44,height:3,background:C.orange,marginTop:10,borderRadius:1,boxShadow:C.orangeG}}/>
            {STORAGE_MODE_LABEL && <div style={{marginTop:10,fontSize:11,color:C.dim,lineHeight:1.6}}>{STORAGE_MODE_LABEL}</div>}
          </div>
          {loadingList?(
            <div style={{...ncrd,textAlign:"center",padding:46,animation:"fadeIn .4s ease-out"}}>
              <div style={{fontSize:32,marginBottom:12}}>⚙️</div>
              <p style={{color:C.dim,margin:0,fontSize:14}}>Carregando clientes...</p>
            </div>
          ):clients.length===0?(
            <div style={{...ocrd,textAlign:"center",padding:56,borderStyle:"dashed",animation:"fadeIn .4s ease-out"}}>
              <div style={{fontSize:44,marginBottom:14}}>📋</div>
              <p style={{color:C.dim,marginBottom:22,fontSize:14}}>Nenhum cliente ainda.</p>
              <button className="btn-new-client" onClick={startNew}>+ Criar Primeiro Cliente</button>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,19rem),1fr))",gap:18}}>
              {clients.map((c,ci)=>(
                <ClientCard
                  key={c.id}
                  plano={c}
                  index={ci}
                  onGenerate={generate}
                  onOpen={openSavedPlan}
                  onEdit={startEdit}
                  onDelete={deletarPlano}
                />
              ))}
            </div>
          )}
        </div>
      )}


      {/* ── COMERCIAL ── */}
      {screen==="commercial"&&(
        commercialLoading ? (
          <div style={wrap}>
            <div style={{...ncrd,textAlign:"center",padding:46}}>
              <div style={{fontSize:32,marginBottom:12}}>⚙️</div>
              <p style={{color:C.dim,margin:0,fontSize:14}}>Carregando módulo comercial...</p>
            </div>
          </div>
        ) : (
          <CommercialHome
            leads={leads}
            services={services}
            proposals={proposals}
            onNavigate={goCommercial}
          />
        )
      )}

      {screen==="commercial-leads"&&(
        <LeadsView
          leads={leads}
          form={leadForm}
          setForm={setLeadForm}
          editingLead={editingLead}
          filters={leadFilters}
          setFilters={setLeadFilters}
          onSave={saveLead}
          onEdit={editLead}
          onDelete={deleteLead}
          onNew={startNewLead}
          onNavigate={goCommercial}
        />
      )}

      {screen==="commercial-services"&&(
        <ServicesCatalogView
          services={services}
          form={serviceForm}
          setForm={setServiceForm}
          editingService={editingService}
          onSave={saveService}
          onEdit={editService}
          onDelete={deleteService}
          onNew={startNewService}
          onNavigate={goCommercial}
        />
      )}

      {screen==="commercial-proposals"&&(
        <ProposalsView
          proposals={proposals}
          items={proposalItems}
          leads={leads}
          onNew={startNewProposal}
          onEdit={editProposal}
          onPdf={proposalPdf}
          onConvert={convertProposalToClient}
          onDelete={deleteProposal}
          onNavigate={goCommercial}
        />
      )}

      {screen==="commercial-proposal-form"&&(
        <ProposalFormView
          form={proposalForm}
          setForm={setProposalForm}
          leads={leads}
          services={services}
          onLeadChange={onProposalLeadChange}
          onToggleService={toggleProposalService}
          onUpdateItem={updateProposalItem}
          onRemoveItem={removeProposalItem}
          onSave={saveProposal}
          onCancel={()=>setScreen("commercial-proposals")}
          onPdfDraft={proposalDraftPdf}
          onNavigate={goCommercial}
          editingProposal={editingProposal}
        />
      )}

      {/* ── FORM ── */}
      {screen==="form"&&(
        <div className="max-w-3xl mx-auto px-4 w-full" style={{...wrap,maxWidth:"46rem",animation:"fadeIn .35s ease-out"}}>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:4,color:C.orange,textTransform:"uppercase",marginBottom:5}}>{editing?"Editar":"Novo"} Cliente</div>
            <h2 style={{fontSize:22,fontWeight:900,margin:0}}>Cadastro <span style={{color:C.orange}}>de Cliente</span></h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={lbl}>Nome do Cliente *</label><input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Mister Burgers"/></div>
              <div><label style={lbl}>Agência</label><input style={inp} value={form.agency} onChange={e=>setForm(f=>({...f,agency:e.target.value}))} placeholder="Coral Films"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div><label style={lbl}>Nicho</label><input style={inp} value={form.niche} onChange={e=>setForm(f=>({...f,niche:e.target.value}))} placeholder="Ex: Hamburgueria"/></div>
              <div>
                <label style={lbl}>Mês</label>
                <select style={inp} value={form.month} onChange={e=>setForm(f=>({...f,month:Number(e.target.value)}))}>
                  {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Ano</label><input style={inp} type="number" value={form.year} onChange={e=>setForm(f=>({...f,year:Number(e.target.value)}))}/></div>
            </div>
            <div><label style={lbl}>Instagram (sem @)</label><input style={inp} value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} placeholder="coralfilms"/></div>

            {/* Links */}
            <div style={ncrd}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <label style={{...lbl,margin:0}}>🔗 Links de Arquivos</label>
                <button style={btn("neon","sm")} onClick={addLink}>+ Link</button>
              </div>
              {form.links.map((l,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                  <input style={{...inp,width:130,flexShrink:0}} value={l.label} onChange={e=>updLink(i,"label",e.target.value)} placeholder="Rótulo"/>
                  <input style={inp} value={l.url} onChange={e=>updLink(i,"url",e.target.value)} placeholder="https://..."/>
                  <button onClick={()=>delLink(i)} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:20,flexShrink:0,padding:"0 4px"}}>×</button>
                </div>
              ))}
            </div>

            {/* Images */}
            <div style={ncrd}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <label style={{...lbl,margin:0}}>🖼 Referências Visuais</label>
                <button style={btn("primary","sm")} onClick={pickImages}>+ Adicionar Imagens</button>
              </div>
              {/* input file totalmente desacoplado, acionado via ref */}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                multiple
                style={{position:"absolute",width:1,height:1,opacity:0,pointerEvents:"none"}}
                onChange={onFileChange}
              />
              {(form.images||[]).length===0?(
                <div
                  onClick={pickImages}
                  style={{border:`2px dashed ${C.border}`,borderRadius:6,padding:32,textAlign:"center",color:C.dim,fontSize:13,cursor:"pointer"}}
                >
                  Toque aqui para abrir a galeria e selecionar imagens
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,6rem),1fr))",gap:8}}>
                  {form.images.map((img,i)=>(
                    <div key={i} style={{position:"relative",borderRadius:6,overflow:"hidden",aspectRatio:"1",border:`1px solid #f9731633`}}>
                      <img src={img.data} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <button onClick={()=>removeImg(i)} style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,.85)",border:`1px solid ${C.orange}`,color:C.orange,borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,padding:0}}>×</button>
                    </div>
                  ))}
                  <div onClick={pickImages} style={{borderRadius:6,border:`2px dashed ${C.border}`,aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.dim,fontSize:24}}>+</div>
                </div>
              )}
            </div>

            {/* Approval Materials */}
            <div style={ocrd}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <label style={{...lbl,margin:0}}>✅ Artes e vídeos produzidos para aprovação</label>
                <button style={btn("primary","sm")} onClick={pickFinalImages}>+ Adicionar Artes</button>
              </div>
              <input
                ref={finalFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                multiple
                style={{position:"absolute",width:1,height:1,opacity:0,pointerEvents:"none"}}
                onChange={onFinalFileChange}
              />
              {(form.approvalImages||[]).length===0?(
                <div onClick={pickFinalImages} style={{border:`2px dashed ${C.border}`,borderRadius:6,padding:24,textAlign:"center",color:C.dim,fontSize:13,cursor:"pointer",marginBottom:12}}>
                  Toque aqui para anexar as artes finais já produzidas
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,6rem),1fr))",gap:8,marginBottom:12}}>
                  {form.approvalImages.map((img,i)=>(
                    <div key={i} style={{position:"relative",borderRadius:6,overflow:"hidden",aspectRatio:"1",border:`1px solid #f9731633`}}>
                      <img src={img.data} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <button onClick={()=>removeFinalImg(i)} style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,.85)",border:`1px solid ${C.orange}`,color:C.orange,borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,padding:0}}>×</button>
                    </div>
                  ))}
                  <div onClick={pickFinalImages} style={{borderRadius:6,border:`2px dashed ${C.border}`,aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.dim,fontSize:24}}>+</div>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"10px 0"}}>
                <label style={{...lbl,margin:0}}>Links dos vídeos / arquivos finais</label>
                <button style={btn("ghost","sm")} onClick={addApprovalLink}>+ Link</button>
              </div>
              {(form.approvalLinks||[]).map((l,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"100px 140px 1fr 28px",gap:8,marginBottom:8}}>
                  <select style={inp} value={l.type||"Vídeo"} onChange={e=>updApprovalLink(i,"type",e.target.value)}>
                    <option>Vídeo</option><option>Arte</option><option>Post</option><option>Reels</option><option>Drive</option>
                  </select>
                  <input style={inp} value={l.label} onChange={e=>updApprovalLink(i,"label",e.target.value)} placeholder="Nome"/>
                  <input style={inp} value={l.url} onChange={e=>updApprovalLink(i,"url",e.target.value)} placeholder="https://..."/>
                  <button onClick={()=>delApprovalLink(i)} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:20,padding:0}}>×</button>
                </div>
              ))}
            </div>

            <div><label style={lbl}>Observações / Briefing</label><textarea style={{...inp,height:88,resize:"vertical"}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Tom de voz, produto principal, diferenciais…"/></div>
            <div><label style={lbl}>Detalhes extras para IA</label><textarea style={{...inp,height:68,resize:"vertical"}} value={form.extra} onChange={e=>setForm(f=>({...f,extra:e.target.value}))} placeholder="Foco do mês, lançamento, promoção especial…"/></div>
            <div style={{display:"flex",gap:10}}>
              <button style={{...btn("primary"),flex:1,padding:13}} onClick={saveForm}>Salvar Cliente</button>
              <button style={{...btn("ghost"),padding:13}} onClick={()=>setScreen("list")}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATING ── */}
      {screen==="generating"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"80vh",gap:26,padding:24}}>
          {!genErr?(
            <>
              <div style={{position:"relative",width:72,height:72}}>
                <div style={{position:"absolute",inset:0,border:"2px solid #f9731633",borderRadius:"50%"}}/>
                <div style={{position:"absolute",inset:0,border:"2px solid transparent",borderTopColor:C.orange,borderRadius:"50%",animation:"spin 1s linear infinite",boxShadow:C.orangeG}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>⚡</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,letterSpacing:-.5,marginBottom:8}}>Gerando Planejamento</div>
                <div style={{fontSize:11,color:C.orange,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>{genStep}</div>
              </div>
              <div style={{width:"min(100%,17.5rem)",background:C.surface,borderRadius:2,overflow:"hidden",border:`1px solid ${C.border}`}}>
                <div style={{height:3,background:C.orange,boxShadow:C.orangeG,transition:"width 1.5s ease",width:`${genPct}%`}}/>
              </div>
            </>
          ):(
            <div style={{...ocrd,textAlign:"center",maxWidth:480,padding:36}}>
              <div style={{fontSize:36,marginBottom:14}}>⚠️</div>
              <div style={{fontSize:16,fontWeight:800,marginBottom:10,color:C.orange}}>Erro ao gerar</div>
              <div style={{fontSize:12,color:C.dim,lineHeight:1.7,marginBottom:20}}>{genErr}</div>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button style={btn("primary")} onClick={()=>generate(active)}>Tentar Novamente</button>
                <button style={btn("ghost")} onClick={()=>setScreen("list")}>Voltar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PLAN ── */}
      {screen==="plan"&&plan&&active&&(
        <PlanView
          client={active}
          plan={plan}
          onRegen={()=>generate(active)}
          onExportPlan={()=>openPremiumPdf(active,plan,"plan")}
          onExportFinal={()=>openPremiumPdf(active,plan,"approval")}
          onEditClient={()=>startEdit(active)}
        />
      )}

      <footer style={{maxWidth:"72rem",margin:"0 auto",padding:"22px 20px 34px",color:C.muted,fontSize:11,letterSpacing:1.4,textTransform:"uppercase",display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <span>{APP_NAME} · {APP_VERSION}</span>
        <span>{APP_SUBTITLE}</span>
      </footer>
    </div>
  );
}


export default function App(){
  return (
    <AppErrorBoundary>
      <CoralFilmsApp />
    </AppErrorBoundary>
  );
}
