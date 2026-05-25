const FormEquipos = ({ equipos, setEquipos, sendSync, setShowNameModal }) => {
   const onChange1 = (e) => {
      const name = e.target.value.toUpperCase();
      setEquipos(prev => ({ ...prev, 1: { ...prev[1], nombre: name } }));
      if (sendSync) sendSync({ e1: name, e2: equipos[2].nombre }, { e1: equipos[1].puntos, e2: equipos[2].puntos });
   };
   const onChange2 = (e) => {
      const name = e.target.value.toUpperCase();
      setEquipos(prev => ({ ...prev, 2: { ...prev[2], nombre: name } }));
      if (sendSync) sendSync({ e1: equipos[1].nombre, e2: name }, { e1: equipos[1].puntos, e2: equipos[2].puntos });
   };

   return (
      <form className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
         onSubmit={(e) => { e.preventDefault(); if (equipos[1].nombre && equipos[2].nombre) setShowNameModal(false); }}>
         <div className="card bg-neutral/90 border-neutral-content/90 border-4 p-8 rounded-xl shadow-lg flex flex-col gap-4 min-w-[300px]">
            <h2 className="text-xl font-bold mb-2">Asignar nombres a los equipos</h2>
            <fieldset className="fieldset">
               <legend className="fieldset-legend">Nombre equipo 1</legend>
               <input type="text" className="input" placeholder="Equipo 1"
                  value={equipos[1].nombre} onChange={onChange1} required />
            </fieldset>
            <fieldset className="fieldset">
               <legend className="fieldset-legend">Nombre equipo 2</legend>
               <input type="text" className="input" placeholder="Equipo 2"
                  value={equipos[2].nombre} onChange={onChange2} required />
            </fieldset>
            <button type="submit" className="btn bg-neutral-content text-neutral font-black"
               disabled={!equipos[1].nombre || !equipos[2].nombre}>
               Confirmar
            </button>
         </div>
      </form>
   );
};

export default FormEquipos;
