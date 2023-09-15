const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const MOVED_EVENT = "moved-book";
const DELETED_EVENT = "deleted-book";
const SEARCH_EVENT = "search-book";
const STORAGE_KEY = "LIST_BOOK";
const books = [];
const result = [];

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung web storage");
    return false;
  }
  return true;
};

document.addEventListener(RENDER_EVENT, () => {
  const unfinishedBook = document.getElementById("unread");
  unfinishedBook.innerHTML = "";
  const nothing_unread = document.getElementById("nothing_unread");

  const finishedBook = document.getElementById("read");
  const nothing_read = document.getElementById("nothing_read");
  finishedBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBookElement(bookItem);
    if (!bookItem.isComplete) {
      nothing_unread.setAttribute('hidden', ''); 
      unfinishedBook.appendChild(bookElement);
    } else {
      finishedBook.appendChild(bookElement);
      nothing_read.setAttribute('hidden', '');
    }
  }
});


document.addEventListener(SAVED_EVENT, () => {
  const elementCustomAlert = document.createElement("div");
  elementCustomAlert.classList.add("alert");
  elementCustomAlert.innerHTML = "<div style='font-weight:bold;'>Success</div><p>Buku berhasil dipindahkan</p>";

  document.body.insertBefore(elementCustomAlert, document.body.children[0]);
  setTimeout(() => {
    elementCustomAlert.remove();
  }, 2000);
});

document.addEventListener(MOVED_EVENT, () => {
  const elementCustomAlert = document.createElement("div");
  elementCustomAlert.classList.add("alert-warning");
  elementCustomAlert.innerHTML = "<div style='font-weight:bold;'>Warning</div><p>Buku telah dipindahkan</p>";

  document.body.insertBefore(elementCustomAlert, document.body.children[0]);
  setTimeout(() => {
    elementCustomAlert.remove();
  }, 2000);
});

document.addEventListener(DELETED_EVENT, () => {
  const elementCustomAlert = document.createElement("div");
  elementCustomAlert.classList.add("alert-warning");
  elementCustomAlert.innerHTML = "<div style='font-weight:bold;'>Warning</div><p>Buku telah dihapus</p>";

  
  document.body.insertBefore(elementCustomAlert, document.body.children[0]);
  setTimeout(() => {
    elementCustomAlert.remove();
  }, 2000);

  const booksRemainingIsCompleteTrue = books.filter(bookItem => bookItem.isComplete).length;
  const booksRemainingIsCompleteFalse = books.filter(bookItem => !bookItem.isComplete).length;

  const nothing_unread = document.getElementById("nothing_unread");
  const nothing_read = document.getElementById("nothing_read");

  if (booksRemainingIsCompleteTrue === 0) {
    nothing_read.removeAttribute('hidden');
  } else {
    nothing_read.setAttribute('hidden', '');
  }

  if (booksRemainingIsCompleteFalse === 0) {
    nothing_unread.removeAttribute('hidden');
  } else {
    nothing_unread.setAttribute('hidden', '');
  }

});



const loadDataFromStorage = () => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data !== null) {
    for (const item of data) {
      books.push(item);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const moveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(MOVED_EVENT));
  }
};

const deleteData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(DELETED_EVENT));
  }
};

