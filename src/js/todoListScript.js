// ── State ──
var tasks      = JSON.parse(localStorage.getItem('folio-v4') || '[]');
var filter     = 'all';
var sortMode   = 'none';   // 'none' | 'priority' | 'due' | 'alpha'
var hideDone   = false;
var searchQuery = '';
var editingIdx = -1;
var SORT_MODES = ['none','priority','due','alpha'];
var SORT_IDX   = 0;

function save() { localStorage.setItem('folio-v4', JSON.stringify(tasks)); }

function toast(msg, dur) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.classList.remove('show'); }, dur || 2200);
}

// ── Date header ──
var DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var NOW    = new Date();
document.getElementById('date-label').textContent =
  DAYS[NOW.getDay()] + ', ' + MONTHS[NOW.getMonth()] + ' ' + NOW.getDate() + ', ' + NOW.getFullYear();

// Set today as default due date
var todayStr = NOW.toISOString().slice(0,10);
document.getElementById('due-input').value = '';
document.getElementById('due-input').min   = todayStr;
document.getElementById('modal-due').min   = todayStr;

// ── Draw SVG spiral coils ──
function drawSpiral() {
  var svg   = document.getElementById('coils-svg');
  if (!svg) return;
  var bookEl = document.querySelector('.paper');
  var bookH  = bookEl ? bookEl.offsetHeight : 500;
  var W      = 38;
  var cx     = W / 2;
  var rx     = 13;
  var ry     = 5.2;
  var step   = 25;
  var startY = 18;
  var count  = Math.floor((bookH - startY - 12) / step);

  svg.setAttribute('height', bookH);
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + bookH);
  svg.innerHTML = '';

  // Defs
  var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  defs.innerHTML =
    '<radialGradient id="gRing" cx="35%" cy="28%" r="68%">' +
      '<stop offset="0%"   stop-color="#f2f2f2"/>' +
      '<stop offset="25%"  stop-color="#d0d0d0"/>' +
      '<stop offset="60%"  stop-color="#8a8a8a"/>' +
      '<stop offset="100%" stop-color="#404040"/>' +
    '</radialGradient>' +
    '<linearGradient id="gHi" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%"   stop-color="#efefef" stop-opacity="1"/>' +
      '<stop offset="100%" stop-color="#aaaaaa" stop-opacity="0.5"/>' +
    '</linearGradient>' +
    '<linearGradient id="gWire" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%"   stop-color="#3a3a3a"/>' +
      '<stop offset="38%"  stop-color="#c8c8c8"/>' +
      '<stop offset="55%"  stop-color="#a0a0a0"/>' +
      '<stop offset="100%" stop-color="#383838"/>' +
    '</linearGradient>' +
    '<filter id="fS" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feDropShadow dx="0.5" dy="2" stdDeviation="1.8" flood-color="rgba(0,0,0,0.65)"/>' +
    '</filter>';
  svg.appendChild(defs);

  // Vertical wire (behind everything)
  var wire = document.createElementNS('http://www.w3.org/2000/svg','line');
  wire.setAttribute('x1', cx); wire.setAttribute('y1', startY - ry);
  wire.setAttribute('x2', cx); wire.setAttribute('y2', startY + (count - 1) * step + ry);
  wire.setAttribute('stroke', 'url(#gWire)');
  wire.setAttribute('stroke-width', '2.8');
  wire.setAttribute('stroke-linecap', 'round');
  svg.appendChild(wire);

  for (var i = 0; i < count; i++) {
    var cy = startY + i * step;

    // Back-half of ring (bottom arc, drawn behind fill)
    var backClipId = 'bc' + i;
    var backClip   = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
    backClip.setAttribute('id', backClipId);
    var bcRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    bcRect.setAttribute('x', 0);   bcRect.setAttribute('y', cy);
    bcRect.setAttribute('width', W); bcRect.setAttribute('height', ry + 6);
    backClip.appendChild(bcRect);
    svg.appendChild(backClip);

    var backArc = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    backArc.setAttribute('cx', cx);  backArc.setAttribute('cy', cy);
    backArc.setAttribute('rx', rx);  backArc.setAttribute('ry', ry);
    backArc.setAttribute('fill', 'none');
    backArc.setAttribute('stroke', '#404040');
    backArc.setAttribute('stroke-width', '3');
    backArc.setAttribute('clip-path', 'url(#' + backClipId + ')');
    svg.appendChild(backArc);

    // Ring body with shadow
    var g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('filter', 'url(#fS)');

    var ringEl = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    ringEl.setAttribute('cx', cx);  ringEl.setAttribute('cy', cy);
    ringEl.setAttribute('rx', rx);  ringEl.setAttribute('ry', ry);
    ringEl.setAttribute('fill', 'url(#gRing)');
    ringEl.setAttribute('stroke', '#2e2e2e');
    ringEl.setAttribute('stroke-width', '0.8');
    g.appendChild(ringEl);

    // Inner hole (spine darkness showing through)
    var holeEl = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    holeEl.setAttribute('cx', cx);         holeEl.setAttribute('cy', cy);
    holeEl.setAttribute('rx', rx - 5);     holeEl.setAttribute('ry', ry - 2.2);
    holeEl.setAttribute('fill', '#1a0e05');
    holeEl.setAttribute('stroke', '#111');
    holeEl.setAttribute('stroke-width', '0.5');
    g.appendChild(holeEl);

    svg.appendChild(g);

    // Front top-half highlight arc
    var hiClipId = 'hc' + i;
    var hiClip   = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
    hiClip.setAttribute('id', hiClipId);
    var hiRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    hiRect.setAttribute('x', 0);     hiRect.setAttribute('y', cy - ry - 2);
    hiRect.setAttribute('width', W); hiRect.setAttribute('height', ry + 2);
    hiClip.appendChild(hiRect);
    svg.appendChild(hiClip);

    var hiEl = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    hiEl.setAttribute('cx', cx);       hiEl.setAttribute('cy', cy);
    hiEl.setAttribute('rx', rx - 1);   hiEl.setAttribute('ry', ry - 1);
    hiEl.setAttribute('fill', 'none');
    hiEl.setAttribute('stroke', 'url(#gHi)');
    hiEl.setAttribute('stroke-width', '2.2');
    hiEl.setAttribute('clip-path', 'url(#' + hiClipId + ')');
    svg.appendChild(hiEl);

    // Specular glint (tiny bright spot top-left)
    var glint = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    glint.setAttribute('cx', cx - rx * 0.42);
    glint.setAttribute('cy', cy - ry * 0.52);
    glint.setAttribute('rx', '2.8');
    glint.setAttribute('ry', '1.1');
    glint.setAttribute('fill', 'rgba(255,255,255,0.62)');
    glint.setAttribute('transform', 'rotate(-20,' + (cx - rx*0.42) + ',' + (cy - ry*0.52) + ')');
    svg.appendChild(glint);
  }
}

