const $=id=>document.getElementById(id), R=n=>Math.floor(Math.random()*n), pick=a=>a[R(a.length)];
const CLASSES={
 knight:{n:'Hollow Knight',hp:130,san:80,w:'Rusted Broadsword',a:'Dented Plate',inv:['Bread Heel'],atk:14,def:6},
 weaver:{n:'Ash-Weaver',hp:70,san:100,w:'Ash Staff',a:'Scorched Robes',inv:['Ember Salts','Bread Heel'],atk:16,def:1},
 rogue:{n:'Pestilent Rogue',hp:85,san:90,w:'Poisoned Daggers',a:'Oiled Leathers',inv:['Lockpicks','Vial of Nightshade'],atk:12,def:3},
 scout:{n:'Blight-Scout',hp:95,san:95,w:'Composite Bow',a:'Hide Jerkin',inv:['Hunting Hatchet','Dried Moss'],atk:13,def:3}};
const TIMES=['Midnight','Deep Night','Small Hours','Grey Pre-Dawn','Sunless Morning'];
const WX=['Dense Fog','Weeping Drizzle','Choking Mist','Still Dead Air'];
let S,cls='knight',started=false;
const fresh=c=>({loc:'cross',cls:c,hp:CLASSES[c].hp,mhp:CLASSES[c].hp,san:CLASSES[c].san,msan:CLASSES[c].san,torch:100,dur:100,
 silver:7,relics:0,inv:[...CLASSES[c].inv,'Weathered Journal','Iron-Tasting Flask'],lvl:1,xp:0,turn:0,depth:0,flags:{},rep:{villagers:0,cult:0},over:false});
const dark=()=>S.depth>0&&S.torch<=0;
function say(t,c=''){const p=document.createElement('p');p.className='p '+c;p.textContent=t;$('log').appendChild(p);$('log').scrollTop=1e9}
function bar(v,m){const n=Math.max(0,Math.round(v/m*10));return '█'.repeat(n)+'░'.repeat(10-n)}
function locName(){return({cross:'Oakhaven Crossroads',inn:'The Sallow Lantern (Inn)',cave1:'Weeping Cave — Mouth',cave2:'Deep-Dells — Flooded Gallery',cave3:'Deep-Dells — The Drowned Altar',woods:'Whispering Woods',shrine:'Forgotten Shrine',end:'The Fading'}[S.loc])}
function hud(){const c=CLASSES[S.cls];const sp=S.san/S.msan*100;
 const sn=sp>75?'Stable':sp>50?'Uneasy':sp>25?'Fraying':'Broken';
 $('hud').textContent=
`╔══════════════════════════════════════════════════════════════════════╗
║                   [ CHRONICLE OF THE FADING REALM ]                  ║
╠══════════════════════════════════════════════════════════════════════╣
║ 📍 LOCATION: ${locName()}${S.depth?' | Depth '+S.depth:''}
║ 🛡️ CLASS & STATUS: ${c.n} / Level ${S.lvl} / Stance: ${S.torch<=0&&S.depth?'Blind':'Normal'}
║ ❤️ HEALTH: [${bar(S.hp,S.mhp)}] ${Math.max(0,Math.round(S.hp/S.mhp*100))}% | 🕯️ SANITY: [${sn} ${Math.round(sp)}%]
║ 🗡️ EQUIPMENT: ${c.w} (${S.dur}%) / ${c.a} / Torch: ${Math.max(0,Math.round(S.torch))}%
║ 💰 CURRENCY: Scraps of Silver: ${S.silver} | Ancient Relics: ${S.relics}
║ 🎒 INVENTORY: ${S.inv.join(', ')||'Nothing'}
║ 🌑 TIME & ENVIRONMENT: ${TIMES[Math.min(4,S.turn>>3)]} / ${WX[S.turn%4]} / Temp: Chilling
║ ⚖️ REPUTATION: Villagers ${S.rep.villagers} | Hollow Cult ${S.rep.cult}
╚══════════════════════════════════════════════════════════════════════╝`;
 document.body.classList.toggle('mad',sp<35)}
function tick(n=1){S.turn+=n;
 if(S.depth){S.torch=Math.max(0,S.torch-6*n);S.san-=(dark()?7:1)*n}
 if(S.san<=0){S.san=0;S.hp-=6;say('Your mind splinters. Something wears your voice and screams it back at you.','you')}
 if(S.san<40&&Math.random()<.35)say(pick(['A whisper behind you speaks your name, and it is not the wind.','Your shadow moves half a heartbeat late.','The walls breathe. You are certain of it.','You hear your own footsteps — where you are not walking.']),'env');
 if(S.depth&&S.torch<=0&&!S.flags.warned){S.flags.warned=1;say('Your torch gutters and dies. The dark closes like a fist.','you')}
 if(S.hp<=0)die()}
