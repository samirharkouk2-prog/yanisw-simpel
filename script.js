const fileInput=document.getElementById('file-input');
const selectBtn=document.getElementById('select-btn');
const dropzone=document.getElementById('dropzone');
const preview=document.getElementById('preview');
const clearBtn=document.getElementById('clear-btn');
const createPdfBtn=document.getElementById('create-pdf-btn');
const contactBtn=document.getElementById('contact-btn');
const contactModal=document.getElementById('contact-modal');
const closeModalBtn=document.getElementById('close-modal');
const sendWhatsappBtn=document.getElementById('send-whatsapp');
const contactMessage=document.getElementById('contact-message');
let images=[];
function enableActions(){
  const has=images.length>0;
  clearBtn.disabled=!has;
  createPdfBtn.disabled=!has;
}
function renderPreview(){
  preview.innerHTML='';
  images.forEach((img,idx)=>{
    const card=document.createElement('div');
    card.className='thumb';
    const im=document.createElement('img');
    im.src=img.dataUrl;
    const rm=document.createElement('button');
    rm.className='remove';
    rm.textContent='×';
    rm.addEventListener('click',()=>{
      images.splice(idx,1);
      renderPreview();
      enableActions();
    });
    card.appendChild(im);
    card.appendChild(rm);
    preview.appendChild(card);
  });
}
function readAsDataURL(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=reject;
    r.readAsDataURL(file);
  });
}
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const i=new Image();
    i.onload=()=>resolve({width:i.width,height:i.height});
    i.onerror=reject;
    i.src=src;
  });
}
async function handleFiles(list){
  for(const f of list){
    if(!f.type.startsWith('image/')) continue;
    const dataUrl=await readAsDataURL(f);
    const dims=await loadImage(dataUrl);
    images.push({dataUrl,type:f.type,name:f.name,width:dims.width,height:dims.height});
  }
  renderPreview();
  enableActions();
}
selectBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',async e=>{
  await handleFiles(e.target.files);
  e.target.value='';
});
dropzone.addEventListener('dragover',e=>{e.preventDefault();dropzone.classList.add('dragover')});
dropzone.addEventListener('dragleave',()=>dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop',async e=>{
  e.preventDefault();dropzone.classList.remove('dragover');
  const list=e.dataTransfer.files;await handleFiles(list);
});
clearBtn.addEventListener('click',()=>{images=[];renderPreview();enableActions()});
async function createPdf(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4',compressPdf:true});
  doc.deletePage(1);
  for(const img of images){
    const orient=img.width>=img.height?'l':'p';
    doc.addPage('a4',orient);
    const pageW=doc.internal.pageSize.getWidth();
    const pageH=doc.internal.pageSize.getHeight();
    const margin=10;
    const usableW=pageW-2*margin;
    const usableH=pageH-2*margin;
    const ir=img.width/img.height;
    const pr=usableW/usableH;
    let w,h;
    if(ir>pr){
      w=usableW;h=w/ir;
    }else{
      h=usableH;w=h*ir;
    }
    const x=(pageW-w)/2;
    const y=(pageH-h)/2;
    const kind=img.type.includes('png')?'PNG':'JPEG';
    doc.addImage(img.dataUrl,kind,x,y,w,h);
  }
  doc.save('images.pdf');
}
createPdfBtn.addEventListener('click',async()=>{
  createPdfBtn.disabled=true;createPdfBtn.textContent='Creating...';
  try{await createPdf()}finally{createPdfBtn.textContent='Create PDF';enableActions()}
});
function toggleModal(show){
  contactModal.classList.toggle('show',show);
  contactModal.setAttribute('aria-hidden',show?'false':'true');
}
contactBtn.addEventListener('click',()=>toggleModal(true));
closeModalBtn.addEventListener('click',()=>toggleModal(false));
sendWhatsappBtn.addEventListener('click',()=>{
  const base='https://wa.me/213699525875?text=';
  const prefix='IMG2PDF  by(YANIS): ';
  const msg=encodeURIComponent((prefix)+(contactMessage.value||'Hi, I need help'));
  const url=base+msg;
  window.open(url,'_blank');
});
