import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import NebulaBackground from './fondo';
import GuestList from './invi';
import './App.css';

// Las credenciales viven en .env (ver .env.example). Ese archivo no se sube.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const guestsCol = collection(db, "guests");

const App = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', going: '', costume: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const q = query(guestsCol, orderBy("ts", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guestsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setGuests(guestsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.going) return;
    
    setIsSubmitting(true);
    try {
      const finalCostume = formData.costume.trim() === '' ? '(Es feka)' : formData.costume;

      await addDoc(guestsCol, { 
        name: formData.name, 
        going: formData.going, 
        costume: finalCostume, 
        ts: serverTimestamp() 
      });
      
      const successText = formData.going === 'si' 
        ? `¡${formData.name}, ya te la sabritones, ahi nos olemos` 
        : formData.going === 'talvez' 
          ? `${formData.name} — ¡ojalá puedas! 🤞` 
          : `${formData.name}, ni por una scooby-galleta? :c`;
          
      setMessage({ type: 'success', text: successText });
      setFormData({ name: '', going: '', costume: '' });
    } catch (e) {
      console.error("Error de Firebase:", e);
      setMessage({ type: 'error', text: 'Algo salió mal, intenta de nuevo.' });
    }
    setIsSubmitting(false);
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const stats = {
    si: guests.filter(g => g.going === 'si').length,
    talvez: guests.filter(g => g.going === 'talvez').length,
    no: guests.filter(g => g.going === 'no').length
  };

  return (
    <>
      <NebulaBackground />
      
      {/* --- BOTÓN FLOTANTE DE MÚSICA --- */}
      <div className="music-player">
        <button 
          className={`music-btn ${isPlaying ? 'playing' : ''}`} 
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '🔊' : ''} {isPlaying ? 'Vibra activada' : 'Ponle ambiente'}
        </button>
        {isPlaying && (
          <iframe 
            width="0" 
            height="0" 
            src="https://www.youtube.com/embed/b2lQw3QdUIs?autoplay=1&loop=1&playlist=b2lQw3QdUIs" 
            title="Música de fondo" 
            frameBorder="0" 
            allow="autoplay" 
            style={{ display: 'none' }}
          ></iframe>
        )}
      </div>

      <div className="card">
        <div className="top-stripe"></div>

        <div className="hero">
          <div className="age-tag">✦ 24 años ✦ </div>
          <h1 className="main-title">HaziFest</h1>
          <span className="vol">Vol. 1</span>
          <p className="subtitle">(y el unico primero dios)</p>
          <div className="photo-ring">
            <div className="photo-inner">
              <img src="/a.jpeg" alt="el cumpleañero" className="profile-photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="intro-section">
          <div className="section-label">Holaaaaaa</div>
          <div className="section-label">¡Hazi dice si a festejar su cumpleaños!, lastimosamente nadie le 
            pregunto (?
          </div>
          <div className="intro-text">
            Si te llegó esta invitación es porque:<br/><br/>
            <strong>a)</strong> Eres una chica <span className="hl">super hot y super latina</span> intrepida que no le teme irse 
            a buro de credito y que posiblemente le debe 10,000 bolas a Coppel o Nu<br/><br/>
            <strong>b)</strong> Posiblemente mi dislexia hizo que te la enviara pensando que eras alguien más, pero entre más, mejor<br/><br/>
            <strong>c)</strong> <span className="hl">Te quiero mucho</span> y me gustaría que me acompañaras a ponernos hasta la cola por mis 24 vueltas al sol. Lo que quiere decir
            que eres una persona muy especial para mí y me gustaría que <span className="hl">revoliaramos el papoi juntes</span>.<br/><br/>
            Para esta peda somos yo, mi adelanta-saldo de 20 pesos, el crédito que le voy a sacar a BBVA para rentar las sillas y un sueño de tener una peda con la gente que amo (pensar en la señorita Poof por favor)
            donde como todos saben soy un aperrado y me apoderare de la playlist para poner desde Belanova hasta Bad Gyal 🌸✨<br/><br/>
            <span style={{ color: 'rgba(255,245,230,.42)', fontSize: '13px' }}>
              La verdad según yo quería planear algo más acá pero me chingue la rodilla y pos ya que, a ver que salga, somos abundancia
              wey x fluye, no pasa de que me digan "Es aqui wey no mames".
            </span>
          </div>
        </div>

        <div className="divider" style={{ marginTop: '.4rem' }}></div>

        <div className="info-section">
          <div className="info-block">
            <div className="info-label">Cuándo</div>
            <div className="info-value big">3:00 pm</div>
            <div className="info-note">Jueves 23 de abril</div>
            <div className="info-note warn">Puntualidad importante — no sé pa' cuántas sillas me alcance</div>
          </div>
          <div className="info-block">
            <div className="info-label">Dónde</div>
            <div className="info-value">Av. Sanalona 46A</div>
            <div className="info-note">Por el Oxxo de la burguer</div>
          </div>
          <div className="info-block cover-block">
            <div className="info-label">¿Cover?</div>
            <div className="cover-text"><strong style={{ color: 'var(--ac)' }}>Gratis.</strong> Ni que fuera antro para cobrarte 80 pesos pa' entrar. </div>
          </div>
        
            
          <div className="info-block full">
            <div className="info-label">¿Qué esperar?</div>
            
            <div className="meme-container fixed-meme">
              <img src="/image.png" alt="Meme HaziFest" className="meme-img" />
            </div>

            <div>
              <span className="vibe-pill pp">pastel (talvez)</span>
              <span className="vibe-pill pv">A la 6 setsitos</span>
              <span className="vibe-pill pg">proyectadas</span>
              <span className="vibe-pill pc">fourlokos</span>
              <span className="vibe-pill pm">laticoneo</span>
              <span className="vibe-pill pp">cachuates</span>
              <span className="vibe-pill pv">crujiente</span>
              <span className="vibe-pill pc">gente chida</span>
              <span className="vibe-pill pg">perreo (no creo)</span>
              <span className="vibe-pill pm">Oca 4.0</span>
              <span className="vibe-pill pp">Bad Gyal de principio a fin</span>
              <span className="vibe-pill pv">Karaoke</span>
              <span className="vibe-pill pm">Degenere</span>
            </div>
          </div>

          {/* NUEVA SECCIÓN SEPARADA: BYOB / TRAE TUS COSAS */}
          <div className="info-block full" style={{ background: 'rgba(0, 245, 212, 0.04)', borderColor: 'rgba(0, 245, 212, 0.2)' }}>
    
            <div className="cover-text" style={{ fontSize: '15px', color: 'var(--cr)', marginBottom: '4px' }}>
              <strong>Trae tu propio veneno 🍻</strong>
            </div>
            <div className="cover-text">
              Pueden traer su pista, botana o lo que vayan a consumir.   Importante que se vean My Littlo Ponys para que entiendan la magia de la amistad porque voy 
              a necesitar que Interactúen, mezclen y colaboren — aquí todos compartimos. Por que lo unico medio decente 
              va ser esta invitacion porque entre mas corriente mas ambiente (presupuesto limitado pero somos chicos resolutivos).
            </div>
          </div>

          {/* SECCIÓN DEL LAVABO (SOLO ADVERTENCIA) */}
          <div className="info-block full warning-box">
            <div className="warning-big">🚫 NO ME ROMPAN EL LAVABO</div>
            <div className="warning-text">
               <strong style={{ color: 'var(--cr)' }}>Tu sabes quien eres</strong> 
            </div>
            <div className="warning-text">
              Con el lavabo, la pared, las sillas rentadas y cualquier cosa de la casa que no sea tuya: <strong style={{ color: 'var(--cr)' }}>trátala con mucho amor.</strong> Gracias de todo corazón.
            </div>
          </div>
        </div>

        <div className="combined-theme-section">
          <div className="theme-content">
            <div className="theme-text-block">
              <div className="dresscode-title theme-title">Tematica: México Mágico & Surrealista</div>
              <div className="dresscode-text theme-text">
                Para que sea fácil y divertido, la temática es <strong>personajes de la cultura mexicana</strong>. Ríndele tributo a los lookazos de nuestro país: vístete del <strong>Doctor Simi, Mamá Lucha, un payasito de crucero, los Chicuarotes</strong>, o cualquier ícono urbano/dosmilero que se te ocurra. <strong style={{ color: 'var(--cr)' }}>(No es obligatorio, pero se agradece mucho)</strong>.<br/><br/>
                <span style={{ fontSize: '14px', color: 'rgba(255, 245, 230, 0.5)' }}>
                  <em>¿Por qué?</em> Porque soy un figuroso y me encanta los disfraces
                  y Las películas como <em>Perfume de violetas</em>, <em>Amarte Duele</em> o <em>Perras</em> capturaron una estética cruda y fascinante del barrio. No
                  es obligatorio disfrazarse pero si lo apreciaria mucho, igual no tiene que ser algo elaborado solo que de vibras.            </span>
              </div>
            </div>
            <img src="/image1.png" alt="el cumpleañero de payaso" className="theme-photo" />
          </div>
        </div>

        {/* --- SECCIÓN MESA DE REGALOS (WISH LIST) --- */}
        <div className="wishlist-section">
          <div className="wishlist-title">Wish List</div>
          

          <div className="wishlist-footer">
            Tu presencia es el mejor regalo ✨<br/>
                     </div>
        </div>

        <div className="rsvp-section">
          <div className="rsvp-title">¿Vas o no vas? — regístrate aquí</div>
          <div className="rsvp-form">
            <input className="rsvp-input" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Tu nombre" maxLength="40" />
            <div className="rsvp-row">
              <select className="rsvp-input" name="going" value={formData.going} onChange={handleInputChange}>
                <option value="" disabled>¿Vas?</option>
                <option value="si">Sí, ahi nos vidrios</option>
                <option value="talvez">Tal vez / Seraaaa?</option>
                <option value="no">No puedo (soy feka)</option>
              </select>
              <input className="rsvp-input" type="text" name="costume" value={formData.costume} onChange={handleInputChange} placeholder="Disfraz planeado..." maxLength="40" />
            </div>
            <button className="rsvp-btn" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Confirmar asistencia'}
            </button>
            {message.type === 'success' && <div className="success-msg" style={{ display: 'block' }}>{message.text}</div>}
            {message.type === 'error' && <div className="error-msg" style={{ display: 'block' }}>{message.text}</div>}
          </div>
        </div>

        <GuestList guests={guests} loading={loading} stats={stats} />

        

        <div className="bottom-stripe"></div>


      </div>

      <div></div>
      {/* --- SECCIÓN MESA DE REGALOS (WISH LIST) --- */}
        <div className="easter-egg-wishlist">
        <div className="wishlist-title" style={{ color: '#C850C0' }}>
          VERDADERA LISTA DE DESEOS (K ES ESO DE QUE SU PRESENCIA)
        </div>
        
        <div className="wishlist-items">
          <span className="vibe-pill pg" style={{ fontSize: '14px', padding: '8px 16px' }}>1. FourLoko Blanco</span>
          <span className="vibe-pill pg" style={{ fontSize: '14px', padding: '8px 16px' }}>2. FourLoko Blanco</span>
          <span className="vibe-pill pg" style={{ fontSize: '14px', padding: '8px 16px' }}>3. Pan de Feria</span>
          <span className="vibe-pill pg" style={{ fontSize: '14px', padding: '8px 16px' }}>4. FourLoko Blanco</span>
          <span className="vibe-pill pg" style={{ fontSize: '14px', padding: '8px 16px' }}>5. FourLoko Blanco</span>
        </div>

        <div className="wishlist-footer">
          <span className="transfer-text">(también acepto transferencias o vatos chichones)</span>
        </div>
      </div>
    </>
  );
};

export default App;