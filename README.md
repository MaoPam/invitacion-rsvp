# Invitación con RSVP

Invitación de cumpleaños hecha en React + Vite, con confirmación de asistencia guardada en Firebase Firestore y lista de invitados que se actualiza en vivo.

```bash
npm install
cp .env.example .env    # y llena los valores de tu proyecto de Firebase
npm run dev
```

## Cómo funciona el RSVP

Todo vive en [`src/App.jsx`](src/App.jsx) y [`src/invi.jsx`](src/invi.jsx). Son tres piezas.

### 1. La conexión

Una sola colección de Firestore, `guests`. Cada confirmación es un documento suelto ahí:

```js
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const guestsCol = collection(db, "guests");
```

### 2. Leer en tiempo real

Aquí está lo único medio interesante: no se hace un `getDocs` de una vez, se usa **`onSnapshot`**. Firestore abre un canal y cada que alguien confirma, el callback se vuelve a disparar solo. No hay que refrescar ni hacer polling: si tienes la página abierta y otra persona confirma desde su celular, aparece en tu pantalla al instante.

```js
useEffect(() => {
  const q = query(guestsCol, orderBy("ts", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    setGuests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  });
  return () => unsubscribe();   // importante: cerrar el canal al desmontar
}, []);
```

Ese `return () => unsubscribe()` no es opcional. Si no cierras la suscripción cuando el componente se desmonta, se quedan canales abiertos y se acumulan.

### 3. Escribir

`addDoc` genera el ID solo. El `ts` usa `serverTimestamp()` y no la hora del navegador, porque el reloj del cliente puede estar mal y se rompería el ordenamiento:

```js
await addDoc(guestsCol, {
  name: formData.name,
  going: formData.going,      // 'si' | 'talvez' | 'no'
  costume: finalCostume,
  ts: serverTimestamp()
});
```

No hace falta actualizar el estado a mano después de escribir: el `onSnapshot` de arriba ya se entera solo y vuelve a pintar.

### Los contadores

Se calculan en cada render a partir del arreglo que ya tienes en memoria. No son otra consulta a Firestore:

```js
const stats = {
  si: guests.filter(g => g.going === 'si').length,
  talvez: guests.filter(g => g.going === 'talvez').length,
  no: guests.filter(g => g.going === 'no').length
};
```

## Reglas de Firestore

**Esto sí importa.** La `apiKey` de un proyecto web de Firebase no es un secreto — va dentro del bundle de JavaScript y cualquiera puede verla desde el navegador. Lo único que de verdad protege tus datos son las reglas de seguridad.

Si dejas el proyecto en modo de prueba, cualquiera con la URL puede leer, editar y borrar toda tu colección. Para un caso como este, donde quieres que cualquiera confirme pero nadie destruya, sirve algo así:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guests/{id} {
      allow read: if true;
      allow create: if request.resource.data.name is string
                    && request.resource.data.name.size() <= 40
                    && request.resource.data.going in ['si', 'talvez', 'no'];
      allow update, delete: if false;   // nadie modifica ni borra lo ya escrito
    }
  }
}
```

Con eso se puede crear pero no editar ni borrar, y se valida la forma de lo que entra. Aun así cualquiera puede llenarte la lista de basura — si te preocupa, lo siguiente sería App Check.

## Estructura

```
src/
  App.jsx     la invitación completa: Firebase, formulario y secciones
  invi.jsx    la lista de confirmados (recibe guests y stats por props)
  fondo.jsx   el canvas de la nebulosa animada, puro requestAnimationFrame
  App.css     los estilos
  index.css   reset y variables globales
```

[`src/fondo.jsx`](src/fondo.jsx) no tiene nada que ver con el RSVP, es un canvas aparte con estrellas y partículas que se redibuja con `requestAnimationFrame`. Si te sirve, cópialo, es independiente del resto.
