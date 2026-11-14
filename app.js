import './falling-flowers.js';
import { invitation as config } from './invitation.config.js';
import { setupReveal, startReveal } from './scroll-reveal.js';
export function whatsappURL(data, number = config.rsvp.number) {
  const recipient = number.replace(/[\s+()-]/g, '');
  if (!/^[1-9]\d{7,14}$/.test(recipient)) return null;
  const text = [`Wedding RSVP · ${config.names.first} & ${config.names.second}`, config.date.english, '', `Name / නම: ${data.name.trim()}`, data.attendance === 'yes' ? 'Joyfully accepts / සතුටින් සහභාගී වෙමි' : 'With love, declines / සහභාගී විය නොහැක', ...(data.attendance === 'yes' ? [`Guests / අමුත්තන්: ${data.guests}`] : []), ...(data.message.trim() ? [`Note: ${data.message.trim()}`] : [])].join('\n');
  return `https://wa.me/${recipient}?text=${encodeURIComponent(text)}`;
}
document.querySelectorAll('[data-text]').forEach(el => { el.textContent = el.dataset.text.split('.').reduce((v, key) => v[key], config); });
document.title = `${config.names.first} & ${config.names.second} — A celebration of love`;
document.querySelector('.monogram').innerHTML = `${config.names.first[0]}<span>&</span>${config.names.second[0]}`;
document.querySelector('.signature').textContent = `${config.names.first} & ${config.names.second}`;
document.querySelector('.closing-names').textContent = `${config.names.first} & ${config.names.second}`;
const [year, month, day] = config.date.iso.split('-');
document.querySelector('.hero-date').textContent = `${day} . ${month} . ${year}`;
document.querySelector('.date-block strong').textContent = day;
document.querySelector('.date-block div>span').textContent = new Intl.DateTimeFormat('en', { month:'long', year:'numeric', timeZone:'Asia/Colombo' }).format(new Date(`${config.date.iso}T12:00:00+05:30`)).toUpperCase();
document.querySelector('#schedule').replaceChildren(...config.schedule.map(item => { const li = document.createElement('li'); for (const [tag, text, cls] of [['time',item.time,''],['h3',item.en,''],['p',item.si,'sinhala'],['p',item.note,'note']]) { const el = document.createElement(tag);el.textContent=text;el.className=cls;if(cls==='sinhala')el.lang='si';li.append(el); } return li; }));
setupReveal();
const intro = document.querySelector('#intro'), video = document.querySelector('#opening-video'), page = document.querySelector('#page'), play = document.querySelector('#play-intro');
intro.tabIndex = -1;
let previousFocus, fallback;
function closeIntro() { clearTimeout(fallback); video.pause(); intro.hidden=true;page.inert=false;document.body.classList.remove('intro-open'); if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true}); startReveal(); }
async function openIntro() { previousFocus=document.activeElement;intro.hidden=false;page.inert=true;document.body.classList.add('intro-open');video.currentTime=0;play.hidden=true;intro.focus();clearTimeout(fallback);fallback=setTimeout(()=>{play.hidden=false;},4000);try { await video.play();clearTimeout(fallback); } catch { play.hidden=false; } }
video.poster=config.poster; video.src=config.video;
video.addEventListener('ended',closeIntro);video.addEventListener('error',closeIntro);
play.addEventListener('click',()=>{play.hidden=true;video.play().catch(closeIntro);});
intro.addEventListener('keydown',event=>{if(event.key==='Escape')closeIntro();if(event.key==='Tab'){event.preventDefault();(play.hidden?intro:play).focus();}});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches) openIntro();
const form=document.querySelector('#rsvp-form'),send=document.querySelector('#send-rsvp'),party=document.querySelector('#party-size');
const configured=!!whatsappURL({name:'',attendance:'no',message:''});
send.disabled=!configured;
form.addEventListener('change',()=>{const attending=form.elements.attendance.value==='yes';document.querySelector('#party-field').hidden=!attending;party.disabled=!attending;party.required=attending;});
form.addEventListener('submit',event=>{event.preventDefault();const name=form.elements.name;name.setCustomValidity(name.value.trim()?'':'Please enter your name.');if(!form.reportValidity()||!configured)return;const url=whatsappURL({name:name.value,attendance:form.elements.attendance.value,guests:party.value,message:form.elements.message.value});if(url)window.open(url,'_blank','noopener,noreferrer');});
form.elements.name.addEventListener('input',event=>event.target.setCustomValidity(''));