function die(){S.over=true;S.hp=0;say('The dark takes you, as it took the others. Your name joins the whispers in the Mire.\n\nTHE CHRONICLE ENDS. (Load a save or Reset to try again.)','you');document.body.classList.add('dead')}
function gain(x){S.xp+=x;if(S.xp>=S.lvl*30){S.xp=0;S.lvl++;S.mhp+=10;S.hp=Math.min(S.mhp,S.hp+15);say('You feel something harden inside you. (Level '+S.lvl+')','env')}}
function fight(name,hp,dmg){const c=CLASSES[S.cls];let e=hp,r=0;
 while(e>0&&S.hp>0&&r++<12){e-=Math.max(1,c.atk+R(8)-(dark()?6:0));S.dur=Math.max(0,S.dur-2);if(e>0)S.hp-=Math.max(1,dmg+R(6)-c.def-(S.dur<20?0:0))}
 if(S.hp<=0){die();return false}say('You cut down the '+name+'. It leaves a smell of old iron and wet ash.');S.san-=4;gain(20);return true}
function loot(){const t=[['Scraps of Silver',()=>{const n=2+R(6);S.silver+=n;return n+' scraps of silver'}],['Ancient Relic',()=>{S.relics++;return 'an ancient relic, faintly warm'}],['Healing Draught',()=>{S.inv.push('Healing Draught');return 'a Healing Draught'}],['Pitch Torch',()=>{S.inv.push('Pitch Torch');return 'a spare pitch-pine torch'}]];return pick(t)[1]()}
// scenes: text, env, choices [label, fn]
const go=(l,d)=>()=>{S.loc=l;S.depth=d;tick(1)};
const SC={
cross:()=>({t:'The headless effigy looms over the crossroads. Rain beads along its severed neck. North, the palisade of Oakhaven and a single lit window. East, the Whispering Woods breathe fog. Up the cliff, the weeping cave mouth yawns, wet and patient.',
 e:'The dog has stopped barking. Somewhere behind the palisade, something drags itself across wood.',
 c:[['Climb the jagged path to the weeping cave mouth',go('cave1',1)],['Knock at the Sallow Lantern inn and ask about the missing villager',go('inn',0)],['Follow the blood-stained path into the Whispering Woods',go('woods',0)]]}),
inn:()=>({t:'The innkeeper bars the door after you and does not meet your eyes. Six patrons sit in a silence like held breath. Garlic hangs from every beam. "Brannoch went up the cliff four nights back," the innkeeper mutters. "The cave sings, stranger. Don\'t answer it."',
 e:'Firelight shivers. A child upstairs is whispering the same three words over and over.',
 c:[['Pay 5 silver for a hot meal and the elder\'s rumors',()=>{if(S.silver<5)return say('The innkeeper shakes his head. Not enough silver.');S.silver-=5;S.hp=Math.min(S.mhp,S.hp+25);S.san=Math.min(S.msan,S.san+15);S.rep.villagers++;S.flags.rumor=1;say('Broth, bread, and a truth: the cave was a burial pit for the Hollow Cult, and Brannoch carried a relic-key up there. The elder swears the stone door beneath the Drowned Altar opens only to blood of the village.');tick(2)}],['Threaten the innkeeper for what he is hiding',()=>{S.rep.villagers-=2;S.silver+=4;say('You take four scraps and a locked-door key\'s description. The room hates you now.');tick()}],['Leave for the crossroads',go('cross',0)]]}),
woods:()=>({t:'Gnarled trunks close overhead like cupped hands. The fog tastes of copper. A ruined shrine leans in a clearing, its idol chipped into a face that looks almost like yours.',
 e:'Branches tick against each other in a rhythm too regular to be wind.',
 c:[['Search the ruined shrine',()=>{S.loc='shrine';tick()}],['Forage for reagents and game along the path',()=>{const f=S.cls==='scout'?2:1;if(R(4)<f){say('You find '+loot()+' beneath rotten roots.')}else{S.hp-=8;say('Something with too many joints lunges from the fog and rakes you before you drive it off.')}tick(2)}],['Return to the crossroads',go('cross',0)]]}),
shrine:()=>({t:'The idol is slick with an oil that is not rain. A shallow bowl at its feet holds old coins and black teeth. Faded carvings show a village kneeling before a hollow-headed king.',
 e:'The fog leans in to listen.',
 c:[['Leave an offering (2 silver) and pray',()=>{if(S.silver<2)return say('You have nothing to give.');S.silver-=2;S.san=Math.min(S.msan,S.san+20);S.rep.cult--;say('A breath of warmth. The idol\'s stone eyes seem closed now.');tick()}],['Pry the relic from the idol\'s mouth',()=>{if(S.flags.pried)return say('The mouth is empty and the teeth are wet.');S.flags.pried=1;S.relics++;S.san-=12;S.rep.cult+=2;say('It comes free with a sound like a swallowed word. Your head fills with wet, distant chanting.')}],['Back to the woods path',go('woods',0)]]}),
cave1:()=>({t:'The cave mouth weeps black water down its lip. Inside, stone steps descend into a throat of rock. Scratched into the wall, in a frantic hand: DO NOT ANSWER THE SINGING. Brannoch\'s pack lies torn open on the first landing.',
 e:'Water drips. Below, faintly, a woman\'s voice hums a lullaby you almost recognize.',
 c:[['Descend into the flooded gallery',go('cave2',2)],['Search Brannoch\'s pack',()=>{if(S.flags.pack)return say('Nothing more. Only claw marks.');S.flags.pack=1;S.inv.push('Brannoch\'s Bloodied Sigil');say('Inside: a sigil-ring stamped with the village seal, stiff with dried blood. It may open something below.');tick()}],['Retreat to the crossroads',go('cross',0)]]}),
cave2:()=>({t:'Knee-deep black water pools across the gallery, and rusted chains hang from the ceiling with nothing on the ends. Pale shapes drift just beneath the surface. Ahead, a stone arch lit by a sickly green glow.',
 e:'Your torch hisses in the damp. Something in the water turns to face you.',
 c:[['Wade toward the green-lit arch',()=>{S.flags.wade=1;if(R(3)===0){say('A Hollowed thing surges up, mouth open like a drain.');if(fight('Hollowed Drowner',30,9))loot()&&say('You find '+loot()+'.')}else say('The water parts around you with a reluctant sigh.');S.loc='cave3';S.depth=3;tick()}],['Mine the wall for pale ore',()=>{S.relics+=R(2);S.dur=Math.max(0,S.dur-8);say('The rock yields a sliver of relic-glass. Your blade hates you for it.');if(R(2)){say('The noise draws something. It comes fast.');fight('Blind Crawler',22,7)}tick(2)}],['Climb back toward the mouth',go('cave1',1)]]}),
cave3:()=>({t:'The Drowned Altar rises from black water, ringed with carved hollow-headed kings. A stone door behind it bears a hand-shaped hollow. Brannoch sits against the altar, alive but staring, his mouth stuffed with wet moss. Above him, something vast shifts in the dark.',
 e:'The lullaby is coming from Brannoch\'s throat. Or from the ceiling. You cannot tell.',
 c:[['Free Brannoch and carry him out',()=>{S.flags.brannoch=1;S.rep.villagers+=3;S.san-=10;say('He weeps blood-black tears as you drag him up the stairs. Behind you, the dark laughs — a sound like stones settling. You have made an enemy that has all the time in the world.');S.loc='cave1';S.depth=1;gain(40);tick(3)}],['Open the stone door'+(S.inv.includes("Brannoch's Bloodied Sigil")?' with the sigil':' with your own blood'),()=>{if(S.inv.includes("Brannoch's Bloodied Sigil"))S.relics+=2,S.rep.cult+=3,S.san-=20,say('The door opens onto a hollow-king\'s tomb. A crown of black iron lies on a pillow of bone. You lift it. The world whispers you a name that is not yours.');else S.hp-=25,S.san-=10,say('The door grinds open as it drinks you. Inside: a tomb, a crown of black iron, a silence that watches.');S.loc='end';tick(3)}],['Flee upward, leaving him to the singing',()=>{S.rep.villagers-=3;S.san-=8;say('His eyes follow you as you go. The lullaby stops.');S.loc='cave1';S.depth=1;tick(3)}]]}),
end:()=>({t:'You stand in the tomb of the hollow-king. The crown is heavy. Rats do not enter here. The Realm fades a little more with every breath you take, and you begin to understand: it fades because someone must wear the crown, and no one wants to.',
 e:'Far above, dawn refuses to come.',
 c:[['Wear the Crown of Black Iron',()=>{S.rep.cult+=10;S.san=1;say('You become a chapter in a book you did not write. THE CHRONICLE CONTINUES WITHOUT YOU.');S.over=true;document.body.classList.add('dead')}],['Leave it and climb back to the living',()=>{S.loc='cave1';S.depth=1;gain(60);say('Dawn is still not coming, but you are still human. It will have to be enough.');tick(4)}],['Take the crown to sell in Oakhaven',()=>{S.relics+=3;S.loc='cross';S.depth=0;S.rep.villagers-=2;say('The village will pay for horrors. The horror, however, will follow the crown.');tick(4)}]]})};
