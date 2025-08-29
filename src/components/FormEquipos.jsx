const FormEquipos = ({ teamNames, setTeamNames, setShowNameModal }) => {
   return (
      <div className="fixed inset-0 bg-black/80 bg-opacity-60 flex items-center justify-center z-50">
         <div className="card bg-neutral/90 border-neutral-content/90 border-4 p-8 rounded-xl shadow-lg flex flex-col gap-4 min-w-[300px]">
            <h2 className="text-xl font-bold mb-2">Asignar nombres a los equipos</h2>
            <fieldset className="fieldset">
               <legend className="fieldset-legend">Nombre equipo 1</legend>
               <input type="text" className="input" placeholder="Equipo 1" value={teamNames.e1} onChange={(e) => setTeamNames({ ...teamNames, e1: e.target.value })} />
               {/* <p className="label">Optional</p> */}
            </fieldset>
            <fieldset className="fieldset">
               <legend className="fieldset-legend">Nombre equipo 2</legend>
               <input type="text" className="input" placeholder="Equipo 2" value={teamNames.e2} onChange={(e) => setTeamNames({ ...teamNames, e2: e.target.value })} />
               {/* <p className="label">Optional</p> */}
            </fieldset>
            {/* <input
               type="text"
               placeholder="Nombre equipo 1"
               className="border p-2 rounded"
               value={teamNames.e1}
               onChange={(e) => setTeamNames({ ...teamNames, e1: e.target.value })}
            />
            <input
               type="text"
               placeholder="Nombre equipo 2"
               className="border p-2 rounded"
               value={teamNames.e2}
               onChange={(e) => setTeamNames({ ...teamNames, e2: e.target.value })}
            /> */}
            <button className="btn btn-neutral" onClick={() => setShowNameModal(false)} disabled={!teamNames.e1 || !teamNames.e2}>
               Confirmar
            </button>
         </div>
      </div>
   );
};

export default FormEquipos;
