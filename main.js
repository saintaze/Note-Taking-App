
const swatches = document.querySelectorAll('.swatch');
const root = document.querySelector(':root');



//change theme color
const changeThemeColor = () => {
  swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      let swatchColor = window.getComputedStyle(e.target).backgroundColor;
      root.style.setProperty('--theme-color', swatchColor);
    });
  })
}

changeThemeColor()


class Note {
  constructor(title, body, date) {
    this.title = title;
    this.body = body;
    this.date = date;
  }
}

const getCurrentDate = () => {
  return Date().split(' ').slice(0, 4).join(' ');
}

const q = el => document.querySelector(el);
const qa = el => document.querySelectorAll(el);

const localStore = (mode) => {
  if (mode === 'set') {
    localStorage.setItem('notes', JSON.stringify(notes));
  }
  if (mode === 'get') {
    return JSON.parse(localStorage.getItem('notes'));
  }
  if (mode === 'clear') {
    localStorage.clear();
  }
}

const renderToast = (action) => {
  const toast = q('.toast')
  if (action === 'edit') {
    toast.innerText = 'Note Edited Successfully! :)';
    toast.classList.add('toast-write');
    toast.classList.remove('toast-delete');
    toast.classList.remove('toast-invalid');
  }
  if (action === 'write') {
    toast.innerText = 'Note Added Successfully! :)';
    toast.classList.add('toast-write');
    toast.classList.remove('toast-delete');
    toast.classList.remove('toast-invalid');
  }
  if (action === 'delete') {
    toast.innerText = 'Note Deleted Successfully! :(';
    toast.classList.add('toast-delete');
    toast.classList.remove('toast-write');
    toast.classList.remove('toast-invalid'); 
  }
  if (action === 'deleteAll') {
    toast.innerText = 'All Notes Deleted Successfully! :(';
    toast.classList.add('toast-delete');
    toast.classList.remove('toast-write');
    toast.classList.remove('toast-invalid');
  }if (action === 'invalid') {
    toast.innerText = 'Happy if you Add Note Title! :|';
    toast.classList.add('toast-invalid');
    toast.classList.remove('toast-delete');
    toast.classList.remove('toast-write');
  }
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.innerText = '';
    toast.style.opacity = 0;
  }, 1600);
}

q('.note-btn').addEventListener('click', (e) => {
  const mode = e.target.dataset.mode;
  let canClearFields = false;
  canClearFields = mode === 'write' ? writeNote() : editNote();
  if (canClearFields) clearFields()
  renderNotes(notes, view);
});

q('#note-search').addEventListener('keyup', e => {
  searchNote(e.target.value);
})

q('#note-sort').addEventListener('change', e => {
  if (notes.length < 2) return;
  const sortField = e.target.value;
  notes.sort((a, b) => a[sortField].localeCompare(b[sortField]));
  renderNotes(notes, view);
})

q('textarea').style.height = '32px';

q('textarea').addEventListener('input', (e) => {
  // e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 'px';
});

q('#note-view').addEventListener('change', e => {
  view = e.target.value;
  if (notes.length === 0) return;
  renderNotes(notes, view);
})


q('.note-delete-all').addEventListener('click', e => {
  deleteAllNotes();
})


const clearFields = () => {
  q('#note-title').value = '';
  const textarea = q('#note-body');
  textarea.value = '';
  textarea.style.height = '32px'; 
}

const writeNote = () => {
  const noteTitle = q('#note-title');
  const noteBody = q('#note-body');
  if (noteBody.value.trim().length !== '' && noteTitle.value.trim() === '') {
    renderToast('invalid');
    return false
  }
  if (noteTitle.value.trim() === '') return false;
  const note = new Note(noteTitle.value, noteBody.value, getCurrentDate());
  notes.unshift(note);
  localStore('set');
  q('.note-btn').dataset.mode = "write";
  renderToast('write');
  return true
}

const renderNotes = (notes, view) => {
  let notesDisplay = '';
  notes.forEach((note, i) => {
    notesDisplay += `
				<div class="note" id="${i}" draggable="true">
						<h3>${note.title}</h3>
						<h4>Date: ${note.date}</h4>`
    if (view === 'compact') notesDisplay += `</div>`
    if (view === 'minimal') {
      notesDisplay += note.body.length > 100 ? `<p>${note.body.slice(0, 101)}...</p>` : `<p>${note.body}</p>`;
    }
    if (view === 'full') notesDisplay += ` <p>${note.body}</p> `
    if (view === 'full' || view === 'minimal') {
      notesDisplay += `
							<button class="note-edit">Edit</button>
							<button class="note-delete">Delete</button>
					</div>`}
  });
  q('.notes-display').innerHTML = notesDisplay;
  qa('.note').forEach(note => {
    window.getComputedStyle(note).opacity;
    note.style.opacity = 1;
  });
  attachDeleteEditToNotes();
  initDragNDrop()
}

