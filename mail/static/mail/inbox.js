document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields and alert
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#alert').innerHTML = '';
  document.querySelector('#alert').className = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch_email(mailbox);
}

// Call /emails/<mailbox> API to fetch emails
function fetch_email(mailbox) {
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      if (!emails.error) {
        // create email element to display
        emails.forEach(email => {
          create_email(email, mailbox);
        });
      } else {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.innerHTML = result.error;
        document.querySelector('#emails-view').append(alert);
      }
    });
}

function create_email(email, mailbox) {
  const emailRow = document.createElement('div');
  emailRow.className = 'row';
  if (email.read && mailbox === 'inbox') {
    // if email is read, display as gray
    emailRow.style.backgroundColor = 'lightgray';
  }

  const emailColSender = document.createElement('div');
  emailColSender.className = 'col-3';
  if(mailbox === 'sent') {
    var recipientsString = 'To: ';
    email.recipients.forEach(recipient => {
      recipientsString += recipient + ', '
    })
    emailColSender.innerHTML = recipientsString.substring(0, recipientsString.length - 2); // to remove the last ', '
  } else {
    emailColSender.innerHTML = email.sender;
  }

  const emailColContent = document.createElement('div');
  emailColContent.className = 'emailContentCol';
  emailColContent.innerHTML = email.subject + ' - ' + email.body;

  const emailColTime = document.createElement('div');
  emailColTime.className = 'col-3';
  emailColTime.innerHTML = email.timestamp;

  emailRow.append(emailColSender, emailColContent, emailColTime);
  document.querySelector('#emails-view').append(emailRow);
}
