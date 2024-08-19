// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDib8u1QJUxEsyhrIAHctZGyQBqitvygPg",
  authDomain: "biblioteca-65ac7.firebaseapp.com",
  projectId: "biblioteca-65ac7",
  storageBucket: "biblioteca-65ac7.appspot.com",
  messagingSenderId: "1087611860323",
  appId: "1:1087611860323:web:ced2f3e4c55d955d31cf56"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();  // Asegúrate de que esto está después de initializeApp
const db = firebase.firestore();     // Asegúrate de que esto está después de initializeApp

// Buscar libro por nombre
function searchBook() {
    const bookName = document.getElementById('book-name').value.trim();
    const bookInfo = document.getElementById('book-info');
    bookInfo.innerHTML = '';

    if (bookName) {
        db.collection("Biblioteca").doc(bookName).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                bookInfo.innerHTML = `
                    <div class="book-item">
                        <h3>${bookName}</h3>
                        <p>Autor: ${data.Autor}</p>
                        <p>Editorial: ${data.Editorial}</p>
                        <img src="${data.Portada}" alt="Portada del libro" style="width:100px;">
                    </div>`;
            } else {
                bookInfo.innerHTML = `<p>No se encontró el libro.</p>`;
            }
        }).catch((error) => {
            console.error("Error al buscar el libro: ", error);
        });
    }
}

// Buscar libros por autor
function searchByAuthor() {
    const authorName = document.getElementById('author-name').value.trim();
    const authorBooks = document.getElementById('author-books');
    authorBooks.innerHTML = '';

    if (authorName) {
        db.collection("Biblioteca").where("Autor", "==", authorName).get().then((querySnapshot) => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    authorBooks.innerHTML += `
                        <div class="book-item">
                            <h3>${doc.id}</h3>
                            <p>Autor: ${data.Autor}</p>
                            <p>Editorial: ${data.Editorial}</p>
                            <img src="${data.Portada}" alt="Portada del libro" style="width:100px;">
                        </div>`;
                });
            } else {
                authorBooks.innerHTML = `<p>No se encontraron libros de ese autor.</p>`;
            }
        }).catch((error) => {
            console.error("Error al buscar libros por autor: ", error);
        });
    }
}

// Añadir nuevo libro
function addNewBook() {
    const bookName = document.getElementById('new-book-name').value.trim();
    const bookAuthor = document.getElementById('new-book-author').value.trim();
    const bookEditorial = document.getElementById('new-book-editorial').value.trim();
    const bookCover = document.getElementById('imageInput').files[0];

    if (bookName && bookAuthor && bookEditorial && bookCover) {
        const storageRef = storage.ref('images/' + bookCover.name);

        // Subir la imagen al Storage
        storageRef.put(bookCover).then(() => {
            return storageRef.getDownloadURL();
        }).then((url) => {
            // Guardar los datos del libro en Firestore
            return db.collection("Biblioteca").doc(bookName).set({
                Autor: bookAuthor,
                Editorial: bookEditorial,
                Portada: url
            });
        }).then(() => {
            alert("Libro añadido correctamente");
            document.getElementById('new-book-name').value = '';
            document.getElementById('new-book-author').value = '';
            document.getElementById('new-book-editorial').value = '';
            document.getElementById('imageInput').value = '';
        }).catch((error) => {
            console.error("Error al añadir el libro: ", error);
        });
    } else {
        alert("Por favor, complete todos los campos y seleccione una imagen.");
    }
}
