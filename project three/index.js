const modal = document.querySelector('.modal');

// From materialize library, grab prop Modal and initialize it
M.Modal.init(modal);

//Connect to firebase
const form = document.querySelector('form');
const name = document.querySelector('#name');
const parent = document.querySelector('#parent');
const department = document.querySelector('#department');

//Event listener: listen to submit event

form.addEventListener('submit', e => {
  e.preventDefault(); //don't refresh page when submit is clicked

  db.collection ('employees').add({
    name: name.value,
    parent: parent.value,
    department: department.value
  });
  var instance = M.Modal.getInstance(modal) //grab the modal
  instance.close(); //close the submission popup

  form.reset(); //set all the values to blank
});