const addBook = () => {
  const bookTitle = document.getElementById("judul");
  const bookAuthor = document.getElementById("penulis");
  const bookYear = document.getElementById("tahun");
  const bookHasFinished = document.getElementById("isRead");
  let bookStatus;

  if (bookHasFinished.checked) {
    bookStatus = true;
  } else {
    bookStatus = false;
  }

  books.push({
    id: +new Date(),
    title: bookTitle.value,
    author: bookAuthor.value,
    year: bookYear.value,
    isComplete: bookStatus,
  });

  bookTitle.value = null;
  bookAuthor.value = null;
  bookYear.value = null;
  bookHasFinished.checked = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const makeBookElement = (bookObject) => {
  const elementBookTitle = document.createElement("p");
  elementBookTitle.classList.add("item-title");
  elementBookTitle.innerHTML = `${bookObject.title} <span>(${bookObject.year})</span>`;

  const elementBookAuthor = document.createElement("p");
  elementBookAuthor.classList.add("item-writer");
  elementBookAuthor.innerText = bookObject.author;

  const descContainer = document.createElement("div");
  descContainer.classList.add("item-desc");
  descContainer.append(elementBookTitle, elementBookAuthor);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("item-action");

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(descContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const returnBtn = document.createElement("button");
    returnBtn.classList.add("kembalikan-btn");
    returnBtn.innerHTML = `<i class='bx bx-undo'></i>`;

    returnBtn.addEventListener("click", () => {
      returnBookFromFinished(bookObject.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("hapus-btn");
    deleteBtn.innerHTML = `<i class='bx bx-trash'></i>`;

    deleteBtn.addEventListener("click", () => {
      deleteBook(bookObject.id);
    });

    actionContainer.append(returnBtn, deleteBtn);
    container.append(actionContainer);
  } else {
    const finishBtn = document.createElement("button");
    finishBtn.classList.add("selesai-btn");
    finishBtn.innerHTML = `<i class='bx bx-check'></i>`;

    finishBtn.addEventListener("click", () => {
      addBookToFinished(bookObject.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("hapus-btn");
    deleteBtn.innerHTML = `<i class='bx bx-trash'></i>`;

    deleteBtn.addEventListener("click", () => {
      deleteBook(bookObject.id);
    });

    actionContainer.append(finishBtn, deleteBtn);
    container.append(actionContainer);
  }

  return container;
};

const addBookToFinished = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  moveData();
};

const returnBookFromFinished = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  moveData();
};

const deleteBook = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  deleteData();
};

const findBook = (bookId) => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
};

const findBookIndex = (bookId) => {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
};

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const simpanForm = document.getElementById("formDataBuku");
  simpanForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("formSearch");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
  });

  const resetBtn = document.querySelector(".reset-btn");
  resetBtn.addEventListener("click", () => {
    document.getElementById("pencarian").value = "";
    resetForm();
  });
});

const resetForm = () => {
  const searchInput = document.getElementById("pencarian");
  searchInput.value = "";
  const bookItems = document.getElementsByClassName("item");
  for (let i = 0; i < bookItems.length; i++) {
    bookItems[i].classList.remove("hidden");
    const elementCustomAlert = document.createElement("div");
    elementCustomAlert.classList.add("alert");
    elementCustomAlert.classList.add("alert-error");
    elementCustomAlert.innerHTML = "<div style='font-weight:bold;'>Success</div><p>Berhasil reset pencarian</p>";
    document.body.insertBefore(elementCustomAlert, document.body.children[0]);
    setTimeout(() => {
      elementCustomAlert.remove();
    }, 2000);
    document.body.insertBefore(elementCustomAlert, document.body.children[0]);
  }
};

const searchBook = () => {
  const searchInput = document.getElementById("pencarian").value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");
  let bookFound = false;

  if (books.length === 0) {
    const elementCustomAlertError = document.createElement("div");
    elementCustomAlertError.classList.add("alert");
    elementCustomAlertError.classList.add("alert-error");
    elementCustomAlertError.innerHTML = "<div style='font-weight:bold;'>Gagal</div><p>Tidak ada data buku</p>";
    document.body.insertBefore(elementCustomAlertError, document.body.children[0]);
    setTimeout(() => {
      elementCustomAlertError.remove();
    }, 2000);
  } else {
    for (let i = 0; i < bookItems.length; i++) {
      const itemTitle = bookItems[i].querySelector(".item-title");
      if (itemTitle.textContent.toLowerCase().includes(searchInput)) {
        bookItems[i].classList.remove("hidden");
        bookFound = true;
      } else {
        bookItems[i].classList.add("hidden");
      }
    }
  }

  if (bookFound) {
    const elementCustomAlert = document.createElement("div");
    elementCustomAlert.classList.add("alert");
    elementCustomAlert.innerHTML = "<div style='font-weight:bold;'>Success</div><p>Buku ditemukan</p>";
    document.body.insertBefore(elementCustomAlert, document.body.children[0]);
    setTimeout(() => {
      elementCustomAlert.remove();
    }, 2000);
  } else {
    const elementCustomAlert = document.createElement("div");
    elementCustomAlert.classList.add("alert-warning");
    elementCustomAlert.innerHTML = "<div style='font-weight:bold;'>Attention</div><p>Buku tidak ditemukan</p>";
    document.body.insertBefore(elementCustomAlert, document.body.children[0]);
    setTimeout(() => {
      elementCustomAlert.remove();
    }, 2000);
  }
};