drawSpiral();
window.addEventListener('resize', drawSpiral);

// ── Progress ring ──
function updateRing(done, total) {
  var pct    = total ? Math.round(done / total * 100) : 0;
  var circ   = 150.8;
  var offset = circ - circ * pct / 100;
  var arc    = document.getElementById('prog-arc');
  var lbl    = document.getElementById('ring-pct');
  arc.style.strokeDashoffset = offset;
  var col = pct === 100 ? '#2d5a3d' : pct >= 60 ? '#b8720a' : pct >= 30 ? '#2d5a3d' : '#9b2335';
  arc.style.stroke = col;
  lbl.style.color  = col;
  lbl.textContent  = pct + '%';
}

// ── HTML escape ──
function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Format due date ──
function formatDue(str) {
  if (!str) return '';
  var d   = new Date(str + 'T00:00:00');
  var now = new Date(); now.setHours(0,0,0,0);
  var diff = Math.round((d - now) / 86400000);
  if (diff < 0)  return { label: 'Overdue ' + Math.abs(diff) + 'd', cls: 'due-overdue' };
  if (diff === 0) return { label: 'Today', cls: 'due-today' };
  if (diff === 1) return { label: 'Tomorrow', cls: '' };
  return { label: MONTHS[d.getMonth()].slice(0,3) + ' ' + d.getDate(), cls: '' };
}

// ── Priority config ──
var PRIO = {
  high: { dot: 'p-high', label: 'Urgent',  color: '#9b2335', rank: 0 },
  med:  { dot: 'p-med',  label: 'Normal',  color: '#b8720a', rank: 1 },
  low:  { dot: 'p-low',  label: 'Low',     color: '#2d5a3d', rank: 2 },
};

