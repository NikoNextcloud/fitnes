/* The original 3D exercise collection is loaded only when opened. */
(() => {
  const groups = [
    {id:'biceps',name:'Бицепс',parts:['17']},
    {id:'triceps',name:'Трицепс',parts:['18']},
    {id:'shoulders',name:'Рамене',parts:['6']},
    {id:'chest',name:'Гърди',parts:['2']},
    {id:'back',name:'Гръб',parts:['4']},
    {id:'abs',name:'Корем',parts:['12']},
    {id:'legs',name:'Крака',parts:['19','20','1','8']},
    {id:'butt',name:'Седалище',parts:['3']}
  ];
  const local = [
    ['Barbell Curl','Сгъване с щанга'],
    ['Hammer Curl','Чуково сгъване'],
    ['Incline Bench Curl','Сгъване от наклон'],
    ['Concentration Curl','Концентрирано сгъване'],
    ['Cable Curl','Сгъване на скрипец']
  ].map(([file,name],i)=>({id:'local-'+i,name,originalName:file,group:'biceps',video:'video/'+encodeURIComponent(file)+'.mp4',poster:'images/'+encodeURIComponent(file)+'.jpg',local:true}));
  const catalog={groups,items:[...local],loaded:false,loading:null,error:false};
  catalog.load=()=>{
    if(catalog.loaded)return Promise.resolve(catalog.items);
    if(catalog.loading)return catalog.loading;
    catalog.error=false;
    catalog.loading=fetch('lyfta_exercises_cache.json').then(r=>{
      if(!r.ok)throw new Error('Catalog unavailable');
      return r.json();
    }).then(data=>{
      const unique=new Set();
      const remote=[];
      for(const raw of data.exercises||[]){
        if(typeof raw.video_file!=='string'||!raw.video_file.startsWith('https://apilyfta.com/static/GymvisualMP4/'))continue;
        if(unique.has(raw.video_file))continue;
        unique.add(raw.video_file);
        let ids=[];
        try{ids=JSON.parse(raw.body_part_id).map(String)}catch{}
        const group=groups.find(g=>g.parts.some(p=>ids.includes(p)));
        if(!group)continue;
        const poster=typeof raw.image_name==='string'&&raw.image_name.startsWith('https://apilyfta.com/static/GymvisualPNG/')?raw.image_name:'';
        remote.push({id:'remote-'+raw.id,name:String(raw.name||'Упражнение').replace(/\s*\((male|female)\)\s*/gi,' ').trim(),group:group.id,video:raw.video_file,poster,local:false});
      }
      catalog.items=[...local,...remote];catalog.loaded=true;catalog.loading=null;return catalog.items;
    }).catch(()=>{catalog.error=true;catalog.loading=null;return catalog.items});
    return catalog.loading;
  };
  window.IronLegacy3D=catalog;
})();
