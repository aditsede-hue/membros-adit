"use client";

import { useState } from "react";

/* ── Types ──────────────────────────────────────────────────────── */
type AbaPage    = "escalas" | "obreiros" | "configuracoes";
type ModoEscala = "lista" | "criar" | "ver";
type AbConfig   = "postos" | "cargos" | "cultos" | "mensagem";

interface Cargo      { id: number; nome: string; }
interface Posto      { id: number; nome: string; multiplos: boolean; }
interface TipoCulto  { id: number; nome: string; diaSemana: string; horario: string; }
interface Obreiro    { id: number; nome: string; cargoId: number; telefone: string; }
interface Atribuicao { obreiroId: number; horario: string; }
interface PostoEsc   { postoId: number; atribuicoes: Atribuicao[]; }
interface Escala     { id: number; tipoCultoId: number; data: string; postos: PostoEsc[]; coordenacaoIds: number[]; observacoes: string; }

/* ── Initial data ───────────────────────────────────────────────── */
const CARGOS0: Cargo[] = [
  {id:1,nome:"Dc"},{id:2,nome:"Dcª"},{id:3,nome:"Aux"},{id:4,nome:"Coop"},{id:5,nome:"Missª"},
];
const POSTOS0: Posto[] = [
  {id:1,nome:"Servir o Altar",multiplos:false},
  {id:2,nome:"Microfones",multiplos:false},
  {id:3,nome:"Recepção",multiplos:true},
  {id:4,nome:"Portaria",multiplos:true},
  {id:5,nome:"Fechar a Igreja",multiplos:false},
  {id:6,nome:"Coordenação",multiplos:true},
];
const CULTOS0: TipoCulto[] = [
  {id:1,nome:"Culto de Ensino",diaSemana:"Terça",horario:"18:50h às 21h30"},
  {id:2,nome:"Culto de Oração e Libertação",diaSemana:"Quinta",horario:"18:50h às 21h30"},
  {id:3,nome:"Escola Bíblica",diaSemana:"Sábado",horario:"18:50h às 21h30"},
  {id:4,nome:"Culto de Departamentos",diaSemana:"Domingo",horario:"18:50h às 21h30"},
  {id:5,nome:"Culto de Santa Ceia",diaSemana:"Domingo",horario:"18:50h às 21h30"},
];
const OBREIROS0: Obreiro[] = [
  {id:1,nome:"Crislano",cargoId:1,telefone:"61999990001"},
  {id:2,nome:"Jordano",cargoId:3,telefone:"61999990002"},
  {id:3,nome:"Débora",cargoId:2,telefone:"61999990003"},
  {id:4,nome:"Jeane",cargoId:4,telefone:"61999990004"},
  {id:5,nome:"Liliane",cargoId:4,telefone:"61999990005"},
  {id:6,nome:"Mary",cargoId:4,telefone:"61999990006"},
  {id:7,nome:"Hugo",cargoId:3,telefone:"61999990007"},
  {id:8,nome:"Carlos",cargoId:3,telefone:"61999990008"},
  {id:9,nome:"Hozias",cargoId:3,telefone:"61999990009"},
  {id:10,nome:"Adriana",cargoId:5,telefone:"61999990010"},
];
const ESCALAS0: Escala[] = [{
  id:1, tipoCultoId:1, data:"2026-04-15",
  postos:[
    {postoId:1,atribuicoes:[{obreiroId:1,horario:"18:50h às 21h30"}]},
    {postoId:2,atribuicoes:[{obreiroId:2,horario:"18:50h às 21h30"}]},
    {postoId:3,atribuicoes:[{obreiroId:3,horario:"18:50h às 20h"},{obreiroId:4,horario:"18:50h às 20h"},{obreiroId:5,horario:"18:50h às 20h"},{obreiroId:6,horario:"18:50h às 20h"}]},
    {postoId:4,atribuicoes:[{obreiroId:7,horario:"1° 18:50h às 20h"},{obreiroId:8,horario:"2° 20h às 21h30"}]},
    {postoId:5,atribuicoes:[{obreiroId:9,horario:""}]},
  ],
  coordenacaoIds:[10],
  observacoes:"",
}];
const TEMPLATE0 = `ESCALA {culto} — {data}

{postos}

COORDENAÇÃO: {coordenacao}

——————————————
Prezado(a) {nome_obreiro},
Você está escalado(a) para:
Posto: {posto_obreiro}
Horário: {horario_obreiro}

UNIFORME
Homens: Terno Preto | Camisa Branca | Gravata Azul
Mulheres: Vestido Preto | Lencinhos Azul

Campo ADIT — Secretaria`;

