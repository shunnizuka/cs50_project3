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
  document.querySelector('#email-content').style.display = 'none';
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
  document.querySelector('#email-content').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch_email(mailbox);
}

/**
 * Calls /emails/<mailbox> API to fetch emails and generate email to display
 */
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

/**
 * Create email element to be displayed in the mail-box
 */
function create_email(email, mailbox) {
  const parentDiv = document.querySelector('#emails-view');
  const emailRow = document.createElement('button');
  emailRow.addEventListener('click', () => {
    view_email(email.id, mailbox);
  });
  emailRow.className = 'emailRow';
  if (email.read && mailbox === 'inbox') {
    // if email is read, display as gray
    emailRow.style.backgroundColor = 'lightgray';
  }

  const emailColSender = document.createElement('div');
  emailColSender.className = 'col-3';
  if (mailbox === 'sent') {
    // Show recipients instead of sender in sent mail-box
    var recipientsString = 'To: ';
    email.recipients.forEach(recipient => {
      recipientsString += recipient + ', ';
    });
    emailColSender.innerHTML = recipientsString.substring(0, recipientsString.length - 2); // to remove the last ', '
  } else {
    // Show sender in inbox
    emailColSender.innerHTML = email.sender;
  }

  const emailColContent = document.createElement('div');
  emailColContent.className = 'emailContentCol';
  emailColContent.innerHTML = email.subject + ' - ' + email.body;

  const emailColTime = document.createElement('div');
  emailColTime.className = 'col-3';
  emailColTime.innerHTML = email.timestamp;

  emailRow.append(emailColSender, emailColContent, emailColTime);
  parentDiv.append(emailRow);
}

/**
 * This function is called when the email element in the mail-box is clicked
 * Displays the content of the email
 */
function view_email(email_id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Display the view to show email content
  const emailContent = document.querySelector('#email-content');
  emailContent.style.display = 'block';

  // Mark email as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });

  // get the content of the email to be displayed
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      // fill up the content of the view
      emailContent.querySelector('#sender-field').innerHTML =
        '<strong>From: </strong>' + email.sender;

      var recipientsString = '';
      email.recipients.forEach(recipient => {
        recipientsString += recipient + ', ';
      });
      emailContent.querySelector('#recipients-field').innerHTML =
        '<strong>To: </strong>' + recipientsString.substring(0, recipientsString.length - 2);
      emailContent.querySelector('#subject-field').innerHTML =
        '<strong>Subject: </strong>' + email.subject;
      emailContent.querySelector('#time-field').innerHTML =
        '<strong>Timestamp: </strong>' + email.timestamp;
      emailContent.querySelector('#body-field').innerHTML = email.body;

      // Allow user to archive emails in inbox
      const btnDiv = emailContent.querySelector('#buttons');
      btnDiv.innerHTML = '';

      if (mailbox !== 'sent') {
        const archiveBtn = document.createElement('button');
        btnDiv.append(archiveBtn);
        archiveBtn.className = 'btn btn-primary';
        if (mailbox === 'inbox') {
          archiveBtn.innerHTML = 'Archive';
        } else if (mailbox === 'archive') {
          archiveBtn.innerHTML = 'Unarchive';
        }
        archiveBtn.addEventListener('click', () => {
          addOrRemoveFromArchived(email.id, !email.archived);
        });

        const replyBtn = document.createElement('button');
        btnDiv.append(replyBtn);
        replyBtn.className = 'btn btn-primary';
        replyBtn.innerHTML = 'Reply';
        replyBtn.style = 'margin-left: 15px;';
        replyBtn.addEventListener('click', () => {
          reply_email(email);
        });
      }
    });
}

/**
 * Sends a PUT request to /emails/<email_id> API to update the archived field of the email
 * Add to archive: set toArchive as true
 * Remove from archive: set toAtchive as false
 */
function addOrRemoveFromArchived(email_id, toArchive) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: toArchive
    })
  }).then(response => {
    if (response.status === 204) {
      load_mailbox('inbox');
    }
  });
}

function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#alert').innerHTML = '';
  document.querySelector('#alert').className = '';

  // prefill the composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.includes('Re:')) {
    document.querySelector('#compose-subject').value = email.subject;
  } else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  document.querySelector(
    '#compose-body'
  ).value = `<em><font color='gray'>On ${email.timestamp} ${email.sender} wrote:\n ${email.body}</em></font>\n`;
}
