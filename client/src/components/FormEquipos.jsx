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
      <form className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
         onSubmit={(e) => { e.preventDefault(); if (equipos[1].nombre && equipos[2].nombre) setShowNameModal(false); }}>
         <div className="card w-full max-w-lg bg-neutral border-warning/70 border-2 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col gap-5 text-white">
            <div className="text-center"><h2 className="text-2xl sm:text-3xl font-black text-warning">Preparemos la partida</h2><p className="mt-2 text-sm text-white/65">Asigna un nombre a cada equipo. El conductor elegirá la pregunta cuando todos estén listos.</p></div>
            <fieldset className="fieldset rounded-xl bg-red-950/50 p-4">
               <legend className="fieldset-legend text-red-200 font-bold">Equipo rojo</legend>
               <input type="text" maxLength={30} autoComplete="off" className="input input-bordered w-full text-lg font-bold uppercase" placeholder="Nombre del equipo rojo"
                  value={equipos[1].nombre} onChange={onChange1} required />
            </fieldset>
            <fieldset className="fieldset rounded-xl bg-blue-950/50 p-4">
               <legend className="fieldset-legend text-blue-200 font-bold">Equipo azul</legend>
               <input type="text" maxLength={30} autoComplete="off" className="input input-bordered w-full text-lg font-bold uppercase" placeholder="Nombre del equipo azul"
                  value={equipos[2].nombre} onChange={onChange2} required />
            </fieldset>
            <button type="submit" className="btn btn-warning min-h-12 text-base font-black"
               disabled={!equipos[1].nombre || !equipos[2].nombre}>
               Confirmar equipos
            </button>
         </div>
      </form>
   );
};

export default FormEquipos;