// ── Tag color pool ──
var TAG_COLORS = ['#9b2335','#b8720a','#2d5a3d','#2980b9','#8e44ad','#2c7873','#c0392b'];
var tagColorMap = {};
function getTagColor(tag) {
  if (!tagColorMap[tag]) {
    var idx = Object.keys(tagColorMap).length % TAG_COLORS.length;
    tagColorMap[tag] = TAG_COLORS[idx];
  }
  return tagColorMap[tag];
}

// ── Render ──
function render() {
  var total    = tasks.length;
  var doneCount = tasks.filter(function(t){ return t.done; }).length;
  var left     = total - doneCount;
  var highCount = tasks.filter(function(t){ return !t.done && t.priority === 'high'; }).length;

  document.getElementById('s-total').textContent = total;
  document.getElementById('s-done').textContent  = doneCount;
  document.getElementById('s-left').textContent  = left;
  document.getElementById('s-high').textContent  = highCount;

  var msg = '';
  if (left > 0)       msg = left + ' task' + (left>1?'s':'') + ' remaining';
  else if (total > 0) msg = '🎉  All done — excellent work!';
  document.getElementById('footer-msg').textContent = msg;

  updateRing(doneCount, total);

  // Progress bar
  var pct = total ? Math.round(doneCount / total * 100) : 0;
  var barFill  = document.getElementById('prog-bar-fill');
  var barLabel = document.getElementById('prog-bar-label');
  if (barFill)  barFill.style.width = pct + '%';
  if (barLabel) barLabel.textContent = doneCount + ' / ' + total + ' done';


  // ── Filter ──
  var list = document.getElementById('task-list');
  var sq   = searchQuery.toLowerCase();

  var visible = tasks.filter(function(t) {
    if (hideDone && t.done) return false;
    if (sq && t.text.toLowerCase().indexOf(sq) === -1 &&
        (!t.tag || t.tag.toLowerCase().indexOf(sq) === -1)) return false;
    if (filter === 'done')   return t.done;
    if (filter === 'active') return !t.done;
    if (filter === 'high')   return t.priority === 'high' && !t.done;
    return true;
  });

  // ── Sort ──
  if (sortMode === 'priority') {
    visible.sort(function(a,b){ return (PRIO[a.priority]||PRIO.med).rank - (PRIO[b.priority]||PRIO.med).rank; });
  } else if (sortMode === 'due') {
    visible.sort(function(a,b){
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });
  } else if (sortMode === 'alpha') {
    visible.sort(function(a,b){ return a.text.localeCompare(b.text); });
  }

  // ── Empty state ──
  if (!visible.length) {
    var icons  = { all:'📋', active:'🎯', done:'✅', high:'⚡' };
    var texts  = { all:'No tasks yet — add one above!', active:'No active tasks!', done:'Nothing completed yet.', high:'No urgent tasks!' };
    list.innerHTML =
      '<li style="padding:32px 0 24px;text-align:center;">' +
        '<span style="font-size:40px;display:block;margin-bottom:8px;animation:bob 3s ease-in-out infinite;">' + (icons[filter]||'📋') + '</span>' +
        '<span style="font-family:Caveat,cursive;font-size:18px;color:#9c7e62;font-style:italic;">' + (texts[filter]||'') + '</span>' +
      '</li>';
    return;
  }

  list.innerHTML = '';

  visible.forEach(function(task) {
    var idx   = tasks.indexOf(task);
    var prio  = PRIO[task.priority] || PRIO.med;
    var dueInfo = task.due ? formatDue(task.due) : null;
    var tagColor = task.tag ? getTagColor(task.tag) : null;

    var li = document.createElement('li');
    li.className = 'task-row' + (task.done ? ' task-done' : '');

    var dueHtml = '';
    if (dueInfo) {
      dueHtml = '<div class="due-label ' + dueInfo.cls + '">' +
        '<svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>' +
        dueInfo.label + '</div>';
    }
    var noteHtml = task.note ? '<div style="font-family:DM Mono,monospace;font-size:10px;color:#9c7e62;margin-top:2px;">— ' + esc(task.note) + '</div>' : '';
    var tagHtml  = task.tag  ? '<span class="tag-badge" style="background:' + tagColor + '22;color:' + tagColor + ';border:1px solid ' + tagColor + '44;">' +
      '<svg width="8" height="8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>' +
      esc(task.tag) + '</span>' : '';

    li.innerHTML =
      // Drag handle
      '<svg class="drag-handle w-3 h-3 mt-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>' +
      // Priority dot
      '<div class="pdot ' + prio.dot + ' mt-3"></div>' +
      // Checkbox
      '<input type="checkbox" class="task-cb mt-1"' + (task.done ? ' checked' : '') + '>' +
      // Content
      '<div class="task-content flex-1 min-w-0">' +
        '<div class="flex flex-wrap items-baseline gap-1">' +
          '<span class="task-text">' + esc(task.text) + '</span>' +
          tagHtml +
        '</div>' +
        dueHtml +
        noteHtml +
        '<input type="text" class="edit-field mt-0.5" value="' + esc(task.text) + '" maxlength="140">' +
      '</div>' +
      // Actions
      '<div class="row-actions">' +
        '<button class="act-btn btn-edit" data-tip="Edit" style="color:#b8720a;">' +
          '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>' +
        '</button>' +
        '<button class="act-btn btn-save" style="display:none;color:#2d5a3d;">' +
          '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' +
        '</button>' +
        '<button class="act-btn btn-open" data-tip="Details" style="color:#6b5240;">' +
          '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
        '</button>' +
        '<button class="act-btn btn-del" data-tip="Delete" style="color:#9b2335;">' +
          '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
        '</button>' +
      '</div>';

    // Toggle checkbox
    li.querySelector('.task-cb').addEventListener('change', function(e) {
      tasks[idx].done = e.target.checked;
      save(); render();
      toast(e.target.checked ? '✓ Task completed!' : '↩ Marked as active');
    });

    // Inline edit
    li.querySelector('.btn-edit').addEventListener('click', function() {
      startInlineEdit(li);
    });
    li.querySelector('.task-text').addEventListener('dblclick', function() {
      startInlineEdit(li);
    });
    li.querySelector('.btn-save').addEventListener('click', function() {
      commitInlineEdit(li, idx);
    });
    li.querySelector('.edit-field').addEventListener('keydown', function(e) {
      if (e.key === 'Enter')  commitInlineEdit(li, idx);
      if (e.key === 'Escape') cancelInlineEdit(li);
    });

    // Open detail modal
    li.querySelector('.btn-open').addEventListener('click', function() {
      openModal(idx);
    });

    // Delete with undo
    li.querySelector('.btn-del').addEventListener('click', function() {
      var removed = tasks.splice(idx, 1)[0];
      save(); render();
      var undoToast = document.getElementById('toast');
      undoToast.innerHTML = 'Task deleted. <span id="undo-link" style="text-decoration:underline;cursor:pointer;color:#d4b86a;margin-left:8px;">Undo</span>';
      undoToast.classList.add('show');
      clearTimeout(undoToast._t);
      undoToast._t = setTimeout(function(){ undoToast.classList.remove('show'); }, 4000);
      document.getElementById('undo-link').onclick = function() {
        tasks.splice(idx, 0, removed);
        save(); render();
        undoToast.classList.remove('show');
        toast('↩ Task restored');
      };
    });

    // Add button hover effects inline
    li.querySelector('.btn-del').onmouseover  = function(){ this.style.color='#6b1522'; };
    li.querySelector('.btn-del').onmouseout   = function(){ this.style.color='#9b2335'; };
    li.querySelector('.btn-edit').onmouseover = function(){ this.style.color='#7a4c06'; };
    li.querySelector('.btn-edit').onmouseout  = function(){ this.style.color='#b8720a'; };

    list.appendChild(li);
  });
  // Redraw spiral to match new paper height
  setTimeout(drawSpiral, 20);
}