/* ── Utils ──────────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  if (!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function nextId(arr: {id:number}[]) {
  return arr.length === 0 ? 1 : Math.max(...arr.map(a => a.id)) + 1;
}

/* ── SVG Icons ──────────────────────────────────────────────────── */
const IPlus  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>;
const IEdit  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/></svg>;
const ITrash = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,3.5 12,3.5"/><path d="M5.5 3.5V2.5h3v1M4 3.5l.7 8h4.6l.7-8"/></svg>;
const IEye   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z"/><circle cx="7" cy="7" r="1.5"/></svg>;
const IBack  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11L5 7l4-4"/></svg>;
const IWA    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;

/* ── Shared UI ──────────────────────────────────────────────────── */
function PrimaryBtn({onClick,children}: {onClick:()=>void;children:React.ReactNode}) {
  return (
    <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:"var(--radius)",border:"none",background:"#3b82f6",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:"var(--shadow-sm)"}}>
      {children}
    </button>
  );
}
function GhostBtn({onClick,children,title}: {onClick:()=>void;children:React.ReactNode;title?:string}) {
  return (
    <button onClick={onClick} title={title} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:"var(--radius)",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink-muted)",fontSize:13,fontWeight:500,cursor:"pointer"}}>
      {children}
    </button>
  );
}
function IconBtn({onClick,children,danger,title}: {onClick:()=>void;children:React.ReactNode;danger?:boolean;title?:string}) {
  return (
    <button onClick={onClick} title={title} style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"var(--radius)",border:"1px solid var(--border)",background:"var(--surface)",cursor:"pointer",color:danger?"var(--red)":"var(--ink-muted)"}}>
      {children}
    </button>
  );
}
function FieldLabel({children}: {children:React.ReactNode}) {
  return <label style={{fontSize:13,fontWeight:500,color:"var(--ink)",marginBottom:6,display:"block"}}>{children}</label>;
}
function TInput({value,onChange,placeholder,type="text"}: {value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{padding:"8px 12px",borderRadius:"var(--radius)",border:"1px solid var(--border)",fontSize:14,outline:"none",background:"var(--surface)",color:"var(--ink)",width:"100%"}}
    />
  );
}
function TSelect({value,onChange,children}: {value:string;onChange:(v:string)=>void;children:React.ReactNode}) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{padding:"8px 12px",borderRadius:"var(--radius)",border:"1px solid var(--border)",fontSize:14,outline:"none",background:"var(--surface)",color:"var(--ink)",width:"100%",cursor:"pointer"}}>
      {children}
    </select>
  );
}
function ThCell({children}: {children:React.ReactNode}) {
  return <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:600,color:"var(--ink-muted)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{children}</th>;
}
function TdCell({children}: {children:React.ReactNode}) {
  return <td style={{padding:"12px 14px",fontSize:13,color:"var(--ink-muted)"}}>{children}</td>;
}

