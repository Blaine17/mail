document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archive').addEventListener('click', () => load_mailbox('archive')); // added "d"
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // Listen for sent email
  document.querySelector('#compose-form').onsubmit = () => {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value;

    // Log message
    console.log(body) 
    console.log(recipients)
    console.log(subject)

    // Send message as POST request
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });

    // Load sent inbox
    load_mailbox('sent');
    // Stop form from submitting 
    return false
  }

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(data) {
  console.log(data)
  // ensure all buttons are enabled
  const buttons = document.querySelectorAll('button');
  console.log(buttons)
  for (let i = 0; i < buttons.length; i++) {
    console.log(buttons[i]);
    buttons[i].disabled = false;
  }

  const button = document.querySelector('#compose');
  button.disabled = true;
  console.log(button)

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields if not replying
  if (data === undefined) {
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  }
  // Prefill reply message
  else {
  document.querySelector('#compose-recipients').value = data['sender'];
  document.querySelector('#compose-subject').value = data['subject'];
  document.querySelector('#compose-body').value = `On ${data["timestamp"]} ${data['sender']} wrote: ${data['body']}`;
  }
  
}

function load_mailbox(mailbox) {
  // ensure all buttons are enabled
  const buttons = document.querySelectorAll('button');
  console.log(buttons)
  for (let i = 0; i < buttons.length; i++) {
    console.log(buttons[i]);
    buttons[i].disabled = false;
  }

  // Show the mailbox and hide other views, disable current inbox botton
  const button = document.querySelector(`#${mailbox}`);
  button.disabled = true;
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
console.log('about to fetch')
  // Fetch the desired inbox
  fetch(`/emails/${mailbox}`)
  //await for response
  .then( response => response.json())
  //.then( data => console.log(data))
  .then( data => {
    console.log(data)
    // find inbox
    let emailsView = document.querySelector('#emails-view')
    // iterate over messages returned fromAPI
    for (let i = 0; i < data.length; i++) {
      let message = document.createElement('div');
      message.setAttribute('class', 'message');
      message.setAttribute('id', `message${data[i]['id']}`)
      emailsView.append(message);

      // create and load message objects into div and add to email view
      for (const key in data[i]) {
        // console.log(`${key}: ${data[i][key]}`);
        let temp = document.createElement('div');
        temp.setAttribute('class', `${key}`);
        temp.innerHTML = `${data[i][key]}`;

        //hide unwanted data
        if (key === 'id' || key === 'recipients' || key === 'body' || key === 'read' || key === 'archived') {
          console.log(temp)
          console.log(key)
          temp.style.display = 'none';
        }
        message.append(temp);
          
  //         console.log('This element has been clicked!')
  //         let fullMessage = document.createElement('div')
  //         fullMessage.setAttribute('class', 'fullMessage')
  //         console.log(`${data[i]['id']}`)
  //         fetch(`/emails/${data[i]['id']}`)
  //         .then( response => response.json())
  // //.then( data => console.log(data))
  //         .then( data => {
  //           console.log(data)
  //         });
  //       });
      }
      message.addEventListener('click', () => showMessage(data[i]['id']));
      // change the background color of the div if read
      if (data[i]['read'] == true) {
        message.style.backgroundColor = 'grey'
      }
    }
    // listen for opened email

  });

  function showMessage(id) {
    console.log('This element has been clicked!')
    console.log(document.querySelector(`#fullMessage${id}`))
    console.log(`#fullMessage${id}`)
    //check if previously viewed in session, create full message if not
    let renderedMessage = document.querySelector(`#fullMessage${id}`)
    if (renderedMessage === null) {
        fetch(`/emails/${id}`)
        .then( response => response.json())
        .then( data => {
        console.log(data)
        let fullMessage = document.createElement('div')
        fullMessage.setAttribute('class', 'fullMessage')
        fullMessage.setAttribute('id', `fullMessage${id}`)

        // create reply button 
        const button = document.createElement('input') 
        console.log(button.innerHTML)
        button.setAttribute('type', 'submit')
        button.setAttribute('class', 'btn btn-primary')
        button.value = "Reply"
        button.addEventListener('click', () => compose_email(data));

        // create archive button
        const archive = document.createElement('input') 
        console.log(button.innerHTML)
        archive.setAttribute('type', 'submit')
        archive.setAttribute('class', 'btn btn-primary')
        

        // update email as read
        if (data['read'] === false) {
          console.log(data['read'])
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        }
        //display each message component in a div 
        for (const key in data) {
          // console.log(`${key}: ${data[i][key]}`);
          let temp = document.createElement('div');
          temp.setAttribute('class', `${key}`);
          temp.setAttribute('id', `${key}-${id}`);
          temp.innerHTML = `${data[key]}`;
          fullMessage.append(temp)
          if (key === 'recipients') {
            temp.innerHTML = `To: ${data[key]}`;
          }
          if (key === 'id' || key === 'read' || key === 'archived' || key === 'sender' || key === 'subject' || key === "timestamp") {
            console.log(temp)
            console.log(key)
            temp.style.display = 'none';
          }
          }
        
        // add new full message inside of message div
        let renderedMessage = document.querySelector(`#message${id}`) 
        renderedMessage.append(fullMessage)
        document.querySelector(`#fullMessage${id}`).append(button)
        document.querySelector(`#fullMessage${id}`).append(archive)

        console.log(data['archived'])
        if (data['archived'] === false) {
          archive.value = "archive"
          archive.addEventListener('click', function (e) {
          fetch(`/emails/${data['id']}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          .then(() => {
            e.stopPropagation()
            load_mailbox('inbox')
          })
        });
        }

        console.log(data)
        if (data['archived'] === true) {
          console.log(data['id'])
          archive.value = "unarchive"
          archive.addEventListener('click', function (e) {
          
          console.log(data)
          fetch(`/emails/${data['id']}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          .then(() => {
            e.stopPropagation()
            load_mailbox('inbox')
          })
          
        });
        }
        
        }); 
        //remove message if reclicked 
      } else {
        renderedMessage.remove()
      }
  }

}