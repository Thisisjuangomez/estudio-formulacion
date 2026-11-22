/* Motor de la calculadora de panadería (12 dígitos), tomado de "Calculadora Triple". */
function makeBK(){
  const def={disp:'0',acc:null,op:null,wait:false,k:null,mem:0,gt:0,err:false,lastEq:false,last:''};
  const clone=o=>JSON.parse(JSON.stringify(o));
  let s=clone(def);
  const MAX=12;
  const cur=()=>parseFloat(s.disp)||0;
  function fmtNum(v){
    if(!isFinite(v)||Math.abs(v)>=1e12){s.err=true;return '0'}
    if(Math.abs(v)<1e-11)return '0';
    const ip=Math.floor(Math.abs(v)).toString().length;
    let str=v.toFixed(Math.min(Math.max(0,MAX-ip),11));
    if(str.includes('.'))str=str.replace(/0+$/,'').replace(/\.$/,'');
    if(str==='-0')str='0';
    return str;
  }
  function setVal(v){s.disp=fmtNum(v);s.wait=true}
  function apply(a,op,b){switch(op){case '+':return a+b;case '−':return a-b;case '×':return a*b;case '÷':if(b===0){s.err=true;return 0}return a/b}return b}
  function addGT(){if(!s.err)s.gt+=parseFloat(s.disp)}
  function eq(){
    if(s.op){
      const b=(s.wait&&!s.lastEq)?s.acc:cur(); const a=s.acc;
      const r=apply(a,s.op,b);
      s.k=s.op==='×'?{op:'×',v:a}:{op:s.op,v:b};
      s.op=null;setVal(r);addGT();s.lastEq=true;
    }else if(s.k){
      const c=cur();const r=s.k.op==='×'?s.k.v*c:apply(c,s.k.op,s.k.v);
      setVal(r);addGT();s.lastEq=true;
    }else{s.wait=true;s.lastEq=true}
  }
  function key(id){
    const last=s.last;s.last=id;
    if(id==='AC'){const m=s.mem,g=s.gt;s=clone(def);s.mem=m;s.gt=g;s.last=id;return}
    if(s.err){if(id==='CE'){s.err=false;s.disp='0'}return}
    if(/^\d$/.test(id)||id==='00'||id==='.'){
      if(s.wait||s.lastEq){s.disp=id==='.'?'0.':(id==='00'?'0':id);s.wait=false;s.lastEq=false;return}
      if(id==='.'){if(!s.disp.includes('.'))s.disp+='.';return}
      const digits=s.disp.replace(/[^0-9]/g,'').length;
      if(s.disp==='0'||s.disp==='-0'){if(id!=='00')s.disp=s.disp.replace('0',id);return}
      if(digits+id.length>MAX)return;
      s.disp+=id;return;
    }
    switch(id){
      case '+':case '−':case '×':case '÷':
        if(s.op&&!s.wait){setVal(apply(s.acc,s.op,cur()));s.acc=cur()}
        else if(!s.op||s.lastEq){s.acc=cur()}
        s.op=id;s.wait=true;s.lastEq=false;s.k=null;break;
      case '=':eq();break;
      case '%':{
        const b=cur();
        if(s.op){const a=s.acc;let r;
          switch(s.op){case '+':r=a+a*b/100;break;case '−':r=a-a*b/100;break;case '×':r=a*b/100;break;case '÷':if(b===0){s.err=true;r=0}else r=a/b*100}
          s.op=null;setVal(r);s.lastEq=true;s.k=null;addGT();
        }else setVal(b/100);
        break}
      case 'MU':{
        const b=cur();
        if(s.op==='÷'||s.op==='×'){const a=s.acc;let r;
          if(s.op==='÷'){if(b===100){s.err=true;r=0}else r=a/(1-b/100)}else r=a*(1+b/100);
          s.op=null;setVal(r);s.lastEq=true;s.k=null;addGT()}
        break}
      case 'SQRT':{const v=cur();if(v<0)s.err=true;else setVal(Math.sqrt(v));break}
      case 'NEG':if(s.disp!=='0')s.disp=s.disp[0]==='-'?s.disp.slice(1):'-'+s.disp;break;
      case 'CE':s.disp='0';s.wait=false;s.lastEq=false;break;
      case 'BS':if(!s.wait&&!s.lastEq){s.disp=s.disp.slice(0,-1);if(s.disp===''||s.disp==='-')s.disp='0'}break;
      case 'MRC':if(last==='MRC'){s.mem=0}else{s.disp=fmtNum(s.mem);s.wait=true}break;
      case 'M+':case 'M-':if(s.op)eq();if(!s.err){s.mem+=(id==='M+'?1:-1)*cur();s.mem=+s.mem.toPrecision(14)}s.wait=true;break;
      case 'GT':if(last==='GT'){s.gt=0;s.disp='0'}else{s.disp=fmtNum(s.gt)}s.wait=true;break;
    }
  }
  return {key,state:()=>s,reset(){s=clone(def)}};
}
if(typeof module!=='undefined')module.exports={makeBK};