function render(){if(S.over){hud();return}const sc=SC[S.loc]();say(sc.t);say(sc.e,'env');
 const ch=$('choices');ch.innerHTML='';sc.c.forEach((c,i)=>{const b=document.createElement('button');b.textContent='['+(i+1)+'] '+c[0];b.onclick=()=>act(c);ch.appendChild(b)});
 const h=document.createElement('div');h.style.cssText='font-size:.8rem;opacity:.6';h.textContent='(Or type any custom action you want)';ch.appendChild(h);hud()}
function act(c){if(S.over)return;started=true;$('classes').style.display='none';say('> '+c[0],'you');c[1]();if(!S.over)tick(0);render()}
function custom(raw){const t=raw.toLowerCase();if(S.over)return;started=true;$('classes').style.display='none';say('> '+raw,'you');
 if(/save/.test(t))return save();
 if(/inv|bag|pack|items/.test(t))say('You carry: '+S.inv.join(', ')+'.');
 else if(/relight|torch|light/.test(t)){const i=S.inv.indexOf('Pitch Torch');if(i<0)say('You have no spare torch. Only the dark.');else{S.inv.splice(i,1);S.torch=100;S.flags.warned=0;say('Pitch flares. The dark retreats, sullen.')}}
 else if(/drink|heal|potion|eat/.test(t)){const i=S.inv.findIndex(x=>/Draught|Bread|Moss/.test(x));if(i<0)say('Nothing to drink or eat but the iron-tasting flask.');else{say('You consume '+S.inv[i]+'.');S.inv.splice(i,1);S.hp=Math.min(S.mhp,S.hp+30)}}
 else if(/rest|sleep|camp/.test(t)){if(S.depth){say('Resting here is inviting the dark to sit with you.');S.san-=6;S.hp+=4;S.torch-=10}else{S.hp=Math.min(S.mhp,S.hp+12);S.san=Math.min(S.msan,S.san+8);say('You rest against cold wood, one eye open.')}tick(3)}
 else if(/search|look|examine|inspect|listen/.test(t)){if(R(3)===0)say('Hidden in the gloom you find '+loot()+'.');else say(pick(['You find only the wet memory of other people\'s fear.','Old claw marks. Old blood. Nothing new.','Something scuttles out of sight. You are not alone.']));tick()}
 else{say(pick(['The dark considers your idea and finds it wanting.','You try. The world does not respond as you hoped.','Nothing answers. You feel watched.']));S.san-=2;tick()}
 render()}