// ── Inline edit helpers ──
function startInlineEdit(li) {
  li.querySelector('.task-content').classList.add('editing');
  var field = li.querySelector('.edit-field');
  field.style.display = 'block';
  field.focus(); field.select();
  li.querySelector('.btn-save').style.display = 'flex';
}

function commitInlineEdit(li, idx) {
  var val = li.querySelector('.edit-field').value.trim();
  if (!val) return;
  tasks[idx].text = val;
  save(); render();
  toast('✏ Task updated');
}

function cancelInlineEdit(li) {
  li.querySelector('.task-content').classList.remove('editing');
  li.querySelector('.edit-field').style.display = 'none';
  li.querySelector('.btn-edit').style.display    = '';
  li.querySelector('.btn-save').style.display    = 'none';
}

// ── Modal ──
function openModal(idx) {
  editingIdx = idx;
  var t = tasks[idx];
  document.getElementById('modal-text').value     = t.text;
  document.getElementById('modal-priority').value = t.priority || 'med';
  document.getElementById('modal-due').value      = t.due  || '';
  document.getElementById('modal-tag').value      = t.tag  || '';
  document.getElementById('modal-note').value     = t.note || '';
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editingIdx = -1;
}

function saveModal() {
  if (editingIdx < 0) return;
  var t = tasks[editingIdx];
  t.text     = document.getElementById('modal-text').value.trim() || t.text;
  t.priority = document.getElementById('modal-priority').value;
  t.due      = document.getElementById('modal-due').value || '';
  t.tag      = document.getElementById('modal-tag').value.trim();
  t.note     = document.getElementById('modal-note').value.trim();
  save(); render(); closeModal();
  toast('✏ Task updated');
}

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── Add task ──
function addTask() {
  var input    = document.getElementById('task-input');
  var text     = input.value.trim();
  if (!text) { input.focus(); return; }

  var priority = document.getElementById('priority-select').value;
  var due      = document.getElementById('due-input').value;
  var tag      = document.getElementById('tag-input').value.trim();
  var note     = document.getElementById('note-input').value.trim();

  tasks.unshift({ text:text, done:false, id:Date.now(), priority:priority, due:due, tag:tag, note:note });

  input.value = '';
  document.getElementById('tag-input').value  = '';
  document.getElementById('note-input').value = '';
  document.getElementById('due-input').value  = '';
  document.getElementById('priority-select').value = 'med';

  save(); render(); input.focus();
  toast('+ Task added');
}

