(() => {
  "use strict";

  const STORE = "ironform-studio-v2";
  const labels = {biceps:"Бицепс",triceps:"Трицепс",shoulders:"Рамене",back:"Гръб",legs:"Крака",chest:"Гърди"};
  const goalNames = {muscle:"Мускулна маса",strength:"Сила",fitness:"Обща физическа форма"};
  const experienceNames = {beginner:"Начинаещ",intermediate:"Средно напреднал",advanced:"Напреднал"};
  const equipmentNames = {gym:"Пълна зала",dumbbells:"Дъмбели",bodyweight:"Собствено тегло"};
  const daysOfWeek = ["Неделя","Понеделник","Вторник","Сряда","Четвъртък","Петък","Събота"];
  const dayShort = ["Нд","Пн","Вт","Ср","Чт","Пт","Сб"];
  const dayNames = ["Понеделник","Вторник","Сряда","Четвъртък","Петък","Събота","Неделя"];
  const plansByDays = {
    2:[{title:"Цяло тяло A",split:"Цяло тяло",groups:["legs","chest","back","shoulders","biceps","triceps"]},{title:"Цяло тяло B",split:"Цяло тяло",groups:["legs","back","chest","shoulders","triceps","biceps"]}],
    3:[{title:"Цяло тяло A",split:"Цяло тяло",groups:["legs","chest","back","shoulders","biceps"]},{title:"Цяло тяло B",split:"Цяло тяло",groups:["legs","back","shoulders","chest","triceps"]},{title:"Цяло тяло C",split:"Цяло тяло",groups:["legs","chest","back","triceps","biceps"]}],
    4:[{title:"Горна част A",split:"Горна част",groups:["chest","back","shoulders","biceps","triceps"]},{title:"Долна част A",split:"Долна част",groups:["legs","legs","legs","back"]},{title:"Горна част B",split:"Горна част",groups:["back","chest","shoulders","triceps","biceps"]},{title:"Долна част B",split:"Долна част",groups:["legs","legs","legs","shoulders"]}],
    5:[{title:"Бутане",split:"Гърди · рамене · трицепс",groups:["chest","chest","shoulders","triceps","triceps"]},{title:"Дърпане",split:"Гръб · бицепс",groups:["back","back","back","shoulders","biceps","biceps"]},{title:"Крака",split:"Квадрицепс · задно бедро",groups:["legs","legs","legs","legs","back"]},{title:"Горна част",split:"Смесена горна част",groups:["chest","back","shoulders","biceps","triceps"]},{title:"Долна част",split:"Крака и стабилност",groups:["legs","legs","legs","back"]}]
  };
  const weekdaySchedules = {2:[1,4],3:[1,3,5],4:[1,2,4,6],5:[1,2,3,5,6]};
  const equipmentRules = {
    biceps:{gym:["barbell","cable","preacher","кърл на наклон","концентрационен"],dumbbells:["хамър","наклонена пейка","концентрационен"],bodyweight:[]},
    triceps:{gym:["лег","пушдаун","надглавно","диипс"],dumbbells:["надглавно","skull","диипс"],bodyweight:[]},
    shoulders:{gym:["военна преса","странично","предно","фейс пул","арнолд"],dumbbells:["странично","предно","арнолд","военна преса"],bodyweight:[]},
    back:{gym:["набирания","барбел","лат пулдаун","кейбъл","тяга"],dumbbells:["набирания","барбел","тяга"],bodyweight:[]},
    legs:{gym:["клек","преса за крака","румънска тяга","сгъване","изпади"],dumbbells:["клек","румънска тяга","изпади"],bodyweight:["клек","изпади"]},
    chest:{gym:["хоризонтален лег","наклонен лег","флай","кейбъл","диипс"],dumbbells:["хоризонтален лег","наклонен лег","флай","диипс"],bodyweight:[]}
  };
  const prettyNames = {
    "Барбел Кърл":"Сгъване с щанга","Хамър Кърл":"Чуково сгъване с дъмбели","Кърл на Наклонена Пейка":"Сгъване с дъмбели на наклонена пейка","Концентрационен Кърл":"Концентрационно сгъване","Кейбъл Кърл":"Сгъване на скрипец",
    "Теснохват Лег":"Лежанка с тесен хват","Skull Crusher":"Разгъване с щанга от лег","Трицепс Пушдаун":"Разгъване на скрипец за трицепс","Надглавно Разгъване":"Разгъване над глава за трицепс","Диипс за Трицепс":"Кофички за трицепс",
    "Военна Преса":"Военна преса","Странично Повдигане":"Странично повдигане с дъмбели","Предно Повдигане":"Предно повдигане с дъмбели","Фейс Пул":"Издърпване на въже към лицето","Преса на Арнолд":"Раменна преса на Арнолд",
    "Набирания":"Набирания","Барбел Рeд":"Гребане с щанга","Лат Пулдаун":"Издърпване на горен скрипец","Кейбъл Рeд":"Гребане на долен скрипец","Мъртва Тяга":"Мъртва тяга",
    "Клек":"Клек","Преса за Крака":"Лег преса","Румънска Тяга":"Румънска тяга","Сгъване за Крака":"Сгъване за задно бедро","Изпади":"Напади",
    "Хоризонтален Лег":"Лежанка с щанга","Наклонен Лег":"Наклонена лежанка","Флай":"Разтваряне с дъмбели","Кейбъл Кросоувър":"Кросоувър на скрипец","Диипс за Гърди":"Кофички за гърди"
  };
  const equipmentAlternatives = {
    dumbbells:{biceps:"Сгъване с дъмбели",triceps:"Френско разгъване с дъмбел",shoulders:"Странично повдигане с дъмбели",back:"Гребане с дъмбел с опора",legs:"Румънска тяга с дъмбели",chest:"Лежанка с дъмбели"},
    bodyweight:{biceps:"Самосъпротивително сгъване за бицепс",triceps:"Тесни лицеви опори за трицепс",shoulders:"Пайк лицева опора",back:"Супермен с прибиране на лопатките",legs:"Клек със собствено тегло",chest:"Лицеви опори"}
  };
  const groupEmoji={biceps:"↗",triceps:"↗",shoulders:"◉",back:"↔",legs:"⌁",chest:"▤"};
  let state = loadState();
  let chosenGroup = "all";
  let timerId = null;
  let timerTarget = 75;
  let activeWorkout = null;
  let setupStep = 0;
  let toastId = null;

  function loadState(){try{return JSON.parse(localStorage.getItem(STORE))||{profile:null,plan:null,history:[]}}catch{return{profile:null,plan:null,history:[]}}}
  function saveState(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{showToast("Не успяхме да запазим данните на това устройство.")}}
  function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function todayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
  function dateAtOffset(offset){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return d}
  function formatDate(value,options={day:"numeric",month:"short"}){return new Date(`${value}T12:00:00`).toLocaleDateString("bg-BG",options)}
  function showToast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastId);toastId=setTimeout(()=>el.classList.remove("show"),2500)}
  function groupExercises(group){const catalog=typeof GROUPS!=="undefined"?GROUPS:{};return (catalog[group]?.exercises||[]).map(x=>({...x,displayName:prettyNames[x.name]||x.name}))}
  function suitableExercises(group,equipment){
    const all=groupExercises(group);if(!all.length)return[];
    if(equipment==="gym")return all;
    const hints=equipmentRules[group]?.[equipment]||[];
    const matches=all.filter(x=>hints.some(h=>x.displayName.toLocaleLowerCase("bg").includes(h.toLocaleLowerCase("bg"))||x.name.toLocaleLowerCase("bg").includes(h.toLocaleLowerCase("bg"))));
    if(matches.length)return matches;
    const name=equipmentAlternatives[equipment]?.[group];
    return name?[{id:`${equipment}-${group}`,displayName:name,desc:"Изпълнявай с контролирано темпо и избери вариант, който можеш да правиш без болка."}]:all;
  }
  function prescription(goal,group,index,experience){
    if(goal==="strength")return {sets:index===0?(experience==="beginner"?3:experience==="advanced"?5:4):(experience==="beginner"?2:3),reps:index===0?"5–6":"6–8",rest:index===0?150:105};
    if(goal==="fitness")return {sets:experience==="beginner"?2:3,reps:index===0?"10–12":"12–15",rest:60};
    return {sets:experience==="beginner"?2:3,reps:index===0?"8–10":"10–15",rest:index===0?90:75};
  }
  function makePlan(profile){
    const days=Number(profile.days);const weeklyDays=weekdaySchedules[days];const sessions=(plansByDays[days]||plansByDays[3]).map((template,i)=>{
      const used={};const exercises=template.groups.map((group,j)=>{
        const options=suitableExercises(group,profile.equipment);const fallback=groupExercises(group);const available=options.length?options:fallback;
        const position=used[group]||0;used[group]=position+1;
        const raw=available[(i+position)%available.length];const pres=prescription(profile.goal,group,position,profile.experience);
        return {id:`${raw?.id||group}-${i}-${j}`,sourceId:raw?.id||"",name:raw?.displayName||`${labels[group]} · основно движение`,group,sets:pres.sets,reps:pres.reps,rest:pres.rest,desc:raw?.desc||"Изпълнявай с плавен контрол и без да жертваш техниката.",completed:0,logs:Array.from({length:pres.sets},()=>({weight:"",reps:"",done:false}))};
      }).slice(0,profile.duration<=30?4:profile.duration<=45?5:template.groups.length);
      return {id:`session-${i}-${days}`,title:template.title,split:template.split,weekday:weeklyDays[i],duration:Number(profile.duration),exercises,completed:false};
    });
    return {created:todayKey(),sessions};
  }
  function currentWeekLogs(){const now=new Date();const start=new Date(now);const monday=(now.getDay()+6)%7;start.setDate(now.getDate()-monday);start.setHours(0,0,0,0);const end=new Date(start);end.setDate(start.getDate()+7);return state.history.filter(x=>{const d=new Date(`${x.date}T12:00:00`);return d>=start&&d<end})}
  function getStreak(){let streak=0;const weeks=new Set(state.history.map(x=>{const d=new Date(`${x.date}T12:00:00`);d.setDate(d.getDate()-((d.getDay()+6)%7));return todayKey(d)}));const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));while(weeks.has(todayKey(d))){streak++;d.setDate(d.getDate()-7)}return streak}
  function currentWeekSessions(){return currentWeekLogs().length}
  function renderDashboard(){
    const p=state.profile;const plan=state.plan;const total=state.history.length;const weekly=currentWeekSessions();const required=p?Number(p.days):0;
    document.getElementById("metricSessions").innerHTML=`${weekly} <small>/ ${required}</small>`;
    document.getElementById("metricTotal").textContent=total;
    document.getElementById("weeklyBar").style.width=`${required?Math.min(100,weekly/required*100):0}%`;
    document.getElementById("weeklyCaption").textContent=p?(weekly>=required?"Седмичната цел е изпълнена":"Продължавай с постоянство"):"Създай план, за да започнеш";
    const now=new Date();document.getElementById("todayLabel").textContent=now.toLocaleDateString("bg-BG",{weekday:"long",day:"numeric",month:"long"});document.getElementById("welcomeDate").textContent=`${now.toLocaleDateString("bg-BG",{weekday:"long"}).toLocaleUpperCase("bg-BG")} · ТРЕНИРОВЪЧНО СТУДИО`;
    const title=document.getElementById("nextWorkoutTitle"),copy=document.getElementById("nextWorkoutCopy"),badge=document.getElementById("nextWorkoutBadge"),action=document.getElementById("heroAction");
    if(!p||!plan){title.innerHTML="Изгради своя<br><em>ритъм.</em>";copy.textContent="Създай план според целта, опита и времето, с което разполагаш.";badge.textContent="ПЛАНЪТ ТЕ ЧАКА";action.textContent="Създай тренировъчен план →";action.dataset.action="setup"}
    else{const next=findNextSession();title.innerHTML=next?`${escapeHTML(next.session.title)}<br><em>е на ход.</em>`:"Отлична седмица.<br><em>Продължавай.</em>";copy.textContent=next?`${daysOfWeek[next.session.weekday]} · ${next.session.duration} минути · ${next.session.exercises.length} упражнения`:"Всички планирани тренировки за седмицата са отбелязани.";badge.textContent=next?"СЛЕДВАЩА ТРЕНИРОВКА":"СЕДМИЧНАТА ЦЕЛ Е ПОСТИГНАТА";action.textContent=next?"Започни тренировката →":"Виж моя план →";action.dataset.action=next?`start:${next.session.id}`:"plan"}
    renderWeekStrip();renderUpNext();renderProgress();
  }
  function findNextSession(){if(!state.plan?.sessions?.length)return null;const today=new Date().getDay();const doneThisWeek=new Set(currentWeekLogs().map(x=>x.sessionId));const sorted=state.plan.sessions.map(s=>({session:s,offset:(s.weekday-today+7)%7})).sort((a,b)=>a.offset-b.offset);return sorted.find(x=>!doneThisWeek.has(x.session.id))||null}
  function renderWeekStrip(){const el=document.getElementById("weekStrip");const now=new Date();const monday=(now.getDay()+6)%7;const start=dateAtOffset(-monday);const scheduled=new Set((state.plan?.sessions||[]).map(s=>s.weekday));const doneDates=new Set(currentWeekLogs().map(x=>x.date));el.innerHTML=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const key=todayKey(d);const today=key===todayKey();const classes=["day-cell",scheduled.has(d.getDay())?"training":"",today?"today":"",doneDates.has(key)?"done":""].filter(Boolean).join(" ");return `<div class="${classes}"><small>${dayShort[d.getDay()]}</small><strong>${d.getDate()}</strong><i></i></div>`}).join("")}
  function renderUpNext(){const host=document.getElementById("upNext");const next=findNextSession();if(!next){host.innerHTML=`<div class="up-next-main"><span class="up-next-icon">✳</span><span><strong>${state.plan?"Всички тренировки за седмицата са готови":"Готов ли си да започнеш?"}</strong><small>${state.plan?"Планирай следващата си седмица.":"Направи първата крачка с личен план."}</small></span></div><button class="button button-quiet" data-view="${state.plan?"plan":"plan"}">${state.plan?"Преглед":"Създай план"} →</button>`;return}host.innerHTML=`<div class="up-next-main"><span class="up-next-icon">▦</span><span><strong>${escapeHTML(next.session.title)}</strong><small>${next.offset===0?"Днес":"Следваща · "+daysOfWeek[next.session.weekday]} · ${next.session.duration} мин</small></span></div><button class="button button-primary" data-start="${next.session.id}">Започни →</button>`}
  function renderPlan(){const host=document.getElementById("planContent");if(!state.plan||!state.profile){host.innerHTML=`<div class="setup-empty"><div class="empty-symbol">✳</div><h2>Твоят план започва оттук</h2><p>Избери целта, графика и оборудването си. Ще изготвим седмична структура с ясни упражнения и препоръки за сериите.</p><button class="button button-primary" data-open-setup>Настрой моя план →</button></div>`;return}
    const p=state.profile;const weekDays=weekdaySchedules[Number(p.days)];const workoutCards=Array.from({length:7},(_,offset)=>{const weekday=(offset+1)%7;const session=state.plan.sessions.find(s=>s.weekday===weekday);if(!session)return `<article class="day-plan-card rest-day"><div class="day-mark">·</div><div><h3>${dayNames[offset]} · Възстановяване</h3><p>Почивка и възстановяване между сесиите.</p></div><span class="summary-tag">ПОЧИВКА</span></article>`;const list=session.exercises.map(x=>`<span>${escapeHTML(x.name)}</span>`).join("");return `<article class="day-plan-card"><div class="day-mark">${String(session.weekday).padStart(2,"0")}</div><div><h3>${dayNames[offset]} · ${escapeHTML(session.title)}</h3><p>${session.duration} минути · ${session.exercises.length} упражнения · ${escapeHTML(session.split)}</p><div class="day-exercises">${list}</div></div><button class="button button-primary" data-start="${session.id}">Започни →</button></article>`}).join("");
    host.innerHTML=`<div class="plan-summary"><div><p class="eyebrow">ТВОЯТА СТРУКТУРА · СЪЗДАДЕНА ${formatDate(state.plan.created,{day:"numeric",month:"long",year:"numeric"})}</p><h2>${goalNames[p.goal]} · ${p.days} дни седмично</h2><p>${experienceNames[p.experience]} · ${p.duration} минути · ${equipmentNames[p.equipment]}</p></div><div class="summary-tags"><span class="summary-tag">${p.days} тренировки / седмица</span><span class="summary-tag">${p.duration} мин / сесия</span></div></div><div class="plan-days">${workoutCards}</div>`;
  }
  function renderProgress(){const total=state.history.length;const month=new Date().toISOString().slice(0,7);const monthCount=state.history.filter(x=>x.date.startsWith(month)).length;const volume=state.history.reduce((sum,x)=>sum+(Number(x.volume)||0),0);document.getElementById("progressTotal").textContent=total;document.getElementById("progressMonth").textContent=monthCount;document.getElementById("progressVolume").innerHTML=`${Math.round(volume).toLocaleString("bg-BG")} <small>кг</small>`;const host=document.getElementById("historyList");host.innerHTML=state.history.length?state.history.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12).map(x=>`<div class="history-row"><span class="history-check">✓</span><span><strong>${escapeHTML(x.title)}</strong><small>${formatDate(x.date,{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · ${x.sets} работни серии</small></span><span class="history-volume">${Math.round(x.volume||0).toLocaleString("bg-BG")} кг</span></div>`).join(""):`<div class="no-history">Тук ще се появят тренировките, които завършиш.</div>`}
  function renderLibrary(){const keys=Object.keys(labels);document.getElementById("groupFilters").innerHTML=[`<button class="filter-pill ${chosenGroup==="all"?"active":""}" data-group-filter="all">Всички</button>`,...keys.map(k=>`<button class="filter-pill ${chosenGroup===k?"active":""}" data-group-filter="${k}">${labels[k]}</button>`)].join("");const query=document.getElementById("exerciseSearch").value.trim().toLocaleLowerCase("bg");const items=[];for(const key of keys){if(chosenGroup!=="all"&&chosenGroup!==key)continue;for(const ex of groupExercises(key)){const text=`${ex.displayName} ${labels[key]}`.toLocaleLowerCase("bg");if(!query||text.includes(query))items.push({key,ex})}}const host=document.getElementById("exerciseList");host.innerHTML=items.length?items.map(({key,ex})=>`<button class="exercise-card" type="button" data-open-exercise data-group="${key}" data-exercise-id="${escapeHTML(ex.id)}" aria-label="Отвори техника за ${escapeHTML(ex.displayName)}"><span class="exercise-glyph">${groupEmoji[key]}</span><span class="exercise-card-copy"><strong>${escapeHTML(ex.displayName)}</strong><small>${labels[key]} · Виж техника и инструкции</small></span><span class="exercise-detail" aria-hidden="true">↗</span></button>`).join(""):`<div class="empty-state">Няма упражнения, които отговарят на това търсене.</div>`}
  function openExerciseDetails(group,id){const ex=groupExercises(group).find(item=>String(item.id)===String(id));if(!ex)return;const video=ex.video?`<video controls playsinline preload="metadata" poster="${encodeURI(ex.image||"")}"><source src="${encodeURI(ex.video)}" type="video/mp4">Браузърът ти не поддържа видео.</video>`:ex.image?`<img src="${encodeURI(ex.image)}" alt="Демонстрация: ${escapeHTML(ex.displayName)}">`:`<div class="exercise-media-placeholder">${groupEmoji[group]}</div>`;const tips=Array.isArray(ex.tips)&&ex.tips.length?`<ul class="exercise-tips">${ex.tips.map(tip=>`<li>${escapeHTML(tip)}</li>`).join("")}</ul>`:"";document.getElementById("exerciseDialogContent").innerHTML=`<div class="exercise-detail-layout"><div class="exercise-media">${video}</div><div class="exercise-detail-copy"><div class="exercise-detail-top"><div><p class="eyebrow">${labels[group]} · ТЕХНИКА</p><h2 id="exerciseDetailTitle">${escapeHTML(ex.displayName)}</h2></div><button class="icon-button" data-action="close-exercise" aria-label="Затвори">×</button></div><p class="exercise-description">${escapeHTML(ex.desc||"Изпълнявай с плавен контрол и стабилна позиция.")}</p><div class="exercise-prescription"><span><small>СЕРИИ</small><b>${escapeHTML(ex.sets||"3")}</b></span><span><small>ПОВТОРЕНИЯ</small><b>${escapeHTML(ex.reps||"8–12")}</b></span><span><small>ПОЧИВКА</small><b>${escapeHTML(ex.rest||"60 сек")}</b></span></div>${tips?`<h3>Насоки за изпълнение</h3>${tips}`:""}</div></div>`;document.getElementById("exerciseDialog").showModal()}
  function navigate(view){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(view==="plan")renderPlan();if(view==="library")renderLibrary();if(view==="progress")renderProgress();window.scrollTo({top:0,behavior:"smooth"});history.replaceState(null,"",view==="home"?"#home":`#${view}`)}
  function renderWizard(){document.querySelectorAll(".wizard-step").forEach(step=>step.classList.toggle("active",Number(step.dataset.step)===setupStep));document.getElementById("setupStepLabel").textContent=`СТЪПКА ${setupStep+1} ОТ 3`;document.getElementById("setupStepHint").textContent=["Първо избери целта си.","Избери график, който можеш да спазваш.","Посочи оборудването и нивото си."][setupStep];document.getElementById("wizardProgress").style.width=`${(setupStep+1)/3*100}%`;document.getElementById("wizardBack").hidden=setupStep===0;document.getElementById("wizardNext").hidden=setupStep===2;document.getElementById("savePlanButton").hidden=setupStep!==2}
  function setChoice(group,value){const select=document.getElementById(group);if(select)select.value=String(value);if(group==="equipment"){const radio=document.querySelector(`input[name="equipment"][value="${value}"]`);if(radio)radio.checked=true}document.querySelectorAll(`[data-choice="${group}"]`).forEach(button=>button.classList.toggle("selected",button.dataset.value===String(value)))}
  function openSetup(){const p=state.profile||{goal:"muscle",experience:"beginner",days:3,duration:60,equipment:"gym"};setChoice("goal",p.goal);setChoice("days",p.days);setChoice("duration",p.duration);setChoice("equipment",p.equipment);document.getElementById("experience").value=p.experience;setupStep=0;renderWizard();document.getElementById("planDialog").showModal()}
  function savePlan(event){event.preventDefault();const profile={goal:document.getElementById("goal").value,experience:document.getElementById("experience").value,days:Number(document.getElementById("days").value),duration:Number(document.getElementById("duration").value),equipment:document.querySelector("input[name=equipment]:checked").value};state.profile=profile;state.plan=makePlan(profile);saveState();document.getElementById("planDialog").close();renderPlan();renderDashboard();navigate("plan");showToast("Готово. Планът ти е запазен.")}
  function timerText(seconds){return `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`}
  function workoutMarkup(session){
    const ei=activeWorkout.exerciseIndex;const ex=session.exercises[ei];const setIndex=ex.logs.findIndex(log=>!log.done);const complete=setIndex===-1;const total=session.exercises.reduce((n,e)=>n+e.sets,0);const done=session.exercises.reduce((n,e)=>n+e.logs.filter(log=>log.done).length,0);const exerciseList=session.exercises.map((item,index)=>`<span class="${index===ei?"current":index<ei?"done":""}">${index<ei?"✓":index+1} · ${escapeHTML(item.name)}</span>`).join("");
    const setContent=complete?`<div class="set-card complete-card"><strong>Упражнението е готово ✓</strong><p>Добра работа. Продължи със следващото.</p><button class="button button-primary set-action" data-action="${ei===session.exercises.length-1?"finish":"next-exercise"}">${ei===session.exercises.length-1?"Завърши тренировката":"Следващо упражнение"} →</button></div>`:`<div class="set-card"><div class="set-card-top"><strong>Серия ${setIndex+1} от ${ex.sets}</strong><span>Цел: ${escapeHTML(ex.reps)} повторения</span></div><div class="set-fields"><label>Тежест · кг<input id="setWeight" type="number" inputmode="decimal" min="0" step="0.5" placeholder="напр. 20" value="${escapeHTML(ex.logs[setIndex].weight)}"></label><label>Повторения<input id="setReps" type="number" inputmode="numeric" min="1" step="1" placeholder="${escapeHTML(ex.reps)}" value="${escapeHTML(ex.logs[setIndex].reps)}"></label></div><button class="button button-primary set-action" data-action="record-set">Запиши серия ✓</button></div>`;
    return `<div class="workout-head"><div><p class="eyebrow">ТРЕНИРОВКА · ${escapeHTML(session.title)}</p><h2>${escapeHTML(session.title)}</h2><p>${session.duration} мин · ${session.exercises.length} упражнения</p></div><button class="icon-button" data-action="close" aria-label="Излез от тренировката">×</button></div><div class="workout-progress"><span id="setProgressText">${done} от ${total} серии</span><div class="progress-track"><i id="setProgressBar" style="width:${total?done/total*100:0}%"></i></div></div><section class="workout-focus"><p class="exercise-step-label">УПРАЖНЕНИЕ ${ei+1} ОТ ${session.exercises.length}</p><h3>${escapeHTML(ex.name)}</h3><p class="exercise-meta">${labels[ex.group]} · ${ex.sets} серии · ${escapeHTML(ex.reps)} повторения · ${Math.round(ex.rest/60)} мин почивка</p><p class="exercise-hint">${escapeHTML(ex.desc||"Движи се спокойно и запази контрол във всяко повторение.")}</p>${setContent}<div class="rest-timer"><span>Почивка<strong id="timerDisplay">${timerText(timerTarget)}</strong></span><button class="button button-secondary" data-action="timer">Пусни таймера</button></div><div class="exercise-todo">${exerciseList}</div></section>`;
  }
  function renderWorkout(){const session=state.plan?.sessions.find(s=>s.id===activeWorkout?.sessionId);if(!session)return;document.getElementById("workoutModalContent").innerHTML=workoutMarkup(session)}
  function startWorkout(sessionId){const session=state.plan?.sessions.find(s=>s.id===sessionId);if(!session){showToast("Първо създай план.");openSetup();return}if(session.completed){session.exercises.forEach(ex=>{ex.logs=Array.from({length:ex.sets},()=>({weight:"",reps:"",done:false}))});session.completed=false;saveState()}let exerciseIndex=session.exercises.findIndex(ex=>ex.logs.some(log=>!log.done));if(exerciseIndex<0)exerciseIndex=0;activeWorkout={sessionId,exerciseIndex};timerTarget=session.exercises[exerciseIndex]?.rest||75;renderWorkout();document.body.classList.add("workout-active");document.getElementById("workoutDialog").showModal()}
  function persistWorkoutInputs(){if(!activeWorkout)return;const session=state.plan?.sessions.find(s=>s.id===activeWorkout.sessionId);const ex=session?.exercises[activeWorkout.exerciseIndex];if(!ex)return;const setIndex=ex.logs.findIndex(log=>!log.done);if(setIndex<0)return;ex.logs[setIndex].weight=document.getElementById("setWeight")?.value||"";ex.logs[setIndex].reps=document.getElementById("setReps")?.value||"";saveState()}
  function recordSet(){const session=state.plan?.sessions.find(s=>s.id===activeWorkout?.sessionId);const ex=session?.exercises[activeWorkout.exerciseIndex];if(!ex)return;const setIndex=ex.logs.findIndex(log=>!log.done);if(setIndex<0)return;const reps=document.getElementById("setReps")?.value.trim();if(!reps){showToast("Въведи броя повторения.");document.getElementById("setReps")?.focus();return}ex.logs[setIndex].weight=document.getElementById("setWeight")?.value||"";ex.logs[setIndex].reps=reps;ex.logs[setIndex].done=true;saveState();stopTimer();renderWorkout();if(setIndex<ex.sets-1)startTimer(ex.rest)}
  function nextExercise(){const session=state.plan?.sessions.find(s=>s.id===activeWorkout?.sessionId);if(!session)return;if(activeWorkout.exerciseIndex<session.exercises.length-1){activeWorkout.exerciseIndex++;timerTarget=session.exercises[activeWorkout.exerciseIndex].rest;renderWorkout()}else finishWorkout()}
  function finishWorkout(){const session=state.plan?.sessions.find(s=>s.id===activeWorkout?.sessionId);if(!session)return;const log={id:session.id+"-"+Date.now(),sessionId:session.id,title:session.title,date:todayKey(),sets:session.exercises.reduce((n,e)=>n+e.logs.filter(x=>x.done).length,0),volume:session.exercises.reduce((sum,e)=>sum+e.logs.filter(x=>x.done).reduce((v,l)=>v+(Number(l.weight)||0)*(Number(l.reps)||0),0),0)};state.history.push(log);session.completed=true;saveState();stopTimer();document.getElementById("workoutDialog").close();document.body.classList.remove("workout-active");activeWorkout=null;renderDashboard();renderPlan();renderProgress();navigate("home");showToast("Тренировката е записана.")}
  function stopTimer(){clearInterval(timerId);timerId=null;const display=document.getElementById("timerDisplay");if(display)display.textContent=timerText(timerTarget);const button=document.querySelector('[data-action="timer"]');if(button)button.textContent="Пусни таймера"}
  function startTimer(seconds=timerTarget){stopTimer();timerTarget=Number(seconds)||75;let left=timerTarget;const display=document.getElementById("timerDisplay");const button=document.querySelector('[data-action="timer"]');if(display)display.textContent=timerText(left);if(button)button.textContent="Пропусни";timerId=setInterval(()=>{left--;if(display)display.textContent=timerText(Math.max(0,left));if(left<=0){clearInterval(timerId);timerId=null;if(button)button.textContent="Пусни таймера";showToast("Почивката приключи.")}},1000)}
  function init(){
    document.getElementById("todayLabel").textContent=new Date().toLocaleDateString("bg-BG",{weekday:"short",day:"numeric",month:"short"});
    document.addEventListener("click",event=>{
      const nav=event.target.closest("[data-view]");if(nav){navigate(nav.dataset.view);return}
      const choice=event.target.closest("[data-choice]");if(choice){setChoice(choice.dataset.choice,choice.dataset.value);return}
      if(event.target.closest("#wizardNext")){if(setupStep<2){setupStep++;renderWizard()}return}
      if(event.target.closest("#wizardBack")){if(setupStep>0){setupStep--;renderWizard()}return}
      if(event.target.closest("[data-close-setup]")){document.getElementById("planDialog").close();return}
      if(event.target.closest("#settingsShortcut,[data-open-setup]")){openSetup();return}
      if(event.target.closest("#heroAction")){const el=event.target.closest("#heroAction");if(el.dataset.action==="setup")openSetup();else if(el.dataset.action?.startsWith("start:"))startWorkout(el.dataset.action.slice(6));else navigate("plan");return}
      const detail=event.target.closest("[data-open-exercise]");if(detail){openExerciseDetails(detail.dataset.group,detail.dataset.exerciseId);return}
      const starter=event.target.closest("[data-start]");if(starter){startWorkout(starter.dataset.start);return}
      const filter=event.target.closest("[data-group-filter]");if(filter){chosenGroup=filter.dataset.groupFilter;renderLibrary();return}
      const action=event.target.closest("[data-action]");if(!action)return;
      const kind=action.dataset.action;
      if(kind==="close"){persistWorkoutInputs();stopTimer();document.getElementById("workoutDialog").close()}
      else if(kind==="close-exercise")document.getElementById("exerciseDialog").close();
      else if(kind==="record-set")recordSet();
      else if(kind==="next-exercise")nextExercise();
      else if(kind==="timer"){if(timerId)stopTimer();else startTimer()}
      else if(kind==="finish")finishWorkout();
    });
    document.getElementById("planForm").addEventListener("submit",savePlan);
    document.getElementById("exerciseSearch").addEventListener("input",renderLibrary);
    document.getElementById("workoutModalContent").addEventListener("input",event=>{if(event.target.matches("input"))persistWorkoutInputs()});
    document.getElementById("workoutDialog").addEventListener("close",()=>{stopTimer();document.body.classList.remove("workout-active");activeWorkout=null});
    document.getElementById("exerciseDialog").addEventListener("close",()=>{document.querySelectorAll("#exerciseDialog video").forEach(video=>video.pause())});
    window.addEventListener("hashchange",()=>{const view=location.hash.slice(1);if(["home","plan","library","progress"].includes(view))navigate(view)});
    renderDashboard();renderPlan();renderLibrary();renderProgress();const initial=location.hash.slice(1);if(["plan","library","progress"].includes(initial))navigate(initial);
  }
  document.addEventListener("DOMContentLoaded",init);
})();