function save(){localStorage.setItem('fading-realm',JSON.stringify(S));say('The Chronicle is bound and hidden beneath a loose stone. (Saved.)','env');hud()}
function load(){const d=localStorage.getItem('fading-realm');if(!d)return say('No Chronicle is buried here.','env');S=JSON.parse(d);cls=S.cls;$('log').innerHTML='';document.body.classList.remove('dead');$('classes').style.display='none';say('You return to the Chronicle…','env');render()}
function start(){S=fresh(cls);$('log').innerHTML='';document.body.classList.remove('dead');$('classes').style.display='flex';
 say('It is a pitch-black midnight outside the damp, decaying timber walls of Oakhaven, a border village half-swallowed by the creeping fog of the Black Mire. A cold, weeping drizzle slick-coats your gear. You stand at a crossroads marked by a headless stone effigy, clutching a flickering pine-pitch torch that hisses angrily against the moisture. Your pockets hold a handful of silver scraps, a water flask tasting faintly of iron, and a weathered leather journal detailing a missing villager who last ventured into the weeping cave mouth fifty paces up the jagged cliffside. Behind the village palisade, a dog barks frantically, cut short by something wet and heavy.');
 render()}
function classBar(){const c=$('classes');c.innerHTML='';Object.entries(CLASSES).forEach(([k,v])=>{const b=document.createElement('button');b.textContent=v.n;b.className=k===cls?'on':'';b.onclick=()=>{if(started)return;cls=k;S=fresh(k);classBar();hud()};c.appendChild(b)})}
$('f').onsubmit=e=>{e.preventDefault();const v=$('in').value.trim();$('in').value='';if(v)custom(v)};
$('save').onclick=save;$('load').onclick=load;$('reset').onclick=()=>{started=false;classBar();start()};
classBar();start();