document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTask();
});
// Add on Enter from tag/note fields too
['tag-input','note-input'].forEach(function(id) {
  document.getElementById(id).addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
  });
});

// ── Filter tabs ──
document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(function(b) {
      b.classList.remove('active');
      b.style.borderBottomColor = 'transparent';
      b.style.color = '#6b5240';
      b.style.background = 'transparent';
    });
    btn.classList.add('active');
    btn.style.borderBottomColor = '#9b2335';
    btn.style.color             = '#1a120a';
    btn.style.background        = 'rgba(155,35,53,0.06)';
    filter = btn.dataset.f;
    render();
  });
});

// ── Search ──
document.getElementById('search-input').addEventListener('input', function() {
  searchQuery = this.value.trim();
  render();
});

// ── Clear completed ──
document.getElementById('clear-btn').addEventListener('click', function() {
  var count = tasks.filter(function(t){ return t.done; }).length;
  if (!count) return;
  tasks = tasks.filter(function(t){ return !t.done; });
  save(); render();
  toast(count + ' completed task' + (count > 1 ? 's' : '') + ' cleared');
});

// ── Sort cycle ──
function cycleSort() {
  SORT_IDX = (SORT_IDX + 1) % SORT_MODES.length;
  sortMode = SORT_MODES[SORT_IDX];
  var labels = { none:'Default order', priority:'Sorted by priority', due:'Sorted by due date', alpha:'Sorted A–Z' };
  toast('⇅ ' + labels[sortMode]);
  render();
}

// ── Toggle hide done ──
function toggleDone() {
  hideDone = !hideDone;
  toast(hideDone ? '🙈 Completed tasks hidden' : '👁 Showing all tasks');
  render();
}

// ── Export ──
function exportTasks() {
  var json = JSON.stringify(tasks, null, 2);
  var blob = new Blob([json], { type:'application/json' });
  var a    = document.createElement('a');
  a.href   = URL.createObjectURL(blob);
  a.download = 'folio-tasks-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  toast('📥 Tasks exported');
}

// ── Import ──
function importTasks() {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid');
        tasks = imported.concat(tasks);
        save(); render();
        toast('📤 ' + imported.length + ' tasks imported');
      } catch(err) {
        toast('⚠ Invalid file format');
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}

// ── Add-button hover effect ──
var addBtn = document.getElementById('add-btn');
addBtn.addEventListener('mouseenter', function(){ this.style.background='#9b2335'; this.style.transform='scale(1.1) rotate(90deg)'; });
addBtn.addEventListener('mouseleave', function(){ this.style.background='#1a120a'; this.style.transform=''; });

// ── Init ──
render();