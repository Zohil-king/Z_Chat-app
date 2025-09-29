// --- Mock data ---
const conversations = [
  {id:1,name:'Alex',avatar:'A',messages:[
    {from:'other',text:'Hey! Are you there?',time:Date.now()-1000*60*60},
    {from:'me',text:'Yes — working on the UI now. 😊',time:Date.now()-1000*60*50},
    {from:'other',text:'Cool. Can you add emoji support?',time:Date.now()-1000*60*49},
  ]},
  {id:2,name:'Sam',avatar:'S',messages:[
    {from:'other',text:"Did you watch the demo?",time:Date.now()-1000*60*60*24},
    {from:'me',text:'Not yet. Sending my feedback soon.',time:Date.now()-1000*60*60*23}
  ]}
];

// --- State ---
let currentConv = conversations[0];
const chatListEl = document.getElementById('chatList');
const messagesInner = document.getElementById('messagesInner');
const headerName = document.getElementById('headerName');
const headerAvatar = document.getElementById('headerAvatar');
const headerStatus = document.getElementById('headerStatus');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const messagesEl = document.getElementById('messages');

// Render chat list
function renderChatList(){
  chatListEl.innerHTML = '';
  conversations.forEach(conv=>{
    const el = document.createElement('div');
    el.className='chat-item';
    el.innerHTML = `<div class='avatar'>${conv.avatar}</div>
      <div class='meta'>
        <div class='name'>${conv.name}</div>
        <div class='last'>${conv.messages[conv.messages.length-1].text.slice(0,40)}</div>
      </div>`;
    el.onclick = ()=>{loadConversation(conv.id)};
    chatListEl.appendChild(el);
  });
}

function loadConversation(id){
  currentConv = conversations.find(c=>c.id===id);
  headerName.textContent = currentConv.name;
  headerAvatar.textContent = currentConv.avatar;
  headerStatus.textContent = 'Online';
  renderMessages();
}

function formatTime(ts){
  const d = new Date(ts);
  return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

function renderMessages(){
  messagesInner.innerHTML = '';
  currentConv.messages.forEach(m=>{
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (m.from==='me'?'me':'other');
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + (m.from==='me'?'me':'other');
    bubble.innerHTML = `<div>${escapeHtml(m.text)}</div><div class='time'>${formatTime(m.time)}</div>`;
    wrap.appendChild(bubble);
    messagesInner.appendChild(wrap);
  });
  scrollToBottom();
}

function scrollToBottom(){
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(unsafe){
  return unsafe.replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
}

// Send message
function sendMessage(){
  const text = input.value.trim();
  if(!text) return;
  currentConv.messages.push({from:'me',text,time:Date.now()});
  input.value='';
  renderMessages();
  simulateOtherTypingAndReply();
}

// Simulate typing + reply
function simulateOtherTypingAndReply(){
  showTyping(true);
  const typingTime = 800 + Math.random()*1200;
  setTimeout(()=>{
    showTyping(false);
    const replyText = generateAutoReply();
    currentConv.messages.push({from:'other',text:replyText,time:Date.now()});
    renderMessages();
  }, typingTime);
}

function showTyping(show){
  const existing = document.querySelector('.typing-indicator');
  if(show){
    if(existing) return;
    const wrap = document.createElement('div');
    wrap.className='typing-indicator msg other';
    const bubble = document.createElement('div');
    bubble.className='bubble other';
    bubble.innerHTML = `
      <div class="typing">
        <div style="font-size:13px;color:var(--muted);margin-right:8px">
          ${currentConv.name} is typing
        </div>
        <div style="display:flex">
          <div class="dot animate"></div><div class="dot animate"></div><div class="dot animate"></div>
        </div>
      </div>`;
    wrap.appendChild(bubble);
    messagesInner.appendChild(wrap);
    scrollToBottom();
  } else {
    if(existing) existing.remove();
  }
}

function generateAutoReply(){
  const replies = [
    `Nice — got it!`,`Sounds good.`,`I like that idea.`,
    `Haha, that's great!`,`Okay, I'll check and reply back.`,`Thanks — saved 👍`
  ];
  return replies[Math.floor(Math.random()*replies.length)];
}

// Emoji picker
emojiBtn.addEventListener('click', ()=>{
  emojiPicker.style.display = emojiPicker.style.display==='none' ? 'grid':'none';
});
emojiPicker.addEventListener('click', (e)=>{
  if(e.target.classList.contains('emoji')){
    insertAtCursor(input, e.target.textContent);
    input.focus();
  }
});
document.addEventListener('click', (e)=>{
  if(!emojiPicker.contains(e.target) && e.target!==emojiBtn) emojiPicker.style.display='none';
});

function insertAtCursor(textarea, text){
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0,start);
  const after = textarea.value.substring(end);
  textarea.value = before + text + after;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

// Events
input.addEventListener('keydown',(e)=>{
  if(e.key==='Enter' && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener('click', sendMessage);
document.getElementById('attachBtn').addEventListener('click', ()=>{
  currentConv.messages.push({from:'me',text:'[Image] (mock attachment)',time:Date.now()});
  renderMessages();
  simulateOtherTypingAndReply();
});

// Init
renderChatList();
loadConversation(currentConv.id);
window.addEventListener('load', ()=>input.focus());
