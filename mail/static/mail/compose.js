document.addEventListener('DOMContentLoaded', function () {
  // send out email by calling the API /emails
  document.querySelector('#compose-form').addEventListener('submit', event => {
    event.preventDefault(); // causes connection aborted error without this

    const recipients = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');
    const alert = document.querySelector('#alert');

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients.value,
        subject: subject.value,
        body: body.value
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
        if (result.error) {
          alert.className = 'alert alert-danger';
          alert.innerHTML = result.error;
        } else {
          load_mailbox('sent');
        }
      });
  });
});
