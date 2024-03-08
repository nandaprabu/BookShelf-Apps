const books = [];
const RENDER_EVENT = 'render-book';

const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBooks();
    });

    if (isStorageExist()) {
      loadDataFromStorage();
    }
});

function addBooks() {
    const bookTitle = document.getElementById('title').value;
    const authorName = document.getElementById('author').value;
    const bookYear = document.getElementById('year').value;
    
    const checkboxComplete = document.getElementById('inputBookIsComplete');
    const completeRead = checkboxComplete.checked;
   
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, authorName, bookYear, completeRead);
    books.push(bookObject);

    resetForm()
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}
   
function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year : Number(year),
      isComplete
    }
}

function makeBooks(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;
    textTitle.classList.add('book-title');
   
    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + bookObject.year;
   
    const container = document.createElement('div');
    container.classList.add('list-item');
    container.append(textTitle, textAuthor, textYear);
  
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isComplete) {
        const finishButton = document.createElement('button');
        finishButton.classList.add('finish');
        finishButton.innerText = 'Finished';

        finishButton.addEventListener('click', function () {
          undoBookFromCompleted(bookObject.id);
        });
     
        const editButton = document.createElement('button');
        editButton.classList.add('btn-edit');
        editButton.innerHTML = '<img src="asset/edit.png" alt="edit">';
        editButton.addEventListener('click', function(){
          editBook(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('btn-clear');
        trashButton.innerHTML = '<img src="asset/delete.png" alt="clear">';
     
        trashButton.addEventListener('click', function () {
          const isConfirmedClear = confirm('Apakah anda yakin akan menghapus data Buku ' + bookObject.title + '?')
          if(isConfirmedClear){
            removeTaskFromCompleted(bookObject.id);
          }
        });

        const btnList = document.createElement('div');
        btnList.classList.add('btn-action');
        btnList.append(finishButton, editButton, trashButton)
        container.append(btnList);
    } else {
        const unfinishButton = document.createElement('button');
        unfinishButton.classList.add('unfinish');
        unfinishButton.innerText = 'Unfinished';

        unfinishButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });
     
        const editButton = document.createElement('button');
        editButton.classList.add('btn-edit');
        editButton.innerHTML = '<img src="asset/edit.png" alt="edit">';
        editButton.addEventListener('click', function(){
          editBook(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('btn-clear');
        trashButton.innerHTML = '<img src="asset/delete.png" alt="clear">';
     
        trashButton.addEventListener('click', function () {
          const isConfirmedClear = confirm('Apakah anda yakin akan menghapus data Buku ' + bookObject.title +'?')
          if(isConfirmedClear){
            removeTaskFromCompleted(bookObject.id);
          }
        });

        const btnList = document.createElement('div');
        btnList.classList.add('btn-action');
        btnList.append(unfinishButton, editButton, trashButton)
        container.append(btnList);
    }
    return container;
}

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;
   
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Untuk Hapus Buku
function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
 
  if (bookTarget === -1) return;
 
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Untuk Edit Buku
function editBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  // Mengisi formulir
  document.getElementById('title').value = bookTarget.title;
  document.getElementById('author').value = bookTarget.author;
  document.getElementById('year').value = bookTarget.year;
  document.getElementById('inputBookIsComplete').checked = bookTarget.isComplete;

  // Menampilkan tombol "edit" dan menyembunyikan tombol "submit"
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('editBtn').style.display = 'block';

  // Melakukan edit buku
  document.getElementById('editBtn').addEventListener('click', function () {
    const isConfirmed = confirm('Apakah anda yakin akan merubah data Buku '+ bookTarget.title +'?');
    if (isConfirmed) {  
        console.log(books);
        editBookItem(bookId);
    }
  }, { once: true });
}

function editBookItem(bookId) {
  const editedTitle = document.getElementById('title').value;
  const editedAuthor = document.getElementById('author').value;
  const editedYear = document.getElementById('year').value;
  const editedStatus = document.getElementById('inputBookIsComplete').checked;

  if (editedTitle && editedAuthor && editedYear) {
      const bookTargetIndex = findBookIndex(bookId);

      if (bookTargetIndex !== -1) {
          // Mengupdate nilai buku dengan nilai yang baru
          books[bookTargetIndex].title = editedTitle;
          books[bookTargetIndex].author = editedAuthor;
          books[bookTargetIndex].year = editedYear;
          books[bookTargetIndex].isComplete = editedStatus;

          // Mereset formulir
          resetForm();

          // Menampilkan kembali tombol "submit" dan menyembunyikan tombol "edit"
          document.getElementById('submitBtn').style.display = 'block';
          document.getElementById('editBtn').style.display = 'none';
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();
      } else {
          alert('Book not found.');
      }
  }
}

function resetForm() {
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('year').value = '';
  document.getElementById('inputBookIsComplete').checked  = '';
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
 
  return -1;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

const searchBook = document.getElementById("searching");

searchBook.addEventListener("keyup", function (e) {
  const searchQuery = e.target.value.toLowerCase();
  const books = document.querySelectorAll(".book-collect");

  books.forEach((book) => {
    const bookDesc = book.querySelector(".list-item h3");
    const bookTitle = bookDesc.textContent.toLowerCase();

    let match = true;
    for (let i = 0; i < searchQuery.length; i++) {
      if (bookTitle.indexOf(searchQuery[i]) === -1) {
        match = false;
        break;
      }
    }

    if (match) {
      book.style.display = "flex";
    } else {
      book.style.display = "none";
    }
  });
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('uncompleted-books');
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completed-books');
  completedBookList.innerHTML = '';
  
  
  for (const bookItem of books) {
    // console.log("Type of ID:", typeof bookItem.id);
    // console.log("Type of Title:", typeof bookItem.title);
    // console.log("Type of Author:", typeof bookItem.author);
    // console.log("Type of Year:", typeof bookItem.year);
    // console.log("Type of isComplete:", typeof bookItem.isComplete);
    const bookElement = makeBooks(bookItem);
    if (!bookItem.isComplete)
      uncompletedBookList.append(bookElement);
    else
      completedBookList.append(bookElement);
  }
});