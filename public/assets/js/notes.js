document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.querySelector('.note-form');
    const noteTitle = document.querySelector('.note-title');
    const noteText = document.querySelector('.note-textarea');
    const saveNoteBtn = document.querySelector('.save-note');
    const newNoteBtn = document.querySelector('.new-note');
    const clearBtn = document.querySelector('.clear-btn');
    const noteList = document.querySelector('#note-list');
  
    const apiUrl = '/api/notes';
  
    let activeNote = {};
  
    const toggleVisibility = (elem, show) => {
      elem.style.display = show ? 'inline' : 'none';
    };
  
    const fetchApi = (url, options) => 
      fetch(url, options)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to ${options.method} note`);
          return response.json();
        });
  
    const getNotes = () => fetchApi(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  
    const saveNote = note => {
      console.log('Saving note:', note);
      return fetchApi(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) });
    };
  
    const deleteNote = id => {
      return fetchApi(`${apiUrl}/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
    };
  
    const renderActiveNote = () => {
      toggleVisibility(saveNoteBtn, false);
      toggleVisibility(clearBtn, activeNote.id ? true : false);
      noteTitle.readOnly = !!activeNote.id;
      noteText.readOnly = !!activeNote.id;
      noteTitle.value = activeNote.title || '';
      noteText.value = activeNote.text || '';
    };
  
    const handleNoteSave = () => {
      const newNote = { title: noteTitle.value, text: noteText.value };
      console.log('Attempting to save new note:', newNote);
      saveNote(newNote)
        .then(data => {
          console.log('Note saved:', data);
          getAndRenderNotes();
          renderActiveNote();
        })
        .catch(error => console.error('Error saving note:', error));
    };
  
    const handleNoteDelete = e => {
      e.stopPropagation();
      const noteId = JSON.parse(e.target.parentElement.getAttribute('data-note')).id;
      if (activeNote.id === noteId) activeNote = {};
      deleteNote(noteId)
        .then(() => {
          getAndRenderNotes();
          renderActiveNote();
        })
        .catch(error => console.error('Error deleting note:', error));
    };
  
    const handleNoteView = e => {
      e.preventDefault();
      activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
      renderActiveNote();
    };
  
    const handleNewNoteView = () => {
      activeNote = {};
      toggleVisibility(clearBtn, true);
      renderActiveNote();
    };
  
    const handleRenderBtns = () => {
      const hasTitle = noteTitle.value.trim();
      const hasText = noteText.value.trim();
      toggleVisibility(clearBtn, hasTitle || hasText);
      toggleVisibility(saveNoteBtn, hasTitle && hasText);
    };
  
    const renderNoteList = async notes => {
      console.log('Fetched notes:', notes);
      noteList.innerHTML = '';
  
      const createLi = (text, delBtn = true) => {
        const liEl = document.createElement('li');
        liEl.classList.add('list-group-item');
  
        const spanEl = document.createElement('span');
        spanEl.classList.add('list-item-title');
        spanEl.innerText = text;
        spanEl.addEventListener('click', handleNoteView);
  
        liEl.append(spanEl);
  
        if (delBtn) {
          const delBtnEl = document.createElement('i');
          delBtnEl.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
          delBtnEl.addEventListener('click', handleNoteDelete);
  
          liEl.append(delBtnEl);
        }
  
        return liEl;
      };
  
      const noteListItems = notes.length 
        ? notes.map(note => {
            const li = createLi(note.title);
            li.dataset.note = JSON.stringify(note);
            return li;
          })
        : [createLi('No saved Notes', false)];
  
      noteList.append(...noteListItems);
    };
  
    const getAndRenderNotes = () => getNotes().then(renderNoteList).catch(error => console.error('Error fetching notes:', error));
  
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNoteView);
    clearBtn.addEventListener('click', renderActiveNote);
    noteForm.addEventListener('input', handleRenderBtns);
  
    getAndRenderNotes();
  });
  