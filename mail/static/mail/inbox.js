document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', ()=> load_mailbox('inbox'));
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
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  const myform = document.querySelector("#compose-form");
  myform.addEventListener("submit", (event) => {
      event.preventDefault();
  const to = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: to,
        subject: subject,
        body: body,
      }),
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        load_mailbox('sent');
         });     
         });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
 if (mailbox == 'sent'){
fetch('/emails/sent')
.then(response => response.json())
.then(emails => {
	console.log(emails);
   emails.forEach((mail) => {
  var card = document.createElement('div');
  card.className = 'md';
  card.innerHTML = `<div> <span class="u">${mail.recipients} </span><span class="u">${mail.subject} </span> <span class="u">${mail.timestamp}</span> </div>`;
  document.querySelector("#emails-view").appendChild(card);   
  card.addEventListener('click', () => { 
     viewmail(mail.id, mailbox)  
});
});
});
}
if( mailbox == 'inbox'){
fetch('/emails/inbox')
.then(response => response.json())
.then(emails => {
	console.log(emails);
  emails.forEach((mail) => {
  var card = document.createElement('div');
  card.className = 'md';
  if (mail.read == true){
  card.innerHTML = `<div id="mlbtn"><mark>Read</mark><span class="u">${mail.sender} </span> <span class="u">${mail.subject} </span> <span class="u">${mail.timestamp}</span> </div>`;
  }
  else {
  	card.innerHTML = `<div id="mlbtn"><span class="u">${mail.sender} </span> <span class="u">${mail.subject} </span> <span class="u">${mail.timestamp}</span> </div>`;
  	}
  document.querySelector("#emails-view").appendChild(card);   
  card.addEventListener('click', () => {
     viewmail(mail.id, mailbox)    
     
});
if (mail.read == true){
	card.style.backgroundColor = "grey";
	}
else {
card.style.backgroundColor = "white";
}

});
});
}
if (mailbox =='archive'){
fetch('/emails/archive')
.then(response => response.json())
.then(emails => {
	console.log(emails);
   emails.forEach((mail) => {
  if (mail.archived == true){
  var card = document.createElement('div');
  card.className = 'md';
  card.innerHTML = `<div><span class="u">${mail.sender} </span> <span class="u">${mail.subject} </span> <span class="u">${mail.timestamp}</span> </div>`;
 document.querySelector("#emails-view").appendChild(card);   
 card.addEventListener('click', () => { 
    viewmail(mail.id, mailbox)
  
});
 }
});
});
}
}
function viewmail(id, mailbox){
  document.querySelector('#detail-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
var vw = document.createElement('div');
vw.className = 'view';
vw.innerHTML = `<div>
<div><span Style="font-weight: bold">From:</span> ${email.sender}</div>
<div><span Style="font-weight: bold">Recipients:</span>${email.recipients}</div>
<div><span Style="font-weight: bold">Subject:</span>${email.subject}</div>
<div><span Style="font-weight: bold">Timestamp:</span>${email.timestamp}</div>
<br>
<div><span Style="font-weight: bold">Body:</span>${email.body}</div>
<br>
<button type="button" class="btn btn-primary" id="repbtn">Reply</button>
</div>`;
document.querySelector("#detail-view").appendChild(vw);
if (mailbox == 'inbox'){
var m = document.createElement('button');
m.innerHTML = `<button type="button" class="btn btn-success" id="arcbtn">Add to Archive</button>`;
document.querySelector("#detail-view").appendChild(m);
}
if (mailbox == 'archive'){
var p = document.createElement('button');
p.className = `btn btn-danger`;
p.innerHTML = 'Remove from Archive';
p.onclick = function(){
    nomailarchive(id, email.archived);
   return false;
   };
document.querySelector("#detail-view").appendChild(p);
}
document.querySelector("#arcbtn").addEventListener('click', () => { mailarchive(email.id)});
document.querySelector("#repbtn").addEventListener('click', () => { replymail(email.sender, email.subject, email.body, email.timestamp)});
});
readmail(id);
}
function mailarchive(id) {
 fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: true,
    }),
  });
  load_mailbox('inbox');
}
function nomailarchive(id, archive) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: false,
    }),
  });
  load_mailbox('inbox');
}
function readmail(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}
function replymail(sender, subject, body, timestamp) {
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  compose_email();
  let str = subject;
  let substr = 'Re:';
 if (str.includes(substr)){
  	subject = subject;
  }
  else{
   subject = `Re: ${subject}`;
   }
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;
  fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;
  document.querySelector("#compose-body").value = fill;
  
}

