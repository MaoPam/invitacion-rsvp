import React, { useState } from 'react';

const GuestList = ({ guests, loading, stats }) => {
  const [showList, setShowList] = useState(false);

  const sL = { si: 'va 🎉', talvez: 'tal vez', no: 'no puede' };
  const sC = { si: 'ss', talvez: 'st', no: 'sn' };
  const dC = { si: 'dot-si', talvez: 'dot-talvez', no: 'dot-no' };

  if (loading) return <div className="loading-msg">Cargando lista... ✨</div>;

  return (
    <div className="guests-section">
      {!showList ? (
        <button className="view-guests-btn" onClick={() => setShowList(true)}>
          Ver quiénes ya confirmaron asistencia
        </button>
      ) : (
        <>
          <div className="guests-header-row">
            <div className="guests-title">Invitades confirmades</div>
            <div className="guests-count">
              {stats.si} van · {stats.talvez} tal vez · {stats.no} no pueden
            </div>
          </div>
          <div className="guests-container">
            {guests.length === 0 ? (
              <div className="loading-msg">Nadie registrado todavía — ¡sé la primera!</div>
            ) : (
              guests.map(g => (
                <div key={g.id} className="guest-item">
                  <div className={`guest-dot ${dC[g.going]}`}></div>
                  <span>{g.name}</span>
                  {g.costume && <span className="guest-costume">· {g.costume}</span>}
                  <span className={`guest-status ${sC[g.going]}`}>{sL[g.going]}</span>
                </div>
              ))
            )}
            <button className="hide-guests-btn" onClick={() => setShowList(false)}>
              Ocultar lista
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GuestList;