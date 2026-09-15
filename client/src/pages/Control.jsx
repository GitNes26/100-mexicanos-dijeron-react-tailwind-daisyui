import {useEffect,useRef,useState} from "react";
import {useNavigate,useParams,useSearchParams} from "react-router-dom";
import {FaHandPointer,FaWifi} from "react-icons/fa";
import {useJuegoContext} from "../contexts/JuegoContext";
import LoadingScreen from "../components/LoadingScreen";
export default function Control(){
 const {team}=useParams();const [params]=useSearchParams();const navigate=useNavigate();const code=params.get("room");
 const {send,equipos,ronda,equipoActivo,unirseaSala,wsReady,wsError}=useJuegoContext();const teamNum=Number(team);const [celebrating,setCelebrating]=useState(false);const [pressSent,setPressSent]=useState(false);const previousActive=useRef(false);const teamData=equipos[teamNum];const isWinner=equipoActivo===teamNum;const canPress=wsReady&&ronda.activa&&equipoActivo===null&&!teamData?.bloqueado&&!pressSent;
 useEffect(()=>{if(!code||![1,2].includes(teamNum))navigate("/",{replace:true});else if(wsReady)unirseaSala(code)},[code,teamNum,wsReady,unirseaSala,navigate]);
 useEffect(()=>{if(isWinner&&!previousActive.current){setCelebrating(true);const timer=setTimeout(()=>setCelebrating(false),2200);previousActive.current=true;return()=>clearTimeout(timer)}if(!equipoActivo){previousActive.current=false;setPressSent(false)}},[equipoActivo,isWinner]);
 if(wsError)return <LoadingScreen error={wsError} onBack={()=>navigate("/",{replace:true})}/>;if(!wsReady||!teamData)return <LoadingScreen title="Conectando tu pulsador…" detail={`Equipo ${teamNum} · Sala ${code||"—"}`}/>;
 const status=isWinner?"¡GANASTE EL TURNO!":canPress?"¡PRESIONA AHORA!":ronda.activa&&equipoActivo?"OTRO EQUIPO GANÓ EL TURNO":"ESPERANDO PREGUNTA";const name=teamData.nombre||(teamNum===1?"ROJOS":"AZULES");
 function press(){if(!canPress)return;setPressSent(true);send({action:"press",team:teamNum})}
 return <main className={`buzzer-screen buzzer-team-${teamNum} ${canPress?"is-ready":"is-locked"} ${isWinner?"is-winner":""} ${celebrating?"is-celebrating":""}`}><button type="button" className="buzzer" onClick={press} disabled={!canPress} aria-label={`${name}: ${status}`}><span className="buzzer__room"><FaWifi aria-hidden="true"/> SALA {code}</span><FaHandPointer className="buzzer__hand" aria-hidden="true"/><strong className="buzzer__name">{name.toUpperCase()}</strong><span className="buzzer__status" role="status">{status}</span></button></main>
}
