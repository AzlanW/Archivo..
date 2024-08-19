import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDzt3sdFc8Z19rw7ij5EVoOJJmAy3urpVk",
    authDomain: "archivo-ba1f1.firebaseapp.com",
    projectId: "archivo-ba1f1",
    storageBucket: "archivo-ba1f1.appspot.com",
    messagingSenderId: "1014533925026",
    appId: "1:1014533925026:web:c48017cb7c99a8a7164ffb"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.getElementById('formAgregar').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombreLibro').value;
    const autor = document.getElementById('autorLibro').value;
    const editorial = document.getElementById('editorialLibro').value;
    const portada = document.getElementById('portadaLibro').files[0];

    if (!portada) {
        document.getElementById('mensajeAgregar').textContent = 'Por favor, elige una portada.';
        return;
    }

    try {
        // Subir la imagen a Firebase Storage
        const storageRef = ref(storage, `uploads/${Date.now()}_${portada.name}`);
        await uploadBytes(storageRef, portada);
        const portadaURL = await getDownloadURL(storageRef);

        // Agregar el libro a Firestore
        await addDoc(collection(db, 'libros'), {
            nombre,
            autor,
            editorial,
            portada: portadaURL
        });

        document.getElementById('mensajeAgregar').textContent = 'Libro agregado con éxito!';
        this.reset();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('mensajeAgregar').textContent = 'Error al agregar libro.';
    }
});

// Funciones de búsqueda
window.buscarLibroPorNombre = async function() {
    const nombreLibro = document.getElementById('buscarNombre').value.trim();
    const q = query(collection(db, 'libros'), where('nombre', '==', nombreLibro));

    try {
        const querySnapshot = await getDocs(q);
        const libros = querySnapshot.docs.map(doc => doc.data());
        mostrarResultados('resultadoNombre', libros);
    } catch (error) {
        console.error('Error al buscar libro por nombre:', error);
        document.getElementById('resultadoNombre').textContent = 'Error al buscar libros.';
    }
};

window.buscarLibrosPorAutor = async function() {
    const autor = document.getElementById('buscarAutor').value.trim();
    const q = query(collection(db, 'libros'), where('autor', '==', autor));

    try {
        const querySnapshot = await getDocs(q);
        const libros = querySnapshot.docs.map(doc => doc.data());
        mostrarResultados('resultadoAutor', libros);
    } catch (error) {
        console.error('Error al buscar libros por autor:', error);
        document.getElementById('resultadoAutor').textContent = 'Error al buscar libros.';
    }
};

window.buscarLibrosPorEditorial = async function() {
    const editorial = document.getElementById('buscarEditorial').value.trim();
    const q = query(collection(db, 'libros'), where('editorial', '==', editorial));

    try {
        const querySnapshot = await getDocs(q);
        const libros = querySnapshot.docs.map(doc => doc.data());
        mostrarResultados('resultadoEditorial', libros);
    } catch (error) {
        console.error('Error al buscar libros por editorial:', error);
        document.getElementById('resultadoEditorial').textContent = 'Error al buscar libros.';
    }
};

function mostrarResultados(id, libros) {
    const contenedor = document.getElementById(id);
    contenedor.innerHTML = '';

    if (libros.length === 0) {
        contenedor.textContent = 'No se encontraron libros.';
        return;
    }

    libros.forEach(libro => {
        const divLibro = document.createElement('div');
        divLibro.innerHTML = `
            <p>Nombre: ${libro.nombre}</p>
            <p>Autor: ${libro.autor}</p>
            <p>Editorial: ${libro.editorial}</p>
            <img src="${libro.portada}" alt="Portada del libro">
        `;
        contenedor.appendChild(divLibro);
    });
}