const deleteNote = (noteId) => {
  if (confirm('Are you sure you want to delete this note?')) {
    notes.splice(noteId, 1);
    localStore('set');
    renderToast('delete');
  }
  notes.length > 0 ? renderNotes(notes, view) : renderAddNoteMessage();
}

const renderAddNoteMessage = () => q('.notes-display').innerHTML = 'Add a new Note!';

const scrollToElement = (mode) => {
  let top = null;
  if(mode === 'edit'){
    top = q('#note-title').getBoundingClientRect().top;
  }else{
    const editedNoteId = q('.note-btn').dataset.noteid;
    top = q('[id="' + editedNoteId + '"]').getBoundingClientRect().top;
  }
  window.scrollBy({ top: top, behavior: 'smooth' });
}

const editUpdateDisplay = (noteId) => {
  const noteBtn = q('.note-btn');
  q('#note-title').value = notes[noteId].title;
  q('#note-body').value = notes[noteId].body;
  q('#note-title').focus();
  noteBtn.innerText = 'Edit Note';
  noteBtn.dataset.mode = 'edit';
  noteBtn.dataset.noteid = noteId;
  scrollToElement('edit');
  toggleDelEditBtns('edit');
}

const deleteAllNotes = () => {
  if(notes.length === 0) return;
  if (confirm('Are you sure you want to delete all notes?')) {
    notes.length = 0;
    localStore('clear');
    renderAddNoteMessage();
    renderToast('deleteAll');
  }
}

const attachDeleteEditToNotes = () => {
  const editBtns = qa('.note-edit');
  const deleteBtns = qa('.note-delete');
  editBtns.forEach((editBtn, i) => {
    editBtn.addEventListener('click', e => editUpdateDisplay(i));
    deleteBtns[i].addEventListener('click', e => deleteNote(i));
  });
}

const editNote = () => {
  const noteBtn = q('.note-btn');
  const noteId = q('.note-btn').dataset.noteid;
  notes[noteId].title = q('#note-title').value;
  notes[noteId].body = q('#note-body').value;
  localStore('set');
  noteBtn.innerText = 'Write Note';
  noteBtn.dataset.mode = 'write';
  toggleDelEditBtns('write');
  scrollToElement('write');
  renderToast('edit');
  return true
}

const searchNote = (searchTerm) => {
  if (notes.length > 1 && searchTerm.length > 1) {
    searchTerm = searchTerm.toLowerCase();
    const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchTerm) ||
      note.body.toLowerCase().includes(searchTerm) ||
      note.date.toLowerCase().includes(searchTerm))
    renderNotes(filteredNotes, view);
  } else {
    notes.length > 0 ? renderNotes(notes, view) : renderAddNoteMessage();
  }
}

const initDragNDrop = () => {

  if(('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) return;

  let srcEl = null;
  qa('.note').forEach(note => {

    note.addEventListener('dragstart', (e) => {
      e.target.style.opacity = '0.4';
      srcEl = e.target;
      [...srcEl.children].forEach(c => c.style.pointerEvents = 'none')
      e.dataTransfer.setData('text/html', e.target.innerHTML);
    });

    note.addEventListener('dragenter', (e) => {
      e.target.classList.add('drag-over');
      [...e.target.children].forEach(c => c.style.pointerEvents = 'none')
    });

    note.addEventListener('dragover', (e) => {
      e.preventDefault()
    });

    note.addEventListener('dragleave', (e) => {
      e.target.classList.remove('drag-over');
      Array.from(e.target.children).forEach(c => c.style.pointerEvents = 'auto');
    });

    note.addEventListener('drop', (e) => {
      if (e.target != srcEl) {
        let targetIndex = e.target.id;
        let srcIndex = srcEl.id;

        let oldEl = notes[srcIndex];
        notes[srcIndex] = notes[targetIndex];
        notes[targetIndex] = oldEl;

        srcEl.innerHTML = e.target.innerHTML;
        e.target.innerHTML = e.dataTransfer.getData('text/html');

        [targetIndex, srcIndex].forEach(i => {
          q('[id="' + i + '"] .note-edit').addEventListener('click', e => editUpdateDisplay(i))
          q('[id="' + i + '"] .note-delete').addEventListener('click', e => deleteNote(i))
        });

        e.target.classList.remove('drag-over');
        [...e.target.children].forEach(c => c.style.pointerEvents = 'auto');
      }
      srcEl.classList.remove('drag-over');
      [...srcEl.children].forEach(c => c.style.pointerEvents = 'auto');
    });

    note.addEventListener('dragend', (e) => {
      srcEl.style.opacity = '1';
    });

  });
}

const toggleDelEditBtns = (mode) => {
  const editBtns = qa('.note-edit');
  const delBtns = qa('.note-delete');
  const delAllBtn = q('.note-delete-all');
  const disable = mode === 'edit';
  editBtns.forEach((editBtn, i) => {
    editBtn.disabled = disable;
    delBtns[i].disabled = disable;;
  });
  delAllBtn.disabled = disable;;
}

const notes = localStore('get') || [];
let view = 'full';
if (notes.length !== 0) {
  renderNotes(notes, view)
}