/* ═══════════════════════════════════════════════════════════════════
   ABA ESCALAS
═══════════════════════════════════════════════════════════════════ */
function AbaEscalas({escalas,setEscalas,cultos,postos,obreiros,cargos,template}: {
  escalas:Escala[];setEscalas:React.Dispatch<React.SetStateAction<Escala[]>>;
  cultos:TipoCulto[];postos:Posto[];obreiros:Obreiro[];cargos:Cargo[];template:string;
}) {
  const [modo, setModo] = useState<ModoEscala>("lista");
  const [escalaSel, setEscalaSel] = useState<Escala|null>(null);

  function getCulto(id:number) { return cultos.find(c=>c.id===id); }
  function getPosto(id:number) { return postos.find(p=>p.id===id); }
  function getObreiro(id:number) { return obreiros.find(o=>o.id===id); }
  function getCargo(id:number) { return cargos.find(c=>c.id===id); }
  function nomeObreiro(id:number) {
    const o=getObreiro(id); if(!o) return "—";
    const c=getCargo(o.cargoId);
    return c ? `${c.nome} ${o.nome}` : o.nome;
  }
  function totalObreiros(e:Escala) {
    return e.postos.reduce((acc,p)=>acc+p.atribuicoes.length,0)+e.coordenacaoIds.length;
  }
  function excluirEscala(id:number) {
    if(confirm("Excluir esta escala?")) setEscalas(prev=>prev.filter(e=>e.id!==id));
  }
  function salvarEscala(e:Escala) {
    setEscalas(prev=>{
      const ex=prev.find(x=>x.id===e.id);
      return ex ? prev.map(x=>x.id===e.id?e:x) : [e,...prev];
    });
    setModo("lista");
  }

  if(modo==="criar") {
    return <CriarEscala cultos={cultos} postos={postos} obreiros={obreiros} cargos={cargos}
      onSalvar={salvarEscala} onCancelar={()=>setModo("lista")} novoId={nextId(escalas)} />;
  }
  if(modo==="ver" && escalaSel) {
    return <VerEscala escala={escalaSel} cultos={cultos} postos={postos} obreiros={obreiros}
      cargos={cargos} template={template} nomeObreiro={nomeObreiro} onVoltar={()=>setModo("lista")} />;
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
        <PrimaryBtn onClick={()=>setModo("criar")}><IPlus/> Nova Escala</PrimaryBtn>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        {escalas.length===0 ? (
          <div style={{padding:40,textAlign:"center",color:"var(--ink-muted)"}}>Nenhuma escala cadastrada.</div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px solid var(--border)",background:"var(--surface-2)"}}>
                <ThCell>Culto</ThCell><ThCell>Data</ThCell><ThCell>Obreiros</ThCell><ThCell>Ações</ThCell>
              </tr>
            </thead>
            <tbody>
              {escalas.map((e,i)=>{
                const culto=getCulto(e.tipoCultoId);
                return (
                  <tr key={e.id} style={{borderBottom:i<escalas.length-1?"1px solid var(--border)":"none"}}
                    onMouseEnter={ev=>(ev.currentTarget.style.background="var(--surface-2)")}
                    onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                    <td style={{padding:"12px 14px"}}>
                      <p style={{fontSize:14,fontWeight:600,color:"var(--ink)",margin:0}}>{culto?.nome||"—"}</p>
                      <p style={{fontSize:12,color:"var(--ink-muted)",margin:0}}>{culto?.diaSemana} · {culto?.horario}</p>
                    </td>
                    <TdCell>{fmtDate(e.data)}</TdCell>
                    <TdCell>{totalObreiros(e)} obreiro{totalObreiros(e)!==1?"s":""}</TdCell>
                    <td style={{padding:"12px 14px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <IconBtn onClick={()=>{setEscalaSel(e);setModo("ver");}} title="Visualizar"><IEye/></IconBtn>
                        <IconBtn onClick={()=>excluirEscala(e.id)} danger title="Excluir"><ITrash/></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Criar Escala ─────────────────────────────────────────────────*/
function CriarEscala({cultos,postos,obreiros,cargos,onSalvar,onCancelar,novoId}: {
  cultos:TipoCulto[];postos:Posto[];obreiros:Obreiro[];cargos:Cargo[];
  onSalvar:(e:Escala)=>void;onCancelar:()=>void;novoId:number;
}) {
  const postosSemCoord = postos.filter(p=>p.nome!=="Coordenação");
  const [cultoId,  setCultoId]  = useState(cultos[0]?.id?.toString()||"");
  const [data,     setData]     = useState("");
  const [postosEsc,setPostosEsc]= useState<PostoEsc[]>(postosSemCoord.map(p=>({postoId:p.id,atribuicoes:[]})));
  const [coordIds, setCoordIds] = useState<number[]>([]);
  const [obs,      setObs]      = useState("");

  function getCargo(id:number) { return cargos.find(c=>c.id===id); }
  function getPosto(id:number) { return postos.find(p=>p.id===id); }

  function addAtrib(postoId:number) {
    setPostosEsc(prev=>prev.map(p=>p.postoId===postoId
      ? {...p,atribuicoes:[...p.atribuicoes,{obreiroId:obreiros[0]?.id||0,horario:""}]}
      : p));
  }
  function removeAtrib(postoId:number,idx:number) {
    setPostosEsc(prev=>prev.map(p=>p.postoId===postoId
      ? {...p,atribuicoes:p.atribuicoes.filter((_,i)=>i!==idx)}
      : p));
  }
  function updateAtrib(postoId:number,idx:number,field:"obreiroId"|"horario",value:string) {
    setPostosEsc(prev=>prev.map(p=>p.postoId===postoId
      ? {...p,atribuicoes:p.atribuicoes.map((a,i)=>i===idx
          ? {...a,[field]:field==="obreiroId"?parseInt(value):value}:a)}
      : p));
  }
  function toggleCoord(id:number) {
    setCoordIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  }
  function handleSalvar() {
    if(!cultoId||!data){alert("Selecione o culto e a data.");return;}
    onSalvar({id:novoId,tipoCultoId:parseInt(cultoId),data,
      postos:postosEsc.filter(p=>p.atribuicoes.length>0),
      coordenacaoIds:coordIds,observacoes:obs});
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <GhostBtn onClick={onCancelar}><IBack/> Voltar</GhostBtn>
        <h2 style={{fontSize:18,margin:0}}>Nova Escala</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* Culto + Data */}
        <div className="card" style={{padding:20}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:"var(--ink)"}}>Informações gerais</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div><FieldLabel>Tipo de culto *</FieldLabel>
              <TSelect value={cultoId} onChange={setCultoId}>
                {cultos.map(c=><option key={c.id} value={c.id}>{c.nome} ({c.diaSemana})</option>)}
              </TSelect>
            </div>
            <div><FieldLabel>Data *</FieldLabel><TInput type="date" value={data} onChange={setData}/></div>
          </div>
        </div>

        {/* Postos */}
        {postosEsc.map(pe=>{
          const posto=getPosto(pe.postoId); if(!posto) return null;
          return (
            <div key={pe.postoId} className="card" style={{padding:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <h3 style={{fontSize:14,fontWeight:600,margin:0,color:"var(--ink)"}}>{posto.nome}</h3>
                {(posto.multiplos||pe.atribuicoes.length===0) && (
                  <GhostBtn onClick={()=>addAtrib(pe.postoId)}><IPlus/> Adicionar obreiro</GhostBtn>
                )}
              </div>
              {pe.atribuicoes.length===0 ? (
                <p style={{fontSize:13,color:"var(--ink-muted)",margin:0}}>Nenhum obreiro atribuído.</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {pe.atribuicoes.map((a,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:10,alignItems:"flex-end"}}>
                      <div><FieldLabel>Obreiro</FieldLabel>
                        <TSelect value={a.obreiroId.toString()} onChange={v=>updateAtrib(pe.postoId,i,"obreiroId",v)}>
                          {obreiros.map(o=>{const c=getCargo(o.cargoId);return<option key={o.id} value={o.id}>{c?.nome} {o.nome}</option>;})}
                        </TSelect>
                      </div>
                      <div><FieldLabel>Horário</FieldLabel>
                        <TInput value={a.horario} onChange={v=>updateAtrib(pe.postoId,i,"horario",v)} placeholder="Ex: 18:50h às 21h30"/>
                      </div>
                      <IconBtn onClick={()=>removeAtrib(pe.postoId,i)} danger title="Remover"><ITrash/></IconBtn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Coordenação */}
        <div className="card" style={{padding:20}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:"var(--ink)"}}>Coordenação</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {obreiros.map(o=>{
              const c=getCargo(o.cargoId); const sel=coordIds.includes(o.id);
              return (
                <button key={o.id} onClick={()=>toggleCoord(o.id)} style={{
                  padding:"6px 14px",borderRadius:999,fontSize:13,cursor:"pointer",
                  border:sel?"none":"1px solid var(--border)",
                  background:sel?"#3b82f6":"var(--surface)",
                  color:sel?"#fff":"var(--ink-muted)",fontWeight:sel?600:400,
                }}>{c?.nome} {o.nome}</button>
              );
            })}
          </div>
        </div>

        {/* Observações */}
        <div className="card" style={{padding:20}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:"var(--ink)"}}>Observações</h3>
          <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={3}
            placeholder="Uniforme especial, instruções adicionais..."
            style={{padding:"8px 12px",borderRadius:"var(--radius)",border:"1px solid var(--border)",
              fontSize:14,outline:"none",background:"var(--surface)",color:"var(--ink)",
              width:"100%",resize:"vertical",fontFamily:"var(--font-body)"}}/>
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <GhostBtn onClick={onCancelar}>Cancelar</GhostBtn>
          <PrimaryBtn onClick={handleSalvar}>Salvar Escala</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

/* ── Ver Escala ───────────────────────────────────────────────────*/
function VerEscala({escala,cultos,postos,obreiros,cargos,template,nomeObreiro,onVoltar}: {
  escala:Escala;cultos:TipoCulto[];postos:Posto[];obreiros:Obreiro[];cargos:Cargo[];
  template:string;nomeObreiro:(id:number)=>string;onVoltar:()=>void;
}) {
  const culto=cultos.find(c=>c.id===escala.tipoCultoId);
  function getPosto(id:number) { return postos.find(p=>p.id===id); }
  function getObreiro(id:number) { return obreiros.find(o=>o.id===id); }

  function gerarPostosTexto() {
    const lines:string[]=[];
    escala.postos.forEach(pe=>{
      const posto=getPosto(pe.postoId); if(!posto) return;
      lines.push(`${posto.nome.toUpperCase()} — ${culto?.horario||""}`);
      pe.atribuicoes.forEach(a=>{
        const h=a.horario?` (${a.horario})`:"";
        lines.push(`  ${nomeObreiro(a.obreiroId)}${h}`);
      });
    });
    if(escala.coordenacaoIds.length>0){
      lines.push(`COORDENAÇÃO`);
      escala.coordenacaoIds.forEach(id=>lines.push(`  ${nomeObreiro(id)}`));
    }
    return lines.join("\n");
  }

  function notificar(obreiroId:number,postoNome:string,horario:string) {
    const o=getObreiro(obreiroId);
    if(!o?.telefone){alert("Este obreiro não tem telefone cadastrado.");return;}
    const coordNomes=escala.coordenacaoIds.map(id=>nomeObreiro(id)).join(", ");
    const msg=template
      .replace(/\{culto\}/g,culto?.nome||"")
      .replace(/\{data\}/g,fmtDate(escala.data))
      .replace(/\{postos\}/g,gerarPostosTexto())
      .replace(/\{coordenacao\}/g,coordNomes)
      .replace(/\{nome_obreiro\}/g,nomeObreiro(obreiroId))
      .replace(/\{posto_obreiro\}/g,postoNome)
      .replace(/\{horario_obreiro\}/g,horario||culto?.horario||"");
    const tel=o.telefone.replace(/\D/g,"");
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const BtnWA = ({obreiroId,postoNome,horario}: {obreiroId:number;postoNome:string;horario:string}) => (
    <button onClick={()=>notificar(obreiroId,postoNome,horario)} style={{
      display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",
      borderRadius:"var(--radius)",border:"1px solid #25d366",background:"#f0fdf4",
      color:"#16a34a",fontSize:12,fontWeight:600,cursor:"pointer",
    }}><IWA/> Notificar</button>
  );

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <GhostBtn onClick={onVoltar}><IBack/> Voltar</GhostBtn>
          <div>
            <h2 style={{fontSize:18,margin:0}}>{culto?.nome}</h2>
            <p style={{fontSize:13,color:"var(--ink-muted)",margin:0}}>{culto?.diaSemana} · {fmtDate(escala.data)} · {culto?.horario}</p>
          </div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {escala.postos.map(pe=>{
          const posto=getPosto(pe.postoId); if(!posto) return null;
          return (
            <div key={pe.postoId} className="card" style={{padding:20}}>
              <h3 style={{fontSize:13,fontWeight:600,marginBottom:12,color:"var(--ink)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{posto.nome}</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {pe.atribuicoes.map((a,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div>
                      <span style={{fontSize:14,fontWeight:600,color:"var(--ink)"}}>{nomeObreiro(a.obreiroId)}</span>
                      {a.horario&&<span style={{fontSize:12,color:"var(--ink-muted)",marginLeft:8}}>{a.horario}</span>}
                    </div>
                    <BtnWA obreiroId={a.obreiroId} postoNome={posto.nome} horario={a.horario}/>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {escala.coordenacaoIds.length>0&&(
          <div className="card" style={{padding:20}}>
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:12,color:"var(--ink)",textTransform:"uppercase",letterSpacing:"0.04em"}}>Coordenação</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {escala.coordenacaoIds.map(id=>(
                <div key={id} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:14,fontWeight:600,color:"var(--ink)"}}>{nomeObreiro(id)}</span>
                  <BtnWA obreiroId={id} postoNome="Coordenação" horario={culto?.horario||""}/>
                </div>
              ))}
            </div>
          </div>
        )}
        {escala.observacoes&&(
          <div className="card" style={{padding:20}}>
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:8,color:"var(--ink)"}}>Observações</h3>
            <p style={{fontSize:14,color:"var(--ink-muted)",margin:0,lineHeight:1.6}}>{escala.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ABA OBREIROS
═══════════════════════════════════════════════════════════════════ */
function AbaObreiros({obreiros,setObreiros,cargos}: {
  obreiros:Obreiro[];setObreiros:React.Dispatch<React.SetStateAction<Obreiro[]>>;cargos:Cargo[];
}) {
  const [modalAberto,setModalAberto]=useState(false);
  const [editando,setEditando]=useState<Obreiro|undefined>();

  function getCargo(id:number){return cargos.find(c=>c.id===id);}
  function salvar(dados:Omit<Obreiro,"id">){
    if(editando){setObreiros(prev=>prev.map(o=>o.id===editando.id?{...dados,id:editando.id}:o));}
    else{setObreiros(prev=>[...prev,{...dados,id:nextId(obreiros)}]);}
    setModalAberto(false);
  }
  function excluir(id:number){
    if(confirm("Excluir este obreiro?"))setObreiros(prev=>prev.filter(o=>o.id!==id));
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
        <PrimaryBtn onClick={()=>{setEditando(undefined);setModalAberto(true);}}>
          <IPlus/> Novo Obreiro
        </PrimaryBtn>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:"1px solid var(--border)",background:"var(--surface-2)"}}>
              <ThCell>Nome</ThCell><ThCell>Cargo</ThCell><ThCell>Telefone</ThCell><ThCell>Ações</ThCell>
            </tr>
          </thead>
          <tbody>
            {obreiros.map((o,i)=>(
              <tr key={o.id} style={{borderBottom:i<obreiros.length-1?"1px solid var(--border)":"none"}}
                onMouseEnter={ev=>(ev.currentTarget.style.background="var(--surface-2)")}
                onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                <td style={{padding:"12px 14px",fontSize:14,fontWeight:600,color:"var(--ink)"}}>{o.nome}</td>
                <TdCell>
                  <span style={{display:"inline-block",padding:"2px 10px",borderRadius:999,fontSize:12,fontWeight:600,background:"var(--surface-2)",color:"var(--ink-muted)",border:"1px solid var(--border)"}}>
                    {getCargo(o.cargoId)?.nome||"—"}
                  </span>
                </TdCell>
                <TdCell>{o.telefone||"—"}</TdCell>
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:6}}>
                    <IconBtn onClick={()=>{setEditando(o);setModalAberto(true);}} title="Editar"><IEdit/></IconBtn>
                    <IconBtn onClick={()=>excluir(o.id)} danger title="Excluir"><ITrash/></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalAberto&&<ModalObreiro obreiro={editando} cargos={cargos} onSalvar={salvar} onFechar={()=>setModalAberto(false)}/>}
    </div>
  );
}

function ModalObreiro({obreiro,cargos,onSalvar,onFechar}: {
  obreiro?:Obreiro;cargos:Cargo[];onSalvar:(d:Omit<Obreiro,"id">)=>void;onFechar:()=>void;
}) {
  const [nome,setNome]=useState(obreiro?.nome||"");
  const [cargoId,setCargoId]=useState(obreiro?.cargoId?.toString()||cargos[0]?.id?.toString()||"");
  const [telefone,setTelefone]=useState(obreiro?.telefone||"");

  function fmtTel(v:string){
    return v.replace(/\D/g,"").slice(0,11).replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2");
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"rgba(15,17,23,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>{if(e.target===e.currentTarget)onFechar();}}>
      <div className="card animate-scale-in" style={{width:"100%",maxWidth:420,padding:28}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h2 style={{fontSize:17,margin:0}}>{obreiro?"Editar Obreiro":"Novo Obreiro"}</h2>
          <IconBtn onClick={onFechar}><span style={{fontSize:14,lineHeight:1}}>✕</span></IconBtn>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><FieldLabel>Nome completo *</FieldLabel><TInput value={nome} onChange={setNome} placeholder="Ex: Maria das Graças"/></div>
          <div><FieldLabel>Cargo *</FieldLabel>
            <TSelect value={cargoId} onChange={setCargoId}>
              {cargos.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
            </TSelect>
          </div>
          <div><FieldLabel>Telefone / WhatsApp</FieldLabel><TInput value={telefone} onChange={v=>setTelefone(fmtTel(v))} placeholder="(61) 99999-0000"/></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <GhostBtn onClick={onFechar}>Cancelar</GhostBtn>
            <PrimaryBtn onClick={()=>{if(nome.trim()&&cargoId)onSalvar({nome:nome.trim(),cargoId:parseInt(cargoId),telefone});}}>
              {obreiro?"Salvar":"Cadastrar"}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ABA CONFIGURAÇÕES
═══════════════════════════════════════════════════════════════════ */
function AbaConfiguracoes({cargos,setCargos,postos,setPostos,cultos,setCultos,template,setTemplate}: {
  cargos:Cargo[];setCargos:React.Dispatch<React.SetStateAction<Cargo[]>>;
  postos:Posto[];setPostos:React.Dispatch<React.SetStateAction<Posto[]>>;
  cultos:TipoCulto[];setCultos:React.Dispatch<React.SetStateAction<TipoCulto[]>>;
  template:string;setTemplate:React.Dispatch<React.SetStateAction<string>>;
}) {
  const [abaCfg,setAbaCfg]=useState<AbConfig>("postos");

  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:"1px solid var(--border)"}}>
        {([{key:"postos",label:"Postos"},{key:"cargos",label:"Cargos"},{key:"cultos",label:"Cultos"},{key:"mensagem",label:"Template WhatsApp"}] as {key:AbConfig;label:string}[]).map(t=>(
          <button key={t.key} onClick={()=>setAbaCfg(t.key)} style={{
            padding:"8px 16px",fontSize:13,fontWeight:abaCfg===t.key?600:400,cursor:"pointer",
            border:"none",background:"transparent",
            borderBottom:abaCfg===t.key?"2px solid var(--primary-dark)":"2px solid transparent",
            color:abaCfg===t.key?"var(--primary-dark)":"var(--ink-muted)",marginBottom:-1,
          }}>{t.label}</button>
        ))}
      </div>
      {abaCfg==="postos"&&<CfgPostos postos={postos} setPostos={setPostos}/>}
      {abaCfg==="cargos"&&<CfgCargos cargos={cargos} setCargos={setCargos}/>}
      {abaCfg==="cultos"&&<CfgCultos cultos={cultos} setCultos={setCultos}/>}
      {abaCfg==="mensagem"&&<CfgMensagem template={template} setTemplate={setTemplate}/>}
    </div>
  );
}

function CfgPostos({postos,setPostos}: {postos:Posto[];setPostos:React.Dispatch<React.SetStateAction<Posto[]>>}) {
  const [nome,setNome]=useState("");
  const [multiplos,setMultiplos]=useState(false);
  function add(){
    if(!nome.trim())return;
    setPostos(prev=>[...prev,{id:nextId(prev),nome:nome.trim(),multiplos}]);
    setNome("");setMultiplos(false);
  }
  return (
    <div>
      <div className="card" style={{padding:20,marginBottom:16}}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:"var(--ink)"}}>Adicionar posto</h3>
        <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:160}}><FieldLabel>Nome do posto</FieldLabel><TInput value={nome} onChange={setNome} placeholder="Ex: Sonoplastia"/></div>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer",paddingBottom:2}}>
            <input type="checkbox" checked={multiplos} onChange={e=>setMultiplos(e.target.checked)} style={{width:15,height:15,accentColor:"var(--primary-dark)"}}/>
            Múltiplos obreiros
          </label>
          <PrimaryBtn onClick={add}><IPlus/> Adicionar</PrimaryBtn>
        </div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid var(--border)",background:"var(--surface-2)"}}><ThCell>Posto</ThCell><ThCell>Múltiplos</ThCell><ThCell>Ação</ThCell></tr></thead>
          <tbody>
            {postos.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:i<postos.length-1?"1px solid var(--border)":"none"}}>
                <td style={{padding:"10px 14px",fontSize:14,fontWeight:500,color:"var(--ink)"}}>{p.nome}</td>
                <TdCell>{p.multiplos?"Sim":"Não"}</TdCell>
                <td style={{padding:"10px 14px"}}><IconBtn onClick={()=>setPostos(prev=>prev.filter(x=>x.id!==p.id))} danger title="Remover"><ITrash/></IconBtn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CfgCargos({cargos,setCargos}: {cargos:Cargo[];setCargos:React.Dispatch<React.SetStateAction<Cargo[]>>}) {
  const [nome,setNome]=useState("");
  function add(){if(!nome.trim())return;setCargos(prev=>[...prev,{id:nextId(prev),nome:nome.trim()}]);setNome("");}
  return (
    <div>
      <div className="card" style={{padding:20,marginBottom:16}}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:"var(--ink)"}}>Adicionar cargo</h3>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}><FieldLabel>Abreviação / Nome</FieldLabel><TInput value={nome} onChange={setNome} placeholder="Ex: Pb"/></div>
          <PrimaryBtn onClick={add}><IPlus/> Adicionar</PrimaryBtn>
        </div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid var(--border)",background:"var(--surface-2)"}}><ThCell>Cargo</ThCell><ThCell>Ação</ThCell></tr></thead>
          <tbody>
            {cargos.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:i<cargos.length-1?"1px solid var(--border)":"none"}}>
                <td style={{padding:"10px 14px",fontSize:14,fontWeight:500,color:"var(--ink)"}}>{c.nome}</td>
                <td style={{padding:"10px 14px"}}><IconBtn onClick={()=>setCargos(prev=>prev.filter(x=>x.id!==c.id))} danger title="Remover"><ITrash/></IconBtn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CfgCultos({cultos,setCultos}: {cultos:TipoCulto[];setCultos:React.Dispatch<React.SetStateAction<TipoCulto[]>>}) {
  const [form,setForm]=useState({nome:"",diaSemana:"",horario:""});
  function add(){
    if(!form.nome.trim())return;
    setCultos(prev=>[...prev,{id:nextId(prev),...form}]);
    setForm({nome:"",diaSemana:"",horario:""});
  }
  return (
    <div>
      <div className="card" style={{padding:20,marginBottom:16}}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:"var(--ink)"}}>Adicionar culto</h3>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:10,alignItems:"flex-end"}}>
          <div><FieldLabel>Nome</FieldLabel><TInput value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} placeholder="Ex: Culto de Jovens"/></div>
          <div><FieldLabel>Dia</FieldLabel><TInput value={form.diaSemana} onChange={v=>setForm(f=>({...f,diaSemana:v}))} placeholder="Ex: Sexta"/></div>
          <div><FieldLabel>Horário</FieldLabel><TInput value={form.horario} onChange={v=>setForm(f=>({...f,horario:v}))} placeholder="18:50h às 21h30"/></div>
          <PrimaryBtn onClick={add}><IPlus/> Adicionar</PrimaryBtn>
        </div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid var(--border)",background:"var(--surface-2)"}}><ThCell>Culto</ThCell><ThCell>Dia</ThCell><ThCell>Horário</ThCell><ThCell>Ação</ThCell></tr></thead>
          <tbody>
            {cultos.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:i<cultos.length-1?"1px solid var(--border)":"none"}}>
                <td style={{padding:"10px 14px",fontSize:14,fontWeight:500,color:"var(--ink)"}}>{c.nome}</td>
                <TdCell>{c.diaSemana}</TdCell><TdCell>{c.horario}</TdCell>
                <td style={{padding:"10px 14px"}}><IconBtn onClick={()=>setCultos(prev=>prev.filter(x=>x.id!==c.id))} danger title="Remover"><ITrash/></IconBtn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CfgMensagem({template,setTemplate}: {template:string;setTemplate:React.Dispatch<React.SetStateAction<string>>}) {
  return (
    <div className="card" style={{padding:24}}>
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:8,color:"var(--ink)"}}>Template de mensagem WhatsApp</h3>
      <p style={{fontSize:13,color:"var(--ink-muted)",marginBottom:14,lineHeight:1.6}}>Use as variáveis abaixo — cada uma será substituída pelo valor real ao notificar:</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
        {["{culto}","{data}","{postos}","{coordenacao}","{nome_obreiro}","{posto_obreiro}","{horario_obreiro}"].map(v=>(
          <code key={v} style={{padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:600,background:"var(--surface-2)",border:"1px solid var(--border)",color:"var(--ink)"}}>{v}</code>
        ))}
      </div>
      <textarea value={template} onChange={e=>setTemplate(e.target.value)} rows={14}
        style={{padding:"12px",borderRadius:"var(--radius)",border:"1px solid var(--border)",
          fontSize:13,outline:"none",background:"var(--surface)",color:"var(--ink)",
          width:"100%",resize:"vertical",fontFamily:"monospace",lineHeight:1.7}}/>
      <p style={{fontSize:12,color:"var(--ink-muted)",marginTop:8}}>Alterações aplicadas imediatamente em todos os envios futuros.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
export default function EscalasPage() {
  const [aba,setAba]=useState<AbaPage>("escalas");
  const [cargos,setCargos]=useState<Cargo[]>(CARGOS0);
  const [postos,setPostos]=useState<Posto[]>(POSTOS0);
  const [cultos,setCultos]=useState<TipoCulto[]>(CULTOS0);
  const [obreiros,setObreiros]=useState<Obreiro[]>(OBREIROS0);
  const [escalas,setEscalas]=useState<Escala[]>(ESCALAS0);
  const [template,setTemplate]=useState(TEMPLATE0);

  return (
    <div style={{padding:"32px",maxWidth:960,margin:"0 auto"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,marginBottom:4}}>Escalas de Obreiros</h1>
        <p style={{color:"var(--ink-muted)",fontSize:14,margin:0}}>
          {escalas.length} escala{escalas.length!==1?"s":""} cadastrada{escalas.length!==1?"s":""}
        </p>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:28,borderBottom:"1px solid var(--border)"}}>
        {([{key:"escalas",label:"Escalas"},{key:"obreiros",label:"Obreiros"},{key:"configuracoes",label:"Configurações"}] as {key:AbaPage;label:string}[]).map(t=>(
          <button key={t.key} onClick={()=>setAba(t.key)} style={{
            padding:"10px 18px",fontSize:14,fontWeight:aba===t.key?600:400,cursor:"pointer",
            border:"none",background:"transparent",
            borderBottom:aba===t.key?"2px solid var(--primary-dark)":"2px solid transparent",
            color:aba===t.key?"var(--primary-dark)":"var(--ink-muted)",marginBottom:-1,
          }}>{t.label}</button>
        ))}
      </div>
      {aba==="escalas"&&<AbaEscalas escalas={escalas} setEscalas={setEscalas} cultos={cultos} postos={postos} obreiros={obreiros} cargos={cargos} template={template}/>}
      {aba==="obreiros"&&<AbaObreiros obreiros={obreiros} setObreiros={setObreiros} cargos={cargos}/>}
      {aba==="configuracoes"&&<AbaConfiguracoes cargos={cargos} setCargos={setCargos} postos={postos} setPostos={setPostos} cultos={cultos} setCultos={setCultos} template={template} setTemplate={setTemplate}/>}
    </div>
  );
}